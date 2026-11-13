import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, SystemAlertRecord, OperatorAlertReadRecord } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const operatorId = searchParams.get('operatorId') || '';

    const supabase = getSupabaseAdmin();
    let alerts: SystemAlertRecord[] = [];
    let readAlertIds = new Set<string>();

    // 1. Tenta carregar do Supabase
    try {
      const { data: sbAlerts, error: sbErr } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!sbErr && Array.isArray(sbAlerts)) {
        alerts = sbAlerts.map(a => ({
          id: a.id,
          title: a.title,
          message: a.message,
          priority: a.priority || 'info',
          action_label: a.action_label,
          action_url: a.action_url,
          is_active: true,
          created_by: a.created_by,
          created_at: a.created_at,
        }));

        if (operatorId) {
          const { data: sbReads } = await supabase
            .from('operator_alert_reads')
            .select('alert_id')
            .eq('operator_id', operatorId);

          if (Array.isArray(sbReads)) {
            sbReads.forEach(r => readAlertIds.add(r.alert_id));
          }
        }
      }
    } catch (e) {
      console.warn('[Operador Alerts GET] Supabase fallback para db.json:', e);
    }

    // 2. Fallback com db.json se necessário
    if (!alerts || alerts.length === 0) {
      const db = readDb();
      alerts = (db.systemAlerts || [])
        .filter(a => a.is_active !== false)
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (operatorId && Array.isArray(db.operatorAlertReads)) {
        db.operatorAlertReads
          .filter(r => r.operator_id === operatorId)
          .forEach(r => readAlertIds.add(r.alert_id));
      }
    }

    const formattedAlerts = alerts.map(a => ({
      ...a,
      read: readAlertIds.has(a.id),
    }));

    const unreadCount = formattedAlerts.filter(a => !a.read).length;

    return NextResponse.json({
      success: true,
      alerts: formattedAlerts,
      unreadCount,
    });
  } catch (error: any) {
    console.error('[Operador Alerts GET] Erro:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar alertas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { operatorId, alertId, markAll } = body;

    if (!operatorId) {
      return NextResponse.json({ error: 'operatorId é obrigatório.' }, { status: 400 });
    }

    const cleanOpId = String(operatorId).trim();
    const nowIso = new Date().toISOString();
    const supabase = getSupabaseAdmin();
    const db = readDb();

    if (markAll) {
      // Marcar todos os alertas ativos como lidos
      let activeAlerts: SystemAlertRecord[] = [];
      try {
        const { data: sbAlerts } = await supabase
          .from('system_alerts')
          .select('id')
          .eq('is_active', true);
        if (Array.isArray(sbAlerts) && sbAlerts.length > 0) {
          activeAlerts = sbAlerts as any;
        }
      } catch (e) {
        // fallback
      }

      if (activeAlerts.length === 0) {
        activeAlerts = (db.systemAlerts || []).filter(a => a.is_active !== false);
      }

      const rowsToInsert: OperatorAlertReadRecord[] = [];
      if (!Array.isArray(db.operatorAlertReads)) db.operatorAlertReads = [];

      for (const alert of activeAlerts) {
        const alreadyRead = db.operatorAlertReads.some(
          r => r.operator_id === cleanOpId && r.alert_id === alert.id
        );
        if (!alreadyRead) {
          const rec: OperatorAlertReadRecord = {
            id: 'rd_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
            operator_id: cleanOpId,
            alert_id: alert.id,
            read_at: nowIso,
          };
          rowsToInsert.push(rec);
          db.operatorAlertReads.push(rec);
        }
      }

      if (rowsToInsert.length > 0) {
        try {
          await supabase.from('operator_alert_reads').insert(rowsToInsert);
        } catch (sbErr) {
          console.warn('[Operador Alerts Read All] Supabase insert warning:', sbErr);
        }
        writeDb(db);
      }

      return NextResponse.json({ success: true, markedCount: rowsToInsert.length });
    }

    // Marcar um único alerta específico como lido
    if (!alertId) {
      return NextResponse.json({ error: 'alertId é obrigatório para marcar individual.' }, { status: 400 });
    }

    const cleanAlertId = String(alertId).trim();

    if (!Array.isArray(db.operatorAlertReads)) db.operatorAlertReads = [];
    const existing = db.operatorAlertReads.find(
      r => r.operator_id === cleanOpId && r.alert_id === cleanAlertId
    );

    if (!existing) {
      const rec: OperatorAlertReadRecord = {
        id: 'rd_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
        operator_id: cleanOpId,
        alert_id: cleanAlertId,
        read_at: nowIso,
      };

      try {
        await supabase.from('operator_alert_reads').insert([rec]);
      } catch (sbErr) {
        console.warn('[Operador Alerts Read Single] Supabase insert warning:', sbErr);
      }

      db.operatorAlertReads.push(rec);
      writeDb(db);
    }

    return NextResponse.json({ success: true, alertId: cleanAlertId });
  } catch (error: any) {
    console.error('[Operador Alerts POST] Erro:', error);
    return NextResponse.json({ error: error.message || 'Erro ao registrar leitura.' }, { status: 500 });
  }
}
