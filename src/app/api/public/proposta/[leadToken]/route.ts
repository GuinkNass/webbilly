import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadToken: string }> }
) {
  try {
    const { leadToken } = await params;
    const db = readDb();
    const briefing = db.briefings?.[leadToken];

    const title = briefing?.title || 'Empresa Parceira';
    const category = briefing?.category || 'Comércio Local';
    const phone = briefing?.phone || '';
    const suggestedDomain = (title || 'site')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    const domains = [
      { domain: `${suggestedDomain}.com.br`, available: true, price: 'R$ 40,00/ano' },
      { domain: `${suggestedDomain}oficial.com.br`, available: true, price: 'R$ 40,00/ano' }
    ];

    const pixKey = db.adminSettings.pixGatewayKey || 'pix@billysuite.com.br';
    const pixName = 'BILLY SUITE';
    const pixCity = 'SAO PAULO';
    const amount = 500;
    const txid = `PROPOSTA${leadToken.slice(0, 16).toUpperCase()}`;

    // Payload básico Copia e Cola Pix
    const pixPayload = `00020126580014BR.GOV.BCB.PIX0136${pixKey}520400005303986540${amount.toFixed(2)}5802BR5911${pixName}6009${pixCity}62170513${txid}6304ABCD`;

    return NextResponse.json({
      success: true,
      leadToken,
      lead: {
        title,
        category,
        phone,
        suggestedPrice: amount
      },
      domains,
      pix: {
        key: pixKey,
        name: pixName,
        city: pixCity,
        amount,
        txid,
        payload: pixPayload,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao carregar proposta' },
      { status: 500 }
    );
  }
}
