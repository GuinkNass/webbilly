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
  city: string;
  state: string;
  pixType: 'cpf' | 'cnpj' | 'phone' | 'email' | 'random';
  pixKey: string;
  resumeUrl?: string;
  experience?: string;
  instagram?: string;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
  createdAt: string;
  reviewedAt?: string;
  notes?: string;
  referred_by_operator_id?: string | null;
  affiliate_code_used?: string | null;
  accepted_terms_at?: string;
  accepted_terms_ip?: string;
  accepted_terms_version?: string;
  avatar_config?: any;
  avatarConfig?: any;
  avatar_svg?: string;
  avatarSvg?: string;
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
  status: 'PENDENTE' | 'PENDENTE_APROVACAO' | 'ATIVO' | 'BLOQUEADO' | 'RECUSADO';
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
  status: 'PENDENTE' | 'PROCESSADO';
  deployedUrl?: string;
  demoUrl?: string;
  accepted_terms_at?: string;
  accepted_terms_ip?: string;
  accepted_terms_version?: string;
  avatar_config?: any;
  avatarConfig?: any;
  avatar_svg?: string;
  avatarSvg?: string;
}

export interface DemoRecord {
  leadToken: string;
  title: string;
  category?: string;
  deployedUrl: string;
  instagram?: string;
  phone?: string;
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
  status: 'active' | 'pending' | 'suspended' | 'cancelled';
  deployedUrl?: string;
  asaasCustomerId?: string;
  asaas_customer_id?: string;
  asaasSubscriptionId?: string;
  asaas_subscription_id?: string;
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

export interface DatabaseSchema {
  candidates: Candidate[];
  operators: Operator[];
  licenses: LicenseRecord[];
  sales: Sale[];
  adminSettings: AdminSettings;
  adminUsers: AdminUser[];
  briefings?: Record<string, BriefingRecord>;
  demos?: Record<string, DemoRecord>;
  subscriptions: SubscriptionRecord[];
  payoutRequests?: PayoutRequest[];
  medalUpgrades?: MedalUpgradeRecord[];
  affiliateCommissions?: AffiliateCommissionRecord[];
  siteChangeRequests?: SiteChangeRequestRecord[];
  systemAlerts?: SystemAlertRecord[];
  operatorAlertReads?: OperatorAlertReadRecord[];
}

export function getDefaultSubscriptions(): SubscriptionRecord[] {
  return [
    {
      id: 'sub_sushihiroshisp',
      leadToken: 'brf_yq194mxmwbdwzav',
      siteSlug: 'sushihiroshisp',
      clientName: 'Restaurante Sushi Hiroshi',
      clientPhone: '(11) 2978-7128',
      clientEmail: 'contato@sushihiroshisp.webbilly.com.br',
      operatorId: 'OP-C071',
      operatorName: 'Lucas Klock',
      operatorToken: 'BILLY-OP-C071-A33F',
      monthlyPrice: 29.90,
      commissionMonthly: 10.00,
      status: 'suspended',
      deployedUrl: 'https://sushihiroshisp.vercel.app',
      checkoutUrl: 'https://webbilly.com.br/api/subscription/create-checkout?slug=sushihiroshisp',
      lastPaymentDate: new Date().toISOString(),
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sub_thehousesushi',
      leadToken: 'brf_thehousesushi',
      siteSlug: 'thehousesushi',
      clientName: 'The House Sushi',
      clientPhone: '(11) 98765-4321',
      clientEmail: 'contato@thehousesushi.com.br',
      operatorId: 'OP-0001',
      operatorName: 'Administrador Master Billy',
      operatorToken: 'BILLY-OP-ADMIN-MASTER-2026',
      monthlyPrice: 29.90,
      commissionMonthly: 10.00,
      status: 'suspended',
      deployedUrl: 'https://thehousesushi.vercel.app',
      checkoutUrl: 'https://webbilly.com.br/api/subscription/create-checkout?slug=thehousesushi',
      lastPaymentDate: new Date().toISOString(),
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sub_caoqripetshop',
      leadToken: 'brf_8cf2jt1mw600z3g',
      siteSlug: 'caoqripetshop',
      clientName: "CAO Q' RI PET SHOP",
      clientPhone: '(11) 98452-1920',
      clientEmail: 'contato@caoqripetshop.com.br',
      operatorId: 'OP-1001',
      operatorName: 'Carlos Eduardo Silva',
      operatorToken: 'BILLY-OP-DEMO-9988-2026',
      monthlyPrice: 29.90,
      commissionMonthly: 10.00,
      status: 'suspended',
      deployedUrl: 'https://caoqripetshop-guilhermernascimento-9353s-projects.vercel.app',
      checkoutUrl: 'https://webbilly.com.br/api/subscription/create-checkout?slug=caoqripetshop',
      lastPaymentDate: new Date().toISOString(),
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sub_barbeariavintage',
      leadToken: 'brf_barbeariavintage',
      siteSlug: 'barbearia-vintage',
      clientName: 'Barbearia Vintage Imperial',
      clientPhone: '(11) 97722-1100',
      clientEmail: 'marcos@barbeariavintage.com.br',
      operatorId: 'OP-1001',
      operatorName: 'Carlos Eduardo Silva',
      operatorToken: 'BILLY-OP-DEMO-9988-2026',
      monthlyPrice: 29.90,
      commissionMonthly: 10.00,
      status: 'active',
      deployedUrl: 'https://barbeariavintage.vercel.app',
      checkoutUrl: 'https://webbilly.com.br/api/subscription/create-checkout?slug=barbearia-vintage',
      lastPaymentDate: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      nextRenewalDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sub_autoescoladrivepro',
      leadToken: 'brf_autoescoladrivepro',
      siteSlug: 'autoescola-drivepro',
      clientName: 'Autoescola DrivePro',
      clientPhone: '(11) 96633-8899',
      clientEmail: 'contato@drivepro.com.br',
      operatorId: 'OP-0001',
      operatorName: 'Administrador Master Billy',
      operatorToken: 'BILLY-OP-ADMIN-MASTER-2026',
      monthlyPrice: 29.90,
      commissionMonthly: 10.00,
      status: 'suspended',
      deployedUrl: 'https://autoescola-drivepro.vercel.app',
      checkoutUrl: 'https://webbilly.com.br/api/subscription/create-checkout?slug=autoescola-drivepro',
      lastPaymentDate: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
      nextRenewalDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
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
    candidates: [
      {
        id: 'cand-001',
        name: 'Lucas Ferreira Mendes',
        email: 'lucas.mendes@exemplo.com.br',
        whatsapp: '(11) 98765-4321',
        city: 'São Paulo',
        state: 'SP',
        pixType: 'cpf',
        pixKey: '123.456.789-00',
        resumeUrl: 'https://linkedin.com/in/lucas-mendes-comercial',
        experience: '2 anos como SDR B2B em agência de marketing digital.',
        status: 'PENDENTE',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'cand-002',
        name: 'Beatriz Vasconcelos',
        email: 'beatriz.vendas@exemplo.com.br',
        whatsapp: '(21) 99876-5432',
        city: 'Rio de Janeiro',
        state: 'RJ',
        pixType: 'phone',
        pixKey: '(21) 99876-5432',
        resumeUrl: 'https://linkedin.com/in/beatriz-closer',
        experience: 'Closer autônoma com experiência em prospecção ativa e WhatsApp.',
        status: 'PENDENTE',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ],
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
    subscriptions: getDefaultSubscriptions()
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
