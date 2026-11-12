import nodemailer from 'nodemailer';

export interface CandidateEmailData {
  name: string;
  whatsapp: string;
  email: string;
  city?: string;
  state?: string;
  instagram?: string;
  experience?: string;
  pixType?: string;
  pixKey?: string;
  candidateId?: string;
}

export function getLarkTransporter() {
  return nodemailer.createTransport({
    host: process.env.LARK_SMTP_HOST || 'smtp.larksuite.com',
    port: Number(process.env.LARK_SMTP_PORT) || 465,
    secure: Number(process.env.LARK_SMTP_PORT) === 465 || !process.env.LARK_SMTP_PORT,
    auth: {
      user: process.env.LARK_SMTP_USER || 'comercial@webbilly.com.br',
      pass: process.env.LARK_SMTP_PASS || 'KxD3owJCprFiv2Yw',
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function sendOperatorApplicationEmail(data: CandidateEmailData): Promise<boolean> {
  const fromAddress = process.env.LARK_SMTP_USER || 'comercial@webbilly.com.br';
  const toAddress = process.env.LARK_NOTIFY_EMAIL || 'comercial@webbilly.com.br';

  const cleanWhatsapp = (data.whatsapp || '').replace(/\D/g, '');
  const waUrl = cleanWhatsapp ? `https://wa.me/55${cleanWhatsapp}` : '';
  const adminUrl = 'https://webbilly.com.br/admin';

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Candidatura de Operador</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0e14; color: #e2e8f0; margin: 0; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #141824; border: 1px solid #232d42; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      
      <!-- Topo com Logo e Destaque -->
      <div style="background: linear-gradient(135deg, #0f141d 0%, #172033 100%); padding: 28px 24px; border-bottom: 1px solid #232d42; text-align: center;">
        <div style="font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
          Web<span style="color: #7abf18;">billy</span>
        </div>
        <div style="display: inline-block; padding: 4px 14px; background: rgba(122, 191, 24, 0.15); border: 1px solid rgba(122, 191, 24, 0.35); border-radius: 9999px; color: #7abf18; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 10px; letter-spacing: 0.5px;">
          Nova Candidatura de Operador
        </div>
      </div>

      <!-- Conteúdo Principal -->
      <div style="padding: 28px 24px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #ffffff; margin: 0 0 18px 0; border-left: 4px solid #7abf18; padding-left: 10px;">
          Dados do Candidato
        </h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; width: 35%; color: #94a3b8; font-weight: 600;">Nome Completo:</td>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #ffffff; font-weight: 700;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #94a3b8; font-weight: 600;">WhatsApp:</td>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #ffffff;">
              <a href="${waUrl}" style="color: #25d366; text-decoration: none; font-weight: 700;" target="_blank">
                ${data.whatsapp} &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #94a3b8; font-weight: 600;">E-mail:</td>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #60a5fa;">
              <a href="mailto:${data.email}" style="color: #60a5fa; text-decoration: none;">${data.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #94a3b8; font-weight: 600;">Cidade / Estado:</td>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #e2e8f0;">
              ${data.city || 'Não informado'} / ${data.state || 'UF'}
            </td>
          </tr>
          <tr>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #94a3b8; font-weight: 600;">Instagram / Perfil:</td>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #e2e8f0;">
              ${data.instagram ? `<a href="${data.instagram.startsWith('http') ? data.instagram : 'https://instagram.com/' + data.instagram.replace('@', '')}" style="color: #f43f5e; text-decoration: none; font-weight: 600;" target="_blank">${data.instagram}</a>` : 'Não informado'}
            </td>
          </tr>
          <tr>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #94a3b8; font-weight: 600;">Experiência:</td>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
              ${data.experience || 'Não informada'}
            </td>
          </tr>
          <tr>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #94a3b8; font-weight: 600;">Chave Pix:</td>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #10b981; font-weight: 700;">
              ${data.pixKey || 'Não informada'} <span style="font-size: 11px; color: #94a3b8; font-weight: normal;">(${data.pixType || 'Pix'})</span>
            </td>
          </tr>
          ${data.candidateId ? `
          <tr>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 13px; color: #94a3b8; font-weight: 600;">ID da Candidatura:</td>
            <td style="padding: 11px 12px; border-bottom: 1px solid #1f2738; font-size: 12px; color: #94a3b8; font-family: monospace;">${data.candidateId}</td>
          </tr>
          ` : ''}
        </table>

        <!-- Ações Rápidas -->
        <div style="text-align: center; margin: 30px 0 10px 0;">
          ${waUrl ? `
          <a href="${waUrl}" target="_blank" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 10px; font-weight: 700; font-size: 13px; margin: 0 6px 12px 6px; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">
            Chamar no WhatsApp &rarr;
          </a>
          ` : ''}
          <a href="${adminUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 10px; font-weight: 700; font-size: 13px; margin: 0 6px 12px 6px; box-shadow: 0 4px 12px rgba(79,70,229,0.3);">
            Acessar Painel Master Admin &rarr;
          </a>
        </div>
      </div>

      <!-- Rodapé -->
      <div style="background-color: #0d1017; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1f2738;">
        Webbilly SaaS &bull; Gestão Centralizada de Operadores &bull; Notificação Automática Lark Suite SMTP
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const transporter = getLarkTransporter();
    const info = await transporter.sendMail({
      from: `"Webbilly Notificações" <${fromAddress}>`,
      to: toAddress,
      subject: `[Webbilly] Nova Candidatura de Operador: ${data.name}`,
      text: `Nova candidatura de operador recebida:\n\n` +
            `Nome: ${data.name}\n` +
            `WhatsApp: ${data.whatsapp}\n` +
            `E-mail: ${data.email}\n` +
            `Local: ${data.city || 'N/A'}/${data.state || 'N/A'}\n` +
            `Instagram: ${data.instagram || 'N/A'}\n` +
            `Experiência: ${data.experience || 'N/A'}\n` +
            `Chave Pix: ${data.pixKey || 'N/A'} (${data.pixType || 'Pix'})\n\n` +
            `WhatsApp direto: ${waUrl}\n` +
            `Acessar Admin: ${adminUrl}`,
      html: htmlContent,
    });

    console.log(`[Lark SMTP] E-mail enviado com sucesso para ${toAddress}! MessageId: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error('[Lark SMTP] Erro ao enviar e-mail de notificação:', error?.message || error);
    return false;
  }
}
