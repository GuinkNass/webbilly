import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export interface ExtractedService {
  name: string;
  price: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text = '', imageBase64 = '', mimeType = 'image/jpeg', niche = 'Comércio Geral' } = body;

    if (!text && !imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Por favor envie um texto colado ou uma imagem de cardápio/tabela.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // 1. Se tivermos chave Gemini, usamos IA com suporte a texto e visão
    if (apiKey) {
      try {
        const prompt = `Você é um extrator inteligente de cardápios, tabelas de preços e serviços comerciais.
Analise o conteúdo fornecido (imagem/print ou texto bruto) para o nicho de "${niche}".
Extraia TODOS os itens, serviços, pratos ou produtos com seus respectivos preços em Real (R$) e uma breve descrição quando disponível.

Retorne EXCLUSIVAMENTE um objeto JSON válido (sem tags markdown \`\`\`json) com o seguinte formato:
{
  "services": [
    { "name": "Nome do Serviço/Produto", "price": "R$ XX,00", "description": "Breve descrição atraente" }
  ],
  "rawExtracted": "Texto completo resumido dos itens encontrados"
}`;

        const parts: any[] = [{ text: prompt }];

        if (imageBase64) {
          const cleanB64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
          parts.push({
            inline_data: {
              mime_type: mimeType,
              data: cleanB64
            }
          });
        }

        if (text) {
          parts.push({
            text: `\n\nTEXTO BRUTO FORNECIDO PELO USUÁRIO:\n"""\n${text}\n"""`
          });
        }

        const models = [preferredModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
        for (const m of models) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                  temperature: 0.1,
                  maxOutputTokens: 8192,
                  responseMimeType: 'application/json'
                }
              })
            });

            if (res.ok) {
              const data = await res.json();
              const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const parsed = JSON.parse(candidate);
              if (parsed && Array.isArray(parsed.services) && parsed.services.length > 0) {
                return NextResponse.json({
                  success: true,
                  services: parsed.services,
                  rawText: parsed.rawExtracted || text
                });
              }
            }
          } catch (modelErr) {
            console.warn(`[Extrair Texto] Modelo ${m} falhou:`, modelErr);
          }
        }
      } catch (geminiErr: any) {
        console.warn('[Extrair Texto] Falha no Gemini Vision, aplicando parser regex:', geminiErr?.message);
      }
    }

    // 2. Parser inteligente de contingência por Regex caso Gemini não responda
    const extractedServices: ExtractedService[] = [];
    const lines = (text || '').split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);

    for (const line of lines) {
      // Procura padrões de preço como R$ 50,00, R$50, 50,00, 50 reais
      const priceMatch = line.match(/(?:R\$\s*|\$\s*)?(\d{1,4}(?:[.,]\d{2})?)\s*(?:reais)?/i);
      if (priceMatch) {
        const rawNum = priceMatch[1].replace('.', ',');
        const formattedPrice = rawNum.includes(',') ? `R$ ${rawNum}` : `R$ ${rawNum},00`;
        const itemName = line.replace(priceMatch[0], '').replace(/[-–—:]+/g, ' ').trim();
        if (itemName.length >= 3) {
          extractedServices.push({
            name: itemName,
            price: formattedPrice,
            description: 'Item extraído do cardápio / tabela.'
          });
        }
      } else if (line.length > 3 && line.length < 50 && !line.includes('http')) {
        extractedServices.push({
          name: line,
          price: 'Sob Consulta',
          description: 'Atendimento e orçamento personalizado.'
        });
      }
    }

    return NextResponse.json({
      success: true,
      services: extractedServices.length > 0 ? extractedServices : [
        { name: `Serviço Especializado de ${niche}`, price: 'R$ 50,00', description: 'Item cadastrado' }
      ],
      rawText: text
    });
  } catch (error: any) {
    console.error('[Extrair Texto] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao extrair serviços.' },
      { status: 500 }
    );
  }
}
