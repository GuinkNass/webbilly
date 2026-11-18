import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getTopSitesRanking } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const ranking = await getTopSitesRanking(10);

    return NextResponse.json({
      success: true,
      ranking
    });
  } catch (err: any) {
    console.error('[API Admin Analytics Ranking Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro ao carregar ranking de audiência.' },
      { status: 500 }
    );
  }
}
