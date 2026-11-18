import { getSupabaseAdmin } from './supabase';
import { readDb, writeDb, SiteDailyStatRecord } from './db';

export interface SiteHitParams {
  domain: string;
  event: 'pageview' | 'whatsapp_click';
  isMobile: boolean;
  isUnique: boolean;
}

export interface DayStatPoint {
  date: string; // YYYY-MM-DD
  label: string; // DD/MM
  views: number;
  uniques: number;
  whatsapp: number;
}

export interface SiteAnalyticsSummary {
  domain: string;
  todayViews: number;
  todayUniques: number;
  todayWhatsapp: number;
  totalViews30d: number;
  totalUniques30d: number;
  totalWhatsapp30d: number;
  mobileViews30d: number;
  desktopViews30d: number;
  mobilePercent: number;
  dailyStats: DayStatPoint[];
}

export interface RankedSiteItem {
  rank: number;
  domain: string;
  siteSlug: string;
  clientName: string;
  operatorName: string;
  operatorId: string;
  pageViews: number;
  uniqueVisitors: number;
  whatsappClicks: number;
  mobilePercent: number;
  siteUrl: string;
}

export const ANALYTICS_TRACKER_SCRIPT = `<script>
(function(){
  try {
    var isStudio = false;
    try {
      if (window.frameElement && (window.frameElement.id === 'studio-preview-iframe' || (window.frameElement.title && window.frameElement.title.indexOf('Preview') !== -1))) {
        isStudio = true;
      }
      if (window.self !== window.top) {
        var tp = (window.top.location && window.top.location.pathname) || '';
        if (tp.indexOf('/estudio') !== -1 || tp.indexOf('/admin') !== -1 || tp.indexOf('/operador') !== -1) {
          isStudio = true;
        }
      }
    } catch(err) {}
    if (isStudio) return;

    var h = location.hostname.toLowerCase().replace(/^www\\./, '');
    try {
      if (window.top && window.top.location && window.top.location.hostname) {
        var th = window.top.location.hostname.toLowerCase().replace(/^www\\./, '');
        if (th && th !== 'webbilly.com.br' && th !== 'localhost' && th !== '127.0.0.1' && !th.endsWith('.vercel.app')) {
          h = th;
        }
      }
    } catch(e) {}

    if (!h || h === 'localhost' || h === '127.0.0.1' || h === 'webbilly.com.br') return;

    var today = new Date().toISOString().slice(0, 10);
    var key = 'wb_v_' + today;
    var isUnique = !localStorage.getItem(key);
    if (isUnique) { try { localStorage.setItem(key, '1'); } catch(_) {} }

    var send = function(ev) {
      var payload = JSON.stringify({ domain: h, event: ev, isUnique: isUnique });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('https://webbilly.com.br/api/analytics/hit', payload);
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://webbilly.com.br/api/analytics/hit', true);
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.send(payload);
      }
    };

    send('pageview');

    document.addEventListener('click', function(e) {
      var t = e.target && e.target.closest ? e.target.closest('a') : null;
      if (t && t.href && (t.href.indexOf('wa.me') !== -1 || t.href.indexOf('whatsapp.com') !== -1 || t.href.indexOf('api.whatsapp') !== -1)) {
        send('whatsapp_click');
      }
    }, true);
  } catch(e) {}
})();
</script>`;

export function injectAnalyticsTracker(html: string): string {
  if (!html || typeof html !== 'string') return html;
  if (html.includes('api/analytics/hit')) return html;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${ANALYTICS_TRACKER_SCRIPT}\n</body>`);
  }
  return `${html}\n${ANALYTICS_TRACKER_SCRIPT}`;
}

/**
 * Normaliza o domínio para lowercase, sem protocolo, porta ou www
 */
export function sanitizeDomain(rawDomain: string): string {
  if (!rawDomain) return '';
  return rawDomain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0]
    .replace(/^www\./, '');
}

/**
 * Retorna a data no fuso de Brasília (YYYY-MM-DD)
 */
export function getBrazilTodayDate(): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  } catch (_) {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Registra um hit (pageview ou whatsapp_click) de forma atômica no Supabase
 * com fallback automático no db.json local.
 */
export async function recordSiteHit(params: SiteHitParams): Promise<boolean> {
  const cleanDomain = sanitizeDomain(params.domain);
  if (!cleanDomain || cleanDomain === 'localhost' || cleanDomain === '127.0.0.1' || cleanDomain === 'webbilly.com.br') {
    return false;
  }

  const statDate = getBrazilTodayDate();
  const isPageView = params.event === 'pageview';
  const isWhatsapp = params.event === 'whatsapp_click';

  // 1. Tenta incrementar via RPC atômico no Supabase
  try {
    const supabase = getSupabaseAdmin();
    const { error: rpcError } = await supabase.rpc('increment_site_stat', {
      p_domain: cleanDomain,
      p_event: params.event,
      p_is_mobile: Boolean(params.isMobile),
      p_is_unique: Boolean(params.isUnique),
      p_stat_date: statDate
    });

    if (!rpcError) {
      return true;
    }

    // Se o RPC falhou (ex: ainda não criado no Supabase), tenta upsert direto na tabela site_daily_stats
    const { data: existingRow, error: fetchErr } = await supabase
      .from('site_daily_stats')
      .select('*')
      .eq('domain', cleanDomain)
      .eq('stat_date', statDate)
      .maybeSingle();

    if (!fetchErr) {
      if (existingRow) {
        const updateData: any = {
          updated_at: new Date().toISOString()
        };
        if (isPageView) {
          updateData.page_views = (existingRow.page_views || 0) + 1;
          if (params.isUnique) {
            updateData.unique_visitors = (existingRow.unique_visitors || 0) + 1;
          }
          if (params.isMobile) {
            updateData.mobile_views = (existingRow.mobile_views || 0) + 1;
          } else {
            updateData.desktop_views = (existingRow.desktop_views || 0) + 1;
          }
        }
        if (isWhatsapp) {
          updateData.whatsapp_clicks = (existingRow.whatsapp_clicks || 0) + 1;
        }

        await supabase
          .from('site_daily_stats')
          .update(updateData)
          .eq('id', existingRow.id);
        return true;
      } else {
        // Inserir nova linha diária
        await supabase
          .from('site_daily_stats')
          .insert({
            domain: cleanDomain,
            stat_date: statDate,
            page_views: isPageView ? 1 : 0,
            unique_visitors: isPageView && params.isUnique ? 1 : 0,
            whatsapp_clicks: isWhatsapp ? 1 : 0,
            mobile_views: isPageView && params.isMobile ? 1 : 0,
            desktop_views: isPageView && !params.isMobile ? 1 : 0
          });
        return true;
      }
    }
  } catch (sbErr) {
    console.warn('[Analytics Hit] Aviso Supabase:', sbErr);
  }

  // 2. Fallback no banco local db.json
  try {
    const db = readDb();
    if (!db.siteDailyStats) {
      db.siteDailyStats = [];
    }

    const idx = db.siteDailyStats.findIndex(
      s => s.domain === cleanDomain && s.stat_date === statDate
    );

    if (idx >= 0) {
      const row = db.siteDailyStats[idx];
      if (isPageView) {
        row.page_views = (row.page_views || 0) + 1;
        if (params.isUnique) {
          row.unique_visitors = (row.unique_visitors || 0) + 1;
        }
        if (params.isMobile) {
          row.mobile_views = (row.mobile_views || 0) + 1;
        } else {
          row.desktop_views = (row.desktop_views || 0) + 1;
        }
      }
      if (isWhatsapp) {
        row.whatsapp_clicks = (row.whatsapp_clicks || 0) + 1;
      }
      row.updated_at = new Date().toISOString();
    } else {
      db.siteDailyStats.push({
        id: `stat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        domain: cleanDomain,
        stat_date: statDate,
        page_views: isPageView ? 1 : 0,
        unique_visitors: isPageView && params.isUnique ? 1 : 0,
        whatsapp_clicks: isWhatsapp ? 1 : 0,
        mobile_views: isPageView && params.isMobile ? 1 : 0,
        desktop_views: isPageView && !params.isMobile ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    writeDb(db);
    return true;
  } catch (dbErr) {
    console.error('[Analytics Hit] Erro local db.json:', dbErr);
    return false;
  }
}

/**
 * Retorna as estatísticas consolidadas e evolução diária para um site/domínio
 */
export async function getSiteAnalytics(domainOrSlug: string): Promise<SiteAnalyticsSummary> {
  const clean = sanitizeDomain(domainOrSlug);
  const candidates = new Set<string>();
  candidates.add(clean);
  if (!clean.includes('.')) {
    candidates.add(`${clean}.webbilly.com.br`);
  } else if (clean.endsWith('.webbilly.com.br')) {
    candidates.add(clean.replace('.webbilly.com.br', ''));
  }

  const candidateList = Array.from(candidates);
  const today = getBrazilTodayDate();

  // Data de 30 dias atrás
  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const startDate30d = d30.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

  let rows: SiteDailyStatRecord[] = [];

  // 1. Tenta carregar do Supabase
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('site_daily_stats')
      .select('*')
      .in('domain', candidateList)
      .gte('stat_date', startDate30d)
      .order('stat_date', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      rows = data.map(r => ({
        id: r.id,
        domain: r.domain,
        site_id: r.site_id,
        stat_date: r.stat_date,
        page_views: Number(r.page_views) || 0,
        unique_visitors: Number(r.unique_visitors) || 0,
        whatsapp_clicks: Number(r.whatsapp_clicks) || 0,
        mobile_views: Number(r.mobile_views) || 0,
        desktop_views: Number(r.desktop_views) || 0
      }));
    }
  } catch (_) {}

  // 2. Fallback / merge com db.json
  if (rows.length === 0) {
    try {
      const db = readDb();
      if (Array.isArray(db.siteDailyStats)) {
        rows = db.siteDailyStats.filter(
          s => candidateList.includes(s.domain) && s.stat_date >= startDate30d
        );
      }
    } catch (_) {}
  }

  // Agrupamento por dia (somando caso haja variações de subdomínio/domínio próprio)
  const mapByDate = new Map<string, { views: number; uniques: number; whatsapp: number; mobile: number; desktop: number }>();
  for (const r of rows) {
    const curr = mapByDate.get(r.stat_date) || { views: 0, uniques: 0, whatsapp: 0, mobile: 0, desktop: 0 };
    curr.views += r.page_views;
    curr.uniques += r.unique_visitors;
    curr.whatsapp += r.whatsapp_clicks;
    curr.mobile += r.mobile_views;
    curr.desktop += r.desktop_views;
    mapByDate.set(r.stat_date, curr);
  }

  // Estatísticas de Hoje
  const todayStat = mapByDate.get(today) || { views: 0, uniques: 0, whatsapp: 0, mobile: 0, desktop: 0 };

  // Totais dos últimos 30 dias
  let totalViews30d = 0;
  let totalUniques30d = 0;
  let totalWhatsapp30d = 0;
  let mobileViews30d = 0;
  let desktopViews30d = 0;

  for (const val of mapByDate.values()) {
    totalViews30d += val.views;
    totalUniques30d += val.uniques;
    totalWhatsapp30d += val.whatsapp;
    mobileViews30d += val.mobile;
    desktopViews30d += val.desktop;
  }

  const mobilePercent =
    totalViews30d > 0 ? Math.round((mobileViews30d / totalViews30d) * 100) : 0;

  // Montar array dos últimos 14 dias para o gráfico
  const dailyStats: DayStatPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const parts = dateStr.split('-');
    const label = `${parts[2]}/${parts[1]}`;

    const stat = mapByDate.get(dateStr) || { views: 0, uniques: 0, whatsapp: 0 };
    dailyStats.push({
      date: dateStr,
      label,
      views: stat.views,
      uniques: stat.uniques,
      whatsapp: stat.whatsapp
    });
  }

  return {
    domain: clean,
    todayViews: todayStat.views,
    todayUniques: todayStat.uniques,
    todayWhatsapp: todayStat.whatsapp,
    totalViews30d,
    totalUniques30d,
    totalWhatsapp30d,
    mobileViews30d,
    desktopViews30d,
    mobilePercent,
    dailyStats
  };
}

/**
 * Retorna o Ranking dos Top 10 sites mais acessados nos últimos 30 dias
 */
export async function getTopSitesRanking(limit: number = 10): Promise<RankedSiteItem[]> {
  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const startDate30d = d30.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

  let allStats: SiteDailyStatRecord[] = [];

  // 1. Busca do Supabase
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('site_daily_stats')
      .select('*')
      .gte('stat_date', startDate30d);

    if (!error && Array.isArray(data)) {
      allStats = data.map(r => ({
        id: r.id,
        domain: r.domain,
        site_id: r.site_id,
        stat_date: r.stat_date,
        page_views: Number(r.page_views) || 0,
        unique_visitors: Number(r.unique_visitors) || 0,
        whatsapp_clicks: Number(r.whatsapp_clicks) || 0,
        mobile_views: Number(r.mobile_views) || 0,
        desktop_views: Number(r.desktop_views) || 0
      }));
    }
  } catch (_) {}

  // 2. Fallback db.json
  if (allStats.length === 0) {
    try {
      const db = readDb();
      if (Array.isArray(db.siteDailyStats)) {
        allStats = db.siteDailyStats.filter(s => s.stat_date >= startDate30d);
      }
    } catch (_) {}
  }

  // Agrega por domínio
  const map = new Map<string, { pageViews: number; uniqueVisitors: number; whatsappClicks: number; mobile: number; desktop: number }>();
  for (const row of allStats) {
    const d = sanitizeDomain(row.domain);
    const curr = map.get(d) || { pageViews: 0, uniqueVisitors: 0, whatsappClicks: 0, mobile: 0, desktop: 0 };
    curr.pageViews += row.page_views;
    curr.uniqueVisitors += row.unique_visitors;
    curr.whatsappClicks += row.whatsapp_clicks;
    curr.mobile += row.mobile_views;
    curr.desktop += row.desktop_views;
    map.set(d, curr);
  }

  // Cruzamento com db.subscriptions e clientAccounts para obter nome do comércio e do operador
  const db = readDb();
  const subs = db.subscriptions || [];
  const clientAccs = db.clientAccounts || [];
  const operators = db.operators || [];

  const rankedList: RankedSiteItem[] = [];

  for (const [domain, stats] of map.entries()) {
    const slugCandidate = domain.replace('.webbilly.com.br', '');
    const sub = subs.find(
      s => s.siteSlug === slugCandidate || (s.custom_domain && sanitizeDomain(s.custom_domain) === domain)
    );
    const client = clientAccs.find(
      c => c.site_slug === slugCandidate || sanitizeDomain(c.domain_login) === domain
    );

    const clientName = client?.business_name || sub?.clientName || slugCandidate;
    const operatorId = sub?.operatorToken || sub?.operatorId || client?.operator_id || 'BILLY-MASTER';
    const operator = operators.find(o => o.id === operatorId || (o as any).code === operatorId);
    const operatorName = sub?.operatorName || operator?.name || 'Equipe Webbilly';

    const totalViews = stats.pageViews;
    const mobilePercent = totalViews > 0 ? Math.round((stats.mobile / totalViews) * 100) : 0;
    const siteUrl = domain.includes('.') ? `https://${domain}` : `https://${domain}.webbilly.com.br`;

    rankedList.push({
      rank: 0,
      domain,
      siteSlug: slugCandidate,
      clientName,
      operatorName,
      operatorId,
      pageViews: stats.pageViews,
      uniqueVisitors: stats.uniqueVisitors,
      whatsappClicks: stats.whatsappClicks,
      mobilePercent,
      siteUrl
    });
  }

  // Ordenar por pageViews decrescente, depois whatsappClicks
  rankedList.sort((a, b) => {
    if (b.pageViews !== a.pageViews) return b.pageViews - a.pageViews;
    return b.whatsappClicks - a.whatsappClicks;
  });

  // Atribuir ranks 1..N
  return rankedList.slice(0, limit).map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
}
