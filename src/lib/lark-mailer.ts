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
  cpf?: string;
  whatsapp: string;
  email: string;
  cep?: string;
  address?: string;
  neighborhood?: string;
  cidade?: string;
  city?: string;
  state?: string;
  city_state?: string;
  pixType?: string;
  pixKey?: string;
  pix_type?: string;
  pix_key?: string;
  experiencia?: string;
  experience?: string;
  instagram?: string;
  candidateId?: string;
}

export interface OperatorApprovalEmailData {
  operadorNome: string;
  operadorEmailPessoal: string;
  corporateEmail: string;
  temporaryPassword: string;
  serialToken: string;
  painelUrl?: string;
  webmailUrl?: string;
}

export interface OperatorRejectionEmailData {
  operadorNome: string;
  operadorEmailPessoal: string;
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

export interface CorporateCredentialsEmailData {
  operadorNome: string;
  operadorEmailPessoal: string;
  corporateEmail: string;
  temporaryPassword: string;
  serialToken?: string;
  webmailUrl?: string;
  painelUrl?: string;
}

// -------------------------------------------------------------------------------------------------
// 6. ENVIO DE CREDENCIAIS DE E-MAIL CORPORATIVO (@webbilly.com.br) AO OPERADOR
// -------------------------------------------------------------------------------------------------
export async function sendCorporateCredentialsEmail(data: CorporateCredentialsEmailData): Promise<boolean> {
  const fromAddress = `"Webbilly Tecnologia" <${process.env.LARK_SMTP_USER || 'comercial@webbilly.com.br'}>`;
  const webmailUrl = data.webmailUrl || 'https://mail.larksuite.com';
  const painelUrl = data.painelUrl || 'https://webbilly.com.br/operador';

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:24px;background-color:#0b0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:600px;margin:0 auto;background-color:#141824;border:1px solid #232d42;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        <div style="background:linear-gradient(135deg,#0f141d 0%,#172033 100%);padding:28px 24px;border-bottom:1px solid #232d42;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Web<span style="color:#7abf18;">billy</span></div>
          <div style="display:inline-block;padding:4px 14px;background:rgba(122,191,24,0.15);border:1px solid rgba(122,191,24,0.35);border-radius:9999px;color:#7abf18;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:10px;letter-spacing:0.5px;">
            Boas-vindas à Equipe Comercial
          </div>
        </div>
        <div style="padding:28px 24px;">
          <h2 style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 14px 0;border-left:4px solid #7abf18;padding-left:10px;">
            Seu E-mail Corporativo Oficial foi Gerado!
          </h2>
          <p style="font-size:13px;color:#94a3b8;margin:0 0 20px 0;line-height:1.6;">
            Olá, <strong>${data.operadorNome}</strong>! A administração da Webbilly gerou sua caixa postal corporativa oficial e seus acessos ao ecossistema comercial Billy Suite.
          </p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;width:40%;">E-mail Corporativo:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#7abf18;font-family:monospace;font-size:14px;font-weight:800;">
                ${data.corporateEmail}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Senha Provisória:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#ffffff;font-family:monospace;font-size:14px;font-weight:800;background:#0d111a;border-radius:6px;">
                ${data.temporaryPassword}
              </td>
            </tr>
            ${data.serialToken ? `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Chave Serial Billy:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#38bdf8;font-family:monospace;font-size:13px;font-weight:700;">
                ${data.serialToken}
              </td>
            </tr>` : ''}
          </table>

          <div style="background:#161c28;border:1px solid #334155;border-radius:10px;padding:14px;margin-bottom:24px;font-size:12px;color:#94a3b8;line-height:1.6;">
            <strong style="color:#ffffff;">Segurança no Primeiro Acesso:</strong><br/>
            Ao fazer login no Painel do Operador com este e-mail e senha provisória, o sistema solicitará que você <strong>defina sua nova senha pessoal definitiva</strong>.
          </div>

          <div style="display:flex;gap:12px;text-align:center;">
            <a href="${painelUrl}" target="_blank" style="flex:1;display:inline-block;padding:12px 20px;background-color:#7abf18;color:#052e16;text-decoration:none;font-weight:800;font-size:13px;border-radius:10px;margin-right:8px;">
              Acessar Painel Operador &rarr;
            </a>
            <a href="${webmailUrl}" target="_blank" style="flex:1;display:inline-block;padding:12px 20px;background-color:#1e293b;color:#f8fafc;border:1px solid #334155;text-decoration:none;font-weight:700;font-size:13px;border-radius:10px;">
              Abrir Webmail Lark &rarr;
            </a>
          </div>

          <p style="font-size:11px;color:#64748b;margin:24px 0 0 0;text-align:center;">
            Webbilly Tecnologia • Suporte Operadores: operadores@webbilly.com.br
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await larkTransporter.sendMail({
      from: fromAddress,
      to: data.operadorEmailPessoal,
      cc: 'operadores@webbilly.com.br',
      subject: `[Webbilly] Seu E-mail Corporativo e Acesso ao Painel — ${data.corporateEmail}`,
      html,
    });
    return true;
  } catch (err) {
    console.warn('[LarkMailer] Erro ao enviar credenciais corporativas:', err);
    return false;
  }
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
  const candidateCity = data.city_state || data.cidade || (data.city ? `${data.city}${data.state ? ' / ' + data.state : ''}` : '') || 'Não informado';
  const candidateExp = data.experiencia || data.experience || '';
  const candidateCpf = data.cpf || 'Não informado';
  const candidateAddress = [data.address, data.neighborhood, data.cep].filter(Boolean).join(', ') || 'Não informado';
  const candidatePix = data.pixKey || data.pix_key ? `${data.pixKey || data.pix_key} (${(data.pixType || data.pix_type || 'CPF').toUpperCase()})` : 'Não informado';

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
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">CPF:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#ffffff;font-mono;font-size:13px;">${candidateCpf}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">WhatsApp:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#22c55e;font-size:13px;font-weight:700;">
                ${waLink ? `<a href="${waLink}" style="color:#22c55e;text-decoration:none;" target="_blank">${data.whatsapp} &rarr;</a>` : data.whatsapp}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">E-mail Pessoal:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#60a5fa;font-size:13px;">
                <a href="mailto:${data.email}" style="color:#60a5fa;text-decoration:none;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Cidade/Estado:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#e2e8f0;font-size:13px;">${candidateCity}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Endereço:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#e2e8f0;font-size:13px;">${candidateAddress}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Chave Pix:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#22c55e;font-mono;font-size:13px;">${candidatePix}</td>
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
    subject: `[OPERADOR] Nova Candidatura: ${candidateName}`,
    html,
  });

  return true;
}

// -------------------------------------------------------------------------------------------------
// 1.1 APROVAÇÃO OFICIAL DE OPERADOR COM E-MAIL CORPORATIVO E SERIAL DESKTOP
// -------------------------------------------------------------------------------------------------
export async function sendOperatorApprovalEmail(data: OperatorApprovalEmailData): Promise<boolean> {
  const fromAddress = `"Webbilly Operadores" <${process.env.LARK_EMAIL_OPERADORES || 'operadores@webbilly.com.br'}>`;
  const painelUrl = data.painelUrl || 'https://webbilly.com.br/operador';
  const webmailUrl = data.webmailUrl || 'https://mail.larksuite.com';

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:24px;background-color:#0b0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:620px;margin:0 auto;background-color:#141824;border:1px solid #232d42;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0a1510 0%,#13281c 100%);padding:28px 24px;border-bottom:1px solid #1d3e2b;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Web<span style="color:#7abf18;">billy</span></div>
          <div style="display:inline-block;padding:4px 14px;background:rgba(122,191,24,0.15);border:1px solid rgba(122,191,24,0.35);border-radius:9999px;color:#7abf18;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:10px;letter-spacing:0.5px;">
            Aprovação de Cadastro • Boas-vindas
          </div>
        </div>

        <!-- Conteúdo -->
        <div style="padding:28px 24px;">
          <h2 style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 14px 0;border-left:4px solid #7abf18;padding-left:10px;">
            Parabéns, ${data.operadorNome}! Seu cadastro foi Aprovado.
          </h2>
          <p style="font-size:13px;color:#94a3b8;margin:0 0 20px 0;line-height:1.6;">
            A administração da Webbilly analisou seus dados e ativou seu credenciamento oficial como Operador Comercial. Abaixo estão suas credenciais exclusivas para acessar o Painel Web e o Programa Desktop:
          </p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;width:40%;">E-mail Corporativo:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#7abf18;font-family:monospace;font-size:14px;font-weight:800;">
                ${data.corporateEmail}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Senha Provisória:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#ffffff;font-family:monospace;font-size:14px;font-weight:800;background:#0d111a;border-radius:6px;">
                ${data.temporaryPassword}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#94a3b8;font-size:13px;">Chave Serial Billy Suite Desktop:</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1f2738;color:#38bdf8;font-family:monospace;font-size:13px;font-weight:800;background:#0d111a;border-radius:6px;">
                ${data.serialToken}
              </td>
            </tr>
          </table>

          <div style="background:#161c28;border:1px solid #334155;border-radius:12px;padding:16px;margin-bottom:24px;font-size:12px;color:#94a3b8;line-height:1.6;">
            <strong style="color:#ffffff;">Central de Downloads no Painel do Operador:</strong><br/>
            Ao entrar no seu Painel, você encontrará os links oficiais para baixar:
            <ul style="margin:8px 0 0 0;padding-left:18px;color:#cbd5e1;">
              <li><strong>Programa Billy Suite Desktop</strong> (Windows 10/11) — ative apenas colando seu Serial.</li>
              <li><strong>Extensão Chrome WhatsApp Web</strong> para disparos e propostas automáticas.</li>
              <li><strong>Aplicativo Lark Mail</strong> para usar seu e-mail corporativo no computador e celular.</li>
            </ul>
          </div>

          <div style="text-align:center;margin-top:20px;">
            <a href="${painelUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#7abf18;color:#052e16;text-decoration:none;font-weight:800;font-size:14px;border-radius:12px;box-shadow:0 4px 15px rgba(122,191,24,0.3);">
              Acessar Painel do Operador &rarr;
            </a>
          </div>

          <p style="font-size:11px;color:#64748b;margin:24px 0 0 0;text-align:center;">
            Webbilly Tecnologia • Suporte Operadores: operadores@webbilly.com.br
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await larkTransporter.sendMail({
      from: fromAddress,
      to: data.operadorEmailPessoal,
      cc: 'operadores@webbilly.com.br',
      subject: `[Webbilly] Parabéns! Seu cadastro foi APROVADO — Acesso ao Painel e Billy Suite`,
      html,
    });
    return true;
  } catch (err) {
    console.warn('[LarkMailer] Erro ao enviar aprovação de operador:', err);
    return false;
  }
}

// -------------------------------------------------------------------------------------------------
// 1.2 RECUSA CORDIAL POR CONTINGÊNCIA (BANCO DE TALENTOS)
// -------------------------------------------------------------------------------------------------
export async function sendOperatorRejectionEmail(data: OperatorRejectionEmailData): Promise<boolean> {
  const fromAddress = `"Webbilly Operadores" <${process.env.LARK_EMAIL_OPERADORES || 'operadores@webbilly.com.br'}>`;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:24px;background-color:#0b0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:600px;margin:0 auto;background-color:#141824;border:1px solid #232d42;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0f141d 0%,#172033 100%);padding:28px 24px;border-bottom:1px solid #232d42;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Web<span style="color:#7abf18;">billy</span></div>
          <div style="display:inline-block;padding:4px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:9999px;color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:10px;letter-spacing:0.5px;">
            Atualização de Processo Seletivo
          </div>
        </div>

        <!-- Conteúdo -->
        <div style="padding:28px 24px;">
          <h2 style="font-size:17px;font-weight:800;color:#ffffff;margin:0 0 14px 0;">
            Olá, ${data.operadorNome}.
          </h2>
          <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin:0 0 16px 0;">
            Agradecemos sinceramente pelo envio de seus dados e pelo interesse em atuar como Operador Comercial parceiro da Webbilly.
          </p>
          <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin:0 0 16px 0;">
            Informamos que, por <strong>contingência operacional e preenchimento integral das vagas regionais para este ciclo</strong>, não conseguiremos liberar novas licenças de operação para a sua praça neste momento.
          </p>
          <div style="background:#0d111a;border:1px solid #1e2638;border-radius:12px;padding:16px;margin:20px 0;font-size:12px;color:#cbd5e1;line-height:1.6;">
            Seu cadastro e currículo comercial permanecerão ativos em nosso <strong>Banco de Talentos Preferencial</strong>. Assim que um novo lote de licenças e cotas regionais for disponibilizado, entraremos em contato prioritariamente pelo seu WhatsApp.
          </div>
          <p style="font-size:12px;color:#64748b;line-height:1.6;margin:16px 0 0 0;text-align:center;">
            Atenciosamente,<br/>
            <strong style="color:#94a3b8;">Equipe de Recrutamento & Operações Webbilly</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await larkTransporter.sendMail({
      from: fromAddress,
      to: data.operadorEmailPessoal,
      subject: `[Webbilly] Atualização sobre sua candidatura ao time comercial`,
      html,
    });
    return true;
  } catch (err) {
    console.warn('[LarkMailer] Erro ao enviar e-mail de contingência:', err);
    return false;
  }
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
