import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Intercepta todas as requisições exceto:
     * - /api (APIs internas)
     * - /_next (arquivos estáticos compilados do Next.js)
     * - arquivos estáticos na raiz (favicon, imagens, etc.)
     */
    '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Remove a porta se houver (ex: localhost:3000 -> localhost)
  const currentHost = hostname.replace(/:[0-9]+$/, '');
  const rootDomains = ['webbilly.com.br', 'localhost'];

  let subdomain = '';
  for (const root of rootDomains) {
    if (currentHost.endsWith(root) && currentHost !== root) {
      const candidate = currentHost.replace(`.${root}`, '');
      const reserved = ['www', 'webmail', 'api', 'admin', 'operador'];
      if (candidate && !reserved.includes(candidate.toLowerCase())) {
        subdomain = candidate.toLowerCase();
        break;
      }
    }
  }

  // Se a requisição veio através de um subdomínio (ex: caoqripetshop.webbilly.com.br)
  if (subdomain) {
    // Se a rota for a raiz '/', reescreve para a página do site
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/site/${subdomain}`, req.url));
    }
  }

  return NextResponse.next();
}
