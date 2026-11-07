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
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregamento de arquivo .env local se existir
function loadDotEnv() {
  const candidates = [
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '..', '.env'),
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
      } catch (err) {
        // ignora
      }
    }
  }
}

loadDotEnv();

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

// Configurações
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_mmHCe2NQjdDPafKUDlE9FYXQ';
const DOMAIN = process.env.DOMAIN || 'webbilly.com.br';
const SUBDOMAIN = process.env.SUBDOMAIN || 'webmail';
const FULL_SUBDOMAIN = `${SUBDOMAIN}.${DOMAIN}`;
const SERVICE_NAME = process.env.RENDER_SERVICE_NAME || 'billy-webmail';
const DOCKER_IMAGE = process.env.DOCKER_IMAGE || 'snappymail/snappymail:latest';

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

// Validação de Pré-requisitos
if (!RENDER_API_KEY) {
  console.error(`${c.red}✖ ERRO CRÍTICO: RENDER_API_KEY não foi encontrada!${c.reset}`);
  console.log(`
Para obter sua chave da Render API:
1. Acesse: ${c.cyan}https://dashboard.render.com/u/settings#api-keys${c.reset}
2. Clique em "Create API Key"
3. Copie o token e defina no terminal ou arquivo .env:
   ${c.yellow}export RENDER_API_KEY="rnd_xxxxxxxxxxxxxxxxxxxxxxxx"${c.reset}
`);
  process.exit(1);
}

if (!VERCEL_TOKEN) {
  console.error(`${c.red}✖ ERRO: VERCEL_TOKEN não configurado!${c.reset}`);
  process.exit(1);
}

// -------------------------------------------------------------
// Funções Utilitárias de API
// -------------------------------------------------------------

async function renderFetch(endpoint, options = {}) {
  const url = `https://api.render.com/v1${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${RENDER_API_KEY}`,
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

async function vercelFetch(endpoint, options = {}) {
  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `https://api.vercel.com${endpoint}${VERCEL_TEAM_ID ? `${sep}teamId=${VERCEL_TEAM_ID}` : ''}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
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
// FLUXO DE ORQUESTRAÇÃO
// -------------------------------------------------------------

async function main() {
  try {
    // 1. Obter Owner ID na Render
    console.log(`${c.bright}[1/5] Identificando conta/workspace na Render API...${c.reset}`);
    const owners = await renderFetch('/owners');
    if (!Array.isArray(owners) || owners.length === 0) {
      throw new Error('Nenhum proprietário/workspace associado à sua chave da Render API.');
    }
    const owner = owners[0].owner || owners[0];
    const ownerId = owner.id;
    console.log(`  ${c.green}✔ Workspace Render:${c.reset} ${owner.name || owner.email} (${ownerId})`);

    // 2. Verificar se o serviço billy-webmail já existe ou criá-lo
    console.log(`\n${c.bright}[2/5] Provisionando Web Service Docker no Render...${c.reset}`);
    const servicesList = await renderFetch(`/services?name=${encodeURIComponent(SERVICE_NAME)}&limit=10`);
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
        serviceDetails: {
          env: 'image',
          image: {
            imagePath: DOCKER_IMAGE
          },
          plan: 'free',
          region: 'oregon',
          envVars: [
            { key: 'PORT', value: '8888' },
            { key: 'SNAPPYMAIL_TITLE', value: 'Webmail Billy Suite' }
          ]
        }
      };

      service = await renderFetch('/services', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      console.log(`  ${c.green}✔ Web Service criado com sucesso!${c.reset} (ID: ${service.id})`);
    }

    // Identificar hostname onrender.com
    let onrenderUrl = service.serviceDetails?.url || `https://${service.slug || SERVICE_NAME}.onrender.com`;
    const renderHost = onrenderUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    console.log(`  ${c.green}✔ Hostname Render:${c.reset} ${c.bright}${renderHost}${c.reset}`);

    // 3. Vincular Custom Domain no Render
    console.log(`\n${c.bright}[3/5] Configurando Custom Domain (${FULL_SUBDOMAIN}) no Render...${c.reset}`);
    const customDomains = await renderFetch(`/services/${service.id}/custom-domains`);
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
      const newDomainRes = await renderFetch(`/services/${service.id}/custom-domains`, {
        method: 'POST',
        body: JSON.stringify({ name: FULL_SUBDOMAIN })
      });
      const domObj = newDomainRes.customDomain || newDomainRes;
      customDomainId = domObj.id;
      console.log(`  ${c.green}✔ Custom domain adicionado no Render!${c.reset}`);
    }

    // 4. Configurar DNS CNAME na Vercel
    console.log(`\n${c.bright}[4/5] Configurando Apontamento DNS CNAME na Vercel...${c.reset}`);
    const dnsRecordsRes = await vercelFetch(`/v2/domains/${DOMAIN}/records`);
    const records = dnsRecordsRes.records || [];

    // Localiza registro CNAME do webmail se já existir
    const existingCname = records.find(r => r.name === SUBDOMAIN && r.type === 'CNAME');

    if (existingCname) {
      if (existingCname.value.replace(/\.$/, '') === renderHost) {
        console.log(`  ${c.green}✔ Registro DNS CNAME já aponta corretamente para:${c.reset} ${renderHost}`);
      } else {
        console.log(`  Atualizando CNAME existente (${existingCname.value} -> ${renderHost})...`);
        await vercelFetch(`/v2/domains/${DOMAIN}/records/${existingCname.id}`, { method: 'DELETE' });
        await vercelFetch(`/v2/domains/${DOMAIN}/records`, {
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
      await vercelFetch(`/v2/domains/${DOMAIN}/records`, {
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
        await renderFetch(`/services/${service.id}/custom-domains/${customDomainId}/verify`, { method: 'POST' });
        console.log(`  ${c.green}✔ Solicitação de verificação de SSL disparada no Render.${c.reset}`);
      } catch (e) {
        // silencioso
      }
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
