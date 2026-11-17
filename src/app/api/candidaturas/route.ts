import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Candidate, Operator } from '@/lib/db';
import { sendOperatorEmail } from '@/lib/lark-mailer';
import { getSupabaseAdmin, recordTermsAcceptanceInSupabase, upsertOperatorInSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nome,
      name,
      full_name,
      cpf,
      whatsapp,
      phone,
      email,
      cep,
      address,
      rua,
      logradouro,
      neighborhood,
      bairro,
      cidade,
      city,
      state,
      city_state,
      pixType,
      pix_type,
      pixKey,
      pix_key,
      experiencia,
      experience,
      availability,
      has_computer,
      computador,
      instagram,
      refCode,
      affiliateCode,
      ref
    } = body;

    const candidateName = (full_name || nome || name || '').trim();
    const candidateCpf = (cpf || '').trim();
    const candidateWhatsapp = (whatsapp || phone || '').trim();
    const candidateEmail = (email || '').trim().toLowerCase();
    const candidateCep = (cep || '').trim();
    const candidateAddress = (address || rua || logradouro || '').trim();
    const candidateNeighborhood = (neighborhood || bairro || '').trim();
    const resolvedCity = (cidade || city || '').trim();
    const resolvedState = (state || '').trim().toUpperCase();
    const candidateCityState = (
      city_state || (resolvedCity ? (resolvedState ? `${resolvedCity} - ${resolvedState}` : resolvedCity) : '')
    ).trim();
    const candidatePixType = (pix_type || pixType || 'cpf').trim().toLowerCase();
    const candidatePixKey = (pix_key || pixKey || '').trim();
    const candidateExperience = (experiencia || experience || '').trim();
    const candidateAvailability = (availability || 'Integral').trim();
    const candidateHasComputer = Boolean(has_computer ?? computador ?? true);
    const candidateInstagram = (instagram || '').trim();
    const rawRef = (refCode || affiliateCode || ref || '').trim().toUpperCase();

    // Validação de campos obrigatórios
    if (!candidateName || !candidateWhatsapp || !candidateEmail || !candidatePixKey) {
      return NextResponse.json(
        { error: 'Preencha Nome Completo, WhatsApp, E-mail e Chave Pix obrigatórios.' },
        { status: 400 }
      );
    }

    if (!candidateEmail.includes('@') || !candidateEmail.includes('.')) {
      return NextResponse.json(
        { error: 'Informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    // Prova digital de aceite jurídico
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';
    const nowIso = new Date().toISOString();

    const db = readDb();

    // 1. Bloqueio de reenvio antes de 60 dias se recusado anteriormente
    const cleanEmail = candidateEmail.toLowerCase().trim();
    const cleanCpf = candidateCpf.replace(/\D/g, '');

    const priorRejectedCandidate = (db.candidates || []).find(c => {
      const matchEmail = c.email && c.email.toLowerCase().trim() === cleanEmail;
      const matchCpf = cleanCpf && c.cpf && c.cpf.replace(/\D/g, '') === cleanCpf;
      return (matchEmail || matchCpf) && (c.status === 'RECUSADO' || (c.status as any) === 'rejected');
    });

    const priorRejectedOp = (db.operators || []).find(o => {
      const matchEmail = o.email && o.email.toLowerCase().trim() === cleanEmail;
      const matchCpf = cleanCpf && o.cpf && o.cpf.replace(/\D/g, '') === cleanCpf;
      return (matchEmail || matchCpf) && (o.status === 'RECUSADO' || (o.status as any) === 'rejected');
    });

    const priorRecord = priorRejectedCandidate || priorRejectedOp;
    if (priorRecord) {
      const reapplyTimestamp = priorRecord.reapply_after
        ? new Date(priorRecord.reapply_after).getTime()
        : (priorRecord.rejected_at
            ? new Date(priorRecord.rejected_at).getTime() + 60 * 24 * 60 * 60 * 1000
            : (priorRecord.createdAt
                ? new Date(priorRecord.createdAt).getTime() + 60 * 24 * 60 * 60 * 1000
                : 0));

      if (reapplyTimestamp > Date.now()) {
        const reapplyDateFormatted = new Date(reapplyTimestamp).toLocaleDateString('pt-BR');
        return NextResponse.json(
          {
            error: `Sua candidatura anterior foi analisada recentemente. Conforme as diretrizes do processo seletivo da Webbilly, você poderá enviar uma nova inscrição a partir de ${reapplyDateFormatted}.`
          },
          { status: 403 }
        );
      }
    }

    // 2. Localiza Patrocinador / Afiliado
    let sponsorId: string | null = null;
    let usedCode: string | null = null;
    if (rawRef) {
      const sponsor = (db.operators || []).find(
        o => (o.affiliate_code || '').trim().toUpperCase() === rawRef && (o.status === 'ATIVO' || (o as any).status === 'active')
      );
      if (sponsor) {
        sponsorId = sponsor.id;
        usedCode = sponsor.affiliate_code || rawRef;
      } else {
        try {
          const supabase = getSupabaseAdmin();
          const { data: supaOp } = await supabase
            .from('operators')
            .select('id, name, affiliate_code, status')
            .ilike('affiliate_code', rawRef)
            .maybeSingle();

          if (supaOp && (supaOp.status?.toUpperCase() === 'ATIVO' || supaOp.status?.toLowerCase() === 'active')) {
            sponsorId = supaOp.id;
            usedCode = supaOp.affiliate_code || rawRef;
          }
        } catch (_) {}
      }
    }

    const opId = `OP-${Date.now().toString(36).toUpperCase()}`;

    // Monta payload completo e detalhado
    const raw_payload = {
      id: opId,
      full_name: candidateName,
      name: candidateName,
      email: candidateEmail,
      whatsapp: candidateWhatsapp,
      phone: candidateWhatsapp,
      cpf: candidateCpf,
      cep: candidateCep,
      address: candidateAddress,
      neighborhood: candidateNeighborhood,
      city: resolvedCity,
      state: resolvedState,
      city_state: candidateCityState,
      pixType: candidatePixType,
      pixKey: candidatePixKey,
      pix_type: candidatePixType,
      pix_key: candidatePixKey,
      experience: candidateExperience,
      availability: candidateAvailability,
      has_computer: candidateHasComputer,
      instagram: candidateInstagram,
      ref: rawRef,
      referred_by_operator_id: sponsorId,
      affiliate_code_used: usedCode,
      accepted_terms_at: nowIso,
      accepted_terms_ip: clientIp,
      accepted_terms_version: 'v1.0'
    };

    // 3. PERSISTÊNCIA REAL NO SUPABASE (Utilizando getSupabaseAdmin para bypass de RLS)
    const supabase = getSupabaseAdmin();
    let savedInSupabase = false;
    let supabaseErrorMsg: string | null = null;

    // A) Tenta salvar em tabela 'candidaturas' caso exista
    try {
      const { data: candData, error: candErr } = await supabase
        .from('candidaturas')
        .insert({
          id: opId,
          full_name: candidateName,
          name: candidateName,
          email: candidateEmail,
          whatsapp: candidateWhatsapp,
          cpf: candidateCpf,
          pix_key: candidatePixKey,
          pix_type: candidatePixType,
          city_state: candidateCityState,
          experience: candidateExperience,
          availability: candidateAvailability,
          has_computer: candidateHasComputer,
          status: 'pending',
          raw_payload,
          created_at: nowIso
        })
        .select()
        .single();

      if (!candErr && candData) {
        savedInSupabase = true;
      }
    } catch (_) {
      // Tabela 'candidaturas' pode não existir no schema
    }

    // B) Tenta salvar em tabela 'candidates' caso exista
    if (!savedInSupabase) {
      try {
        const { data: cData, error: cErr } = await supabase
          .from('candidates')
          .insert({
            id: opId,
            full_name: candidateName,
            name: candidateName,
            email: candidateEmail,
            whatsapp: candidateWhatsapp,
            cpf: candidateCpf,
            pix_key: candidatePixKey,
            pix_type: candidatePixType,
            city_state: candidateCityState,
            experience: candidateExperience,
            availability: candidateAvailability,
            has_computer: candidateHasComputer,
            status: 'pending',
            raw_payload,
            created_at: nowIso
          })
          .select()
          .single();

        if (!cErr && cData) {
          savedInSupabase = true;
        }
      } catch (_) {}
    }

    // C) Salva na tabela 'operators' (Tabela principal com schema validado em produção)
    try {
      const { data: opData, error: opErr } = await supabase
        .from('operators')
        .upsert({
          id: opId,
          name: candidateName,
          email: candidateEmail,
          whatsapp: candidateWhatsapp,
          pix_type: candidatePixType,
          pix_key: candidatePixKey,
          status: 'pending',
          affiliate_enabled: false,
          affiliate_code: null,
          referred_by_operator_id: sponsorId,
          accepted_terms_at: nowIso,
          accepted_terms_ip: clientIp,
          accepted_terms_version: 'v1.0',
          avatar_config: raw_payload,
          updated_at: nowIso
        }, { onConflict: 'id' })
        .select()
        .single();

      if (opErr) {
        supabaseErrorMsg = opErr.message || opErr.code;
        console.error('[Candidaturas API] Erro ao gravar na tabela operators:', opErr);
      } else {
        savedInSupabase = true;
      }
    } catch (err: any) {
      supabaseErrorMsg = err?.message || 'Falha de conexão com o banco';
      console.error('[Candidaturas API] Falha na conexão Supabase:', err);
    }

    // Se houve erro no Supabase e nada pôde ser persistido, exibe erro real
    if (!savedInSupabase && supabaseErrorMsg) {
      return NextResponse.json(
        { error: `Erro no Supabase: ${supabaseErrorMsg}. Verifique os dados ou contate o suporte.` },
        { status: 500 }
      );
    }

    // 4. Grava auditoria de termos
    try {
      await recordTermsAcceptanceInSupabase({
        targetType: 'operator',
        identifier: candidateEmail,
        ip: clientIp,
        version: 'v1.0'
      });
    } catch (_) {}

    // 5. Persistência de redundância no banco local (db.candidates e db.operators)
    try {
      const candidateData: Candidate = {
        id: opId,
        name: candidateName,
        email: candidateEmail,
        whatsapp: candidateWhatsapp,
        phone: candidateWhatsapp,
        cpf: candidateCpf,
        cep: candidateCep,
        address: candidateAddress,
        neighborhood: candidateNeighborhood,
        city: resolvedCity,
        state: resolvedState || 'BR',
        city_state: candidateCityState,
        instagram: candidateInstagram,
        experience: candidateExperience,
        resumeUrl: '',
        pixType: candidatePixType,
        pixKey: candidatePixKey,
        pix_type: candidatePixType,
        pix_key: candidatePixKey,
        status: 'PENDENTE',
        createdAt: nowIso,
        referred_by_operator_id: sponsorId,
        affiliate_code_used: usedCode,
        accepted_terms_at: nowIso,
        accepted_terms_ip: clientIp,
        accepted_terms_version: 'v1.0',
        avatar_config: raw_payload
      };

      const existingCandIdx = (db.candidates || []).findIndex(c => c.email.toLowerCase() === candidateEmail);
      if (existingCandIdx >= 0) {
        db.candidates[existingCandIdx] = { ...db.candidates[existingCandIdx], ...candidateData };
      } else {
        db.candidates.unshift(candidateData);
      }

      const existingOpIdx = (db.operators || []).findIndex(o => o.email.toLowerCase() === candidateEmail);
      const operatorRecord: Operator = {
        id: opId,
        name: candidateName,
        cpf: candidateCpf,
        email: candidateEmail,
        whatsapp: candidateWhatsapp,
        phone: candidateWhatsapp,
        cep: candidateCep,
        address: candidateAddress,
        neighborhood: candidateNeighborhood,
        city_state: candidateCityState,
        pixType: candidatePixType,
        pixKey: candidatePixKey,
        pix_type: candidatePixType,
        pix_key: candidatePixKey,
        serialToken: '',
        status: 'PENDENTE',
        passwordHash: '',
        dailyLimit: 50,
        todayGenerations: 0,
        createdAt: nowIso,
        experience: candidateExperience,
        referred_by_operator_id: sponsorId,
        accepted_terms_at: nowIso,
        accepted_terms_ip: clientIp,
        accepted_terms_version: 'v1.0',
        avatar_config: raw_payload
      };

      if (existingOpIdx >= 0) {
        db.operators[existingOpIdx] = { ...db.operators[existingOpIdx], ...operatorRecord };
      } else {
        db.operators.push(operatorRecord);
      }

      writeDb(db);
    } catch (dbErr) {
      console.warn('[Candidaturas API] Erro na redundância local:', dbErr);
    }

    // 6. Disparo de Notificação por E-mail (Lark Suite SMTP)
    try {
      await sendOperatorEmail({
        nome: candidateName,
        whatsapp: candidateWhatsapp,
        email: candidateEmail,
        cidade: candidateCityState,
        instagram: candidateInstagram,
        experiencia: candidateExperience
      });
    } catch (mailErr) {
      console.warn('[Candidaturas API] Notificação de e-mail não enviada:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Candidatura registrada com sucesso no sistema!',
      candidateId: opId
    });

  } catch (err: any) {
    console.error('[Candidaturas API] Erro fatal:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao processar candidatura.' },
      { status: 500 }
    );
  }
}
