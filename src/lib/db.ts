import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

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
  email: string;
  passwordHash: string;
  whatsapp: string;
  pixType: string;
  pixKey: string;
  serialToken: string;
  status: 'ATIVO' | 'BLOQUEADO';
  machineId?: string | null;
  osInfo?: string | null;
  operatorIp?: string | null;
  lastSync?: string | null;
  dailyLimit: number;
  todayGenerations: number;
  createdAt: string;
}

export interface LicenseRecord {
  serialToken: string;
  operatorId: string;
  operatorName: string;
  status: 'ATIVO' | 'EM_USO' | 'BLOQUEADO';
  machineId?: string | null;
  osInfo?: string | null;
  operatorIp?: string | null;
  lastSync?: string | null;
  createdAt: string;
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

export interface DatabaseSchema {
  candidates: Candidate[];
  operators: Operator[];
  licenses: LicenseRecord[];
  sales: Sale[];
  adminSettings: AdminSettings;
  adminUsers: AdminUser[];
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
    ]
  };
}

export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial = getDefaultDatabase();
      fs.ensureDirSync(path.dirname(DB_PATH));
      fs.writeJsonSync(DB_PATH, initial, { spaces: 2 });
      return initial;
    }
    const data = fs.readJsonSync(DB_PATH);
    return data;
  } catch (err) {
    console.error('Erro ao ler DB:', err);
    return getDefaultDatabase();
  }
}

export function writeDb(data: DatabaseSchema): void {
  try {
    fs.ensureDirSync(path.dirname(DB_PATH));
    const tmpPath = `${DB_PATH}.tmp.${Date.now()}`;
    fs.writeJsonSync(tmpPath, data, { spaces: 2 });
    fs.moveSync(tmpPath, DB_PATH, { overwrite: true });
  } catch (err) {
    console.error('Erro ao salvar DB:', err);
    throw err;
  }
}

export { generateSerial };
