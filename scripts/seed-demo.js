const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (!db.demos) db.demos = {};

db.demos['brf_8cf2jt1mw600z3g'] = {
  leadToken: 'brf_8cf2jt1mw600z3g',
  title: "CAO Q' RI PET SHOP COMERCIO DE ALIMENTOS E ACESSORIOS PARA ANIMAIS LTDA",
  category: 'Pet Shop, Banho e Tosa',
  deployedUrl: 'https://caoqripetshop-guilhermernascimento-9353s-projects.vercel.app',
  updatedAt: new Date().toISOString()
};

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Saved demo to webbilly db.json successfully!');
