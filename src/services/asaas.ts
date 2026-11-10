// Webbilly — Serviço de Integração Asaas API v3
// Assinaturas Recorrentes R$ 29,90/mês para Presença Digital Oficial

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';
const ASAAS_API_URL = (process.env.ASAAS_API_URL || 'https://api.asaas.com/v3').replace(/\/+$/, '');

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    access_token: ASAAS_API_KEY,
    'User-Agent': 'Webbilly-SaaS-Integrator/1.0'
  };
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
        `${ASAAS_API_URL}/customers?cpfCnpj=${encodeURIComponent(sanitizedCpfCnpj)}`,
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
        `${ASAAS_API_URL}/customers?email=${encodeURIComponent(cleanEmail)}`,
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

  const createRes = await fetch(`${ASAAS_API_URL}/customers`, {
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

  const subRes = await fetch(`${ASAAS_API_URL}/subscriptions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  const subData = await subRes.json();
  if (!subRes.ok || !subData.id) {
    const errorMsg =
      subData?.errors?.[0]?.description ||
      subData?.message ||
      'Erro ao gerar assinatura mensal no Asaas.';
    throw new Error(errorMsg);
  }

  const subscriptionId = subData.id;
  let invoiceUrl = '';

  // Consulta a primeira fatura gerada para obter o link público de pagamento (invoiceUrl)
  try {
    const paymentsRes = await fetch(
      `${ASAAS_API_URL}/subscriptions/${subscriptionId}/payments?limit=1`,
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

  // Fallback caso a lista de pagamentos ainda não tenha propagado
  if (!invoiceUrl) {
    invoiceUrl = `https://www.asaas.com/i/${subscriptionId}`;
  }

  return {
    subscriptionId,
    invoiceUrl,
    nextDueDate
  };
}
