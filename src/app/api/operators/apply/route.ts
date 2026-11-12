import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Candidate } from '@/lib/db';
import { sendOperatorEmail } from '@/lib/lark-mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      nome,
      whatsapp,
      email,
      city,
      cidade,
      state,
      instagram,
      experience,
      experiencia,
      pixType,
      pixKey,
      cityState,
    } = body;

    const candidateName = (name || nome || '').trim();
    const candidateWhatsapp = (whatsapp || '').trim();
    const candidateEmail = (email || '').trim().toLowerCase();

    if (!candidateName || !candidateWhatsapp || !candidateEmail) {
      return NextResponse.json(
        { success: false, error: 'Por favor, preencha ao menos Nome, WhatsApp e E-mail.' },
        { status: 400 }
      );
    }

    if (!candidateEmail.includes('@') || !candidateEmail.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    let parsedCity = (city || cidade || '').trim();
    let parsedState = (state || '').trim();
    if (!parsedCity && cityState) {
      const parts = String(cityState).split('/');
      parsedCity = parts[0]?.trim() || '';
      parsedState = parts[1]?.trim() || '';
    }

    const candidateId = `cand-${Date.now().toString(36)}`;
    const candidateData: Candidate = {
      id: candidateId,
      name: candidateName,
      email: candidateEmail,
      whatsapp: candidateWhatsapp,
      city: parsedCity,
      state: parsedState.toUpperCase() || 'BR',
      instagram: (instagram || '').trim(),
      experience: (experience || experiencia || '').trim(),
      resumeUrl: '',
      pixType: pixType || 'cpf',
      pixKey: (pixKey || '').trim(),
      status: 'PENDENTE',
      createdAt: new Date().toISOString(),
    };

    // 1. Persistência no Banco de Dados
    try {
      const db = readDb();
      const existing = db.candidates.find(c => c.email.toLowerCase() === candidateEmail);
      if (!existing) {
        db.candidates.unshift(candidateData);
      } else {
        Object.assign(existing, candidateData);
      }
      writeDb(db);
    } catch (dbErr) {
      console.warn('[Apply API] Aviso na persistência local do db:', dbErr);
    }

    // 2. Disparo de E-mail via Lark Suite SMTP para operadores@webbilly.com.br
    try {
      await sendOperatorEmail({
        nome: candidateData.name,
        whatsapp: candidateData.whatsapp,
        email: candidateData.email,
        cidade: candidateData.city ? `${candidateData.city}/${candidateData.state}` : '',
        instagram: candidateData.instagram,
        experiencia: candidateData.experience,
      });
    } catch (mailErr: any) {
      console.error('[Apply API] Erro no envio via Lark SMTP:', mailErr?.message || mailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Candidatura de operador enviada com sucesso! Entraremos em contato via WhatsApp e E-mail.',
      candidateId: candidateData.id,
    });
  } catch (err: any) {
    console.error('[Apply API] Erro no endpoint:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro interno ao processar candidatura.' },
      { status: 500 }
    );
  }
}
