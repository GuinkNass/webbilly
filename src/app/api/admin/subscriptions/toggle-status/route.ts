import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { setSlugSuspended, clearSiteCache, persistSite } from '@/lib/site-storage';
import path from 'path';
import fs from 'fs-extra';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador.' }, { status: 403 });
    }

    const { subscriptionId, status } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId é obrigatório.' }, { status: 400 });
    }

    const db = readDb();
    if (!Array.isArray(db.subscriptions)) {
      db.subscriptions = [];
    }

    const sub = db.subscriptions.find(s => s.id === subscriptionId || s.siteSlug === subscriptionId);
    if (!sub) {
      return NextResponse.json({ error: 'Assinatura não encontrada.' }, { status: 404 });
    }

    sub.status = status === 'suspended' ? 'suspended' : 'active';
    sub.updatedAt = new Date().toISOString();

    // 1. Persiste no arquivo local do runtime
    writeDb(db);

    // 2. Se for ambiente de desenvolvimento, sincroniza com o db.json do source
    try {
      const bundledPath = path.join(process.cwd(), 'src', 'data', 'db.json');
      if (fs.existsSync(bundledPath)) {
        fs.writeJsonSync(bundledPath, db, { spaces: 2 });
      }
    } catch {}

    // 3. Atualiza o registro compartilhado de status e limpa caches
    if (sub.siteSlug) {
      setSlugSuspended(sub.siteSlug, sub.status === 'suspended');
      clearSiteCache(sub.siteSlug);
      await persistSite(sub);
    }

    return NextResponse.json({
      success: true,
      message: `Status da assinatura alterado para ${sub.status}`,
      subscription: sub
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
