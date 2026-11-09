import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const targetUrl = 'https://github.com/GuinkNass/webbilly/releases/download/v2.0.4/Billy-Suite-Setup.exe';
  return NextResponse.redirect(targetUrl, 302);
}
