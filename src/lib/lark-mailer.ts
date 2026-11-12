import nodemailer from 'nodemailer';

export const larkTransporter = nodemailer.createTransport({
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

export interface OperatorApplicationData {
  nome?: string;
  name?: string;
  whatsapp: string;
  email: string;
  cidade?: string;
  city?: string;
  state?: string;
  experiencia?: string;
  experience?: string;
  instagram?: string;
  pixType?: string;
  pixKey?: string;
  candidateId?: string;
}

export interface ContactData {
  nome: string;
  whatsapp?: string;
  email: string;
  assunto?: string;
  mensagem: string;
}

export interface DemoRequestData {
  nome?: string;
  empresa: string;
  whatsapp: string;
  instagramOuMaps?: string;
  segmento?: string;
  subdominio?: string;
}

export interface SacData {
  nome: string;
  email: string;
  whatsapp?: string;
  categoria: string;
  mensagem: string;
}

export interface PayoutRequestEmailData {
  operadorNome: string;
  operadorId: string;
  operadorEmailCorporativo: string;
  operadorWhatsapp?: string;
  mesReferencia: string;
  vendasCount: number;
  valorTotalFaturado: number;
  valorRepasse: number;
  chavePix: string;
  tipoPix?: string;
  vendasResumo?: Array<{ cliente: string; plano?: string; valor: number; data?: string }>;
}

// -------------------------------------------------------------------------------------------------
// 1. CANDIDATURA DE OPERADOR -> operadores@webbilly.com.br
// -------------------------------------------------------------------------------------------------
export async function sendOperatorEmail(data: OperatorApplicationData): Promise<boolean> {
  const toAddress = process.env.LARK_EMAIL_OPERADORES || 'operadores@webbilly.com.br';
  const fromAddress = `"Webbilly Recrutamento" <${process.env.LARK_SMTP_USER || 'comercial@webbilly.com.br'}>`;

  const candidateName = data.nome || data.name || 'Candidato';
  const candidateCity = data.cidade || (data.city ? `${data.city}${data.state ? ' / ' + data.state : ''}` : '') || 'Não informado';
  const candidateExp = data.experiencia || data.experience || '';

  const cleanDigits = (data.whatsapp || '').replace(/\D/g, '');
  const formattedPhone = cleanDigits.startsWith('55') ? cleanDigits : '55' + cleanDigits;
  const waLink = cleanDigits ? `https://wa.me/${formattedPhone}` : '';

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:24px;background-color:#0b0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:600px;margin:0 auto;background-color:#141824;border:1px solid #232d42;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        <div style="background:linear-gradient(135deg,#0f141d 0%,#172033 100%);padding:28px 24px;border-bottom:1px solid #232d42;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Web<span style="color:#7abf18;">billy</span></div>
          <div style="display:inline-block;padding:4px 14px;background:rgba(122,191,24,0.15);border:1px solid rgba(122,191,24,0.35);border-radius:9999px;color:#7abf18;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:10px;letter-spacing:0.5px;">
            Recrutamento de Operadores
          </div>
        </div>
        <div style="padding:28px 24px;">
          <h2 style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 18px 0;border-left:4px solid #7abf18;padding-left:10px;">
            Nova Candidatura de Operador
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;width:35%;">Nome Completo:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#ffffff;font-weight:700;font-size:13px;">${candidateName}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">WhatsApp:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#22c55e;font-size:13px;font-weight:700;">
                ${waLink ? `<a href="${waLink}" style="color:#22c55e;text-decoration:none;" target="_blank">${data.whatsapp} &rarr;</a>` : data.whatsapp}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">E-mail:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#60a5fa;font-size:13px;">
                <a href="mailto:${data.email}" style="color:#60a5fa;text-decoration:none;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Cidade/Estado:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#e2e8f0;font-size:13px;">${candidateCity}</td>
            </tr>
            ${data.instagram ? `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Instagram / Perfil:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#f43f5e;font-size:13px;">
                <a href="${data.instagram.startsWith('http') ? data.instagram : 'https://instagram.com/' + data.instagram.replace('@', '')}" style="color:#f43f5e;text-decoration:none;" target="_blank">${data.instagram}</a>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Experiência / Perfil:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#cbd5e1;font-size:13px;line-height:1.5;">${candidateExp ? candidateExp.replace(/\n/g, '<br/>') : 'Não informada'}</td>
            </tr>
          </table>
          ${waLink ? `
          <div style="text-align:center;margin-top:24px;">
            <a href="${waLink}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#22c55e;color:#052e16;text-decoration:none;font-weight:700;font-size:13px;border-radius:10px;">
              Chamar Candidato no WhatsApp &rarr;
            </a>
          </div>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  await larkTransporter.sendMail({
    from: fromAddress,
    to: toAddress,
    replyTo: data.email,
    subject: `[OPERADOR] Nova Candidatura: ${data.nome}`,
    html,
  });

  return true;
}

// -------------------------------------------------------------------------------------------------
// 2. CONTATO COMERCIAL GERAL -> comercial@webbilly.com.br
// -------------------------------------------------------------------------------------------------
export async function sendContactEmail(data: ContactData): Promise<boolean> {
  const toAddress = process.env.LARK_EMAIL_COMERCIAL || 'comercial@webbilly.com.br';
  const fromAddress = `"Webbilly Comercial" <${process.env.LARK_SMTP_USER || 'comercial@webbilly.com.br'}>`;

  const cleanDigits = (data.whatsapp || '').replace(/\D/g, '');
  const formattedPhone = cleanDigits.startsWith('55') ? cleanDigits : '55' + cleanDigits;
  const waLink = cleanDigits ? `https://wa.me/${formattedPhone}` : '';

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:24px;background-color:#0b0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:600px;margin:0 auto;background-color:#141824;border:1px solid #232d42;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        <div style="background:linear-gradient(135deg,#0f141d 0%,#172033 100%);padding:28px 24px;border-bottom:1px solid #232d42;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Web<span style="color:#7abf18;">billy</span></div>
          <div style="display:inline-block;padding:4px 14px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.35);border-radius:9999px;color:#60a5fa;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:10px;letter-spacing:0.5px;">
            Atendimento Comercial
          </div>
        </div>
        <div style="padding:28px 24px;">
          <h2 style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 18px 0;border-left:4px solid #3b82f6;padding-left:10px;">
            Novo Contato Recebido
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;width:35%;">Nome:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#ffffff;font-weight:700;font-size:13px;">${data.nome}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">WhatsApp / Telefone:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#22c55e;font-size:13px;font-weight:700;">
                ${waLink ? `<a href="${waLink}" style="color:#22c55e;text-decoration:none;" target="_blank">${data.whatsapp} &rarr;</a>` : (data.whatsapp || 'Não informado')}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">E-mail:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#60a5fa;font-size:13px;">
                <a href="mailto:${data.email}" style="color:#60a5fa;text-decoration:none;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Assunto:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#e2e8f0;font-size:13px;font-weight:600;">${data.assunto || 'Contato via Site'}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Mensagem:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#cbd5e1;font-size:13px;line-height:1.5;">${data.mensagem ? data.mensagem.replace(/\n/g, '<br/>') : ''}</td>
            </tr>
          </table>
          ${waLink ? `
          <div style="text-align:center;margin-top:24px;">
            <a href="${waLink}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#22c55e;color:#052e16;text-decoration:none;font-weight:700;font-size:13px;border-radius:10px;">
              Responder no WhatsApp &rarr;
            </a>
          </div>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  await larkTransporter.sendMail({
    from: fromAddress,
    to: toAddress,
    replyTo: data.email,
    subject: `[COMERCIAL] Novo Contato: ${data.nome}`,
    html,
  });

  return true;
}

// -------------------------------------------------------------------------------------------------
// 3. PEDIDO DE DEMONSTRAÇÃO -> demo@webbilly.com.br
// -------------------------------------------------------------------------------------------------
export async function sendDemoRequestEmail(data: DemoRequestData): Promise<boolean> {
  const toAddress = process.env.LARK_EMAIL_DEMO || 'demo@webbilly.com.br';
  const fromAddress = `"Webbilly Demonstrações" <${process.env.LARK_SMTP_USER || 'comercial@webbilly.com.br'}>`;

  const cleanDigits = (data.whatsapp || '').replace(/\D/g, '');
  const formattedPhone = cleanDigits.startsWith('55') ? cleanDigits : '55' + cleanDigits;
  const waLink = cleanDigits ? `https://wa.me/${formattedPhone}` : '';

  const socialLink = data.instagramOuMaps ? (
    data.instagramOuMaps.startsWith('http')
      ? data.instagramOuMaps
      : (data.instagramOuMaps.includes('@')
          ? `https://instagram.com/${data.instagramOuMaps.replace('@', '')}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.instagramOuMaps)}`)
  ) : '';

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:24px;background-color:#0b0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:600px;margin:0 auto;background-color:#141824;border:1px solid #232d42;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        <div style="background:linear-gradient(135deg,#0f141d 0%,#172033 100%);padding:28px 24px;border-bottom:1px solid #232d42;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Web<span style="color:#7abf18;">billy</span></div>
          <div style="display:inline-block;padding:4px 14px;background:rgba(234,179,8,0.15);border:1px solid rgba(234,179,8,0.35);border-radius:9999px;color:#facc15;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:10px;letter-spacing:0.5px;">
            Pedido de Demonstração
          </div>
        </div>
        <div style="padding:28px 24px;">
          <h2 style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 18px 0;border-left:4px solid #facc15;padding-left:10px;">
            Solicitação de Demonstração de Site
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;width:35%;">Empresa:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#ffffff;font-weight:700;font-size:13px;">${data.empresa}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Responsável:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#e2e8f0;font-size:13px;">${data.nome || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">WhatsApp:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#22c55e;font-size:13px;font-weight:700;">
                ${waLink ? `<a href="${waLink}" style="color:#22c55e;text-decoration:none;" target="_blank">${data.whatsapp} &rarr;</a>` : data.whatsapp}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Segmento / Ramo:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#e2e8f0;font-size:13px;">${data.segmento || 'Comércio em Geral'}</td>
            </tr>
            ${data.subdominio ? `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Subdomínio Previsto:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#7abf18;font-family:monospace;font-size:13px;font-weight:700;">
                https://${data.subdominio}.webbilly.com.br
              </td>
            </tr>` : ''}
            ${data.instagramOuMaps ? `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Instagram / Maps:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;font-size:13px;">
                ${socialLink ? `<a href="${socialLink}" style="color:#38bdf8;text-decoration:underline;" target="_blank">${data.instagramOuMaps}</a>` : data.instagramOuMaps}
              </td>
            </tr>` : ''}
          </table>
          ${waLink ? `
          <div style="text-align:center;margin-top:24px;">
            <a href="${waLink}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#22c55e;color:#052e16;text-decoration:none;font-weight:700;font-size:13px;border-radius:10px;">
              Chamar no WhatsApp e Enviar Demo &rarr;
            </a>
          </div>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  await larkTransporter.sendMail({
    from: fromAddress,
    to: toAddress,
    subject: `[DEMO] Pedido de Demonstração: ${data.empresa || data.nome || 'Cliente'}`,
    html,
  });

  return true;
}

// -------------------------------------------------------------------------------------------------
// 4. ATENDIMENTO AO CLIENTE (SAC) -> sac@webbilly.com.br
// -------------------------------------------------------------------------------------------------
export async function sendSacEmail(data: SacData): Promise<boolean> {
  const toAddress = process.env.LARK_EMAIL_SAC || 'sac@webbilly.com.br';
  const fromAddress = `"Webbilly SAC" <${process.env.LARK_SMTP_USER || 'comercial@webbilly.com.br'}>`;

  const cleanDigits = (data.whatsapp || '').replace(/\D/g, '');
  const formattedPhone = cleanDigits.startsWith('55') ? cleanDigits : '55' + cleanDigits;
  const waLink = cleanDigits ? `https://wa.me/${formattedPhone}` : '';

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:24px;background-color:#0b0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:600px;margin:0 auto;background-color:#141824;border:1px solid #232d42;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        <div style="background:linear-gradient(135deg,#0f141d 0%,#172033 100%);padding:28px 24px;border-bottom:1px solid #232d42;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Web<span style="color:#7abf18;">billy</span></div>
          <div style="display:inline-block;padding:4px 14px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);border-radius:9999px;color:#f87171;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:10px;letter-spacing:0.5px;">
            SAC & Suporte ao Cliente
          </div>
        </div>
        <div style="padding:28px 24px;">
          <h2 style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 18px 0;border-left:4px solid #ef4444;padding-left:10px;">
            Novo Chamado de Atendimento [${data.categoria}]
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;width:35%;">Categoria:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#f87171;font-weight:700;font-size:13px;">${data.categoria}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Solicitante:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#ffffff;font-weight:700;font-size:13px;">${data.nome}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">E-mail:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#60a5fa;font-size:13px;">
                <a href="mailto:${data.email}" style="color:#60a5fa;text-decoration:none;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">WhatsApp / Telefone:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#22c55e;font-size:13px;font-weight:700;">
                ${waLink ? `<a href="${waLink}" style="color:#22c55e;text-decoration:none;" target="_blank">${data.whatsapp} &rarr;</a>` : (data.whatsapp || 'Não informado')}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Mensagem / Relato:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#cbd5e1;font-size:13px;line-height:1.5;">${data.mensagem ? data.mensagem.replace(/\n/g, '<br/>') : ''}</td>
            </tr>
          </table>
          ${waLink ? `
          <div style="text-align:center;margin-top:24px;">
            <a href="${waLink}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#22c55e;color:#052e16;text-decoration:none;font-weight:700;font-size:13px;border-radius:10px;">
              Atender no WhatsApp &rarr;
            </a>
          </div>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  await larkTransporter.sendMail({
    from: fromAddress,
    to: toAddress,
    replyTo: data.email,
    subject: `[SAC - ${data.categoria}] ${data.nome}`,
    html,
  });

  return true;
}

// -------------------------------------------------------------------------------------------------
// 5. SOLICITAÇÃO DE REPASSE FINANCEIRO DE OPERADOR -> financeiro@webbilly.com.br
// -------------------------------------------------------------------------------------------------
export async function sendPayoutRequestEmail(data: PayoutRequestEmailData): Promise<boolean> {
  const toAddress = process.env.LARK_EMAIL_FINANCEIRO || 'financeiro@webbilly.com.br';
  const fromAddress = `"Webbilly Financeiro" <${process.env.LARK_SMTP_USER || 'comercial@webbilly.com.br'}>`;

  const cleanDigits = (data.operadorWhatsapp || '').replace(/\D/g, '');
  const formattedPhone = cleanDigits.startsWith('55') ? cleanDigits : '55' + cleanDigits;
  const waLink = cleanDigits ? `https://wa.me/${formattedPhone}` : '';

  const repasseFormatado = data.valorRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const faturadoFormatado = data.valorTotalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:24px;background-color:#0b0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:620px;margin:0 auto;background-color:#141824;border:1px solid #232d42;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0a1510 0%,#13281c 100%);padding:28px 24px;border-bottom:1px solid #1d3e2b;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Web<span style="color:#7abf18;">billy</span></div>
          <div style="display:inline-block;padding:4px 14px;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.35);border-radius:9999px;color:#4ade80;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:10px;letter-spacing:0.5px;">
            Departamento Financeiro &bull; Solicitação de Repasse
          </div>
        </div>

        <div style="padding:28px 24px;">
          <h2 style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 18px 0;border-left:4px solid #22c55e;padding-left:10px;">
            Solicitação de Repasse Pix — ${data.mesReferencia}
          </h2>

          <!-- Destaque do Valor a Transferir -->
          <div style="background:#09140e;border:1px solid #1e3a29;border-radius:12px;padding:18px;margin-bottom:20px;text-align:center;">
            <span style="font-size:11px;text-transform:uppercase;color:#86efac;font-weight:700;letter-spacing:1px;display:block;margin-bottom:4px;">
              Valor Líquido a Transferir (50% de Comissão)
            </span>
            <div style="font-size:32px;font-weight:900;color:#22c55e;letter-spacing:-1px;">
              R$ ${repasseFormatado}
            </div>
            <span style="font-size:11px;color:#94a3b8;margin-top:4px;display:block;">
              Base faturada: R$ ${faturadoFormatado} em ${data.vendasCount} vendas confirmadas
            </span>
          </div>

          <!-- Tabela de Dados do Operador & Chave Pix -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;width:35%;">Operador:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#ffffff;font-weight:700;font-size:13px;">${data.operadorNome} (${data.operadorId})</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">E-mail Corporativo:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#60a5fa;font-size:13px;font-weight:600;">
                <a href="mailto:${data.operadorEmailCorporativo}" style="color:#60a5fa;text-decoration:none;">${data.operadorEmailCorporativo}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">WhatsApp do Operador:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#22c55e;font-size:13px;font-weight:700;">
                ${waLink ? `<a href="${waLink}" style="color:#22c55e;text-decoration:none;" target="_blank">${data.operadorWhatsapp} &rarr;</a>` : (data.operadorWhatsapp || 'Não informado')}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Período de Referência:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#e2e8f0;font-size:13px;font-weight:600;">${data.mesReferencia}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Chave Pix Cadastrada:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#facc15;font-family:monospace;font-size:14px;font-weight:800;background:#0d111a;border-radius:6px;">
                ${data.chavePix} ${data.tipoPix ? `(${data.tipoPix.toUpperCase()})` : ''}
              </td>
            </tr>
          </table>

          <!-- Instrução de Ação para o Admin -->
          <div style="background:#161c28;border:1px dashed #334155;border-radius:10px;padding:14px;margin-bottom:20px;font-size:12px;color:#94a3b8;line-height:1.5;">
            <strong style="color:#ffffff;">Instrução de Execução:</strong><br/>
            Realize o Pix no valor de <strong style="color:#22c55e;">R$ ${repasseFormatado}</strong> para a chave acima e <strong>responda diretamente este e-mail</strong> anexando o comprovante da transferência. O e-mail de resposta será entregue automaticamente na caixa postal corporativa do operador (<strong style="color:#60a5fa;">${data.operadorEmailCorporativo}</strong>).
          </div>

          ${waLink ? `
          <div style="text-align:center;">
            <a href="${waLink}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#22c55e;color:#052e16;text-decoration:none;font-weight:700;font-size:13px;border-radius:10px;">
              Avisar Operador no WhatsApp &rarr;
            </a>
          </div>` : ''}

        </div>
      </div>
    </body>
    </html>
  `;

  await larkTransporter.sendMail({
    from: fromAddress,
    to: toAddress,
    replyTo: data.operadorEmailCorporativo,
    subject: `[REPASSE PIX] ${data.operadorNome} — R$ ${repasseFormatado} (${data.mesReferencia})`,
    html,
  });

  return true;
}
