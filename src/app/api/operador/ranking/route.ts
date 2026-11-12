import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { getLeaderboard } from '@/lib/gamification';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'OPERATOR' && user.role !== 'MASTER')) {
      return NextResponse.json({ error: 'Acesso restrito ao Operador ou Administrador.' }, { status: 401 });
    }

    const db = readDb();
    let currentOperatorId = user.userId;

    // Se logado como MASTER, vincula ao operador master OP-0001 para visualização
    if (user.role === 'MASTER') {
      const masterOp = db.operators.find(o => o.id === 'OP-0001') || db.operators[0];
      if (masterOp) currentOperatorId = masterOp.id;
    } else {
      const op = db.operators.find(o => o.id === user.userId || o.email.toLowerCase() === user.email.toLowerCase());
      if (op) currentOperatorId = op.id;
    }

    const { leaderboard, currentUserProgress, rules } = getLeaderboard(db, currentOperatorId);

    return NextResponse.json({
      success: true,
      leaderboard,
      currentUserProgress,
      rules
    });
  } catch (error: any) {
    console.error('[API Ranking] Erro ao carregar leaderboard:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao processar dados de ranking e medalhas.' },
      { status: 500 }
    );
  }
}
