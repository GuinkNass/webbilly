import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { maskOperatorName } from '@/lib/gamification';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get('code') || searchParams.get('ref') || '').trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Código de convite não informado.' }, { status: 400 });
    }

    const db = readDb();
    const sponsor = (db.operators || []).find(
      o => (o.affiliate_code || '').trim().toUpperCase() === code && o.status === 'ATIVO'
    );

    if (!sponsor) {
      return NextResponse.json({ valid: false, error: 'Código de convite não encontrado ou inativo.' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      affiliateCode: sponsor.affiliate_code,
      sponsorId: sponsor.id,
      sponsorName: maskOperatorName(sponsor.name),
      sponsorFullName: sponsor.name,
      message: `Convite oficial indicado por ${maskOperatorName(sponsor.name)}`
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
