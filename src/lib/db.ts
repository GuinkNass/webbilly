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
  resumeUrl: string;
  experience?: string;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
  createdAt: string;
  reviewedAt?: string;
  notes?: string;
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
  whatsapp: string;
  pixType: string;
  pixKey: string;
  serialToken: string;
  status: 'PENDENTE_APROVACAO' | 'ATIVO' | 'BLOQUEADO';
  machineId?: string | null;
  osInfo?: string | null;
  operatorIp?: string | null;
  lastSync?: string | null;
  dailyLimit: number;
  todayGenerations: number;
  createdAt: string;
}

export interface LicenseRecord {
  id?: string;
  serialToken: string;
  operatorId?: string | null;
  operatorName?: string | null;
  status: 'pending_onboarding' | 'pending_approval' | 'pending_activation' | 'active' | 'revoked' | 'ATIVO' | 'EM_USO' | 'BLOQUEADO';
  machineId?: string | null;
  osInfo?: string | null;
  operatorIp?: string | null;
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
  name: string;
  passwordHash: string;
  role: 'MASTER';
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
  operatorId?: string;
  operatorName?: string;
  operatorToken?: string;
  monthlyPrice: number;
  commissionMonthly?: number;
  status: 'active' | 'pending' | 'suspended' | 'cancelled';
  deployedUrl?: string;
  mpPreferenceId?: string;
  mpPreapprovalId?: string;
  mpPaymentId?: string;
  checkoutUrl: string;
  lastPaymentDate?: string;
  nextRenewalDate?: string;
  createdAt: string;
  updatedAt: string;
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
}

export function getDefaultSubscriptions(): SubscriptionRecord[] {
  return [
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
      status: 'active',
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
      }
    ],
    licenses: [
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
    sales: [
      {
        id: 'SALE-201',
        operatorId: 'OP-1001',
        operatorName: 'Carlos Eduardo Silva',
        clientName: 'Barbearia Don Corleone',
        clientWhatsapp: '(11) 99111-2233',
        siteUrl: 'https://barbearia-don-corleone.billy.app',
        niche: 'Barbearia & Estética',
        saleValue: 600,
        commissionValue: 200,
        pixStatus: 'PAGO',
        pixPaidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        pixProof: 'E2E-PIX-98827361726354',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'SALE-202',
        operatorId: 'OP-1001',
        operatorName: 'Carlos Eduardo Silva',
        clientName: 'Dra. Camila Odontologia Estética',
        clientWhatsapp: '(11) 99222-3344',
        siteUrl: 'https://dra-camila-odonto.billy.app',
        niche: 'Dentista & Saúde',
        saleValue: 600,
        commissionValue: 200,
        pixStatus: 'PENDENTE',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ],
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
    if (!Array.isArray(data.adminUsers) || data.adminUsers.length === 0) {
      data.adminUsers = [
        {
          id: 'ADMIN-001',
          email: 'admin@billysuite.com.br',
          name: 'Administrador Master Billy',
          passwordHash: bcrypt.hashSync('admin123456', 10),
          role: 'MASTER'
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
          passwordHash: bcrypt.hashSync('admin123456', 10),
          role: 'MASTER'
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

    if (!Array.isArray(data.licenses)) {
      data.licenses = [];
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
