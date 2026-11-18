import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const db = readDb();
    if (user.role === 'MASTER') {
      const admin = db.adminUsers?.find(
        u => u.id === user.userId ||
             (u.email && u.email.toLowerCase() === (user.email || '').toLowerCase()) ||
             ((u as any).personal_email && (u as any).personal_email.toLowerCase() === (user.email || '').toLowerCase())
      );
      return NextResponse.json({
        authenticated: true,
        user: {
          id: admin?.id || user.userId,
          name: admin?.name || user.name,
          email: admin?.email || user.email,
          role: 'MASTER',
          is_partner: (admin as any)?.is_partner ?? false
        }
      });
    } else {
      const operator = db.operators.find(o => o.id === user.userId);
      if (!operator) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
      return NextResponse.json({
        authenticated: true,
        user: {
          id: operator.id,
          name: operator.name,
          email: operator.email,
          role: 'OPERATOR',
          serialToken: operator.serialToken,
          status: operator.status,
          pixKey: operator.pixKey,
          pixType: operator.pixType,
          mustChangePassword: (
            operator.auth_provider === 'lark' ||
            (operator as any).authProvider === 'lark' ||
            req.cookies.get('webbilly_lark_auth')?.value === 'true'
          ) ? false : Boolean(operator.mustChangePassword === true || (operator as any).must_change_password === true),
          auth_provider: operator.auth_provider || (req.cookies.get('webbilly_lark_auth')?.value === 'true' ? 'lark' : 'credentials')
        }
      });
    }
  } catch (err: any) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
