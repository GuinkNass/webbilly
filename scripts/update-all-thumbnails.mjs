import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const thumbsDir = path.resolve(root, 'public/templates-thumbs');

if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
}

// Mapeamento curado de fotografias reais em altíssima definição (Unsplash HD 800px)
// rigorosamente selecionadas para cada subnicho específico:
export const CURATED_THUMBNAILS = {
  // === Gastronomia, Cafés & Pizzarias ===
  'restaurante-cafe-heritaste': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80', // Café acolhedor moderno
  'restaurante-cardapio-dbento': 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&auto=format&fit=crop&q=80', // Prato asiático / Japanese Bento premium
  'restaurante-classico-granny': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80', // Restaurante afetivo / massas
  'restaurante-foores-gourmet': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80', // Restaurante alta gastronomia
  'restaurante-sumi-culinaria': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80', // Sushi bar premium
  'restaurante-elroyale-cafe': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop&q=80', // Bistrô elegante
  'pizzaria-clean-royate': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80', // Pizza artesanal forno a lenha
  'coffee-shop-escuro-bruin': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80', // Café especial grãos escuros
  'coffee-shop-moderno-max': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80', // Cafeteria moderna clean
  'cafezone-coffee-shop': 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=80', // Brunch & espresso bar
  'bistro-granny-cafe': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', // Confeitaria e pães artesanais
  'bar-oldstory-whiskey': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80', // Hamburgueria artesanal & pub
  'pub-tavern-irish': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80', // Pub irlandês & choperia
  'restaurante-elegante-elegencia': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', // Restaurante de eventos
  'restaurante-portfolio-grandrestaurant': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80', // Alta gastronomia

  // === Tatuagem & Piercing ===
  'tattoo-portfolio-themestarz': 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80', // Tattoo artista autoral
  'tattoo-estudio-portfolio-blaxcut': 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&auto=format&fit=crop&q=80', // Estúdio tattoo e piercing
  'tattoo-estudio-moderno': 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=800&auto=format&fit=crop&q=80', // Tattoo underground urbana
  'portfolio-dark': 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80', // Dark elegance tatuagem

  // === Barbearias ===
  'barbearia-crop-vintage': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80', // Barbearia clássica navalha
  'barbearia-barberon-moderno': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80', // Barbearia VIP neon
  'barbearia-hair-salon': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&auto=format&fit=crop&q=80', // Salão & Barbearia

  // === Estética, Dermato, Maquiagem & Massagem ===
  'estetica-completo-spa': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80', // Clínica estética avançada
  'estetica-elegante-minimalista': 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&auto=format&fit=crop&q=80', // Spa facial relaxante
  'estetica-simples-paradise': 'https://images.unsplash.com/photo-1512290900672-1f551b93380c?w=800&auto=format&fit=crop&q=80', // Beleza e estética express
  'estetica-detalhado-sparelax': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&auto=format&fit=crop&q=80', // Estética corporal tecnologia
  'estetica-pureglow-spa': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80', // Pureglow clínica
  'dermato-clean-skincare': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80', // Dermatologia clínica skincare
  'maquiadora-portfolio-makeup': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80', // Maquiagem noivas glam
  'massagista-portfolio-victoria': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80', // Massoterapia spa pedras
  'massagista-clean-beauta': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&auto=format&fit=crop&q=80', // Massagem modeladora drenagem

  // === Academias, Yoga, Lutas & Suplementos ===
  'academia-crossfit-fitmax': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80', // Academia musculação crossfit
  'personal-gym-progym': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80', // Personal assessoria
  'personal-claro-moderno': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80', // Personal funcional
  'personal-moderno-energetico': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80', // Personal performance
  'luta-moderno-sword': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80', // Lutas MMA CT
  'luta-completa-martialarts': 'https://images.unsplash.com/photo-1509563268479-0f004cf3f58b?w=800&auto=format&fit=crop&q=80', // Artes marciais jiu jitsu
  'yoga-completo-yogana': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80', // Yoga meditação
  'yoga-fitness-exclusivo': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80', // Pilates solo funcional
  'yoga-agendamento-yogazone': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80', // Estúdio yoga studio
  'yoga-moderno-clean-yogava': 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&auto=format&fit=crop&q=80', // Studio clean yoga respiração
  'loja-suplementos-purefit': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=80', // Loja de suplementos whey

  // === Arquitetura & Decoração ===
  'arquitetura-elegante-tecture': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80', // Arquitetura alto padrão
  'arquitetura-portfolio-moderno': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80', // Obras e projetos
  'arquiteto-detalhado-shelder': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80', // Escritório de arquitetura
  'design-interiores-fauxis': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80', // Design de interiores minimalista
  'studio-minimal': 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80', // Studio minimal arquitetura

  // === Mecânica & Automotivo ===
  'mecanica-completo-audeck': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80', // Oficina mecânica auto center
  'mecanica-portfolio-automec': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80', // Câmbio e motor retífica
  'mecanica-simples-cardinal': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80', // Manutenção rápida oficina
  'mecanica-detalhado-axemobile': 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&auto=format&fit=crop&q=80', // Elétrica e injeção
  'autoescola-drivepro': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80', // Autoescola CFC habilitação

  // === Odontologia & Saúde ===
  'dentista-criativo-dentia': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80', // Lentes de contato odontologia estética
  'dentista-detalhado-prime': 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&auto=format&fit=crop&q=80', // Implantes ortodontia
  'dentista-medicina-medicore': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80', // Centro médico integrado
  'odontologia-dentia-clinica': 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80', // Clínica dentia
  'medico-medicalguide-clinica': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80', // Medicalguide clínica médica

  // === Pet Shop & Veterinária ===
  'petshop-completo-petz': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=80', // Banho, tosa e pet shop
  'petshop-petly-veterinaria': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80', // Petly clínica veterinária

  // === Serviços Gerais & Reformas ===
  'marido-aluguel-portfolio': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80', // Reparos residenciais eletricista
  'marido-aluguel-simples-reroof': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80', // Manutenção rápida reformas
  'servicos-gerais-limpo-erepair': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80', // Serviços gerais pintura
  'serralheria-welbim-soldagem': 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80', // Serralheria e solda

  // === Portfólio, Fotografia & B2B ===
  'portfolio-criativo-anglo': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80', // Criativo design branding
  'fotografia-completo-jonna': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', // Estúdio fotográfico casamentos
  'fotografia-minimalista-elarisse': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80', // Ensaios autorais
  'portfolio-simples-slider': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80', // Fotografia slider
  'consultoria-financeira-fo': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80', // Advocacia e consultoria empresarial
  'commercial-vibrant': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80' // Comércio varejo geral
};

async function downloadImage(url, destPath) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuf = await res.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      if (buf.length < 5000) throw new Error(`Image too small (${buf.length}b)`);
      fs.writeFileSync(destPath, buf);
      return buf.length;
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function run() {
  console.log('Iniciando download e padronização de miniaturas HD...');
  const entries = Object.entries(CURATED_THUMBNAILS);
  let updatedCount = 0;

  for (const [id, url] of entries) {
    const dest = path.join(thumbsDir, `${id}.jpg`);
    let needsDownload = false;
    if (!fs.existsSync(dest)) {
      needsDownload = true;
    } else {
      const size = fs.statSync(dest).size;
      // Substitui se for menor que 15KB ou se for heritaste/dbento (que tem banner cinza de placeholder)
      if (size < 15000 || id.includes('heritaste') || id.includes('dbento') || id.includes('granny') || id.includes('bruin')) {
        needsDownload = true;
      }
    }

    if (needsDownload) {
      try {
        const bytes = await downloadImage(url, dest);
        console.log(`[OK] ${id}.jpg baixado com sucesso (${bytes} bytes)`);
        updatedCount++;
      } catch (e) {
        console.error(`[FALHA] Não foi possível baixar ${id}:`, e.message);
      }
    } else {
      console.log(`[EXISTENTE HD] ${id}.jpg já é válido (${fs.statSync(dest).size} bytes)`);
    }
  }

  console.log(`Concluído! ${updatedCount} miniaturas HD atualizadas.`);
}

run();
