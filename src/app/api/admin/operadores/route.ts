import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { getSupabaseAdmin, mapRowToOperator } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const candidateMap = new Map<string, any>();

    // 1. Busca candidaturas na tabela 'candidaturas' do Supabase (caso exista)
    try {
      const { data: candRows } = await supabase
        .from('candidaturas')
        .select('*')
        .order('created_at', { ascending: false });

      if (Array.isArray(candRows)) {
        for (const row of candRows) {
          const extra = (typeof row.raw_payload === 'object' && row.raw_payload !== null) ? row.raw_payload : {};
          const candId = row.id || `cand-${row.email}`;
          candidateMap.set(candId, {
            id: candId,
            name: row.full_name || row.name || extra.name || 'Candidato',
            email: row.email || extra.email || '',
            whatsapp: row.whatsapp || extra.whatsapp || row.phone || extra.phone || '',
            phone: row.whatsapp || extra.whatsapp || row.phone || extra.phone || '',
            cpf: row.cpf || extra.cpf || '',
            pixType: row.pix_type || extra.pixType || extra.pix_type || 'cpf',
            pixKey: row.pix_key || extra.pixKey || extra.pix_key || '',
            pix_type: row.pix_type || extra.pixType || extra.pix_type || 'cpf',
            pix_key: row.pix_key || extra.pixKey || extra.pix_key || '',
            city: extra.city || row.city || '',
            state: extra.state || row.state || 'BR',
            city_state: row.city_state || extra.city_state || (extra.city ? `${extra.city} - ${extra.state || 'BR'}` : ''),
            experience: row.experience || extra.experience || '',
            availability: row.availability || extra.availability || 'Integral',
            has_computer: row.has_computer ?? extra.has_computer ?? true,
            cep: extra.cep || '',
            address: extra.address || '',
            neighborhood: extra.neighborhood || '',
            instagram: extra.instagram || '',
            resumeUrl: extra.resumeUrl || '',
            status: (row.status || 'pending').toUpperCase() === 'PENDENTE' || (row.status || '').toLowerCase() === 'pending' ? 'PENDENTE' : (row.status || '').toUpperCase(),
            createdAt: row.created_at || new Date().toISOString(),
            created_at: row.created_at || new Date().toISOString(),
            raw_payload: extra
          });
        }
      }
    } catch (_) {}

    // 2. Busca candidaturas na tabela 'candidates' do Supabase (caso exista)
    try {
      const { data: cRows } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (Array.isArray(cRows)) {
        for (const row of cRows) {
          const extra = (typeof row.raw_payload === 'object' && row.raw_payload !== null) ? row.raw_payload : {};
          const candId = row.id || `cand-${row.email}`;
          if (!candidateMap.has(candId)) {
            candidateMap.set(candId, {
              id: candId,
              name: row.full_name || row.name || extra.name || 'Candidato',
              email: row.email || extra.email || '',
              whatsapp: row.whatsapp || extra.whatsapp || row.phone || extra.phone || '',
              phone: row.whatsapp || extra.whatsapp || row.phone || extra.phone || '',
              cpf: row.cpf || extra.cpf || '',
              pixType: row.pix_type || extra.pixType || extra.pix_type || 'cpf',
              pixKey: row.pix_key || extra.pixKey || extra.pix_key || '',
              pix_type: row.pix_type || extra.pixType || extra.pix_type || 'cpf',
              pix_key: row.pix_key || extra.pixKey || extra.pix_key || '',
              city: extra.city || row.city || '',
              state: extra.state || row.state || 'BR',
              city_state: row.city_state || extra.city_state || (extra.city ? `${extra.city} - ${extra.state || 'BR'}` : ''),
              experience: row.experience || extra.experience || '',
              availability: row.availability || extra.availability || 'Integral',
              has_computer: row.has_computer ?? extra.has_computer ?? true,
              cep: extra.cep || '',
              address: extra.address || '',
              neighborhood: extra.neighborhood || '',
              instagram: extra.instagram || '',
              resumeUrl: extra.resumeUrl || '',
              status: (row.status || 'pending').toUpperCase() === 'PENDENTE' || (row.status || '').toLowerCase() === 'pending' ? 'PENDENTE' : (row.status || '').toUpperCase(),
              createdAt: row.created_at || new Date().toISOString(),
              created_at: row.created_at || new Date().toISOString(),
              raw_payload: extra
            });
          }
        }
      }
    } catch (_) {}

    // 3. Busca operadores e candidaturas pendentes na tabela 'operators' do Supabase
    const allOperatorsList: any[] = [];
    try {
      const { data: opRows, error: opErr } = await supabase
        .from('operators')
        .select('*')
        .order('created_at', { ascending: false });

      if (!opErr && Array.isArray(opRows)) {
        for (const row of opRows) {
          const mappedOp = mapRowToOperator(row);
          allOperatorsList.push(mappedOp);

          const st = (row.status || '').toLowerCase();
          // Se for uma inscrição pendente (status pending ou PENDENTE ou PENDENTE_APROVACAO)
          if (st === 'pending' || st === 'pendente' || st === 'pendente_aprovacao') {
            const extra = (typeof row.avatar_config === 'object' && row.avatar_config !== null) ? row.avatar_config : {};
            const candId = row.id;

            candidateMap.set(candId, {
              id: candId,
              name: row.name || extra.full_name || extra.name || 'Candidato',
              email: row.email || extra.email || '',
              whatsapp: row.whatsapp || extra.whatsapp || row.phone || '',
              phone: row.whatsapp || extra.whatsapp || row.phone || '',
              cpf: row.cpf || extra.cpf || '',
              pixType: row.pix_type || extra.pixType || extra.pix_type || 'cpf',
              pixKey: row.pix_key || extra.pixKey || extra.pix_key || '',
              pix_type: row.pix_type || extra.pixType || extra.pix_type || 'cpf',
              pix_key: row.pix_key || extra.pixKey || extra.pix_key || '',
              city: extra.city || row.city || '',
              state: extra.state || row.state || 'BR',
              city_state: row.city_state || extra.city_state || (extra.city ? `${extra.city} - ${extra.state || 'BR'}` : ''),
              experience: row.experience || extra.experience || '',
              availability: extra.availability || 'Integral',
              has_computer: extra.has_computer ?? extra.hasComputer ?? true,
              cep: extra.cep || row.cep || '',
              address: extra.address || row.address || '',
              neighborhood: extra.neighborhood || row.neighborhood || '',
              instagram: extra.instagram || '',
              resumeUrl: extra.resumeUrl || '',
              status: 'PENDENTE',
              createdAt: row.created_at || new Date().toISOString(),
              created_at: row.created_at || new Date().toISOString(),
              accepted_terms_at: row.accepted_terms_at,
              accepted_terms_ip: row.accepted_terms_ip,
              accepted_terms_version: row.accepted_terms_version,
              referred_by_operator_id: row.referred_by_operator_id,
              raw_payload: extra
            });
          }
        }
      }
    } catch (err) {
      console.warn('[Admin Operadores API] Erro ao consultar tabela operators:', err);
    }

    // 4. Incorpora candidaturas do db local (filtrando sem dados mockados)
    const db = readDb();
    for (const c of db.candidates || []) {
      // Ignora mocks antigos
      if (c.email?.includes('exemplo.com.br') || c.name === 'Lucas Ferreira Mendes' || c.name === 'Beatriz Vasconcelos') {
        continue;
      }
      if (!candidateMap.has(c.id)) {
        candidateMap.set(c.id, {
          ...c,
          status: (c.status || 'PENDENTE').toUpperCase() === 'PENDENTE' || (c.status || '').toLowerCase() === 'pending' ? 'PENDENTE' : c.status
        });
      }
    }

    const candidates = Array.from(candidateMap.values());
    const operators = allOperatorsList.length > 0 ? allOperatorsList : (db.operators || []);
    const licenses = db.licenses || [];

    return NextResponse.json({
      success: true,
      candidates,
      operators,
      licenses
    });

  } catch (err: any) {
    console.error('[Admin Operadores API] Erro:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao carregar dados dos operadores.' },
      { status: 500 }
    );
  }
}
