import { NextResponse } from 'next/server';
import { readDb, writeDb, Candidate, Operator } from '@/lib/db';
import { sendOperatorEmail } from '@/lib/lark-mailer';
import { recordTermsAcceptanceInSupabase, upsertOperatorInSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nome,
      name,
      cpf,
      whatsapp,
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
      instagram,
      refCode,
      affiliateCode,
      ref
    } = body;

    const candidateName = (nome || name || '').trim();
    const candidateCpf = (cpf || '').trim();
    const candidateWhatsapp = (whatsapp || '').trim();
    const candidateEmail = (email || '').trim().toLowerCase();
    const candidateCep = (cep || '').trim();
    const candidateAddress = (address || rua || logradouro || '').trim();
    const candidateNeighborhood = (neighborhood || bairro || '').trim();
    const resolvedCity = (cidade || city || '').trim();
    const resolvedState = (state || '').trim().toUpperCase();
    const candidateCityState = (city_state || (resolvedCity ? (resolvedState ? `${resolvedCity} - ${resolvedState}` : resolvedCity) : '')).trim();
    const candidatePixType = (pix_type || pixType || 'cpf').trim().toLowerCase();
    const candidatePixKey = (pix_key || pixKey || '').trim();
    const candidateExperience = (experiencia || experience || '').trim();
    const candidateInstagram = (instagram || '').trim();
    const rawRef = (refCode || affiliateCode || ref || '').trim().toUpperCase();

    // Captura endereço IP real para prova digital de aceite jurídico
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';
    const nowIso = new Date().toISOString();

    if (!candidateName || !candidateWhatsapp || !candidateEmail) {
      return NextResponse.json(
        { error: 'Preencha Nome Completo, WhatsApp e E-mail.' },
        { status: 400 }
      );
    }

    const db = readDb();
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

    const existingOp = (db.operators || []).find(o => o.email.toLowerCase() === candidateEmail);
    const opId = existingOp?.id || `OP-${Date.now().toString(36).toUpperCase()}`;

    // 1. Persistência Principal na tabela operators do Supabase com status = 'PENDENTE'
    try {
      await upsertOperatorInSupabase({
        id: opId,
        name: candidateName,
        cpf: candidateCpf,
        email: candidateEmail,
        whatsapp: candidateWhatsapp,
        cep: candidateCep,
        address: candidateAddress,
        neighborhood: candidateNeighborhood,
        city_state: candidateCityState,
        pixType: candidatePixType,
        pixKey: candidatePixKey,
        pix_type: candidatePixType,
        pix_key: candidatePixKey,
        experience: candidateExperience,
        status: 'PENDENTE',
        referred_by_operator_id: sponsorId,
        accepted_terms_at: nowIso,
        accepted_terms_ip: clientIp,
        accepted_terms_version: 'v1.0'
      });

      // Grava auditoria de termos
      await recordTermsAcceptanceInSupabase({
        targetType: 'operator',
        identifier: candidateEmail,
        ip: clientIp,
        version: 'v1.0'
      });
    } catch (supErr) {
      console.warn('[Trabalhe Aqui] Falha ao persistir no Supabase (não-bloqueante):', supErr);
    }

    // 2. Persistência de redundância no banco local (db.operators e db.candidates)
    try {
      const candidateData: Candidate = {
        id: `cand-${Date.now().toString(36)}`,
        name: candidateName,
        email: candidateEmail,
        whatsapp: candidateWhatsapp,
        city: candidateCityState,
        state: resolvedState || 'BR',
        instagram: candidateInstagram,
        experience: candidateExperience,
        resumeUrl: '',
        pixType: candidatePixType,
        pixKey: candidatePixKey,
        status: 'PENDENTE',
        createdAt: nowIso,
        referred_by_operator_id: sponsorId,
        affiliate_code_used: usedCode,
        accepted_terms_at: nowIso,
        accepted_terms_ip: clientIp,
        accepted_terms_version: 'v1.0'
      };

      const existingCand = db.candidates.find(c => c.email.toLowerCase() === candidateEmail);
      if (!existingCand) {
        db.candidates.unshift(candidateData);
      } else {
        Object.assign(existingCand, candidateData);
      }

      // Adiciona/atualiza também no array db.operators com status PENDENTE
      const operatorRecord: Operator = {
        id: opId,
        name: candidateName,
        cpf: candidateCpf,
        email: candidateEmail,
        whatsapp: candidateWhatsapp,
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
        accepted_terms_version: 'v1.0'
      };

      if (!existingOp) {
        db.operators.push(operatorRecord);
      } else {
        Object.assign(existingOp, operatorRecord);
      }

      writeDb(db);
    } catch (dbErr) {
      console.warn('[Trabalhe Aqui] Aviso na persistência local:', dbErr);
    }

    // 3. Disparo oficial via SMTP Lark Suite para operadores@webbilly.com.br
    await sendOperatorEmail({
      nome: candidateName,
      cpf: candidateCpf,
      whatsapp: candidateWhatsapp,
      email: candidateEmail,
      cep: candidateCep,
      address: candidateAddress,
      neighborhood: candidateNeighborhood,
      city_state: candidateCityState,
      pix_type: candidatePixType,
      pix_key: candidatePixKey,
      experiencia: candidateExperience,
      instagram: candidateInstagram,
    });

    console.log(`[Trabalhe Aqui] Candidatura completa de ${candidateName} salva e enviada para operadores@webbilly.com.br`);
    return NextResponse.json({
      success: true,
      message: 'Candidatura enviada com sucesso! Seus dados foram encaminhados para a equipe de admissão.'
    });
  } catch (error: any) {
    console.error('Erro ao processar candidatura:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao processar candidatura. Tente novamente.' },
      { status: 500 }
    );
  }
}
