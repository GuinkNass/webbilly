import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { listClientAccounts, listSiteEditRequests } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Admin Master.' }, { status: 403 });
    }

    const [accounts, editRequests] = await Promise.all([
      listClientAccounts(),
      listSiteEditRequests()
    ]);

    return NextResponse.json({ accounts, editRequests });
  } catch (err: any) {
    console.error('[Admin Client Accounts GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao listar contas de clientes.' }, { status: 500 });
  }
}
