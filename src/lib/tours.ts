import { driver, DriveStep, Config } from 'driver.js';

// Função utilitária segura para encontrar o elemento no DOM
function getSafeElement(selector: string, fallbackSelector?: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  if (document.querySelector(selector)) return selector;
  if (fallbackSelector && document.querySelector(fallbackSelector)) return fallbackSelector;
  return undefined; // Quando undefined, o driver.js exibe o popover centralizado na tela com segurança
}

/**
 * TOUR 1: Painel do Operador (/operador)
 */
export function startOperadorTour(onTabChange?: (tab: string) => void) {
  if (typeof window === 'undefined') return;

  const steps: DriveStep[] = [
    {
      element: getSafeElement('#tour-operador-header'),
      popover: {
        title: '🚀 Bem-vindo ao Painel do Operador Webbilly!',
        description: 'Veja em 30 segundos como acompanhar suas vendas, subir de medalha e solicitar seus repasses.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: getSafeElement('#tour-operador-propostas', '#tour-nav-subscriptions'),
      popover: {
        title: '📋 Cadastro de Leads & Propostas',
        description: 'Aqui você acompanha seus clientes ativos e gera propostas oficiais. Ofereça o Plano Mensal (R$ 29,90/mês com até 2 alterações/mês — comissão de R$ 10,00/mês) ou o Pacote Completo com Domínio Próprio por 1 Ano (R$ 490,00 — comissão de 30% = R$ 147,00).',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: getSafeElement('#tour-operador-gamificacao', '#tour-nav-ranking'),
      popover: {
        title: '🏆 Ranking, Metas & Medalhas',
        description: 'Acompanhe seu progresso nas medalhas Bronze, Prata, Ouro e Rubi. A cada promoção de medalha conquistada no mês, você ganha um bônus extraordinário de +20% sobre todos os seus ganhos operacionais!',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: getSafeElement('#tour-operador-afiliados', '#tour-nav-affiliates'),
      popover: {
        title: '🤝 Programa Billy Afiliados (5%)',
        description: 'Ao atingir no mínimo a medalha Bronze, você destrava seu link exclusivo de convite para recrutar novos parceiros e recebe 5% (R$ 24,50) por cada venda de domínio próprio realizada por eles!',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: getSafeElement('#tour-operador-repasse', '#tour-nav-sales'),
      popover: {
        title: '💰 Extrato & Repasse Pix com 1 Clique',
        description: 'Solicite seu repasse via Pix 1 vez por mês civil diretamente para sua chave cadastrada, ou deixe o saldo acumulando automaticamente para quando desejar resgatar.',
        side: 'top',
        align: 'center'
      }
    }
  ];

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    popoverClass: 'webbilly-tour-popover',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir ✓',
    progressText: 'Passo {{current}} de {{total}}',
    onHighlightStarted: (element, step, options) => {
      // Se houver troca de aba contextual necessária
      if (step?.element === '#tour-operador-propostas' && onTabChange) onTabChange('subscriptions');
      if (step?.element === '#tour-operador-gamificacao' && onTabChange) onTabChange('ranking');
      if (step?.element === '#tour-operador-afiliados' && onTabChange) onTabChange('affiliates');
      if (step?.element === '#tour-operador-repasse' && onTabChange) onTabChange('sales');
    },
    onDestroyed: () => {
      localStorage.setItem('webbilly_tour_operador_v1', 'true');
    },
    steps
  });

  driverObj.drive();
}

/**
 * TOUR 2: Painel Admin Master (/admin)
 */
export function startAdminTour(onTabChange?: (tab: string) => void) {
  if (typeof window === 'undefined') return;

  const steps: DriveStep[] = [
    {
      element: getSafeElement('#tour-admin-header', '#tour-admin-kpis'),
      popover: {
        title: '👑 Bem-vindo ao Painel Admin Master!',
        description: 'Aqui você controla toda a operação, assinaturas, domínios e operadores em tempo real.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: getSafeElement('#tour-admin-subscriptions', '#tour-admin-nav-subscriptions'),
      popover: {
        title: '⚡ Assinaturas SaaS & Controle de Publicação',
        description: 'Visualize os clientes ativos e utilize os botões Suspender / Reativar. Ao suspender um cliente inadimplente, o site sai do ar imediatamente com aviso oficial de regularização.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: getSafeElement('#tour-admin-domains', '#tour-admin-nav-domains'),
      popover: {
        title: '🌐 Gestão de Domínios Próprios',
        description: 'Acompanhe o vencimento do ciclo anual de 1 ano dos domínios próprios e gere cobranças Pix via Asaas para Renovação Anual (R$ 70,00) ou Atualização Avulsa sob demanda (R$ 29,90).',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: getSafeElement('#tour-admin-operators', '#tour-admin-nav-licenses'),
      popover: {
        title: '👥 Licenças, Operadores & Billy Afiliados',
        description: 'Gerencie candidaturas, aprove operadores, gere chaves de ativação do app desktop e audite toda a rede de indicações e comissões do Billy Afiliados.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: getSafeElement('#tour-admin-payouts', '#tour-admin-nav-financial'),
      popover: {
        title: '💳 Extrato & Repasses Financeiros',
        description: 'Conferência em tempo real dos repasses solicitados pelos operadores, confirmação de comprovantes Pix e status dos serviços integrados Asaas e Lark Mail.',
        side: 'top',
        align: 'center'
      }
    }
  ];

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    popoverClass: 'webbilly-tour-popover',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir ✓',
    progressText: 'Passo {{current}} de {{total}}',
    onHighlightStarted: (element, step, options) => {
      if (step?.element === '#tour-admin-subscriptions' && onTabChange) onTabChange('subscriptions');
      if (step?.element === '#tour-admin-domains' && onTabChange) onTabChange('domains');
      if (step?.element === '#tour-admin-operators' && onTabChange) onTabChange('licenses');
      if (step?.element === '#tour-admin-payouts' && onTabChange) onTabChange('financial');
    },
    onDestroyed: () => {
      localStorage.setItem('webbilly_tour_admin_v1', 'true');
    },
    steps
  });

  driverObj.drive();
}
