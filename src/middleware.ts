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
  let isCustomDomain = false;
  let customDomainTarget = '';

  const reservedMainHosts = [
    'webbilly.com.br',
    'www.webbilly.com.br',
    'localhost',
    '127.0.0.1',
    'webbilly.vercel.app'
  ];

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
  // 3. Host externo/Domínio próprio (ex: empresa.com.br ou www.empresa.com.br)
  else if (!reservedMainHosts.includes(currentHost) && !currentHost.endsWith('.vercel.app')) {
    isCustomDomain = true;
    customDomainTarget = currentHost.replace(/^www\./, '').toLowerCase().trim();
  }

  // Se a requisição veio através de um subdomínio válido
  if (subdomain) {
    // Não reescreve chamadas de API internas, assets de templates ou se já estiver na rota /site
    if (!url.pathname.startsWith('/api') && !url.pathname.startsWith('/templates') && !url.pathname.startsWith('/site')) {
      const rewriteUrl = new URL(`/site/${subdomain.toLowerCase()}`, req.url);
      rewriteUrl.search = url.search;
      const response = NextResponse.rewrite(rewriteUrl);
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }
  }

  // Se a requisição veio através de um domínio próprio vinculado
  if (isCustomDomain && customDomainTarget) {
    if (!url.pathname.startsWith('/api') && !url.pathname.startsWith('/templates') && !url.pathname.startsWith('/site')) {
      const rewriteUrl = new URL(`/site/${encodeURIComponent(customDomainTarget)}`, req.url);
      rewriteUrl.search = url.search;
      const response = NextResponse.rewrite(rewriteUrl);
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }
  }

  return NextResponse.next();
}
