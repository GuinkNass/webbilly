import { NextRequest } from 'next/server';
import { POST as handlePost } from '../route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handlePost(req);
}
