import { NextRequest, NextResponse } from 'next/server';
import { createAvatar } from '@dicebear/core';
import { adventurer, lorelei, pixelArt, bottts } from '@dicebear/collection';
import { saveOperatorAvatarInSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { readDb, writeDb } from '@/lib/db';

const STYLES_MAP: Record<string, any> = {
  adventurer,
  lorelei,
  pixelArt,
  'pixel-art': pixelArt,
  bottts
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { operatorId, style = 'adventurer', seed, options = {}, svg } = body;

    if (!operatorId) {
      return NextResponse.json(
        { error: 'operatorId é obrigatório para salvar o avatar.' },
        { status: 400 }
      );
    }

    const selectedCollection = STYLES_MAP[style] || adventurer;
    const effectiveSeed = seed || operatorId || 'BillyGamer';

    // Gera SVG se não enviado pré-renderizado pelo cliente
    let finalSvg = svg;
    if (!finalSvg) {
      try {
        finalSvg = createAvatar(selectedCollection, {
          seed: effectiveSeed,
          ...options
        }).toString();
      } catch (genErr) {
        console.warn('[Avatar Route] Erro ao renderizar DiceBear SVG:', genErr);
      }
    }

    const avatarConfig = {
      style,
      seed: effectiveSeed,
      options: options || {},
      updatedAt: new Date().toISOString()
    };

    // 1. Salva no Supabase
    await saveOperatorAvatarInSupabase(operatorId, avatarConfig, finalSvg);

    // 2. Se for admin master
    if (operatorId === 'admin' || String(operatorId).includes('admin@')) {
      const db = readDb();
      if (Array.isArray(db.adminUsers) && db.adminUsers[0]) {
        db.adminUsers[0].avatar_config = avatarConfig;
        db.adminUsers[0].avatarConfig = avatarConfig;
        db.adminUsers[0].avatar_svg = finalSvg;
        db.adminUsers[0].avatarSvg = finalSvg;
        writeDb(db);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar gamer salvo com sucesso!',
      avatarConfig,
      avatarSvg: finalSvg
    });
  } catch (err: any) {
    console.error('[Avatar Save Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao salvar avatar gamer.' },
      { status: 500 }
    );
  }
}
