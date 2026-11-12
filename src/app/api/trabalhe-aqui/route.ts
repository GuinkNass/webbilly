import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { readDb, writeDb, Candidate } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, whatsapp, email, cidade, experiencia } = body;

    if (!nome || !whatsapp || !email) {
      return NextResponse.json(
        { error: 'Preencha nome, WhatsApp e e-mail.' },
        { status: 400 }
      );
    }

    // Persistência segura em db.candidates para sincronização com o painel admin
    try {
      const db = readDb();
      const cleanEmail = String(email).trim().toLowerCase();
      const existing = db.candidates.find(c => c.email.toLowerCase() === cleanEmail);
      const candidateData: Candidate = {
        id: `cand-${Date.now().toString(36)}`,
        name: String(nome).trim(),
        email: cleanEmail,
        whatsapp: String(whatsapp).trim(),
        city: (cidade || '').trim(),
        state: 'BR',
        experience: (experiencia || '').trim(),
        resumeUrl: '',
        pixType: 'cpf',
        pixKey: '',
        status: 'PENDENTE',
        createdAt: new Date().toISOString(),
      };

      if (!existing) {
        db.candidates.unshift(candidateData);
      } else {
        Object.assign(existing, candidateData);
      }
      writeDb(db);
    } catch (dbErr) {
      console.warn('[Trabalhe Aqui] Aviso na persistência em db.json:', dbErr);
    }

    const transporter = nodemailer.createTransport({
      host: process.env.LARK_SMTP_HOST || 'smtp.larksuite.com',
      port: Number(process.env.LARK_SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.LARK_SMTP_USER || 'comercial@webbilly.com.br',
        pass: process.env.LARK_SMTP_PASS || 'KxD3owJCprFiv2Yw',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const cleanPhone = whatsapp.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    const waLink = `https://wa.me/${formattedPhone}`;

    await transporter.sendMail({
      from: `"Webbilly Recrutamento" <${process.env.LARK_SMTP_USER || 'comercial@webbilly.com.br'}>`,
      to: process.env.LARK_NOTIFY_EMAIL || 'comercial@webbilly.com.br',
      replyTo: email,
      subject: `[Trabalhe Aqui] Nova Candidatura: ${nome}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
          <h2 style="color: #38bdf8; margin-top: 0; font-size: 22px;">Nova Candidatura — Trabalhe Aqui</h2>
          <p style="margin: 8px 0; font-size: 14px;"><strong>Nome:</strong> ${nome}</p>
          <p style="margin: 8px 0; font-size: 14px;"><strong>WhatsApp:</strong> <a href="${waLink}" style="color: #22c55e; text-decoration: none; font-weight: bold;">${whatsapp}</a></p>
          <p style="margin: 8px 0; font-size: 14px;"><strong>E-mail:</strong> <a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a></p>
          <p style="margin: 8px 0; font-size: 14px;"><strong>Cidade/Estado:</strong> ${cidade || 'Não informado'}</p>
          <p style="margin: 8px 0; font-size: 14px;"><strong>Experiência / Observações:</strong><br/>${experiencia ? experiencia.replace(/\n/g, '<br/>') : 'Não informado'}</p>
          <div style="margin-top: 24px; text-align: center;">
            <a href="${waLink}" target="_blank" style="background: #22c55e; color: #052e16; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Chamar no WhatsApp &rarr;
            </a>
          </div>
        </div>
      `,
    });

    console.log(`[Trabalhe Aqui] Candidatura de ${nome} enviada com sucesso para comercial@webbilly.com.br`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar candidatura:', error);
    return NextResponse.json(
      { error: 'Falha ao enviar candidatura. Tente novamente.' },
      { status: 500 }
    );
  }
}
