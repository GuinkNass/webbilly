import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Candidate } from '@/lib/db';
import { sendOperatorApplicationEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      whatsapp,
      email,
      city,
      state,
      instagram,
      experience,
      pixType,
      pixKey,
      cityState,
    } = body;

    if (!name || !whatsapp || !email) {
      return NextResponse.json(
        { success: false, error: 'Por favor, preencha ao menos Nome, WhatsApp e E-mail.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    // Separa cidade e estado caso venham juntos em cityState (ex: "São Paulo/SP")
    let parsedCity = (city || '').trim();
    let parsedState = (state || '').trim();
    if (!parsedCity && cityState) {
      const parts = String(cityState).split('/');
      parsedCity = parts[0]?.trim() || '';
      parsedState = parts[1]?.trim() || '';
    }

    const candidateId = `cand-${Date.now().toString(36)}`;
    const candidateData: Candidate = {
      id: candidateId,
      name: String(name).trim(),
      email: cleanEmail,
      whatsapp: String(whatsapp).trim(),
      city: parsedCity,
      state: parsedState.toUpperCase(),
      instagram: (instagram || '').trim(),
      experience: (experience || '').trim(),
      resumeUrl: '',
      pixType: pixType || 'cpf',
      pixKey: (pixKey || '').trim(),
      status: 'PENDENTE',
      createdAt: new Date().toISOString(),
    };

    // 1. Persistência no Banco de Dados
    try {
      const db = readDb();
      // Se não existir na lista, adiciona no topo
      const existing = db.candidates.find(c => c.email.toLowerCase() === cleanEmail);
      if (!existing) {
        db.candidates.unshift(candidateData);
      } else {
        // Atualiza dados
        Object.assign(existing, candidateData);
      }
      writeDb(db);
    } catch (dbErr) {
      console.warn('[Apply API] Aviso na persistência local do db:', dbErr);
    }

    // 2. Disparo de E-mail via Lark Suite SMTP
    let emailSent = false;
    try {
      emailSent = await sendOperatorApplicationEmail({
        name: candidateData.name,
        whatsapp: candidateData.whatsapp,
        email: candidateData.email,
        city: candidateData.city,
        state: candidateData.state,
        instagram: candidateData.instagram,
        experience: candidateData.experience,
        pixType: candidateData.pixType,
        pixKey: candidateData.pixKey,
        candidateId: candidateData.id,
      });
    } catch (mailErr: any) {
      console.error('[Apply API] Erro no envio via Lark SMTP:', mailErr?.message || mailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Candidatura de operador enviada com sucesso! Entraremos em contato via WhatsApp e E-mail.',
      candidateId: candidateData.id,
      emailNotified: emailSent,
    });

  } catch (err: any) {
    console.error('[Apply API] Erro interno:', err);
    return NextResponse.json(
      { success: false, error: 'Ocorreu um erro interno ao processar a candidatura.' },
      { status: 500 }
    );
  }
}
