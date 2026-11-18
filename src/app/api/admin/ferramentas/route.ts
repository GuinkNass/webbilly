import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { listAdminAffiliateTools, upsertAdminAffiliateTool } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Admin Master.' }, { status: 403 });
    }

    const tools = await listAdminAffiliateTools(false);
    return NextResponse.json({ tools });
  } catch (err: any) {
    console.error('[Admin Ferramentas GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao listar ferramentas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Admin Master.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, category, description, benefit, logo_url, affiliate_link, is_active, display_order } = body;

    if (!name || !category || !affiliate_link) {
      return NextResponse.json(
        { error: 'Nome, categoria e link de afiliado são obrigatórios.' },
        { status: 400 }
      );
    }

    const tool = await upsertAdminAffiliateTool({
      name,
      category,
      description: description || '',
      benefit: benefit || null,
      logo_url: logo_url || null,
      affiliate_link,
      is_active: is_active ?? true,
      display_order: Number(display_order ?? 0)
    });

    return NextResponse.json({ success: true, tool });
  } catch (err: any) {
    console.error('[Admin Ferramentas POST] Erro:', err);
    return NextResponse.json({ error: 'Erro ao salvar ferramenta.' }, { status: 500 });
  }
}
