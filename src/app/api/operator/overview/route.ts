import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'OPERATOR') {
      return NextResponse.json({ error: 'Acesso restrito ao Operador.' }, { status: 403 });
    }

    const db = readDb();
    const operator = db.operators.find(o => o.id === user.userId);

    if (!operator) {
      return NextResponse.json({ error: 'Operador não encontrado.' }, { status: 404 });
    }

    const license = db.licenses.find(l => l.serialToken === operator.serialToken);
    const mySales = db.sales.filter(s => s.operatorId === operator.id);

    const totalSold = mySales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
    const totalCommissions = mySales.reduce((acc, s) => acc + (s.commissionValue || 0), 0);
    const paidCommissions = mySales
      .filter(s => s.pixStatus === 'PAGO')
      .reduce((acc, s) => acc + (s.commissionValue || 0), 0);
    const pendingCommissions = mySales
      .filter(s => s.pixStatus === 'PENDENTE')
      .reduce((acc, s) => acc + (s.commissionValue || 0), 0);

    const trainingModules = [
      {
        id: 'mod-1',
        title: 'Módulo 1: Instalação & Ativação do Billy Suite Desktop',
        duration: '06:45',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // player embed
        description: 'Aprenda a instalar o Billy Suite Desktop no Windows e ativar com o seu Token Serial oficial.',
        downloadAttachment: 'Guia_Primeiros_Passos_Billy.pdf'
      },
      {
        id: 'mod-2',
        title: 'Módulo 2: Garimpando Clientes Quentes no Google Maps',
        duration: '12:20',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Técnica de caça a nichos locais sem site ou com nota alta e sem presença online profissional.',
        downloadAttachment: 'Lista_Top_15_Nichos_Locais_Conversao.xlsx'
      },
      {
        id: 'mod-3',
        title: 'Módulo 3: Geração de Landing Page com IA em 60s',
        duration: '09:15',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Como gerar sites com design moderno, fotos reais e copy persuasiva com um único clique.',
        downloadAttachment: 'Checklist_Personalizacao_Express.pdf'
      },
      {
        id: 'mod-4',
        title: 'Módulo 4: Script de Abordagem WhatsApp e Fechamento no Pix',
        duration: '14:50',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Copy testada e comprovada de envio de demonstração pronta e condução para o pagamento via Pix.',
        downloadAttachment: 'Script_WhatsApp_Alta_Conversao.docx'
      }
    ];

    return NextResponse.json({
      operator: {
        id: operator.id,
        name: operator.name,
        email: operator.email,
        whatsapp: operator.whatsapp,
        pixType: operator.pixType,
        pixKey: operator.pixKey,
        serialToken: operator.serialToken,
        status: operator.status,
        machineId: operator.machineId,
        osInfo: operator.osInfo,
        operatorIp: operator.operatorIp || null,
        detectedIp: (req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip')?.trim() || req.headers.get('cf-connecting-ip')?.trim() || '127.0.0.1'),
        lastSync: operator.lastSync,
        dailyLimit: operator.dailyLimit,
        todayGenerations: operator.todayGenerations
      },
      license: license || null,
      stats: {
        salesCount: mySales.length,
        totalSold,
        totalCommissions,
        paidCommissions,
        pendingCommissions,
        commissionPerSale: db.adminSettings.commissionPerSale || 200
      },
      sales: mySales,
      trainingModules,
      installer: {
        version: '2.0.4',
        releaseDate: '2026-11-05',
        fileName: 'Billy-Suite-Setup-2.0.4.exe',
        fileSize: '346 MB',
        downloadUrl: '/downloads/Billy-Suite-Setup-2.0.4.exe'
      }
    });
  } catch (err: any) {
    console.error('Erro no overview do operador:', err);
    return NextResponse.json({ error: 'Erro ao carregar dados do operador.' }, { status: 500 });
  }
}
