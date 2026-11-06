import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Candidate } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, whatsapp, city, state, pixType, pixKey, resumeUrl, experience, termsAccepted } = body;

    if (!name || !email || !whatsapp || !city || !state || !pixType || !pixKey) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos.' },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'É obrigatório aceitar o Contrato de Parceria Autônoma e Confidencialidade.' },
        { status: 400 }
      );
    }

    // Validação simples de e-mail
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    const db = readDb();

    // Verifica se já existe candidato com este email
    const existing = db.candidates.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma candidatura registrada com este e-mail. Aguarde a análise da equipe Billy Suite.' },
        { status: 409 }
      );
    }

    const newCandidate: Candidate = {
      id: `cand-${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      pixType,
      pixKey: pixKey.trim(),
      resumeUrl: (resumeUrl || '').trim(),
      experience: (experience || '').trim(),
      status: 'PENDENTE',
      createdAt: new Date().toISOString()
    };

    db.candidates.unshift(newCandidate);
    writeDb(db);

    return NextResponse.json({
      success: true,
      message: 'Candidatura submetida com sucesso! Nossa equipe analisará seu perfil.',
      candidateId: newCandidate.id
    });
  } catch (err: any) {
    console.error('Erro ao submeter candidatura:', err);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar a inscrição.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = readDb();
    return NextResponse.json({
      candidates: db.candidates
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao listar candidatos.' }, { status: 500 });
  }
}
