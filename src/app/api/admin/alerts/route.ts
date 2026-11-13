import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, SystemAlertRecord } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    let alerts: SystemAlertRecord[] = [];
    let readsCounts: Record<string, number> = {};

    // 1. Tenta buscar do Supabase
    try {
      const { data: sbAlerts, error: sbErr } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!sbErr && Array.isArray(sbAlerts)) {
        alerts = sbAlerts.map(a => ({
          id: a.id,
          title: a.title,
          message: a.message,
          priority: a.priority || 'info',
          action_label: a.action_label,
          action_url: a.action_url,
          is_active: a.is_active ?? true,
          created_by: a.created_by,
          created_at: a.created_at,
        }));

        // Busca leituras
        const { data: sbReads } = await supabase
          .from('operator_alert_reads')
          .select('alert_id');

        if (Array.isArray(sbReads)) {
          sbReads.forEach(r => {
            readsCounts[r.alert_id] = (readsCounts[r.alert_id] || 0) + 1;
          });
        }
      }
    } catch (e) {
      console.warn('[Admin Alerts] Supabase indisponível, usando fallback db.json:', e);
    }

    // 2. Fallback / Sincronização com db.json
    const db = readDb();
    if (!alerts || alerts.length === 0) {
      alerts = (db.systemAlerts || []).slice().sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      (db.operatorAlertReads || []).forEach(r => {
        readsCounts[r.alert_id] = (readsCounts[r.alert_id] || 0) + 1;
      });
    }

    const alertsWithReads = alerts.map(a => ({
      ...a,
      readsCount: readsCounts[a.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      alerts: alertsWithReads,
    });
  } catch (error: any) {
    console.error('[Admin Alerts GET] Erro:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar alertas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, message, priority = 'info', action_label, action_url, created_by } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Título e mensagem são campos obrigatórios.' },
        { status: 400 }
      );
    }

    const newAlert: SystemAlertRecord = {
      id: 'alt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      title: String(title).trim(),
      message: String(message).trim(),
      priority: ['info', 'promo', 'urgent'].includes(priority) ? priority : 'info',
      action_label: action_label ? String(action_label).trim() : undefined,
      action_url: action_url ? String(action_url).trim() : undefined,
      is_active: true,
      created_by: created_by ? String(created_by).trim() : 'admin@billysuite.com.br',
      created_at: new Date().toISOString(),
    };

    // 1. Tenta salvar no Supabase
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from('system_alerts').insert([newAlert]);
    } catch (e) {
      console.warn('[Admin Alerts POST] Supabase insert warning:', e);
    }

    // 2. Salva no db.json local
    try {
      const db = readDb();
      if (!Array.isArray(db.systemAlerts)) db.systemAlerts = [];
      db.systemAlerts.unshift(newAlert);
      writeDb(db);
    } catch (dbErr) {
      console.error('[Admin Alerts POST] Erro ao gravar no db.json:', dbErr);
    }

    return NextResponse.json({
      success: true,
      alert: { ...newAlert, readsCount: 0 },
    });
  } catch (error: any) {
    console.error('[Admin Alerts POST] Erro:', error);
    return NextResponse.json({ error: error.message || 'Erro ao criar alerta.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, is_active } = body;

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'ID e novo status is_active são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Atualiza no Supabase
    try {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('system_alerts')
        .update({ is_active })
        .eq('id', id);
    } catch (e) {
      console.warn('[Admin Alerts PATCH] Supabase update warning:', e);
    }

    // 2. Atualiza no db.json
    try {
      const db = readDb();
      if (Array.isArray(db.systemAlerts)) {
        const item = db.systemAlerts.find(a => a.id === id);
        if (item) {
          item.is_active = is_active;
          writeDb(db);
        }
      }
    } catch (dbErr) {
      console.error('[Admin Alerts PATCH] Erro db.json:', dbErr);
    }

    return NextResponse.json({ success: true, id, is_active });
  } catch (error: any) {
    console.error('[Admin Alerts PATCH] Erro:', error);
    return NextResponse.json({ error: error.message || 'Erro ao atualizar alerta.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'ID do alerta é obrigatório.' }, { status: 400 });
    }

    // 1. Supabase
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from('system_alerts').delete().eq('id', id);
      await supabase.from('operator_alert_reads').delete().eq('alert_id', id);
    } catch (e) {
      console.warn('[Admin Alerts DELETE] Supabase delete warning:', e);
    }

    // 2. db.json
    try {
      const db = readDb();
      if (Array.isArray(db.systemAlerts)) {
        db.systemAlerts = db.systemAlerts.filter(a => a.id !== id);
      }
      if (Array.isArray(db.operatorAlertReads)) {
        db.operatorAlertReads = db.operatorAlertReads.filter(r => r.alert_id !== id);
      }
      writeDb(db);
    } catch (dbErr) {
      console.error('[Admin Alerts DELETE] Erro db.json:', dbErr);
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[Admin Alerts DELETE] Erro:', error);
    return NextResponse.json({ error: error.message || 'Erro ao remover alerta.' }, { status: 500 });
  }
}
