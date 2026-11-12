import { NextResponse } from 'next/server';
import { readDb, writeDb, Candidate } from '@/lib/db';
import { sendOperatorEmail } from '@/lib/lark-mailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, name, whatsapp, email, cidade, city, experiencia, experience, instagram, refCode, affiliateCode, ref } = body;

    const candidateName = (nome || name || '').trim();
    const candidateWhatsapp = (whatsapp || '').trim();
    const candidateEmail = (email || '').trim().toLowerCase();
    const candidateCity = (cidade || city || '').trim();
    const candidateExperience = (experiencia || experience || '').trim();
    const candidateInstagram = (instagram || '').trim();
    const rawRef = (refCode || affiliateCode || ref || '').trim().toUpperCase();

    if (!candidateName || !candidateWhatsapp || !candidateEmail) {
      return NextResponse.json(
        { error: 'Preencha nome, WhatsApp e e-mail.' },
        { status: 400 }
      );
    }

    // Persistência em db.candidates
    try {
      const db = readDb();
      const existing = db.candidates.find(c => c.email.toLowerCase() === candidateEmail);

      let sponsorId: string | null = null;
      let usedCode: string | null = null;
      if (rawRef) {
        const sponsor = (db.operators || []).find(
          o => (o.affiliate_code || '').trim().toUpperCase() === rawRef && o.status === 'ATIVO'
        );
        if (sponsor) {
          sponsorId = sponsor.id;
          usedCode = sponsor.affiliate_code || rawRef;
        }
      }

      const candidateData: Candidate = {
        id: existing?.id || `cand-${Date.now().toString(36)}`,
        name: candidateName,
        email: candidateEmail,
        whatsapp: candidateWhatsapp,
        city: candidateCity,
        state: 'BR',
        instagram: candidateInstagram,
        experience: candidateExperience,
        resumeUrl: '',
        pixType: 'cpf',
        pixKey: '',
        status: 'PENDENTE',
        createdAt: existing?.createdAt || new Date().toISOString(),
        referred_by_operator_id: sponsorId || existing?.referred_by_operator_id || null,
        affiliate_code_used: usedCode || existing?.affiliate_code_used || null
      };

      if (!existing) {
        db.candidates.unshift(candidateData);
      } else {
        Object.assign(existing, candidateData);
      }
      writeDb(db);
    } catch (dbErr) {
      console.warn('[Trabalhe Aqui] Aviso na persistência local:', dbErr);
    }

    // Disparo oficial via SMTP Lark Suite para operadores@webbilly.com.br
    await sendOperatorEmail({
      nome: candidateName,
      whatsapp: candidateWhatsapp,
      email: candidateEmail,
      cidade: candidateCity,
      experiencia: candidateExperience,
      instagram: candidateInstagram,
    });

    console.log(`[Trabalhe Aqui] Candidatura de ${candidateName} enviada para operadores@webbilly.com.br`);
    return NextResponse.json({ success: true, message: 'Candidatura enviada com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao processar candidatura:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao enviar candidatura. Tente novamente.' },
      { status: 500 }
    );
  }
}
