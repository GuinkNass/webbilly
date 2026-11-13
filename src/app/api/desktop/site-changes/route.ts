import { NextRequest, NextResponse } from 'next/server';
import { getSiteChangeRequestsFromSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteSlug = searchParams.get('siteSlug') || searchParams.get('site') || undefined;
    const status = searchParams.get('status') || undefined;

    const list = await getSiteChangeRequestsFromSupabase({
      siteSlug,
      status
    });

    return NextResponse.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err: any) {
    console.error('[Desktop Site Changes GET Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao consultar solicitações de alteração.' },
      { status: 500 }
    );
  }
}
