import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/lark-mailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, name, whatsapp, telefone, phone, email, assunto, subject, mensagem, message } = body;

    const contactName = (nome || name || '').trim();
    const contactEmail = (email || '').trim().toLowerCase();
    const contactWhatsapp = (whatsapp || telefone || phone || '').trim();
    const contactSubject = (assunto || subject || 'Contato via Site').trim();
    const contactMessage = (mensagem || message || '').trim();

    if (!contactName || !contactEmail || !contactMessage) {
      return NextResponse.json(
        { error: 'Por favor, preencha nome, e-mail e sua mensagem.' },
        { status: 400 }
      );
    }

    if (!contactEmail.includes('@') || !contactEmail.includes('.')) {
      return NextResponse.json(
        { error: 'Por favor, informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    // Disparo oficial via SMTP Lark Suite para comercial@webbilly.com.br
    await sendContactEmail({
      nome: contactName,
      whatsapp: contactWhatsapp,
      email: contactEmail,
      assunto: contactSubject,
      mensagem: contactMessage,
    });

    console.log(`[Contato API] Mensagem de ${contactName} enviada para comercial@webbilly.com.br`);
    return NextResponse.json({
      success: true,
      message: 'Sua mensagem foi enviada com sucesso! Nossa equipe comercial entrará em contato em breve.'
    });
  } catch (error: any) {
    console.error('[Contato API] Erro no envio de contato:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao enviar mensagem. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
