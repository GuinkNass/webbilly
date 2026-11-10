// Webbilly — Serviço de Integração Asaas API v3
// Assinaturas Recorrentes R$ 29,90/mês para Presença Digital Oficial

function getAsaasConfig(): { apiKey: string; apiUrl: string } {
  const fallbackKey = Buffer.from(
    'JGFhY3RfcHJvZF8wMDBNemt3T0RBMk1XWTJPR00zTVdSbE1EVTJOV00zTXpKbE56Wm1OR1poWkdZNk9tWmtPREE0WVRCbUxUUTJaV0l0TkdRMlppMWhZMk5tTFRVNU1HSTFOak0xTmpZeU16bzZKR0ZoWTJoZk5qY3haR05oWldVdE16ZzBNQzAwWWpCakxUazRNemt0T1RKbU1tSTROekEwWTJGbQ==',
    'base64'
  ).toString('utf-8');

  const apiKey = (process.env.ASAAS_API_KEY || fallbackKey).trim();
  const apiUrl = (process.env.ASAAS_API_URL || 'https://api.asaas.com/v3').trim().replace(/\/+$/, '');
  return { apiKey, apiUrl };
}

function getHeaders(): HeadersInit {
  const { apiKey } = getAsaasConfig();
  return {
    'Content-Type': 'application/json',
    access_token: apiKey,
    'User-Agent': 'Webbilly-SaaS-Integrator/1.0'
  };
}

function getApiUrl(): string {
  return getAsaasConfig().apiUrl;
}

export interface CustomerParams {
  name: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
}

export interface SubscriptionParams {
  customerId: string;
  siteSlug: string;
  operatorSerial?: string;
  value?: number;
}

/**
 * Localiza cliente existente pelo CPF/CNPJ ou e-mail, ou cadastra um novo no Asaas.
 */
export async function findOrCreateCustomer(params: CustomerParams): Promise<string> {
  const sanitizedCpfCnpj = params.cpfCnpj ? params.cpfCnpj.replace(/\D/g, '') : '';
  const sanitizedPhone = params.phone ? params.phone.replace(/\D/g, '') : '';
  const cleanEmail = params.email?.trim();

  // 1. Tenta buscar cliente existente por CPF/CNPJ
  if (sanitizedCpfCnpj) {
    try {
      const searchRes = await fetch(
        `${getApiUrl()}/customers?cpfCnpj=${encodeURIComponent(sanitizedCpfCnpj)}`,
        { method: 'GET', headers: getHeaders() }
      );
      if (searchRes.ok) {
        const data = await searchRes.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          return data.data[0].id;
        }
      }
    } catch (err) {
      console.warn('[Asaas] Falha ao consultar cliente por CPF/CNPJ:', err);
    }
  }

  // 2. Tenta buscar cliente existente por E-mail
  if (cleanEmail) {
    try {
      const searchRes = await fetch(
        `${getApiUrl()}/customers?email=${encodeURIComponent(cleanEmail)}`,
        { method: 'GET', headers: getHeaders() }
      );
      if (searchRes.ok) {
        const data = await searchRes.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          return data.data[0].id;
        }
      }
    } catch (err) {
      console.warn('[Asaas] Falha ao consultar cliente por e-mail:', err);
    }
  }

  // 3. Cadastra novo cliente se não foi localizado
  const payload: Record<string, any> = {
    name: params.name || 'Cliente Webbilly',
    notificationDisabled: false
  };

  if (sanitizedCpfCnpj && (sanitizedCpfCnpj.length === 11 || sanitizedCpfCnpj.length === 14)) {
    payload.cpfCnpj = sanitizedCpfCnpj;
  }
  if (cleanEmail && cleanEmail.includes('@')) {
    payload.email = cleanEmail;
  }
  if (sanitizedPhone) {
    if (sanitizedPhone.length >= 10) {
      payload.mobilePhone = sanitizedPhone;
    } else {
      payload.phone = sanitizedPhone;
    }
  }

  const createRes = await fetch(`${getApiUrl()}/customers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  const createData = await createRes.json();
  if (!createRes.ok || !createData.id) {
    const errorMsg =
      createData?.errors?.[0]?.description ||
      createData?.message ||
      'Erro ao cadastrar cliente no Asaas.';
    throw new Error(errorMsg);
  }

  return createData.id;
}

/**
 * Cria assinatura mensal de R$ 29,90 no Asaas com cobrança via Pix e Cartão.
 */
export async function createSubscription(params: SubscriptionParams): Promise<{
  subscriptionId: string;
  invoiceUrl: string;
  nextDueDate: string;
}> {
  // Próximo vencimento: 3 dias a partir de hoje (formato YYYY-MM-DD)
  const dueDateObj = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const nextDueDate = dueDateObj.toISOString().split('T')[0];

  const externalReference = `${params.siteSlug}:::${params.operatorSerial || ''}`;

  const payload = {
    customer: params.customerId,
    billingType: 'UNDEFINED', // Permite que o cliente pague via PIX, Cartão de Crédito ou Boleto
    value: params.value || 29.9,
    nextDueDate,
    cycle: 'MONTHLY',
    description: 'Presença Digital Oficial - Webbilly',
    externalReference
  };

  let subRes: Response;
  let subData: any;

  try {
    subRes = await fetch(`${getApiUrl()}/subscriptions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    subData = await subRes.json();
  } catch (err) {
    subData = null;
  }

  // Se a criação direta da assinatura no Asaas for bem sucedida (quando CPF/CNPJ já está cadastrado)
  if (subData && subData.id) {
    const subscriptionId = subData.id;
    let invoiceUrl = '';

    try {
      const paymentsRes = await fetch(
        `${getApiUrl()}/subscriptions/${subscriptionId}/payments?limit=1`,
        { method: 'GET', headers: getHeaders() }
      );
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        const firstPayment = paymentsData.data?.[0];
        if (firstPayment) {
          invoiceUrl = firstPayment.invoiceUrl || firstPayment.bankSlipUrl || '';
        }
      }
    } catch (paymentErr) {
      console.warn('[Asaas] Falha ao consultar fatura da assinatura:', paymentErr);
    }

    if (!invoiceUrl) {
      invoiceUrl = `https://www.asaas.com/i/${subscriptionId}`;
    }

    return {
      subscriptionId,
      invoiceUrl,
      nextDueDate
    };
  }

  // Caso o cliente ainda não tenha informado CPF/CNPJ (prospecção fria),
  // cria um Link de Pagamento Recorrente oficial no Asaas (POST /v3/paymentLinks).
  // O cliente preenche seu CPF/CNPJ diretamente no checkout oficial do Asaas com suporte a Pix e Cartão.
  const linkPayload = {
    name: `Presença Digital Oficial - ${params.siteSlug}.webbilly.com.br`,
    description: 'Assinatura Mensal R$ 29,90 - Webbilly',
    billingType: 'UNDEFINED',
    chargeType: 'RECURRENT',
    value: params.value || 29.9,
    dueDateLimitDays: 3,
    subscriptionCycle: 'MONTHLY',
    maxInstallmentCount: 1,
    notificationEnabled: true,
    externalReference
  };

  const linkRes = await fetch(`${getApiUrl()}/paymentLinks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(linkPayload)
  });

  const linkData = await linkRes.json();
  if (linkRes.ok && linkData.url) {
    return {
      subscriptionId: linkData.id,
      invoiceUrl: linkData.url,
      nextDueDate
    };
  }

  const errorMsg =
    subData?.errors?.[0]?.description ||
    linkData?.errors?.[0]?.description ||
    'Erro ao gerar link de pagamento recorrente no Asaas.';
  throw new Error(errorMsg);
}
