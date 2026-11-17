import { NextRequest, NextResponse } from 'next/server';
import { fetchProspectedLeadsFromSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const niche = searchParams.get('niche') || '';
    const city = searchParams.get('city') || '';
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const operatorId = searchParams.get('operatorId') || '';
    const role = searchParams.get('role') || '';

    const leads = await fetchProspectedLeadsFromSupabase({
      niche,
      city,
      query,
      operatorId,
      role
    });

    return NextResponse.json({
      success: true,
      total: leads.length,
      leads
    });
  } catch (error: any) {
    console.error('[API studio/leads-salvos error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao carregar leads salvos.', leads: [] },
      { status: 500 }
    );
  }
}
