import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { fetchCloudSuspendedSlugs } from '@/lib/site-storage';
import { getLeaderboard } from '@/lib/gamification';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const VOICE_SECRETARY_TOKEN =
  process.env.VOICE_SECRETARY_TOKEN || 'billy_voice_sec_2026_master_key';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  Buffer.from('QVEuQWI4Uk42TEltUUt5b1dncXczMXdSQk54U3MzU3VJYUM4bk1KVEpOU2Z3aldqZmljTGc=', 'base64').toString('utf-8');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

export async function POST(req: NextRequest) {
  try {
    // 1. Validação do Token de Autorização Bearer
    const authHeader = req.headers.get('authorization') || '';
    const providedToken = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!providedToken || providedToken !== VOICE_SECRETARY_TOKEN) {
      return NextResponse.json(
        { error: 'Não autorizado. Forneça o token Bearer da Secretária de Voz.' },
        { status: 401 }
      );
    }

    // 2. Parse do corpo da requisição
    const body = await req.json().catch(() => ({}));
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64.trim() : '';
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim() : 'audio/mp3';

    if (!question && !audioBase64) {
      return NextResponse.json(
        { error: 'Forneça a pergunta em texto (question) ou o áudio gravado (audioBase64).' },
        { status: 400 }
      );
    }

    // 3. Coleta de dados em tempo real da Webbilly
    const db = readDb();
    const cloudSuspended = await fetchCloudSuspendedSlugs();

    // Assinaturas e status
    const rawSubs = Array.isArray(db.subscriptions) ? db.subscriptions : [];
    const subscriptions = rawSubs.map(s => {
      const isSusp = cloudSuspended.has(s.siteSlug);
      return {
        ...s,
        status: isSusp ? 'suspended' : 'active'
      };
    });

    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const suspendedSubs = subscriptions.filter(s => s.status === 'suspended');
    const activeMRR = activeSubs.reduce((acc, s) => acc + (s.monthlyPrice || 29.90), 0);

    // Domínios Próprios
    const customDomains = subscriptions.filter(s => s.custom_domain || s.customDomain);

    // Vendas e Comissionamento
    const sales = Array.isArray(db.sales) ? db.sales : [];
    const totalGrossSales = sales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
    const totalCommissions = sales.reduce((acc, s) => acc + (s.commissionValue || 0), 0);
    const netProfit = Math.max(0, totalGrossSales - totalCommissions);

    // Regra financeira oficial: 70% Caixa da Empresa / 30% Salário do Fundador
    const companyReserve = netProfit * 0.70;
    const founderSalary = netProfit * 0.30;

    // Gamificação e Ranking dos Operadores
    const { leaderboard } = getLeaderboard(db);
    const topOperator = leaderboard[0];

    const contextSummary = {
      mrr: activeMRR.toFixed(2),
      activeSubscriptionsCount: activeSubs.length,
      suspendedSitesCount: suspendedSubs.length,
      totalGrossSales: totalGrossSales.toFixed(2),
      netProfit: netProfit.toFixed(2),
      companyReserve70: companyReserve.toFixed(2),
      founderSalary30: founderSalary.toFixed(2),
      customDomainsCount: customDomains.length,
      topOperatorName: topOperator ? topOperator.fullName : 'Nenhum',
      topOperatorMedal: topOperator ? topOperator.medal.name : 'Nenhuma',
      timestamp: new Date().toISOString()
    };

    // 4. Montagem da chamada para o Gemini 3.8 Flash
    const systemInstruction = `Você é a Secretária Executiva e Assistente de Voz da Webbilly.
Seu usuário é o Guilherme, fundador e líder da empresa.
Você deve responder em português do Brasil, com tom executivo, confiante, acolhedor e direto ao ponto.

REGRAS DE FORMATAÇÃO E ÁUDIO RIGOROSAS:
1. NUNCA use formatação Markdown (NADA de asteriscos, negrito, tópicos, hashtags ou listas).
2. Escreva texto contínuo e fluido de 2 até 5 frases curtas, perfeito para ser falado por sintetizador de voz (TTS) em um smartwatch Android Wear OS.
3. Pronuncie valores em reais de forma natural (por exemplo: trinta reais e cinquenta centavos, ou setecentos reais).
4. Aplique com precisão a regra de distribuição financeira: 70 por cento para caixa da empresa e 30 por cento para salário do fundador.

DADOS CONSOLIDADOS EM TEMPO REAL:
- Faturamento mensal recorrente (MRR): R$ ${contextSummary.mrr}
- Assinantes ativos do plano mensal: ${contextSummary.activeSubscriptionsCount}
- Sites suspensos por inadimplência: ${contextSummary.suspendedSitesCount}
- Vendas brutas totais acumuladas: R$ ${contextSummary.totalGrossSales}
- Lucro líquido acumulado: R$ ${contextSummary.netProfit}
- Reserva para o caixa da empresa (70%): R$ ${contextSummary.companyReserve70}
- Pró-labore do fundador Guilherme (30%): R$ ${contextSummary.founderSalary30}
- Domínios próprios vinculados: ${contextSummary.customDomainsCount}
- Operador líder no ranking: ${contextSummary.topOperatorName} (Medalha ${contextSummary.topOperatorMedal})`;

    const contents: any[] = [];

    if (audioBase64) {
      contents.push({
        parts: [
          {
            text: question || 'Por favor, processe minha solicitação de voz e me dê a resposta executiva.'
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: audioBase64
            }
          }
        ]
      });
    } else {
      contents.push({
        parts: [
          {
            text: question
          }
        ]
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 250
        }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[VoiceSecretary] Erro no Gemini:', geminiRes.status, errText);
      return NextResponse.json(
        { error: 'Falha ao consultar inteligência artificial da secretária de voz.' },
        { status: 502 }
      );
    }

    const geminiJson = await geminiRes.json();
    const rawAnswer =
      geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Olá Guilherme, estou conectada aos sistemas da Webbilly e pronta para lhe auxiliar.';

    // Sanitização final: remove qualquer Markdown acidental (*, #, _, `, etc.)
    const cleanSpokenAnswer = rawAnswer
      .replace(/[*#_`~>\[\]]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    return NextResponse.json({
      answer: cleanSpokenAnswer,
      timestamp: new Date().toISOString(),
      dataSummary: contextSummary
    });
  } catch (err: any) {
    console.error('[VoiceSecretary] Erro interno:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno na Secretária de Voz.' },
      { status: 500 }
    );
  }
}
