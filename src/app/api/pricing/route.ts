import { NextResponse } from 'next/server';
import { getPlatformPricing } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pricing = await getPlatformPricing();
    return NextResponse.json({
      success: true,
      pricing
    });
  } catch (err: any) {
    console.error('[API Pricing GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao obter preços da plataforma.' }, { status: 500 });
  }
}
