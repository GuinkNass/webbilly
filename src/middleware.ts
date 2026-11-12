import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Intercepta todas as requisições exceto:
     * - /api (APIs internas)
     * - /templates (Arquivos estáticos de templates oficiais)
     * - /_next (arquivos estáticos compilados do Next.js)
     * - arquivos estáticos na raiz (favicon, imagens, etc.)
     */
    '/((?!api/|templates/|_next/|_static/|[\\w-]+\\.\\w+).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostHeader =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    url.hostname ||
    '';

  // Remove a porta se houver (ex: sushihiroshisp.webbilly.com.br:443 -> sushihiroshisp.webbilly.com.br)
  const currentHost = hostHeader.split(':')[0].toLowerCase().trim();

  let subdomain = '';

  // 1. Host termina com .webbilly.com.br
  if (currentHost.endsWith('.webbilly.com.br')) {
    const candidate = currentHost.replace('.webbilly.com.br', '').trim();
    const reserved = ['www', 'api', 'webmail'];
    if (candidate && !reserved.includes(candidate)) {
      subdomain = candidate.toLowerCase();
    }
  }
  // 2. Host termina com .localhost (para testes locais em desenvolvimento)
  else if (currentHost.endsWith('.localhost')) {
    const candidate = currentHost.replace('.localhost', '').trim();
    const reserved = ['www', 'api'];
    if (candidate && !reserved.includes(candidate)) {
      subdomain = candidate.toLowerCase();
    }
  }

  // Se a requisição veio através de um subdomínio válido
  if (subdomain) {
    // Não reescreve chamadas de API internas, assets de templates ou se já estiver na rota /site
    if (!url.pathname.startsWith('/api') && !url.pathname.startsWith('/templates') && !url.pathname.startsWith('/site')) {
      const rewriteUrl = new URL(`/site/${subdomain.toLowerCase()}`, req.url);
      rewriteUrl.search = url.search;
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  return NextResponse.next();
}
