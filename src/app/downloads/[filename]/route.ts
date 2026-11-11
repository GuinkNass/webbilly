import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  // Redirecionamento oficial e seguro com cabeçalhos anti-cache para o binário de alta performance no GitHub Releases
  const targetUrl = 'https://github.com/GuinkNass/webbilly/releases/download/v2.0.4/Billy-Suite-Setup.exe';
  const response = NextResponse.redirect(targetUrl, 307);
  response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}
