import { NextRequest, NextResponse } from 'next/server';

/**
 * @deprecated Descontinuado: O modelo foi pivotado para SaaS Recorrente via subdomínio (*.webbilly.com.br).
 * A compra avulsa de domínios finais foi removida da plataforma.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') || searchParams.get('sld') || 'cliente';

  return NextResponse.json({
    success: true,
    deprecated: true,
    available: true,
    domain: `${domain}.webbilly.com.br`,
    message: 'Registro de domínios .com.br descontinuado. Os sites agora utilizam subdomínios automáticos e assinatura SaaS.'
  });
}
