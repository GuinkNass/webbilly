#!/usr/bin/env node
/**
 * ==============================================================================
 * Billy Suite - Automação de Deploy do Webmail (SnappyMail)
 * Render API + Vercel DNS Automation
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import dns from 'dns';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para formatação de terminal
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

// Função para prompt interativo no terminal
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Carregamento de arquivo .env e configurações locais
function loadConfigurations() {
  const candidates = [
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '..', 'webbilly', '.env'),
    path.join(__dirname, '..', '..', 'BILLY', '.env')
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            if (!process.env[key]) {
              process.env[key] = value.trim();
            }
          }
        });
        console.log(`[Config] Variáveis carregadas de: ${envPath}`);
        break;
      } catch (err) {}
    }
  }

  // Fallback: Recupera token da Vercel configurado no Billy Suite (settings.json)
  const appDataSettings = path.join(process.env.APPDATA || '', 'billy', 'config', 'settings.json');
  if (fs.existsSync(appDataSettings)) {
    try {
      const st = JSON.parse(fs.readFileSync(appDataSettings, 'utf8'));
      if (!process.env.VERCEL_TOKEN && st.vercelToken) {
        process.env.VERCEL_TOKEN = st.vercelToken;
      }
      if (!process.env.RENDER_API_KEY && st.renderApiKey) {
        process.env.RENDER_API_KEY = st.renderApiKey;
      }
    } catch {}
  }
}

loadConfigurations();

// -------------------------------------------------------------
// Validação e Prompt Interativo
// -------------------------------------------------------------

async function ensureCredentials() {
  let renderKey = process.env.RENDER_API_KEY;

  if (!renderKey) {
    console.log(`
${c.yellow}⚠️  A chave RENDER_API_KEY não foi encontrada nas variáveis de ambiente.${c.reset}

Para obter sua chave da Render API:
1. Acesse: ${c.cyan}https://dashboard.render.com/u/settings#api-keys${c.reset}
2. Clique no botão ${c.bright}"Create API Key"${c.reset}
3. Copie o token gerado (começa com "rnd_")
`);

    const input = await askQuestion(`${c.bright}👉 Cole a sua RENDER_API_KEY aqui e pressione Enter:${c.reset} `);

    if (input && input.startsWith('rnd_')) {
      renderKey = input;
      process.env.RENDER_API_KEY = renderKey;

      // Salva no .env local para execuções futuras
      try {
        const envPath = path.join(process.cwd(), '.env');
        const appendText = `\nRENDER_API_KEY=${renderKey}\n`;
        fs.appendFileSync(envPath, appendText, 'utf8');
        console.log(`  ${c.green}✔ Chave salva no arquivo local: ${envPath}${c.reset}`);
      } catch (e) {}

      // Salva também no settings.json do Billy Desktop
      try {
        const appDataSettings = path.join(process.env.APPDATA || '', 'billy', 'config', 'settings.json');
        if (fs.existsSync(appDataSettings)) {
          const st = JSON.parse(fs.readFileSync(appDataSettings, 'utf8'));
          st.renderApiKey = renderKey;
          fs.writeFileSync(appDataSettings, JSON.stringify(st, null, 2), 'utf8');
        }
      } catch (e) {}

    } else {
      console.error(`\n${c.red}✖ Nenhuma chave válida foi informada.${c.reset}`);
      console.log(`
No ${c.bright}Windows PowerShell${c.reset}, você pode definir a chave temporariamente com:
   ${c.yellow}$env:RENDER_API_KEY="rnd_sua_chave_aqui"${c.reset}
   ${c.yellow}node scripts/setup-webmail.mjs${c.reset}

Ou salvar permanentemente no arquivo .env:
   ${c.yellow}Add-Content .env "RENDER_API_KEY=rnd_sua_chave_aqui"${c.reset}
`);
      process.exit(1);
    }
  }

  let vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    console.log(`\n${c.yellow}⚠️  VERCEL_TOKEN não encontrado.${c.reset}`);
    const inputToken = await askQuestion(`${c.bright}👉 Cole o seu VERCEL_TOKEN (https://vercel.com/account/tokens):${c.reset} `);
    if (inputToken) {
      vercelToken = inputToken;
      process.env.VERCEL_TOKEN = vercelToken;
    } else {
      console.error(`${c.red}✖ VERCEL_TOKEN obrigatório para configurar o DNS.${c.reset}`);
      process.exit(1);
    }
  }

  return {
    renderKey,
    vercelToken
  };
}

// -------------------------------------------------------------
// Funções Utilitárias de API
// -------------------------------------------------------------

async function renderFetch(endpoint, apiKey, options = {}) {
  const url = `https://api.render.com/v1${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const errorMsg = json?.message || json?.error || JSON.stringify(json);
    throw new Error(`[Render API ${res.status}] ${errorMsg}`);
  }

  return json;
}

async function vercelFetch(endpoint, vercelToken, teamId, options = {}) {
  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `https://api.vercel.com${endpoint}${teamId ? `${sep}teamId=${teamId}` : ''}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const errorMsg = json?.error?.message || json?.message || JSON.stringify(json);
    throw new Error(`[Vercel API ${res.status}] ${errorMsg}`);
  }

  return json;
}

// -------------------------------------------------------------
// FLUXO PRINCIPAL
// -------------------------------------------------------------

async function main() {
  const DOMAIN = process.env.DOMAIN || 'webbilly.com.br';
  const SUBDOMAIN = process.env.SUBDOMAIN || 'webmail';
  const FULL_SUBDOMAIN = `${SUBDOMAIN}.${DOMAIN}`;
  const SERVICE_NAME = process.env.RENDER_SERVICE_NAME || 'billy-webmail';
  const DOCKER_IMAGE = process.env.DOCKER_IMAGE || 'djmaze/snappymail:latest';
  const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_mmHCe2NQjdDPafKUDlE9FYXQ';

  console.log(`
${c.cyan}${c.bright}=============================================================
  BILLY SUITE - AUTOMAÇÃO DE WEBMAIL (RENDER + VERCEL DNS)
=============================================================${c.reset}
  - Alvo:           ${c.bright}${FULL_SUBDOMAIN}${c.reset}
  - Imagem Docker:  ${c.magenta}${DOCKER_IMAGE}${c.reset}
  - Serviço Render: ${c.yellow}${SERVICE_NAME}${c.reset}
  - Domínio DNS:    ${c.green}${DOMAIN}${c.reset} (Vercel)
-------------------------------------------------------------
`);

  const { renderKey, vercelToken } = await ensureCredentials();

  try {
    // 1. Obter Owner ID na Render
    console.log(`\n${c.bright}[1/5] Identificando conta/workspace na Render API...${c.reset}`);
    const owners = await renderFetch('/owners', renderKey);
    if (!Array.isArray(owners) || owners.length === 0) {
      throw new Error('Nenhum proprietário/workspace associado à sua chave da Render API.');
    }
    const owner = owners[0].owner || owners[0];
    const ownerId = owner.id;
    console.log(`  ${c.green}✔ Workspace Render:${c.reset} ${owner.name || owner.email} (${ownerId})`);

    // 2. Verificar se o serviço billy-webmail já existe ou criá-lo
    console.log(`\n${c.bright}[2/5] Provisionando Web Service Docker no Render...${c.reset}`);
    const servicesList = await renderFetch(`/services?name=${encodeURIComponent(SERVICE_NAME)}&limit=10`, renderKey);
    let service = null;

    if (Array.isArray(servicesList) && servicesList.length > 0) {
      const match = servicesList.find(s => (s.service?.name || s.name) === SERVICE_NAME);
      if (match) {
        service = match.service || match;
        console.log(`  ${c.green}✔ Serviço existente encontrado:${c.reset} ${service.name} (ID: ${service.id})`);
      }
    }

    if (!service) {
      console.log(`  Criando novo Web Service com imagem ${c.magenta}${DOCKER_IMAGE}${c.reset}...`);
      const payload = {
        type: 'web_service',
        name: SERVICE_NAME,
        ownerId: ownerId,
        image: {
          ownerId: ownerId,
          imagePath: DOCKER_IMAGE
        },
        serviceDetails: {
          env: 'image',
          plan: 'free',
          region: 'oregon',
          envVars: [
            { key: 'PORT', value: '8888' },
            { key: 'SNAPPYMAIL_TITLE', value: 'Webmail Billy Suite' }
          ]
        }
      };

      const serviceRes = await renderFetch('/services', renderKey, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      service = serviceRes.service || serviceRes;
      console.log(`  ${c.green}✔ Web Service criado com sucesso!${c.reset} (ID: ${service.id})`);
    }

    // Identificar hostname onrender.com
    let onrenderUrl = service.serviceDetails?.url || `https://${service.slug || SERVICE_NAME}.onrender.com`;
    const renderHost = onrenderUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    console.log(`  ${c.green}✔ Hostname Render:${c.reset} ${c.bright}${renderHost}${c.reset}`);

    // 3. Vincular Custom Domain no Render
    console.log(`\n${c.bright}[3/5] Configurando Custom Domain (${FULL_SUBDOMAIN}) no Render...${c.reset}`);
    const customDomains = await renderFetch(`/services/${service.id}/custom-domains`, renderKey);
    let existingDomain = null;

    if (Array.isArray(customDomains)) {
      existingDomain = customDomains.find(d => (d.customDomain?.name || d.name) === FULL_SUBDOMAIN);
    }

    let customDomainId = null;
    if (existingDomain) {
      const domObj = existingDomain.customDomain || existingDomain;
      customDomainId = domObj.id;
      console.log(`  ${c.green}✔ Custom domain já registrado no Render:${c.reset} ${domObj.name} (Status: ${domObj.verificationStatus})`);
    } else {
      console.log(`  Adicionando ${FULL_SUBDOMAIN} ao serviço...`);
      const newDomainRes = await renderFetch(`/services/${service.id}/custom-domains`, renderKey, {
        method: 'POST',
        body: JSON.stringify({ name: FULL_SUBDOMAIN })
      });
      const domObj = newDomainRes.customDomain || newDomainRes;
      customDomainId = domObj.id;
      console.log(`  ${c.green}✔ Custom domain adicionado no Render!${c.reset}`);
    }

    // 4. Configurar DNS CNAME na Vercel
    console.log(`\n${c.bright}[4/5] Configurando Apontamento DNS CNAME na Vercel...${c.reset}`);
    const dnsRecordsRes = await vercelFetch(`/v2/domains/${DOMAIN}/records`, vercelToken, VERCEL_TEAM_ID);
    const records = dnsRecordsRes.records || [];

    // Localiza registro CNAME do webmail se já existir
    const existingCname = records.find(r => r.name === SUBDOMAIN && r.type === 'CNAME');

    if (existingCname) {
      if (existingCname.value.replace(/\.$/, '') === renderHost) {
        console.log(`  ${c.green}✔ Registro DNS CNAME já aponta corretamente para:${c.reset} ${renderHost}`);
      } else {
        console.log(`  Atualizando CNAME existente (${existingCname.value} -> ${renderHost})...`);
        await vercelFetch(`/v2/domains/${DOMAIN}/records/${existingCname.id}`, vercelToken, VERCEL_TEAM_ID, { method: 'DELETE' });
        await vercelFetch(`/v2/domains/${DOMAIN}/records`, vercelToken, VERCEL_TEAM_ID, {
          method: 'POST',
          body: JSON.stringify({
            name: SUBDOMAIN,
            type: 'CNAME',
            value: `${renderHost}.`,
            ttl: 60
          })
        });
        console.log(`  ${c.green}✔ Registro DNS CNAME atualizado com sucesso!${c.reset}`);
      }
    } else {
      console.log(`  Criando novo registro CNAME: ${c.yellow}${SUBDOMAIN}${c.reset} -> ${c.cyan}${renderHost}.${c.reset}...`);
      await vercelFetch(`/v2/domains/${DOMAIN}/records`, vercelToken, VERCEL_TEAM_ID, {
        method: 'POST',
        body: JSON.stringify({
          name: SUBDOMAIN,
          type: 'CNAME',
          value: `${renderHost}.`,
          ttl: 60
        })
      });
      console.log(`  ${c.green}✔ Registro DNS CNAME criado com sucesso na Vercel!${c.reset}`);
    }

    // 5. Teste de Resolução DNS e Verificação SSL
    console.log(`\n${c.bright}[5/5] Testando propagação DNS e conectividade...${c.reset}`);
    console.log(`  Aguardando confirmação de resolução para ${c.cyan}${FULL_SUBDOMAIN}${c.reset}...`);

    let dnsResolved = false;
    for (let attempt = 1; attempt <= 6; attempt++) {
      try {
        const addresses = await dns.promises.resolveCname(FULL_SUBDOMAIN);
        if (addresses && addresses.length > 0) {
          console.log(`  ${c.green}✔ DNS CNAME resolvido:${c.reset} ${addresses.join(', ')} (Tentativa ${attempt})`);
          dnsResolved = true;
          break;
        }
      } catch (err) {
        process.stdout.write(`  ${c.gray}[Tentativa ${attempt}/6] Propagação em andamento... aguardando 5s\r${c.reset}`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    if (!dnsResolved) {
      console.log(`\n  ${c.yellow}ℹ O apontamento DNS foi criado na Vercel, mas a propagação global pode levar alguns minutos.${c.reset}`);
    }

    // Solicitar re-verificação de certificado no Render
    if (customDomainId) {
      try {
        await renderFetch(`/services/${service.id}/custom-domains/${customDomainId}/verify`, renderKey, { method: 'POST' });
        console.log(`  ${c.green}✔ Solicitação de verificação de SSL disparada no Render.${c.reset}`);
      } catch (e) {}
    }

    console.log(`
${c.green}${c.bright}=============================================================
  🎉 WEBMAIL DEPLOYED & CONECTADO COM SUCESSO!
=============================================================${c.reset}

  📌 ${c.bright}URL Oficial do Webmail:${c.reset}
     👉 ${c.cyan}${c.bright}https://${FULL_SUBDOMAIN}${c.reset}
     ou direto: ${c.gray}https://${renderHost}${c.reset}

  🔐 ${c.bright}Painel de Administração do SnappyMail:${c.reset}
     👉 ${c.cyan}https://${FULL_SUBDOMAIN}/?admin${c.reset}
     ${c.gray}(No primeiro acesso ao ?admin, o SnappyMail solicitará que você defina a senha Master)${c.reset}

  ⚙️ ${c.bright}Configuração de Contas IMAP/SMTP:${c.reset}
     No painel ?admin, vá em "Domains" e adicione o domínio ${c.yellow}${DOMAIN}${c.reset}:
     - IMAP Server: ${c.white}mail.${DOMAIN}${c.reset} (Porta 993 SSL)
     - SMTP Server: ${c.white}mail.${DOMAIN}${c.reset} (Porta 465 SSL ou 587 STARTTLS)
`);

  } catch (err) {
    console.error(`\n${c.red}✖ Erro na execução da automação:${c.reset}`, err.message);
    process.exit(1);
  }
}

main();
