import { NextRequest, NextResponse } from 'next/server';

/**
 * @deprecated Descontinuado: A whitelist de IP da ResellerClub foi removida com o pivot para SaaS Recorrente.
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    deprecated: true,
    ip: '127.0.0.1',
    message: 'Whitelist de IP da ResellerClub descontinuada com o pivot para SaaS Recorrente.'
  });
}
