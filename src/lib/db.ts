import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const IS_VERCEL = !!process.env.VERCEL;
const BUNDLED_DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
const RUNTIME_DB_PATH = IS_VERCEL ? path.join('/tmp', 'webbilly_db.json') : BUNDLED_DB_PATH;

function getDbPath(): string {
  if (IS_VERCEL) {
    if (!fs.existsSync(RUNTIME_DB_PATH)) {
      try {
        if (fs.existsSync(BUNDLED_DB_PATH)) {
          fs.copySync(BUNDLED_DB_PATH, RUNTIME_DB_PATH);
        } else {
          fs.writeJsonSync(RUNTIME_DB_PATH, getDefaultDatabase());
        }
      } catch (e) {
        console.error('Erro ao inicializar DB no /tmp da Vercel:', e);
        return BUNDLED_DB_PATH;
      }
    }
    return RUNTIME_DB_PATH;
  }
  return BUNDLED_DB_PATH;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  phone?: string;
  city: string;
  state: string;
  city_state?: string;
  cpf?: string;
  cep?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  pixType: 'cpf' | 'cnpj' | 'phone' | 'email' | 'random' | string;
  pixKey: string;
  pix_type?: string;
  pix_key?: string;
  resumeUrl?: string;
  experience?: string;
  instagram?: string;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  notes?: string;
  rejected_at?: string;
  reapply_after?: string;
  referred_by_operator_id?: string | null;
  affiliate_code_used?: string | null;
  accepted_terms_at?: string;
  accepted_terms_ip?: string;
  accepted_terms_version?: string;
  avatar_config?: any;
  avatarConfig?: any;
  avatar_svg?: string;
  avatarSvg?: string;
  auth_provider?: string;
  authProvider?: string;
}

export interface Operator {
  id: string;
  candidateId?: string;
  name: string;
  cpf?: string;
  email: string;
  passwordHash: string;
  tempPasswordPlain?: string;
  mustChangePassword?: boolean;
  must_change_password?: boolean;
  corporate_email?: string;
  corporateEmail?: string;
  lark_provisioned?: boolean;
  larkProvisioned?: boolean;
  whatsapp: string;
  pixType: string;
  pixKey: string;
  pix_type?: string;
  pix_key?: string;
  serialToken: string;
  status: 'PENDENTE' | 'PENDENTE_APROVACAO' | 'ATIVO' | 'BLOQUEADO' | 'RECUSADO' | 'rejected';
  rejected_at?: string;
  reapply_after?: string;
  phone?: string;
  cep?: string;
  address?: string;
  neighborhood?: string;
  city_state?: string;
  cityState?: string;
  experience?: string;
  machineId?: string | null;
  osInfo?: string | null;
  operatorIp?: string | null;
  lastSync?: string | null;
  dailyLimit: number;
  todayGenerations: number;
  createdAt: string;
  affiliate_enabled?: boolean;
  affiliate_code?: string;
  referred_by_operator_id?: string | null;
  role?: string;
  is_partner?: boolean;
  accepted_terms_at?: string;
  accepted_terms_ip?: string;
  accepted_terms_version?: string;
  avatar_config?: any;
  avatarConfig?: any;
  avatar_svg?: string;
  avatarSvg?: string;
  auth_provider?: string;
  authProvider?: string;
}

export interface LicenseRecord {
  id?: string;
  serialToken: string;
  operatorId?: string | null;
  operatorName?: string | null;
  operatorEmail?: string | null;
  email?: string | null;
  status: 'pending_onboarding' | 'pending_approval' | 'pending_activation' | 'active' | 'revoked' | 'ATIVO' | 'EM_USO' | 'BLOQUEADO';
  machineId?: string | null;
  osInfo?: string | null;
  operatorIp?: string | null;
  dailyLimit?: number;
  lastSync?: string | null;
  createdAt: string;
  activatedAt?: string | null;
}

export interface Sale {
  id: string;
  operatorId: string;
  operatorName: string;
  clientName: string;
  clientWhatsapp: string;
  siteUrl: string;
  niche?: string;
  saleValue: number;
  commissionValue: number;
  pixStatus: 'PENDENTE' | 'PAGO';
  pixPaidAt?: string | null;
  pixProof?: string | null;
  domainRegistered?: string | null;
  resellerClubOrderId?: string | null;
  createdAt: string;
}

export interface AdminSettings {
  geminiApiKey: string;
  geminiModel: string;
  cloudflareAccountId: string;
  cloudflareApiToken: string;
  vercelToken: string;
  mercadopagoAccessToken?: string;
  mercadopagoPublicKey?: string;
  monthlySubscriptionPrice?: number;
  operatorCommissionMonthly?: number;
  resellerClubUserId?: string;
  resellerClubApiKey?: string;
  resellerClubApiUrl?: string;
  pixGateway: 'mercadopago' | 'asaas' | 'manual';
  pixGatewayKey: string;
  defaultDailyLimit: number;
  commissionPerSale: number;
}

export interface AdminUser {
  id: string;
  email: string;
  personal_email?: string;
  name: string;
  passwordHash: string;
  role: 'MASTER';
  is_partner?: boolean;
  status?: string;
  avatar_config?: any;
  avatarConfig?: any;
  avatar_svg?: string;
  avatarSvg?: string;
  auth_provider?: string;
  authProvider?: string;
}

export interface BriefingRecord {
  leadToken: string;
  title: string;
  phone: string;
  category: string;
  address: string;
  instagram: string;
  bio: string;
  services: Array<{ name: string; price: string; description?: string }>;
  domainIdeas: string[];
  photos: string[];
  submittedAt: string;
  status: 'PENDENTE' | 'PROCESSADO' | 'RECUSADO' | 'declined';
  deployedUrl?: string;
  demoUrl?: string;
  accepted_terms_at?: string;
  accepted_terms_ip?: string;
  accepted_terms_version?: string;
  avatar_config?: any;
  avatarConfig?: any;
  avatar_svg?: string;
  avatarSvg?: string;
  auth_provider?: string;
  authProvider?: string;
}

export interface DemoRecord {
  leadToken: string;
  title: string;
  category?: string;
  deployedUrl: string;
  instagram?: string;
  phone?: string;
  html?: string;
  updatedAt: string;
}

export interface SubscriptionRecord {
  id: string;
  leadToken?: string;
  siteSlug: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientCpfCnpj?: string;
  operatorId?: string;
  operatorName?: string;
  operatorToken?: string;
  monthlyPrice: number;
  commissionMonthly?: number;
  status: 'active' | 'pending' | 'suspended' | 'cancelled' | 'draft' | 'awaiting_first_payment' | 'abandoned_checkout';
  deployedUrl?: string;
  asaasCustomerId?: string;
  asaas_customer_id?: string;
  asaasSubscriptionId?: string | null;
  asaas_subscription_id?: string | null;
  asaasPaymentId?: string | null;
  asaas_payment_id?: string | null;
  asaasInvoiceUrl?: string;
  vercelProjectId?: string;
  vercel_project_id?: string;
  cancellationRequested?: boolean;
  cancellation_requested?: boolean;
  cancellationReason?: string;
  cancellation_reason?: string;
  cancellationRequestedAt?: string;
  cancellation_requested_at?: string;
  cancelledAt?: string;
  cancelled_at?: string;
  siteStatus?: string;
  site_status?: string;
  mpPreferenceId?: string;
  mpPreapprovalId?: string;
  mpPaymentId?: string;
  checkoutUrl: string;
  lastPaymentDate?: string;
  nextRenewalDate?: string;
  custom_domain?: string;
  customDomain?: string;
  domain_status?: 'subdomain_only' | 'pending_payment' | 'propagating' | 'active';
  domainStatus?: 'subdomain_only' | 'pending_payment' | 'propagating' | 'active';
  domain_purchased_at?: string;
  domainPurchasedAt?: string;
  domainPrice?: number;
  domainPaymentMethod?: 'card_vercel' | 'pix_br';
  accepted_terms_at?: string;
  accepted_terms_ip?: string;
  accepted_terms_version?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteChangeRequestRecord {
  id: string;
  siteSlug: string;
  site_slug?: string;
  clientName?: string;
  client_name?: string;
  clientWhatsapp?: string;
  client_whatsapp?: string;
  operatorId?: string;
  operator_id?: string;
  status: 'pending' | 'completed' | 'rejected';
  changesPayload: {
    logoUrl?: string;
    newPhone?: string;
    newWhatsapp?: string;
    newAddress?: string;
    newHours?: string;
    businessUpdates?: string;
    ownerOrTeamPhoto?: {
      url: string;
      description: string;
    };
    galleryPhotos?: Array<{
      url: string;
      description: string;
      placementHint?: string;
    }>;
    generalNotes?: string;
    [key: string]: any;
  };
  changes_payload?: any;
  createdAt: string;
  created_at?: string;
  completedAt?: string;
  completed_at?: string;
}

export interface PayoutRequest {
  id: string;
  operatorId: string;
  operatorName: string;
  corporateEmail: string;
  mesReferencia: string;
  vendasCount: number;
  valorTotalFaturado: number;
  valorRepasse: number;
  chavePix: string;
  tipoPix?: string;
  status: 'PENDENTE' | 'PAGO';
  requestedAt: string;
  paidAt?: string;
  pixProof?: string;
}

export interface MedalUpgradeRecord {
  id: string;
  operatorId: string;
  fromTier: string;
  toTier: string;
  monthRef: string; // e.g. "2026-11"
  bonusPercentage: number; // 20
  baseEarnings: number;
  bonusAmount: number;
  achievedAt: string;
  payoutApplied?: boolean;
}

export interface AffiliateCommissionRecord {
  id: string;
  affiliate_operator_id: string; // Operador padrinho que recebe os 5% (R$ 24,50)
  invited_operator_id: string;   // Operador convidado que realizou a venda
  invited_operator_name?: string;
  lead_or_sale_id: string;       // Identificador único/idempotente
  sale_amount: number;           // 490.00
  commission_rate: number;       // 0.05
  commission_amount: number;     // 24.50
  month_ref: string;             // 'YYYY-MM'
  payout_status: 'available' | 'requested' | 'paid';
  created_at: string;
  paid_at?: string;
  payout_request_id?: string;
}

export interface SystemAlertRecord {
  id: string;
  title: string;
  message: string;
  priority: 'info' | 'promo' | 'urgent';
  type?: string;
  target_role?: string;
  site_slug?: string;
  client_name?: string;
  client_whatsapp?: string;
  subscription_id?: string;
  protocol?: string;
  action_label?: string;
  action_url?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
}

export interface OperatorAlertReadRecord {
  id: string;
  operator_id: string;
  alert_id: string;
  read_at: string;
}

export interface ClientAccountRecord {
  id: string; // uuid
  site_id?: string;
  siteSlug?: string;
  site_slug: string;
  lead_id?: string | null;
  leadId?: string | null;
  operator_id?: string | null;
  operatorId?: string | null;
  business_name: string;
  businessName?: string;
  domain_login: string; // unique (e.g. 13pointtattoo.webbilly.com.br)
  domainLogin?: string;
  email?: string | null;
  phone?: string | null;
  password_hash: string;
  passwordHash?: string;
  initial_password_plain?: string | null;
  initialPasswordPlain?: string | null;
  plan_type: 'monthly_29_90' | 'custom_domain_490';
  planType?: 'monthly_29_90' | 'custom_domain_490';
  status: 'active' | 'blocked';
  monthly_edits_limit: number;
  monthly_edits_used: number;
  extra_edit_credits: number;
  edits_reset_at: string; // ISO date
  editsResetAt?: string;
  asaas_customer_id?: string | null;
  asaasCustomerId?: string | null;
  asaas_subscription_id?: string | null;
  asaasSubscriptionId?: string | null;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
}

export interface SiteEditRequestRecord {
  id: string; // uuid
  client_account_id: string;
  clientAccountId?: string;
  site_slug: string;
  siteSlug?: string;
  operator_id?: string | null;
  operatorId?: string | null;
  title: string;
  description: string;
  photos: string[];
  status: 'enviada' | 'em_andamento' | 'publicada';
  operator_notes?: string | null;
  operatorNotes?: string | null;
  is_extra_credit: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface AdminAffiliateToolRecord {
  id: string; // uuid
  name: string;
  category: string;
  description: string;
  benefit?: string | null;
  cta_text?: string | null;
  ctaText?: string | null;
  logo_url?: string | null;
  logoUrl?: string | null;
  affiliate_link: string;
  affiliateLink?: string;
  is_active: boolean;
  isActive?: boolean;
  display_order: number;
  displayOrder?: number;
  clicks_count: number;
  clicksCount?: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSchema {
  candidates: Candidate[];
  operators: Operator[];
  licenses: LicenseRecord[];
  sales: Sale[];
  adminSettings: AdminSettings;
  adminUsers: AdminUser[];
  briefings?: Record<string, BriefingRecord>;
  demos?: Record<string, DemoRecord>;
  generatedSites?: Record<string, string>;
  subscriptions: SubscriptionRecord[];
  payoutRequests?: PayoutRequest[];
  medalUpgrades?: MedalUpgradeRecord[];
  affiliateCommissions?: AffiliateCommissionRecord[];
  siteChangeRequests?: SiteChangeRequestRecord[];
  systemAlerts?: SystemAlertRecord[];
  operatorAlertReads?: OperatorAlertReadRecord[];
  clientAccounts?: ClientAccountRecord[];
  siteEditRequests?: SiteEditRequestRecord[];
  adminAffiliateTools?: AdminAffiliateToolRecord[];
  siteDailyStats?: SiteDailyStatRecord[];
  platformPricing?: {
    id: string;
    monthly_plan_price: number;
    custom_domain_price: number;
    extra_edit_price: number;
    operator_commission_percent: number;
    affiliate_bonus_percent: number;
    updated_at?: string;
  };
}

export interface SiteDailyStatRecord {
  id: string;
  domain: string;
  site_id?: string | null;
  stat_date: string; // YYYY-MM-DD
  page_views: number;
  unique_visitors: number;
  whatsapp_clicks: number;
  mobile_views: number;
  desktop_views: number;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_ADMIN_AFFILIATE_TOOLS: AdminAffiliateToolRecord[] = [
  {
    id: 'tool-ton-oficial',
    name: 'Maquininha Ton com Taxa Reduzida',
    category: 'Pagamentos & Maquininha',
    description: 'Aceite cartão de crédito, débito e Pix no balcão ou delivery com as menores taxas do mercado e recebimento rápido.',
    benefit: 'Desconto Exclusivo Parceiro',
    cta_text: 'Ver Catálogo com Desconto',
    ctaText: 'Ver Catálogo com Desconto',
    logo_url: 'https://ton.stone.com.br/favicon.ico',
    logoUrl: 'https://ton.stone.com.br/favicon.ico',
    affiliate_link: 'https://ton.com.br/catalogo/?referrer=9AFABF91-00C4-4EE9-8AAE-86C99E4D084B&userAnticipation=0&utm_medium=invite_share&utm_source=revendedor',
    affiliateLink: 'https://ton.com.br/catalogo/?referrer=9AFABF91-00C4-4EE9-8AAE-86C99E4D084B&userAnticipation=0&utm_medium=invite_share&utm_source=revendedor',
    is_active: true,
    isActive: true,
    display_order: 1,
    displayOrder: 1,
    clicks_count: 0,
    clicksCount: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tool-asaas-oficial',
    name: 'Conta PJ & Cobranças Pix/Boleto Asaas',
    category: 'Pagamentos & Maquininha',
    description: 'Envie links de pagamento, boletos e Pix automático pelo WhatsApp com régua de cobrança integrada para seus clientes.',
    benefit: 'Sem Mensalidade',
    cta_text: 'Abrir Conta Gratuita',
    ctaText: 'Abrir Conta Gratuita',
    logo_url: 'https://www.asaas.com/favicon.ico',
    logoUrl: 'https://www.asaas.com/favicon.ico',
    affiliate_link: 'https://www.asaas.com/r/240aa974-f024-4664-8694-f41ddff777d8',
    affiliateLink: 'https://www.asaas.com/r/240aa974-f024-4664-8694-f41ddff777d8',
    is_active: true,
    isActive: true,
    display_order: 2,
    displayOrder: 2,
    clicks_count: 0,
    clicksCount: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tool-nuvemshop-oficial',
    name: 'Sua Loja Virtual & Catálogo Online (Nuvemshop)',
    category: 'Loja Virtual',
    description: 'Transforme visitantes do seu site em compradores online com carrinho, cálculo de frete e checkout completo integrado.',
    benefit: 'Benefício WebBILLY',
    cta_text: 'Criar Minha Loja Online',
    ctaText: 'Criar Minha Loja Online',
    logo_url: 'https://assets.nuvemshop.com.br/assets/images/logo-nuvemshop.svg',
    logoUrl: 'https://assets.nuvemshop.com.br/assets/images/logo-nuvemshop.svg',
    affiliate_link: 'https://www.nuvemshop.com.br/partners/webbilly',
    affiliateLink: 'https://www.nuvemshop.com.br/partners/webbilly',
    is_active: true,
    isActive: true,
    display_order: 3,
    displayOrder: 3,
    clicks_count: 0,
    clicksCount: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tool-bling-oficial',
    name: 'Sistema de Gestão & Emissor de Nota Fiscal (Bling ERP)',
    category: 'Gestão & Nota Fiscal',
    description: 'Controle seu estoque, caixa (PDV), vendas e emita notas fiscais (NF-e / NFC-e) em segundos com condição especial de parceiro.',
    benefit: 'Cupom: GUINKNASS',
    cta_text: 'Ativar Benefício Bling',
    ctaText: 'Ativar Benefício Bling',
    logo_url: 'https://www.bling.com.br/favicon.ico',
    logoUrl: 'https://www.bling.com.br/favicon.ico',
    affiliate_link: 'https://www.bling.com.br/planos-e-precos/GUINKNASS',
    affiliateLink: 'https://www.bling.com.br/planos-e-precos/GUINKNASS',
    is_active: true,
    isActive: true,
    display_order: 4,
    displayOrder: 4,
    clicks_count: 0,
    clicksCount: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  }
];

export function getDefaultSubscriptions(): SubscriptionRecord[] {
  return [];
}

function generateSerial(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `BILLY-OP-${part1}-${part2}-2026`;
}

function getDefaultDatabase(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('admin123456', 10);
  const opPasswordHash = bcrypt.hashSync('operador123', 10);
  const sampleSerial = 'BILLY-OP-DEMO-9988-2026';
  const masterSerial = 'BILLY-OP-ADMIN-MASTER-2026';

  return {
    candidates: [],
    operators: [
      {
        id: 'OP-1001',
        name: 'Carlos Eduardo Silva',
        email: 'carlos.operador@billysuite.com.br',
        passwordHash: opPasswordHash,
        whatsapp: '(11) 97123-4567',
        pixType: 'email',
        pixKey: 'carlos.pix@gmail.com',
        serialToken: sampleSerial,
        status: 'ATIVO',
        machineId: 'WIN-DESKTOP-98B2',
        osInfo: 'Windows 11 Pro 64-bit',
        lastSync: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        dailyLimit: 50,
        todayGenerations: 14,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: 'OP-0001',
        name: 'Administrador Master Billy',
        email: 'admin@billysuite.com.br',
        passwordHash: adminPasswordHash,
        whatsapp: '(11) 99999-9999',
        pixType: 'cpf',
        pixKey: '000.000.000-00',
        serialToken: masterSerial,
        status: 'ATIVO',
        machineId: null,
        osInfo: null,
        lastSync: null,
        dailyLimit: 999,
        todayGenerations: 0,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: 'OP-C071',
        name: 'Lucas Klock',
        email: 'lucasklock@gmail.com',
        corporate_email: 'lucas@webbilly.com.br',
        corporateEmail: 'lucas@webbilly.com.br',
        role: 'admin',
        is_partner: true,
        passwordHash: bcrypt.hashSync('WebBilly@2026#Lucas', 10),
        whatsapp: '(47) 99123-4567',
        pixType: 'cpf',
        pixKey: '000.111.222-33',
        serialToken: 'BILLY-OP-C071-A33F',
        status: 'ATIVO',
        machineId: 'BILLY-PC-C071A33F',
        osInfo: 'Windows 11 Pro 64-bit',
        lastSync: new Date().toISOString(),
        dailyLimit: 999,
        todayGenerations: 0,
        createdAt: new Date().toISOString()
      }
    ],
    licenses: [
      {
        serialToken: 'BILLY-OP-C071-A33F',
        operatorId: 'OP-C071',
        operatorName: 'Lucas Klock',
        status: 'active',
        machineId: 'BILLY-PC-C071A33F',
        osInfo: 'Windows 11 Pro 64-bit',
        lastSync: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        serialToken: sampleSerial,
        operatorId: 'OP-1001',
        operatorName: 'Carlos Eduardo Silva',
        status: 'EM_USO',
        machineId: 'WIN-DESKTOP-98B2',
        osInfo: 'Windows 11 Pro 64-bit',
        lastSync: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        serialToken: masterSerial,
        operatorId: 'OP-0001',
        operatorName: 'Administrador Master Billy',
        status: 'ATIVO',
        machineId: null,
        osInfo: null,
        lastSync: null,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      }
    ],
    sales: [],
    adminSettings: {
      geminiApiKey: '',
      geminiModel: 'gemini-3.8-flash',
      cloudflareAccountId: 'cf_acc_demo_772183',
      cloudflareApiToken: 'cf_tok_live_883920194827',
      vercelToken: 'verc_tok_9981203847',
      resellerClubUserId: '1354859',
      resellerClubApiKey: '2IQ6a2S6wRyMqdUbFF9344vPxqprjCae',
      resellerClubApiUrl: 'https://httpapi.com/api',
      pixGateway: 'mercadopago',
      pixGatewayKey: 'APP_USR-7826315273-091823-DEMO-KEY',
      defaultDailyLimit: 50,
      commissionPerSale: 200
    },
    adminUsers: [
      {
        id: 'ADMIN-001',
        email: 'admin@billysuite.com.br',
        name: 'Administrador Master Billy',
        passwordHash: adminPasswordHash,
        role: 'MASTER'
      },
      {
        id: 'ADMIN-002',
        email: 'lucas@webbilly.com.br',
        personal_email: 'lucasklock@gmail.com',
        name: 'Lucas Klock',
        passwordHash: bcrypt.hashSync('WebBilly@2026#Lucas', 10),
        role: 'MASTER',
        is_partner: true,
        status: 'active'
      }
    ],
    subscriptions: getDefaultSubscriptions(),
    clientAccounts: [],
    siteEditRequests: [],
    adminAffiliateTools: [...DEFAULT_ADMIN_AFFILIATE_TOOLS]
  };
}

export function readDb(): DatabaseSchema {
  try {
    const activePath = getDbPath();
    let data: DatabaseSchema;

    if (!fs.existsSync(activePath)) {
      data = getDefaultDatabase();
      try {
        fs.ensureDirSync(path.dirname(activePath));
        fs.writeJsonSync(activePath, data, { spaces: 2 });
      } catch {}
      return data;
    }
    data = fs.readJsonSync(activePath);

    // Validação e auto-cura de dados essenciais (adminUsers, operadores padrão e licenças)
    let needsWrite = false;
    const defaultMasterHash = bcrypt.hashSync('admin123456', 10);
    const defaultLucasHash = bcrypt.hashSync('WebBilly@2026#Lucas', 10);

    if (!Array.isArray(data.adminUsers) || data.adminUsers.length === 0) {
      data.adminUsers = [
        {
          id: 'ADMIN-001',
          email: 'admin@billysuite.com.br',
          name: 'Administrador Master Billy',
          passwordHash: defaultMasterHash,
          role: 'MASTER'
        },
        {
          id: 'ADMIN-002',
          email: 'lucas@webbilly.com.br',
          personal_email: 'lucasklock@gmail.com',
          name: 'Lucas Klock',
          passwordHash: defaultLucasHash,
          role: 'MASTER',
          is_partner: true,
          status: 'active'
        }
      ];
      needsWrite = true;
    } else {
      const admin = data.adminUsers.find(u => u.email.toLowerCase() === 'admin@billysuite.com.br');
      if (!admin) {
        data.adminUsers.push({
          id: 'ADMIN-001',
          email: 'admin@billysuite.com.br',
          name: 'Administrador Master Billy',
          passwordHash: defaultMasterHash,
          role: 'MASTER'
        });
        needsWrite = true;
      }
      const lucasAdmin = data.adminUsers.find(
        u => u.email.toLowerCase() === 'lucas@webbilly.com.br' || (u as any).personal_email?.toLowerCase() === 'lucasklock@gmail.com'
      );
      if (!lucasAdmin) {
        data.adminUsers.push({
          id: 'ADMIN-002',
          email: 'lucas@webbilly.com.br',
          personal_email: 'lucasklock@gmail.com',
          name: 'Lucas Klock',
          passwordHash: defaultLucasHash,
          role: 'MASTER',
          is_partner: true,
          status: 'active'
        });
        needsWrite = true;
      }
    }

    if (!Array.isArray(data.operators)) {
      data.operators = [];
      needsWrite = true;
    }

    if (!data.operators.some(o => o.email.toLowerCase() === 'admin@billysuite.com.br' || o.id === 'OP-0001')) {
      data.operators.push({
        id: 'OP-0001',
        name: 'Administrador Master Billy',
        email: 'admin@billysuite.com.br',
        passwordHash: bcrypt.hashSync('admin123456', 10),
        whatsapp: '(11) 99999-9999',
        pixType: 'cpf',
        pixKey: '000.000.000-00',
        serialToken: 'BILLY-OP-ADMIN-MASTER-2026',
        status: 'ATIVO',
        machineId: null,
        osInfo: null,
        lastSync: null,
        dailyLimit: 999,
        todayGenerations: 0,
        createdAt: new Date().toISOString()
      });
      needsWrite = true;
    }

    if (!data.operators.some(o => o.email.toLowerCase() === 'carlos.operador@billysuite.com.br')) {
      data.operators.push({
        id: 'OP-1001',
        name: 'Carlos Eduardo Silva',
        email: 'carlos.operador@billysuite.com.br',
        passwordHash: bcrypt.hashSync('operador123', 10),
        whatsapp: '(11) 97123-4567',
        pixType: 'email',
        pixKey: 'carlos.pix@gmail.com',
        serialToken: 'BILLY-OP-DEMO-9988-2026',
        status: 'ATIVO',
        machineId: 'WIN-DESKTOP-98B2',
        osInfo: 'Windows 11 Pro 64-bit',
        lastSync: new Date().toISOString(),
        dailyLimit: 50,
        todayGenerations: 14,
        createdAt: new Date().toISOString()
      });
      needsWrite = true;
    }

    if (!data.operators.some(o => (o.serialToken || '').toUpperCase() === 'BILLY-OP-6A42-08A9')) {
      data.operators.push({
        id: 'OP-6A42',
        name: 'TESTE RODRIGUES BILLY',
        email: 'guilherme.r.nascimentoml@gmail.com',
        passwordHash: bcrypt.hashSync('operador123', 10),
        whatsapp: '(11) 98765-4321',
        pixType: 'email',
        pixKey: 'guilherme.r.nascimentoml@gmail.com',
        serialToken: 'BILLY-OP-6A42-08A9',
        status: 'ATIVO',
        machineId: null,
        osInfo: null,
        lastSync: new Date().toISOString(),
        dailyLimit: 50,
        todayGenerations: 0,
        createdAt: new Date().toISOString()
      });
      needsWrite = true;
    }

    if (!data.operators.some(o => (o.serialToken || '').toUpperCase() === 'BILLY-OP-C071-A33F')) {
      data.operators.push({
        id: 'OP-C071',
        name: 'Lucas Klock',
        email: 'lucasklock@gmail.com',
        passwordHash: bcrypt.hashSync('operador123', 10),
        whatsapp: '(47) 99123-4567',
        pixType: 'cpf',
        pixKey: '000.111.222-33',
        serialToken: 'BILLY-OP-C071-A33F',
        status: 'ATIVO',
        machineId: 'BILLY-PC-C071A33F',
        osInfo: 'Windows 11 Pro 64-bit',
        lastSync: new Date().toISOString(),
        dailyLimit: 50,
        todayGenerations: 0,
        createdAt: new Date().toISOString()
      });
      needsWrite = true;
    }

    if (!Array.isArray(data.licenses)) {
      data.licenses = [];
      needsWrite = true;
    }

    if (!data.licenses.some(l => (l.serialToken || '').toUpperCase() === 'BILLY-OP-C071-A33F')) {
      data.licenses.unshift({
        serialToken: 'BILLY-OP-C071-A33F',
        operatorId: 'OP-C071',
        operatorName: 'Lucas Klock',
        status: 'active',
        machineId: 'BILLY-PC-C071A33F',
        osInfo: 'Windows 11 Pro 64-bit',
        lastSync: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        activatedAt: new Date().toISOString()
      });
      needsWrite = true;
    }

    if (!data.licenses.some(l => (l.serialToken || '').toUpperCase() === 'BILLY-OP-6A42-08A9')) {
      data.licenses.unshift({
        serialToken: 'BILLY-OP-6A42-08A9',
        operatorId: 'OP-6A42',
        operatorName: 'TESTE RODRIGUES BILLY',
        status: 'active',
        machineId: null,
        osInfo: null,
        lastSync: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        activatedAt: new Date().toISOString()
      });
      needsWrite = true;
    }

    if (!Array.isArray(data.subscriptions) || data.subscriptions.length === 0) {
      data.subscriptions = getDefaultSubscriptions();
      needsWrite = true;
    }

    if (!data.licenses.some(l => l.serialToken === 'BILLY-OP-ADMIN-MASTER-2026')) {
      data.licenses.push({
        serialToken: 'BILLY-OP-ADMIN-MASTER-2026',
        operatorId: 'OP-0001',
        operatorName: 'Administrador Master Billy',
        status: 'ATIVO',
        machineId: null,
        osInfo: null,
        lastSync: null,
        createdAt: new Date().toISOString()
      });
      needsWrite = true;
    }

    // Sincronização automática entre operators e licenses
    if (Array.isArray(data.operators) && Array.isArray(data.licenses)) {
      for (const op of data.operators) {
        if (op.serialToken) {
          const cleanSerial = op.serialToken.trim().toUpperCase();
          const existingLic = data.licenses.find(l => (l.serialToken || '').trim().toUpperCase() === cleanSerial);
          if (!existingLic) {
            data.licenses.push({
              serialToken: op.serialToken,
              operatorId: op.id,
              operatorName: op.name,
              status: op.status === 'ATIVO' ? 'active' : op.status === 'BLOQUEADO' ? 'revoked' : 'pending_approval',
              machineId: op.machineId || null,
              osInfo: op.osInfo || null,
              lastSync: op.lastSync || null,
              createdAt: op.createdAt || new Date().toISOString(),
              activatedAt: op.status === 'ATIVO' ? (op.createdAt || new Date().toISOString()) : null
            });
            needsWrite = true;
          } else {
            if (op.name && existingLic.operatorName !== op.name) {
              existingLic.operatorName = op.name;
              needsWrite = true;
            }
            if (op.id && !existingLic.operatorId) {
              existingLic.operatorId = op.id;
              needsWrite = true;
            }
            if (op.status === 'ATIVO' && (existingLic.status === 'pending_onboarding' || existingLic.status === 'pending_approval')) {
              existingLic.status = 'active';
              needsWrite = true;
            }
          }
        }
      }
    }

    if (!Array.isArray(data.affiliateCommissions)) {
      data.affiliateCommissions = [];
      needsWrite = true;
    }

    if (needsWrite) {
      try {
        fs.writeJsonSync(activePath, data, { spaces: 2 });
      } catch {}
    }

    return data;
  } catch (err) {
    console.error('Erro ao ler DB:', err);
    try {
      if (fs.existsSync(BUNDLED_DB_PATH)) {
        return fs.readJsonSync(BUNDLED_DB_PATH);
      }
    } catch {}
    return getDefaultDatabase();
  }
}

export function writeDb(data: DatabaseSchema): void {
  try {
    const activePath = getDbPath();
    fs.ensureDirSync(path.dirname(activePath));
    const tmpPath = `${activePath}.tmp.${Date.now()}`;
    fs.writeJsonSync(tmpPath, data, { spaces: 2 });
    fs.moveSync(tmpPath, activePath, { overwrite: true });
  } catch (err) {
    console.error('Erro ao salvar DB:', err);
    // Em ambiente serverless estrito, loga sem travar o endpoint de validação
  }
}

export { generateSerial };
