import { NextRequest } from 'next/server';
import { POST as authChangePasswordPOST } from '@/app/api/admin/auth/change-password/route';

export async function POST(req: NextRequest) {
  return authChangePasswordPOST(req);
}
