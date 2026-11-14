import { DatabaseSchema, Operator, MedalUpgradeRecord, writeDb } from './db';

export type MedalTier = 'RUBI' | 'OURO' | 'PRATA' | 'BRONZE' | 'NONE';

export interface MedalConfig {
  tier: MedalTier;
  level: number;
  name: string;
  icon: string;
  image: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  minRecurring: number;
  minMonthlyDomainSales: number;
  description: string;
}

export const MEDAL_CONFIGS: Record<MedalTier, MedalConfig> = {
  RUBI: {
    tier: 'RUBI',
    level: 4,
    name: 'Rubi',
    icon: '💎',
    image: '/trofeus/Rubi.png',
    color: '#e11d48',
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/50',
    badgeText: 'text-rose-400',
    minRecurring: 100,
    minMonthlyDomainSales: 25,
    description: 'Nível Máximo: 100+ assinantes ativos e 25+ domínios próprios no mês.'
  },
  OURO: {
    tier: 'OURO',
    level: 3,
    name: 'Ouro',
    icon: '🥇',
    image: '/trofeus/Ouro.png',
    color: '#eab308',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/50',
    badgeText: 'text-amber-300',
    minRecurring: 50,
    minMonthlyDomainSales: 15,
    description: 'Elite de Vendas: 50+ assinantes ativos e 15+ domínios próprios no mês.'
  },
  PRATA: {
    tier: 'PRATA',
    level: 2,
    name: 'Prata',
    icon: '🥈',
    image: '/trofeus/Prata.png',
    color: '#94a3b8',
    badgeBg: 'bg-slate-400/20',
    badgeBorder: 'border-slate-400/50',
    badgeText: 'text-slate-200',
    minRecurring: 35,
    minMonthlyDomainSales: 5,
    description: 'Consistência Comprovada: 35+ assinantes ativos e 5+ domínios próprios no mês.'
  },
  BRONZE: {
    tier: 'BRONZE',
    level: 1,
    name: 'Bronze',
    icon: '🥉',
    image: '/trofeus/Bronze.png',
    color: '#d97706',
    badgeBg: 'bg-orange-600/20',
    badgeBorder: 'border-orange-600/50',
    badgeText: 'text-orange-400',
    minRecurring: 10,
    minMonthlyDomainSales: 1,
    description: 'Primeiro Marco: 10+ assinantes ativos e 1+ domínio próprio no mês.'
  },
  NONE: {
    tier: 'NONE',
    level: 0,
    name: 'Iniciante',
    icon: '🌱',
    image: '/trofeus/Bronze.png',
    color: '#71717a',
    badgeBg: 'bg-zinc-800',
    badgeBorder: 'border-zinc-700',
    badgeText: 'text-zinc-400',
    minRecurring: 0,
    minMonthlyDomainSales: 0,
    description: 'Em Construção de Carteira (Rumo ao Bronze).'
  }
};

export const MEDAL_TIERS_ASC: MedalTier[] = ['NONE', 'BRONZE', 'PRATA', 'OURO', 'RUBI'];

/**
 * Avalia as metas e retorna a medalha correspondente.
 * Exige atingir AMBAS as metas da faixa (AND).
 */
export function getMedalForMetrics(activeRecurringCount: number, monthlyDomainSalesCount: number): MedalConfig {
  if (activeRecurringCount >= 100 && monthlyDomainSalesCount >= 25) {
    return MEDAL_CONFIGS.RUBI;
  }
  if (activeRecurringCount >= 50 && monthlyDomainSalesCount >= 15) {
    return MEDAL_CONFIGS.OURO;
  }
  if (activeRecurringCount >= 35 && monthlyDomainSalesCount >= 5) {
    return MEDAL_CONFIGS.PRATA;
  }
  if (activeRecurringCount >= 10 && monthlyDomainSalesCount >= 1) {
    return MEDAL_CONFIGS.BRONZE;
  }
  return MEDAL_CONFIGS.NONE;
}

/**
 * Pontuação de ranking competitivo Webbilly:
 * rankingScore = (activeRecurringCount * 1) + (monthlyDomainSalesCount * 10)
 */
export function calculateRankingScore(activeRecurringCount: number, monthlyDomainSalesCount: number): number {
  return (activeRecurringCount * 1) + (monthlyDomainSalesCount * 10);
}

/**
 * Mascara o nome do operador para preservar privacidade entre colegas:
 * "Carlos Eduardo Silva" -> "Carlos S."
 * "Lucas Klock" -> "Lucas K."
 */
export function maskOperatorName(fullName: string): string {
  if (!fullName) return 'Operador';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastPart = parts[parts.length - 1];
  const lastInitial = lastPart ? lastPart[0].toUpperCase() : '';
  return `${firstName} ${lastInitial}.`;
}

export interface OperatorMetricsResult {
  operatorId: string;
  operatorName: string;
  activeRecurringCount: number;
  monthlyDomainSalesCount: number;
  rankingScore: number;
  currentMedal: MedalConfig;
  nextMedal: MedalConfig | null;
  recurringNeededForNext: number;
  domainNeededForNext: number;
  recurringProgressPercent: number;
  domainProgressPercent: number;
  monthlyBaseEarnings: number;
  hasMedalUpgradeBonus: boolean;
  medalUpgradeBonusAmount: number;
  upgradeRecord?: MedalUpgradeRecord;
}

/**
 * Calcula todas as métricas de gamificação de um operador específico
 */
export function calculateOperatorGamification(
  operator: Operator,
  db: DatabaseSchema,
  targetDate: Date = new Date(),
  persistUpgrade: boolean = true
): OperatorMetricsResult {
  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth();
  const monthRef = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // 1. Métrica 1: Assinantes Recorrentes Ativos (acumulado de toda a trajetória)
  const subscriptions = Array.isArray(db.subscriptions) ? db.subscriptions : [];
  const operatorSubs = subscriptions.filter(sub =>
    sub.operatorId === operator.id ||
    sub.operatorToken === operator.serialToken ||
    (operator.id === 'OP-0001' && !sub.operatorId)
  );
  const activeRecurringCount = operatorSubs.filter(s => s.status === 'active').length;

  // 2. Métrica 2: Vendas de Domínio Próprio no Mês Civil Atual (R$ 490,00)
  const sales = Array.isArray(db.sales) ? db.sales : [];
  const monthlyDomainSalesFromSales = sales.filter(s => {
    if (s.operatorId !== operator.id) return false;
    if (s.pixStatus !== 'PAGO') return false;
    const d = new Date(s.createdAt);
    if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) return false;
    // Pacote de domínio próprio de R$ 490 (ou >= R$ 400) ou com domínio registrado
    return (s.saleValue && s.saleValue >= 400) || Boolean(s.domainRegistered);
  }).length;

  // Também considera assinaturas com domínio próprio ativado dentro do mês
  const monthlyDomainFromSubs = operatorSubs.filter(sub => {
    const isDomainActive = sub.domain_status === 'active' || sub.domainStatus === 'active';
    if (!isDomainActive) return false;
    const purchaseDate = sub.domain_purchased_at || sub.domainPurchasedAt || sub.updatedAt;
    if (!purchaseDate) return false;
    const d = new Date(purchaseDate);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const monthlyDomainSalesCount = Math.max(monthlyDomainSalesFromSales, monthlyDomainFromSubs);

  // 3. Determinação da Medalha Atual
  const currentMedal = getMedalForMetrics(activeRecurringCount, monthlyDomainSalesCount);

  // 4. Próxima Medalha e Metas Faltantes
  let nextMedal: MedalConfig | null = null;
  if (currentMedal.level === 0) nextMedal = MEDAL_CONFIGS.BRONZE;
  else if (currentMedal.level === 1) nextMedal = MEDAL_CONFIGS.PRATA;
  else if (currentMedal.level === 2) nextMedal = MEDAL_CONFIGS.OURO;
  else if (currentMedal.level === 3) nextMedal = MEDAL_CONFIGS.RUBI;
  else nextMedal = null;

  const recurringNeededForNext = nextMedal
    ? Math.max(0, nextMedal.minRecurring - activeRecurringCount)
    : 0;
  const domainNeededForNext = nextMedal
    ? Math.max(0, nextMedal.minMonthlyDomainSales - monthlyDomainSalesCount)
    : 0;

  const recurringProgressPercent = nextMedal && nextMedal.minRecurring > 0
    ? Math.min(100, Math.round((activeRecurringCount / nextMedal.minRecurring) * 100))
    : 100;
  const domainProgressPercent = nextMedal && nextMedal.minMonthlyDomainSales > 0
    ? Math.min(100, Math.round((monthlyDomainSalesCount / nextMedal.minMonthlyDomainSales) * 100))
    : 100;

  // 5. Pontuação no Ranking
  const rankingScore = calculateRankingScore(activeRecurringCount, monthlyDomainSalesCount);

  // 6. Ganhos Base do Mês (R$ 10 por ativo + R$ 147 por domínio próprio vendido)
  const monthlyBaseEarnings = (activeRecurringCount * 10.00) + (monthlyDomainSalesCount * 147.00);

  // 7. Regra do Bônus de +20% por Mudança / Conquista de Medalha
  if (!db.medalUpgrades) db.medalUpgrades = [];
  const existingUpgradesThisMonth = db.medalUpgrades.filter(
    u => u.operatorId === operator.id && u.monthRef === monthRef
  );

  let hasMedalUpgradeBonus = false;
  let medalUpgradeBonusAmount = 0;
  let upgradeRecord: MedalUpgradeRecord | undefined;

  // Se o operador possui medalha conquistada (Bronze, Prata, Ouro ou Rubi)
  if (currentMedal.level > 0) {
    const recordedUpgrade = existingUpgradesThisMonth.find(u => u.toTier === currentMedal.tier);

    if (recordedUpgrade) {
      hasMedalUpgradeBonus = true;
      medalUpgradeBonusAmount = recordedUpgrade.bonusAmount;
      upgradeRecord = recordedUpgrade;
    } else {
      // Verifica se é uma promoção (nível atual maior do que qualquer medalha anterior do mês ou se é a 1ª conquista)
      const previousHighestLevel = existingUpgradesThisMonth.reduce(
        (max, u) => Math.max(max, MEDAL_CONFIGS[u.toTier as MedalTier]?.level || 0),
        0
      );

      if (currentMedal.level > previousHighestLevel) {
        hasMedalUpgradeBonus = true;
        medalUpgradeBonusAmount = Math.round(monthlyBaseEarnings * 0.20 * 100) / 100;

        upgradeRecord = {
          id: `upg_${operator.id}_${monthRef}_${currentMedal.tier}_${Date.now()}`,
          operatorId: operator.id,
          fromTier: previousHighestLevel > 0 ? (MEDAL_TIERS_ASC[previousHighestLevel] || 'NONE') : 'NONE',
          toTier: currentMedal.tier,
          monthRef,
          bonusPercentage: 20,
          baseEarnings: monthlyBaseEarnings,
          bonusAmount: medalUpgradeBonusAmount,
          achievedAt: new Date().toISOString(),
          payoutApplied: false
        };

        if (persistUpgrade) {
          db.medalUpgrades.push(upgradeRecord);
          try {
            writeDb(db);
          } catch {}
        }
      }
    }
  }

  return {
    operatorId: operator.id,
    operatorName: operator.name,
    activeRecurringCount,
    monthlyDomainSalesCount,
    rankingScore,
    currentMedal,
    nextMedal,
    recurringNeededForNext,
    domainNeededForNext,
    recurringProgressPercent,
    domainProgressPercent,
    monthlyBaseEarnings,
    hasMedalUpgradeBonus,
    medalUpgradeBonusAmount,
    upgradeRecord
  };
}

export interface LeaderboardEntry {
  rank: number;
  operatorId: string;
  displayName: string;
  fullName: string;
  email?: string;
  corporateEmail?: string;
  isCurrentUser: boolean;
  medal: MedalConfig;
  activeRecurringCount: number;
  monthlyDomainSalesCount: number;
  rankingScore: number;
  hasMedalUpgradeBonus: boolean;
  medalUpgradeBonusAmount: number;
  avatar_svg?: string | null;
  avatarSvg?: string | null;
  avatar_config?: any;
}

/**
 * Gera o Ranking Oficial em Tempo Real da equipe com privacidade e desempate
 */
export function getLeaderboard(
  db: DatabaseSchema,
  currentOperatorId?: string,
  targetDate: Date = new Date()
): { leaderboard: LeaderboardEntry[]; currentUserProgress: OperatorMetricsResult | null; rules: typeof MEDAL_CONFIGS } {
  const operators = Array.isArray(db.operators) ? db.operators.filter(o => o.status === 'ATIVO') : [];

  const computed = operators.map(op => {
    const metrics = calculateOperatorGamification(op, db, targetDate, false);
    return {
      operator: op,
      metrics
    };
  });

  // Ordenação:
  // 1. Maior rankingScore
  // 2. Desempate 1: Maior monthlyDomainSalesCount
  // 3. Desempate 2: Maior activeRecurringCount
  // 4. Desempate 3: Data de cadastro mais antiga
  computed.sort((a, b) => {
    if (b.metrics.rankingScore !== a.metrics.rankingScore) {
      return b.metrics.rankingScore - a.metrics.rankingScore;
    }
    if (b.metrics.monthlyDomainSalesCount !== a.metrics.monthlyDomainSalesCount) {
      return b.metrics.monthlyDomainSalesCount - a.metrics.monthlyDomainSalesCount;
    }
    if (b.metrics.activeRecurringCount !== a.metrics.activeRecurringCount) {
      return b.metrics.activeRecurringCount - a.metrics.activeRecurringCount;
    }
    return new Date(a.operator.createdAt || 0).getTime() - new Date(b.operator.createdAt || 0).getTime();
  });

  let currentUserProgress: OperatorMetricsResult | null = null;

  const leaderboard: LeaderboardEntry[] = computed.map((item, index) => {
    const isCurrent = Boolean(currentOperatorId && item.operator.id === currentOperatorId);
    if (isCurrent) {
      currentUserProgress = item.metrics;
    }

    return {
      rank: index + 1,
      operatorId: item.operator.id,
      displayName: isCurrent ? `${item.operator.name} (Você)` : maskOperatorName(item.operator.name),
      fullName: item.operator.name,
      email: item.operator.email,
      corporateEmail: item.operator.corporate_email || item.operator.corporateEmail || item.operator.email,
      isCurrentUser: isCurrent,
      medal: item.metrics.currentMedal,
      activeRecurringCount: item.metrics.activeRecurringCount,
      monthlyDomainSalesCount: item.metrics.monthlyDomainSalesCount,
      rankingScore: item.metrics.rankingScore,
      hasMedalUpgradeBonus: item.metrics.hasMedalUpgradeBonus,
      medalUpgradeBonusAmount: item.metrics.medalUpgradeBonusAmount,
      avatar_svg: item.operator.avatar_svg || item.operator.avatarSvg || null,
      avatarSvg: item.operator.avatar_svg || item.operator.avatarSvg || null,
      avatar_config: item.operator.avatar_config || item.operator.avatarConfig || null
    };
  });

  // Se o currentOperatorId não estava na lista (ex: MASTER logado), busca individualmente
  if (!currentUserProgress && currentOperatorId) {
    const op = db.operators.find(o => o.id === currentOperatorId);
    if (op) {
      currentUserProgress = calculateOperatorGamification(op, db, targetDate, false);
    }
  }

  return {
    leaderboard,
    currentUserProgress,
    rules: MEDAL_CONFIGS
  };
}

/**
 * Avalia elegibilidade para o programa Billy Afiliados (Exige no mínimo nível Bronze)
 */
export function isOperatorEligibleForAffiliates(
  operator: Operator,
  db: DatabaseSchema,
  targetDate: Date = new Date()
): {
  isEligible: boolean;
  isActivated: boolean;
  affiliateCode: string | null;
  currentMedal: MedalConfig;
  activeRecurringCount: number;
  monthlyDomainSalesCount: number;
  recurringNeededForBronze: number;
  domainNeededForBronze: number;
  recurringProgressPercent: number;
  domainProgressPercent: number;
} {
  const gamification = calculateOperatorGamification(operator, db, targetDate, false);
  const isBronzeOrHigher = gamification.currentMedal.level >= 1; // Bronze (1), Prata (2), Ouro (3), Rubi (4)
  const isMaster = operator.id === 'OP-0001' || operator.email?.toLowerCase() === 'admin@billysuite.com.br';
  const isEligible = isBronzeOrHigher || isMaster || Boolean(operator.affiliate_enabled);

  const recurringNeededForBronze = Math.max(0, 10 - gamification.activeRecurringCount);
  const domainNeededForBronze = Math.max(0, 1 - gamification.monthlyDomainSalesCount);

  const recurringProgressPercent = Math.min(100, Math.round((gamification.activeRecurringCount / 10) * 100));
  const domainProgressPercent = Math.min(100, Math.round((gamification.monthlyDomainSalesCount / 1) * 100));

  return {
    isEligible,
    isActivated: Boolean(operator.affiliate_enabled),
    affiliateCode: operator.affiliate_code || null,
    currentMedal: gamification.currentMedal,
    activeRecurringCount: gamification.activeRecurringCount,
    monthlyDomainSalesCount: gamification.monthlyDomainSalesCount,
    recurringNeededForBronze,
    domainNeededForBronze,
    recurringProgressPercent,
    domainProgressPercent
  };
}

/**
 * Gera um código de afiliado amigável e único: ex: BILLY-LUCAS-842
 */
export function generateAffiliateCode(fullName: string, operatorId: string): string {
  const firstName = (fullName || 'OPERADOR')
    .trim()
    .split(/\s+/)[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();

  const idSuffix = (operatorId || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-3) || '842';
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `BILLY-${firstName}-${idSuffix || randomSuffix}`;
}
