import { NextRequest, NextResponse } from 'next/server';
import { fetchCloudSuspendedSlugs, sanitizeSlug } from '@/lib/site-storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSlug = searchParams.get('slug') || '';
    const slug = sanitizeSlug(rawSlug);

    if (!slug) {
      return NextResponse.json({ error: 'Slug obrigatório' }, { status: 400 });
    }

    const cloudSuspended = await fetchCloudSuspendedSlugs();
    const isSuspended = cloudSuspended.has(slug);

    return new NextResponse(
      JSON.stringify({
        slug,
        status: isSuspended ? 'suspended' : 'active',
        isSuspended,
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
