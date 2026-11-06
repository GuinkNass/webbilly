import { readDb } from '@/lib/db';

export interface ClientPayload {
  name: string;
  email: string;
  document: string; // CPF (11 dígitos) ou CNPJ (14 dígitos)
  phone: string; // Ex: (11) 98765-4321 ou 11987654321
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

export interface DomainCheckResult {
  available: boolean;
  fullDomain: string;
  status: string;
  classkey?: string;
}

export interface DomainRegisterResult {
  success: boolean;
  orderId?: string;
  entityId?: string;
  domain: string;
  status: string;
  customerId: string;
  contactId: string;
  nameservers: string[];
  rawResponse?: any;
}

/**
 * Obtém as credenciais ativas da ResellerClub (Prioridade: Env Vars > DB Settings > Defaults)
 */
export function getResellerClubConfig() {
  let dbSettings: any = null;
  try {
    const db = readDb();
    dbSettings = db?.adminSettings;
  } catch {
    // Caso DB não esteja acessível momentaneamente
  }

  const userId =
    process.env.RESELLERCLUB_USER_ID ||
    dbSettings?.resellerClubUserId ||
    '1354859';

  const apiKey =
    process.env.RESELLERCLUB_API_KEY ||
    dbSettings?.resellerClubApiKey ||
    '2IQ6a2S6wRyMqdUbFF9344vPxqprjCae';

  const apiUrl =
    process.env.RESELLERCLUB_API_URL ||
    dbSettings?.resellerClubApiUrl ||
    'https://httpapi.com/api';

  return { userId, apiKey, apiUrl: apiUrl.replace(/\/+$/, '') };
}

/**
 * Trata erros conhecidos da API HTTP da ResellerClub
 */
function handleResellerClubError(data: any, defaultMsg = 'Erro na comunicação com a ResellerClub'): never {
  const message = data?.message || data?.error || JSON.stringify(data);
  const msgLower = (message || '').toLowerCase();

  if (
    msgLower.includes('ip is not allowed') ||
    msgLower.includes('access denied from this ip') ||
    msgLower.includes('ip address') ||
    msgLower.includes('unauthorized ip')
  ) {
    throw new Error(
      `[RESELLERCLUB_IP_BLOCKED] IP não autorizado na API da ResellerClub (${message}). Acesse https://rclubbr.webpropanel.com/settings/pro-suite/api-settings para incluir o IP na lista de permissões.`
    );
  }

  if (
    msgLower.includes('insufficient funds') ||
    msgLower.includes('debit account') ||
    msgLower.includes('balance') ||
    msgLower.includes('funds')
  ) {
    throw new Error(
      `[RESELLERCLUB_INSUFFICIENT_FUNDS] Saldo insuficiente na conta pré-paga da ResellerClub para debitar o registro do domínio.`
    );
  }

  if (
    msgLower.includes('already registered') ||
    msgLower.includes('domain exists') ||
    msgLower.includes('registered')
  ) {
    throw new Error(
      `[RESELLERCLUB_DOMAIN_TAKEN] O domínio solicitado já se encontra registrado por outro titular.`
    );
  }

  if (
    msgLower.includes('br-register-num') ||
    msgLower.includes('document') ||
    msgLower.includes('cnpj') ||
    msgLower.includes('cpf')
  ) {
    throw new Error(
      `[RESELLERCLUB_INVALID_DOCUMENT] Documento CPF/CNPJ inválido ou rejeitado pelo Registro.br/ResellerClub: ${message}`
    );
  }

  throw new Error(`${defaultMsg}: ${message}`);
}

/**
 * 1. Consulta disponibilidade de um domínio .com.br
 */
export async function checkDomainAvailability(
  sld: string,
  tld = 'com.br'
): Promise<DomainCheckResult> {
  const { userId, apiKey, apiUrl } = getResellerClubConfig();
  const cleanSld = sld.trim().toLowerCase().replace(/\.com\.br$/i, '').replace(/[^a-z0-9-]/g, '');
  const cleanTld = tld.replace(/^\./, '').toLowerCase();
  const fullDomain = `${cleanSld}.${cleanTld}`;

  const url = new URL(`${apiUrl}/domains/available.json`);
  url.searchParams.set('auth-userid', userId);
  url.searchParams.set('api-key', apiKey);
  url.searchParams.set('domain-name', cleanSld);
  url.searchParams.append('tlds', cleanTld);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });

  const data = await res.json();

  if (data?.status === 'ERROR') {
    handleResellerClubError(data, 'Erro ao verificar disponibilidade');
  }

  const domainInfo = data[fullDomain];
  if (!domainInfo) {
    return {
      available: false,
      fullDomain,
      status: 'unknown'
    };
  }

  const isAvailable = domainInfo.status === 'available';

  return {
    available: isAvailable,
    fullDomain,
    status: domainInfo.status,
    classkey: domainInfo.classkey
  };
}

/**
 * 2. Cadastra o cliente na ResellerClub (ou recupera se já cadastrado)
 */
export async function createResellerCustomer(clientData: ClientPayload): Promise<string> {
  const { userId, apiKey, apiUrl } = getResellerClubConfig();
  const cleanEmail = clientData.email.trim().toLowerCase();
  const cleanPhone = clientData.phone.replace(/\D/g, '');
  const cleanZipcode = (clientData.zipcode || '01310-100').replace(/\D/g, '');

  // Senha temporária complexa (Maiúsculas, minúsculas, números e caracteres especiais)
  const tempPassword = `Billy@${Math.floor(100000 + Math.random() * 900000)}#Op`;

  const params = new URLSearchParams();
  params.set('auth-userid', userId);
  params.set('api-key', apiKey);
  params.set('username', cleanEmail);
  params.set('passwd', tempPassword);
  params.set('name', clientData.name.trim());
  params.set('company', clientData.company?.trim() || clientData.name.trim());
  params.set('address-line-1', clientData.address?.trim() || 'Avenida Paulista, 1000');
  params.set('city', clientData.city?.trim() || 'São Paulo');
  params.set('state', clientData.state?.trim() || 'SP');
  params.set('country', (clientData.country || 'BR').toUpperCase());
  params.set('zipcode', cleanZipcode || '01310100');
  params.set('phone-cc', '55');
  params.set('phone', cleanPhone || '11999998888');
  params.set('lang-pref', 'pt');

  const res = await fetch(`${apiUrl}/customers/signup.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    // Caso a resposta seja um ID numérico puro em formato texto
    if (/^\d+$/.test(text.trim())) {
      return text.trim();
    }
    throw new Error(`Resposta inesperada ao cadastrar cliente na ResellerClub: ${text}`);
  }

  // Se o retorno for um número direto (ID do cliente criado)
  if (typeof data === 'number' || (typeof data === 'string' && /^\d+$/.test(data))) {
    return String(data);
  }

  // Se o cliente já existir, recuperamos o customerId via busca por email
  if (data?.status === 'ERROR' && String(data?.message || '').toLowerCase().includes('already exists')) {
    const detailUrl = new URL(`${apiUrl}/customers/details.json`);
    detailUrl.searchParams.set('auth-userid', userId);
    detailUrl.searchParams.set('api-key', apiKey);
    detailUrl.searchParams.set('username', cleanEmail);

    const detailRes = await fetch(detailUrl.toString(), { method: 'GET' });
    const detailData = await detailRes.json();
    const existingId = detailData?.customerid || detailData?.['customer-id'];
    if (existingId) {
      return String(existingId);
    }
  }

  if (data?.status === 'ERROR') {
    handleResellerClubError(data, 'Erro ao criar cliente na ResellerClub');
  }

  const customerId = data?.customerid || data?.['customer-id'] || data?.entityid;
  if (!customerId) {
    throw new Error(`Falha ao obter ID do cliente retornado pela ResellerClub: ${JSON.stringify(data)}`);
  }

  return String(customerId);
}

/**
 * 3. Cadastra o contato de titularidade com documento brasileiro (CPF ou CNPJ)
 */
export async function createBrazilContact(
  customerId: string,
  clientData: ClientPayload
): Promise<string> {
  const { userId, apiKey, apiUrl } = getResellerClubConfig();
  const cleanDoc = clientData.document.replace(/\D/g, '');
  const isCnpj = cleanDoc.length > 11;
  const cleanPhone = clientData.phone.replace(/\D/g, '');
  const cleanZipcode = (clientData.zipcode || '01310-100').replace(/\D/g, '');

  if (cleanDoc.length < 11) {
    throw new Error(`Documento inválido para registro .com.br: ${clientData.document}`);
  }

  const params = new URLSearchParams();
  params.set('auth-userid', userId);
  params.set('api-key', apiKey);
  params.set('customer-id', customerId);
  params.set('name', clientData.name.trim());
  params.set('company', isCnpj ? (clientData.company?.trim() || clientData.name.trim()) : clientData.name.trim());
  params.set('email', clientData.email.trim().toLowerCase());
  params.set('address-line-1', clientData.address?.trim() || 'Avenida Paulista, 1000');
  params.set('city', clientData.city?.trim() || 'São Paulo');
  params.set('state', clientData.state?.trim() || 'SP');
  params.set('country', (clientData.country || 'BR').toUpperCase());
  params.set('zipcode', cleanZipcode || '01310100');
  params.set('phone-cc', '55');
  params.set('phone', cleanPhone || '11999998888');
  params.set('type', 'BrContact');

  // Parâmetros obrigatórios de documento para o Registro.br (.com.br)
  params.set('attr-name1', 'br-register-num');
  params.set('attr-value1', cleanDoc);
  params.set('attr-name2', 'br-org-type');
  params.set('attr-value2', isCnpj ? 'company' : 'individual');

  const res = await fetch(`${apiUrl}/contacts/add.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    if (/^\d+$/.test(text.trim())) {
      return text.trim();
    }
    throw new Error(`Resposta inesperada ao cadastrar contato na ResellerClub: ${text}`);
  }

  if (typeof data === 'number' || (typeof data === 'string' && /^\d+$/.test(data))) {
    return String(data);
  }

  if (data?.status === 'ERROR') {
    handleResellerClubError(data, 'Erro ao criar contato de titularidade BR');
  }

  const contactId = data?.contactid || data?.['contact-id'] || data?.entityid;
  if (!contactId) {
    throw new Error(`Falha ao obter ID de contato retornado pela ResellerClub: ${JSON.stringify(data)}`);
  }

  return String(contactId);
}

/**
 * 4. Registra o domínio .com.br debitando do saldo e apontando para os DNS da Vercel
 */
export async function registerDomainBr(
  sld: string,
  customerId: string,
  contactId: string,
  nameservers: string[] = ['ns1.vercel-dns.com', 'ns2.vercel-dns.com']
): Promise<DomainRegisterResult> {
  const { userId, apiKey, apiUrl } = getResellerClubConfig();
  const cleanSld = sld.trim().toLowerCase().replace(/\.com\.br$/i, '').replace(/[^a-z0-9-]/g, '');
  const fullDomain = `${cleanSld}.com.br`;

  const params = new URLSearchParams();
  params.set('auth-userid', userId);
  params.set('api-key', apiKey);
  params.set('domain-name', fullDomain);
  params.set('years', '1');
  params.set('customer-id', customerId);
  params.set('reg-contact-id', contactId);
  params.set('admin-contact-id', contactId);
  params.set('tech-contact-id', contactId);
  params.set('billing-contact-id', contactId);
  params.set('invoice-option', 'NoInvoice');
  params.set('protect-privacy', 'false');

  // Adiciona cada nameserver individualmente no formato exigido pela ResellerClub
  for (const ns of nameservers) {
    params.append('ns', ns);
  }

  const res = await fetch(`${apiUrl}/domains/register.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Resposta inválida ao registrar domínio: ${text}`);
  }

  if (data?.status === 'ERROR') {
    handleResellerClubError(data, `Erro ao registrar o domínio ${fullDomain}`);
  }

  return {
    success: true,
    orderId: data?.entityid || data?.orderid || data?.actionid,
    entityId: data?.entityid,
    domain: fullDomain,
    status: data?.status || 'Success',
    customerId,
    contactId,
    nameservers,
    rawResponse: data
  };
}

/**
 * Pipeline completo unificado:
 * 1. Checa disponibilidade
 * 2. Cria Customer
 * 3. Cria Contato BR com CPF/CNPJ
 * 4. Registra apontando para Vercel DNS
 */
export async function registerCompleteClientDomain(
  sld: string,
  clientData: ClientPayload,
  nameservers: string[] = ['ns1.vercel-dns.com', 'ns2.vercel-dns.com']
): Promise<DomainRegisterResult> {
  const cleanSld = sld.trim().toLowerCase().replace(/\.com\.br$/i, '').replace(/[^a-z0-9-]/g, '');
  const fullDomain = `${cleanSld}.com.br`;

  // 1. Validar disponibilidade
  const check = await checkDomainAvailability(cleanSld, 'com.br');
  if (!check.available) {
    throw new Error(`[DOMAIN_UNAVAILABLE] O domínio ${fullDomain} não está disponível para registro.`);
  }

  // 2. Criar ou localizar cliente
  const customerId = await createResellerCustomer(clientData);

  // 3. Criar contato brasileiro com CPF/CNPJ
  const contactId = await createBrazilContact(customerId, clientData);

  // 4. Efetuar o registro
  const regResult = await registerDomainBr(cleanSld, customerId, contactId, nameservers);

  return regResult;
}
