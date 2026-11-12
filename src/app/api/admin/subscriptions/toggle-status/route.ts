import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { clearSiteCache, syncSlugSuspension } from '@/lib/site-storage';
import { updateSiteStatusInSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
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

    const newStatus: 'active' | 'suspended' = status === 'suspended' ? 'suspended' : 'active';

    const db = readDb();
    if (!Array.isArray(db.subscriptions)) {
      db.subscriptions = [];
    }

    const sub = db.subscriptions.find(s => s.id === subscriptionId || s.siteSlug === subscriptionId);
    if (!sub) {
      return NextResponse.json({ error: 'Assinatura não encontrada.' }, { status: 404 });
    }

    sub.status = newStatus;
    sub.updatedAt = new Date().toISOString();

    // 1. Atualiza no Supabase e na Nuvem (Fonte Única de Verdade) em tempo real
    try {
      await syncSlugSuspension(sub.siteSlug || sub.id, newStatus === 'suspended');
    } catch (sbErr) {
      console.warn('[ToggleStatus] Cloud/Supabase sync:', sbErr);
    }

    // 2. Persiste no arquivo local do runtime
    writeDb(db);

    // 3. Se for ambiente de desenvolvimento, sincroniza com o db.json do source
    try {
      const bundledPath = path.join(process.cwd(), 'src', 'data', 'db.json');
      if (fs.existsSync(bundledPath)) {
        fs.writeJsonSync(bundledPath, db, { spaces: 2 });
      }
    } catch {}

    // 4. Limpa caches
    if (sub.siteSlug) {
      clearSiteCache(sub.siteSlug);
    }

    // 5. Invalida cache de rota do Next.js imediatamente
    try {
      revalidatePath('/site/[slug]', 'page');
      if (sub.siteSlug) {
        revalidatePath(`/site/${sub.siteSlug}`, 'page');
      }
      revalidatePath('/admin', 'page');
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Status da assinatura alterado para ${sub.status}`,
      subscription: sub
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
