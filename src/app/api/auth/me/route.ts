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
      const admin = db.adminUsers.find(u => u.id === user.userId);
      return NextResponse.json({
        authenticated: true,
        user: {
          id: admin?.id,
          name: admin?.name,
          email: admin?.email,
          role: 'MASTER'
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
          mustChangePassword: operator.mustChangePassword ?? false
        }
      });
    }
  } catch (err: any) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
