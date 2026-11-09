const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.subscriptions = [
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

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Subscriptions seeded successfully to db.json');
