import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { upsertAdminAffiliateTool, deleteAdminAffiliateTool } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Admin Master.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const tool = await upsertAdminAffiliateTool({
      id,
      ...body
    });

    return NextResponse.json({ success: true, tool });
  } catch (err: any) {
    console.error('[Admin Ferramentas PATCH] Erro:', err);
    return NextResponse.json({ error: 'Erro ao atualizar ferramenta.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Admin Master.' }, { status: 403 });
    }

    const { id } = await params;
    await deleteAdminAffiliateTool(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Ferramentas DELETE] Erro:', err);
    return NextResponse.json({ error: 'Erro ao excluir ferramenta.' }, { status: 500 });
  }
}
