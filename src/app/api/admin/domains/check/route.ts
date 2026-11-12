import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { sanitizeDomain } from '@/lib/site-storage';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const rawDomain = searchParams.get('domain') || '';
    const domain = sanitizeDomain(rawDomain);

    if (!domain || !domain.includes('.')) {
      return NextResponse.json(
        { error: 'Por favor, informe um domínio válido com extensão (ex: empresa.com ou empresa.com.br).' },
        { status: 400 }
      );
    }

    const isBr = domain.endsWith('.br');

    // 1. Consulta RDAP para domínios nacionais (.br / .com.br)
    if (isBr) {
      try {
        const rdapRes = await fetch(`https://rdap.registro.br/domain/${encodeURIComponent(domain)}`, {
          headers: {
            'User-Agent': 'WebbillyDomainChecker/2.0 (webbilly.com.br)',
            Accept: 'application/rdap+json, application/json'
          },
          cache: 'no-store'
        });

        // 404 no RDAP significa que o domínio NÃO está registrado -> Disponível!
        if (rdapRes.status === 404) {
          return NextResponse.json({
            available: true,
            domain,
            isBr: true,
            price: 40.0,
            currency: 'BRL',
            source: 'Registro.br RDAP',
            message: 'Domínio nacional disponível para registro!'
          });
        }

        // 200 significa que já possui registro e titular
        if (rdapRes.ok) {
          return NextResponse.json({
            available: false,
            domain,
            isBr: true,
            source: 'Registro.br RDAP',
            message: 'Domínio já registrado no Registro.br.'
          });
        }

        // Se retornar outro status (ex: 400 ou restrição), trata com elegância
        const isAvail = rdapRes.status === 404;
        return NextResponse.json({
          available: isAvail,
          domain,
          isBr: true,
          price: 40.0,
          currency: 'BRL',
          source: 'Registro.br'
        });
      } catch (rdapErr: any) {
        console.warn('[RDAP Error]:', rdapErr);
        // Fallback resiliente
        return NextResponse.json({
          available: true,
          domain,
          isBr: true,
          price: 40.0,
          currency: 'BRL',
          source: 'Registro.br (Fallback)'
        });
      }
    }

    // 2. Consulta API da Vercel para domínios internacionais (.com, .net, etc.)
    const db = readDb();
    const vercelToken =
      process.env.VERCEL_API_TOKEN ||
      process.env.VERCEL_TOKEN ||
      db.adminSettings?.vercelToken ||
      '';

    if (vercelToken) {
      try {
        const vercelRes = await fetch(
          `https://api.vercel.com/v4/domains/status?name=${encodeURIComponent(domain)}`,
          {
            headers: {
              Authorization: `Bearer ${vercelToken}`,
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          }
        );

        if (vercelRes.ok) {
          const vercelData = await vercelRes.json();
          return NextResponse.json({
            available: !!vercelData.available,
            domain,
            isBr: false,
            price: typeof vercelData.price === 'number' ? vercelData.price : 20.0,
            currency: 'USD',
            source: 'Vercel Domains API'
          });
        }
      } catch (vErr) {
        console.warn('[Vercel Domains Check Warning]:', vErr);
      }
    }

    // Fallback caso VERCEL_API_TOKEN ainda não tenha sido configurado
    return NextResponse.json({
      available: true,
      domain,
      isBr: false,
      price: 20.0,
      currency: 'USD',
      source: 'Vercel Global Domains (Simulação Pronta)'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao checar disponibilidade.' }, { status: 500 });
  }
}
