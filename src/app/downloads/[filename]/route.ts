import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const cleanName = (filename || '').toLowerCase();

  // Se o download solicitado for a extensão Chrome em ZIP
  if (cleanName.includes('extens') || cleanName.includes('extension') || cleanName.endsWith('.zip')) {
    const zipPath = path.join(process.cwd(), 'public', 'downloads', 'Billy-Extensao-Chrome.zip');
    if (fs.existsSync(zipPath)) {
      const fileBuffer = fs.readFileSync(zipPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="Billy-Extensao-Chrome.zip"',
          'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }
  }

  // Redirecionamento oficial e seguro com cabeçalhos anti-cache para o instalador desktop
  const targetUrl = 'https://github.com/GuinkNass/webbilly/releases/download/v2.0.5/Billy-Suite-Setup.exe';
  const response = NextResponse.redirect(targetUrl, 307);
  response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}
