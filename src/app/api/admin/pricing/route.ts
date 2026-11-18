import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getPlatformPricing, updatePlatformPricing, DEFAULT_PLATFORM_PRICING, TEST_PLATFORM_PRICING } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const pricing = await getPlatformPricing();
    return NextResponse.json({
      success: true,
      pricing
    });
  } catch (err: any) {
    console.error('[API Admin Pricing GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao carregar configurações de preços.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    // Suporte aos atalhos de teste e restauração
    if (body.action === 'apply_test') {
      const updated = await updatePlatformPricing(TEST_PLATFORM_PRICING);
      return NextResponse.json({
        success: true,
        message: 'Modo de Teste ativado! Valores ajustados para R$ 5,00 (mínimo Asaas).',
        pricing: updated
      });
    }

    if (body.action === 'restore_official') {
      const updated = await updatePlatformPricing(DEFAULT_PLATFORM_PRICING);
      return NextResponse.json({
        success: true,
        message: 'Preços oficiais de produção restaurados (R$ 29,90 / R$ 490,00 / R$ 39,90).',
        pricing: updated
      });
    }

    const updated = await updatePlatformPricing({
      monthly_plan_price: body.monthly_plan_price !== undefined ? Number(body.monthly_plan_price) : undefined,
      custom_domain_price: body.custom_domain_price !== undefined ? Number(body.custom_domain_price) : undefined,
      extra_edit_price: body.extra_edit_price !== undefined ? Number(body.extra_edit_price) : undefined,
      operator_commission_percent: body.operator_commission_percent !== undefined ? Number(body.operator_commission_percent) : undefined,
      affiliate_bonus_percent: body.affiliate_bonus_percent !== undefined ? Number(body.affiliate_bonus_percent) : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Tabela de preços da plataforma atualizada com sucesso!',
      pricing: updated
    });
  } catch (err: any) {
    console.error('[API Admin Pricing POST] Erro:', err);
    return NextResponse.json({ error: err?.message || 'Erro ao salvar tabela de preços.' }, { status: 500 });
  }
}
