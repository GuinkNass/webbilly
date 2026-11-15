import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { fetchAllOperatorsFromSupabase, upsertOperatorInSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { sendOperatorRejectionEmail } from '@/lib/lark-mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'MASTER' && (user as any).role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
    }

    const body = await req.json();
    const { candidateId, operatorId, email, reason } = body;
    const targetId = (candidateId || operatorId || '').trim();
    const targetEmail = (email || '').trim().toLowerCase();

    if (!targetId && !targetEmail) {
      return NextResponse.json(
        { error: 'ID do Candidato ou E-mail deve ser fornecido.' },
        { status: 400 }
      );
    }

    const db = readDb();
    const now = new Date();
    const nowIso = now.toISOString();
    const reapplyDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const reapplyDateIso = reapplyDate.toISOString();
    const reapplyDateBr = reapplyDate.toLocaleDateString('pt-BR');

    // 1. Localiza em db.candidates
    let candidate = (db.candidates || []).find(c =>
      (targetId && (c.id === targetId || (c as any).candidateId === targetId)) ||
      (targetEmail && c.email?.toLowerCase().trim() === targetEmail)
    );

    // 2. Localiza em db.operators
    let op = (db.operators || []).find(o =>
      (targetId && (o.id === targetId || o.candidateId === targetId)) ||
      (targetEmail && (
        (o.email && o.email.toLowerCase().trim() === targetEmail) ||
        (o.corporate_email && o.corporate_email.toLowerCase().trim() === targetEmail)
      ))
    );

    // 3. Se não achou em db.operators, busca no Supabase
    if (!op) {
      try {
        const allOps = await fetchAllOperatorsFromSupabase();
        op = allOps.find(o =>
          (targetId && (o.id === targetId || o.candidateId === targetId)) ||
          (targetEmail && o.email?.toLowerCase().trim() === targetEmail)
        );
      } catch (supErr) {
        console.warn('Erro ao consultar operadores no Supabase:', supErr);
      }
    }

    if (!candidate && !op) {
      return NextResponse.json({ error: 'Candidato não localizado no sistema.' }, { status: 404 });
    }

    const candidateName = candidate?.name || op?.name || 'Candidato';
    const candidateEmail = candidate?.email || op?.email || targetEmail;
    const candidateWhatsapp = candidate?.whatsapp || candidate?.phone || op?.whatsapp || op?.phone || '';

    // 4. Atualiza db.candidates
    if (candidate) {
      candidate.status = 'RECUSADO';
      candidate.reviewedAt = nowIso;
      candidate.rejected_at = nowIso;
      candidate.reapply_after = reapplyDateIso;
      candidate.notes = reason || 'Candidatura negada pela triagem (reaplicação liberada após 60 dias).';
    } else {
      db.candidates.unshift({
        id: op?.candidateId || `cand-${Date.now().toString(36)}`,
        name: candidateName,
        email: candidateEmail,
        whatsapp: candidateWhatsapp,
        city: op?.city_state || (op as any)?.city || '',
        state: (op as any)?.state || 'BR',
        pixType: op?.pixType || op?.pix_type || 'cpf',
        pixKey: op?.pixKey || op?.pix_key || '',
        cpf: op?.cpf,
        status: 'RECUSADO',
        createdAt: op?.createdAt || nowIso,
        reviewedAt: nowIso,
        rejected_at: nowIso,
        reapply_after: reapplyDateIso,
        notes: reason || 'Candidatura negada pela triagem (reaplicação liberada após 60 dias).'
      });
    }

    // 5. Atualiza db.operators se presente
    if (op) {
      const localOp = (db.operators || []).find(o => o.id === op!.id || o.email?.toLowerCase() === candidateEmail.toLowerCase());
      if (localOp) {
        localOp.status = 'RECUSADO';
        localOp.rejected_at = nowIso;
        localOp.reapply_after = reapplyDateIso;
        localOp.lastSync = nowIso;
      }
    }

    writeDb(db);

    // 6. Atualiza no Supabase (operators)
    try {
      await upsertOperatorInSupabase({
        id: op?.id || targetId || `OP-${Date.now().toString(36).toUpperCase()}`,
        name: candidateName,
        email: candidateEmail,
        whatsapp: candidateWhatsapp,
        status: 'RECUSADO',
        rejected_at: nowIso,
        reapply_after: reapplyDateIso
      });
      const supabase = getSupabaseAdmin();
      await supabase.from('candidaturas').update({ status: 'rejected', reapply_after: reapplyDateIso }).or(`id.eq.${targetId},email.eq.${candidateEmail}`);
      await supabase.from('candidates').update({ status: 'rejected', reapply_after: reapplyDateIso }).or(`id.eq.${targetId},email.eq.${candidateEmail}`);
    } catch (errSup) {
      console.warn('Erro ao atualizar status RECUSADO no Supabase:', errSup);
    }

    // 7. Texto amigável padrão exigido
    const messageText = `Olá, ${candidateName}! Agradecemos o seu interesse em fazer parte da equipe de operadores da Webbilly. No momento não temos vagas disponíveis para o seu perfil. Caso tenha interesse, você poderá enviar uma nova candidatura novamente após 60 dias. Desejamos sucesso!`;

    // 8. Formatação do WhatsApp (55...)
    const rawDigits = candidateWhatsapp.replace(/\D/g, '');
    const phoneFormatted = rawDigits.length >= 10 ? (rawDigits.startsWith('55') ? rawDigits : `55${rawDigits}`) : '';
    const whatsappLink = phoneFormatted ? `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(messageText)}` : null;

    // 9. Envio automático de e-mail (Lark / SMTP)
    let emailSent = false;
    try {
      emailSent = await sendOperatorRejectionEmail({
        operadorNome: candidateName,
        operadorEmailPessoal: candidateEmail,
        reapplyDate: reapplyDateBr
      });
    } catch (mailErr) {
      console.warn('Falha no envio do e-mail de recusa:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Candidatura de ${candidateName} recusada com sucesso.`,
      candidateName,
      candidateEmail,
      candidateWhatsapp,
      whatsappFormatted: phoneFormatted,
      whatsappLink,
      messageText,
      reapplyAfter: reapplyDateIso,
      reapplyDateBr,
      emailSent
    });

  } catch (err: any) {
    console.error('Erro ao recusar candidatura:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar recusa da candidatura.' },
      { status: 500 }
    );
  }
}
