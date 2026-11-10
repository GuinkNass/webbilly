import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  // O repositório webbilly é público, permitindo download direto para qualquer usuário sem login no GitHub.
  const targetUrl = 'https://github.com/GuinkNass/webbilly/releases/download/v2.0.4/Billy-Suite-Setup.exe';
  const response = NextResponse.redirect(targetUrl, 307);
  response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
  return response;
}
