import { NextRequest, NextResponse } from 'next/server';
import { checkDomainAvailability } from '@/services/resellerClub';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || searchParams.get('sld');

    if (!domain) {
      return NextResponse.json(
        { error: 'Parâmetro domain ou sld é obrigatório.' },
        { status: 400 }
      );
    }

    const tld = searchParams.get('tld') || 'com.br';
    const cleanSld = domain
      .trim()
      .toLowerCase()
      .replace(new RegExp(`\\.${tld.replace('.', '\\.')}$`, 'i'), '')
      .replace(/\.com\.br$/i, '')
      .replace(/[^a-z0-9-]/g, '');

    const result = await checkDomainAvailability(cleanSld, tld);

    return NextResponse.json({
      success: true,
      domain: result.fullDomain,
      available: result.available,
      status: result.status,
      classkey: result.classkey
    });
  } catch (err: any) {
    console.error('Erro ao verificar disponibilidade de domínio:', err);
    return NextResponse.json(
      {
        error: err.message || 'Erro ao verificar disponibilidade do domínio.',
        available: false
      },
      { status: 500 }
    );
  }
}
