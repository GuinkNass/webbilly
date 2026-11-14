import { NextRequest, NextResponse } from 'next/server';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { saveOperatorAvatarInSupabase } from '@/lib/supabase';
import { readDb, writeDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { operatorId, email, name, style = 'avataaars', seed, options = {}, svg } = body;

    if (!operatorId) {
      return NextResponse.json(
        { error: 'operatorId é obrigatório para salvar o avatar.' },
        { status: 400 }
      );
    }

    const effectiveSeed = seed || name || operatorId || 'WebbillyUser';

    // Gera SVG caso não tenha sido enviado pré-renderizado pelo cliente
    let finalSvg = svg;
    if (!finalSvg) {
      try {
        finalSvg = createAvatar(avataaars, {
          seed: effectiveSeed,
          ...options
        }).toString();
      } catch (genErr) {
        console.warn('[Avatar Route] Erro ao renderizar Avataaars SVG:', genErr);
      }
    }

    const avatarConfig = {
      style: 'avataaars',
      seed: effectiveSeed,
      options: options || {},
      updatedAt: new Date().toISOString()
    };

    // 1. Salva no Supabase (com fallback de upsert/insert caso não exista a linha)
    const saved = await saveOperatorAvatarInSupabase(
      operatorId,
      avatarConfig,
      finalSvg,
      { email, name }
    );

    if (!saved) {
      return NextResponse.json(
        { error: 'Falha ao persistir avatar no banco de dados. Tente novamente.' },
        { status: 500 }
      );
    }

    // 2. Garante persistência também no db.json local
    try {
      const db = readDb();
      let updatedDb = false;
      const cleanOpId = String(operatorId).trim();
      const cleanEmail = email ? String(email).trim().toLowerCase() : '';

      if (Array.isArray(db.operators)) {
        const op = db.operators.find(
          o => o.id === cleanOpId || (cleanEmail && o.email?.toLowerCase() === cleanEmail)
        );
        if (op) {
          op.avatar_config = avatarConfig;
          op.avatarConfig = avatarConfig;
          op.avatar_svg = finalSvg;
          op.avatarSvg = finalSvg;
          updatedDb = true;
        }
      }

      const adminTarget = (db.adminUsers || []).find(
        u => u.id === cleanOpId ||
             (u.email && u.email.toLowerCase() === cleanEmail) ||
             ((u as any).personal_email && (u as any).personal_email.toLowerCase() === cleanEmail) ||
             (cleanOpId === 'admin' && u.role === 'MASTER')
      );
      if (adminTarget) {
        adminTarget.avatar_config = avatarConfig;
        adminTarget.avatarConfig = avatarConfig;
        adminTarget.avatar_svg = finalSvg;
        adminTarget.avatarSvg = finalSvg;
        updatedDb = true;
      }

      if (updatedDb) {
        writeDb(db);
      }
    } catch (dbErr) {
      console.warn('[Avatar Route] Erro ao salvar fallback em db.json:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar salvo com sucesso!',
      avatarConfig,
      avatarSvg: finalSvg
    });
  } catch (err: any) {
    console.error('[Avatar Save Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao salvar avatar.' },
      { status: 500 }
    );
  }
}
