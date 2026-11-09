/**
 * @deprecated DESCONTINUADO NO PIVOT PARA SAAS RECORRENTE (BILLY SUITE)
 * Toda a complexidade de compra de domínios finais (.com.br) via ResellerClub,
 * checagem de IP e whitelist foi descontinuada em favor do modelo de subdomínio
 * (*.webbilly.com.br) e assinatura mensal R$ 29,90 via Mercado Pago.
 */

export function getResellerClubConfig() {
  return {
    userId: 'deprecated',
    apiKey: 'deprecated',
    apiUrl: 'https://httpapi.com/api'
  };
}

export async function checkDomainAvailability(sld: string, tld = 'com.br') {
  return {
    domain: `${sld}.${tld}`,
    fullDomain: `${sld}.${tld}`,
    available: true,
    status: 'available',
    classkey: 'domorder'
  };
}

export interface ClientPayload {
  name: string;
  email: string;
  document: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface DomainRegisterResult {
  success: boolean;
  orderId?: string;
  domain?: string;
  error?: string;
  customerId?: string;
  contactId?: string;
  status?: string;
}

export async function registerCompleteClientDomain(
  fullDomain: string,
  client: ClientPayload,
  nameservers?: string[]
): Promise<DomainRegisterResult> {
  console.warn('[ResellerClub Deprecated] Registro de domínio descontinuado. Usando modelo SaaS subdomínio.');
  return {
    success: true,
    domain: fullDomain,
    orderId: `deprecated_${Date.now()}`,
    customerId: 'deprecated',
    contactId: 'deprecated',
    status: 'active'
  };
}
