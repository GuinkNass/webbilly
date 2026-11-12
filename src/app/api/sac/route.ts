import { NextResponse } from 'next/server';
import { sendSacEmail } from '@/lib/lark-mailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, name, email, whatsapp, telefone, phone, categoria, category, mensagem, message } = body;

    const callerName = (nome || name || '').trim();
    const callerEmail = (email || '').trim().toLowerCase();
    const callerWhatsapp = (whatsapp || telefone || phone || '').trim();
    const callerCategory = (categoria || category || 'Dúvida').trim();
    const callerMessage = (mensagem || message || '').trim();

    if (!callerName || !callerEmail || !callerMessage) {
      return NextResponse.json(
        { error: 'Por favor, preencha nome, e-mail e sua mensagem.' },
        { status: 400 }
      );
    }

    if (!callerEmail.includes('@') || !callerEmail.includes('.')) {
      return NextResponse.json(
        { error: 'Por favor, informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    // Disparo oficial via SMTP Lark Suite para sac@webbilly.com.br
    await sendSacEmail({
      nome: callerName,
      email: callerEmail,
      whatsapp: callerWhatsapp,
      categoria: callerCategory,
      mensagem: callerMessage,
    });

    console.log(`[SAC API] Chamado de ${callerName} [${callerCategory}] enviado para sac@webbilly.com.br`);
    return NextResponse.json({
      success: true,
      message: 'Seu chamado de SAC foi registrado com sucesso! Nossa equipe de atendimento responderá em breve.'
    });
  } catch (error: any) {
    console.error('[SAC API] Erro no envio de SAC:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao registrar chamado de SAC. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
