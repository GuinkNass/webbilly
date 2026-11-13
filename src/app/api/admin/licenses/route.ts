import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Master Admin.' }, { status: 403 });
    }

    const db = readDb();

    const licenses = (db.licenses || []).map(lic => {
      const cleanSerial = (lic.serialToken || '').trim().toUpperCase();
      const op = (db.operators || []).find(o => 
        ((o.serialToken || '').trim().toUpperCase() === cleanSerial) || 
        (lic.operatorId && o.id === lic.operatorId)
      );

      const resolvedEmail = op?.email || lic.operatorEmail || (lic as any).email || null;
      const resolvedName = op?.name || lic.operatorName || (lic.status === 'pending_activation' || lic.status === 'pending_onboarding' ? 'Aguardando Onboarding' : 'Não vinculado');
      const isActive = lic.status === 'active' || lic.status === 'ATIVO' || op?.status === 'ATIVO';

      return {
        ...lic,
        operatorId: op?.id || lic.operatorId || null,
        operatorName: resolvedName,
        operatorEmail: resolvedEmail,
        email: resolvedEmail,
        cpf: op?.cpf || (lic as any).cpf || null,
        whatsapp: op?.whatsapp || (lic as any).whatsapp || null,
        pixType: op?.pixType || (lic as any).pixType || null,
        pixKey: op?.pixKey || (lic as any).pixKey || null,
        tempPasswordPlain: op?.tempPasswordPlain || null,
        mustChangePassword: op?.mustChangePassword ?? false,
        corporate_email: op?.corporate_email || op?.corporateEmail || null,
        corporateEmail: op?.corporate_email || op?.corporateEmail || null,
        lark_provisioned: op?.lark_provisioned ?? op?.larkProvisioned ?? false,
        machineId: lic.machineId || op?.machineId || null,
        lastSync: lic.lastSync || op?.lastSync || null,
        status: isActive ? 'active' : lic.status
      };
    });

    return NextResponse.json({
      success: true,
      licenses,
      total: licenses.length
    });
  } catch (err: any) {
    console.error('Erro ao listar licenças:', err);
    return NextResponse.json({ error: 'Erro ao carregar lista de licenças.' }, { status: 500 });
  }
}
