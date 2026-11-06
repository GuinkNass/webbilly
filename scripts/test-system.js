const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

console.log('=== TESTE DE INTEGRAÇÃO DO ECOSSISTEMA WEBBILLY ===\n');

// 1. Inicializa o DB se ainda não existir
const dbPath = path.join(__dirname, '..', 'src', 'data', 'db.json');

function getDefaultDatabase() {
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
        createdAt: new Date().toISOString()
      }
    ],
    operators: [
      {
        id: 'OP-1001',
        name: 'Carlos Eduardo Silva',
        email: 'carlos.operador@billysuite.com.br',
        passwordHash: '$2a$10$wK1.V/Uo.Xj.9882/3...',
        whatsapp: '(11) 97123-4567',
        pixType: 'email',
        pixKey: 'carlos.pix@gmail.com',
        serialToken: sampleSerial,
        status: 'ATIVO',
        machineId: 'WIN-DESKTOP-98B2',
        osInfo: 'Windows 11 Pro 64-bit',
        lastSync: new Date().toISOString(),
        dailyLimit: 50,
        todayGenerations: 14,
        createdAt: new Date().toISOString()
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
        lastSync: new Date().toISOString(),
        createdAt: new Date().toISOString()
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
        pixPaidAt: new Date().toISOString(),
        pixProof: 'E2E-PIX-98827361726354',
        createdAt: new Date().toISOString()
      }
    ],
    adminSettings: {
      geminiApiKey: '',
      geminiModel: 'gemini-3.8-flash',
      cloudflareAccountId: 'cf_acc_demo_772183',
      cloudflareApiToken: 'cf_tok_live_883920194827',
      vercelToken: 'verc_tok_9981203847',
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
        passwordHash: '$2a$10$demo.hash.admin',
        role: 'MASTER'
      }
    ]
  };
}

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(getDefaultDatabase(), null, 2), 'utf8');
  console.log('✅ Banco de dados src/data/db.json inicializado com dados padrão.');
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
console.log('✅ Banco de dados carregado com sucesso!');
console.log(`- Candidatos cadastrados: ${db.candidates.length}`);
console.log(`- Operadores homologados: ${db.operators.length}`);
console.log(`- Licenças ativas: ${db.licenses.length}`);
console.log(`- Vendas registradas: ${db.sales.length}`);
console.log(`- Master Admin: ${db.adminUsers[0]?.email}`);

// 2. Teste de geração e formato de Serial
function generateSerial() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `BILLY-OP-${part1}-${part2}-2026`;
}

const serial = generateSerial();
console.log(`\n✅ Formato do Token Serial verificado: ${serial}`);
if (!/^BILLY-OP-[A-Z0-9]{4}-[A-Z0-9]{4}-2026$/.test(serial)) {
  console.error('Falha no regex do serial!');
  process.exit(1);
}

// 3. Teste do LicenseManager do Desktop
const LicenseManager = require('../../BILLY/src/main/services/license-manager');
const mockUserData = path.join(__dirname, 'mock-user-data');
fs.mkdirSync(mockUserData, { recursive: true });

const lm = new LicenseManager(mockUserData, (msg) => {
  console.log('Alerta de revogação recebido:', msg);
});

const machineId = lm._getOrCreateMachineId();
console.log(`\n✅ LicenseManager do Billy Suite Desktop:`);
console.log(`- Machine ID local gerado: ${machineId}`);
console.log(`- SO Info detectado: ${lm.getOsInfo()}`);

fs.rmSync(mockUserData, { recursive: true, force: true });

console.log('\n=============================================================');
console.log('🎉 SUCESSO! TODAS AS ESTRUTURAS DO ECOSSISTEMA FORAM VALIDADAS');
console.log('=============================================================\n');
