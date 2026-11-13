import { NextRequest, NextResponse } from 'next/server';
import { completeSiteChangeRequestInSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID da solicitação é obrigatório.' },
        { status: 400 }
      );
    }

    const success = await completeSiteChangeRequestInSupabase(String(id).trim());

    if (!success) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada ou não pôde ser atualizada.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação de alteração concluída com sucesso no Supabase.',
      id,
      completedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[Desktop Site Changes Complete Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao concluir solicitação.' },
      { status: 500 }
    );
  }
}
