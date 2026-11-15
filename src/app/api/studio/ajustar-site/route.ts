import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readDb, writeDb } from '@/lib/db';
import { sanitizeSlug } from '@/lib/site-storage';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, instruction, currentHtml } = body;

    const cleanSlug = sanitizeSlug(slug || '');
    if (!cleanSlug) {
      return NextResponse.json({ success: false, error: 'Subdomínio inválido.' }, { status: 400 });
    }

    if (!instruction || !instruction.trim()) {
      return NextResponse.json({ success: false, error: 'Instrução de ajuste não informada.' }, { status: 400 });
    }

    // Carrega o HTML atual caso não tenha sido enviado
    let htmlToRefine = currentHtml || '';
    if (!htmlToRefine) {
      const diskPath = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug, 'index.html');
      if (fs.existsSync(diskPath)) {
        htmlToRefine = fs.readFileSync(diskPath, 'utf-8');
      } else {
        const db = readDb();
        htmlToRefine = db.generatedSites?.[cleanSlug] || '';
      }
    }

    if (!htmlToRefine) {
      return NextResponse.json({ success: false, error: 'HTML do site não encontrado para ajuste.' }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    let refinedHtml = htmlToRefine;

    if (apiKey) {
      const prompt = `Você é um Engenheiro Frontend Sênior e Especialista em Landing Pages.
O operador solicitou o seguinte ajuste no site existente:
"${instruction}"

REGRAS OBRIGATÓRIAS:
1. Mantenha 100% da estrutura geral, design, fontes, folhas de estilo Tailwind e scripts existentes.
2. Aplique cirurgicamente a alteração pedida (ex: modificar cores de botões, alterar títulos ou chamadas, adicionar ou remover seções, ajustar textos de serviços, etc.).
3. Garanta que botões de ação e WhatsApp continuem funcionando normalmente.
4. Retorne EXCLUSIVAMENTE o código HTML completo final, iniciando em <!DOCTYPE html> e finalizando em </html>, sem markdown (\`\`\`html) e sem explicações antes ou depois.

HTML ATUAL DO SITE:
${htmlToRefine}
`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 32768
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = candidateText
          .replace(/^```html\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        if (cleaned && cleaned.includes('</html>') && cleaned.includes('<head')) {
          refinedHtml = cleaned;
        }
      }
    }

    // Salva o HTML refinado em disco
    try {
      const siteDir = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug);
      if (!fs.existsSync(siteDir)) {
        fs.mkdirSync(siteDir, { recursive: true });
      }
      fs.writeFileSync(path.join(siteDir, 'index.html'), refinedHtml, 'utf-8');
    } catch (fsErr) {
      console.warn('[Studio Ajustar Site] Erro ao gravar em disco:', fsErr);
    }

    // Salva no banco local db.json
    try {
      const db = readDb();
      if (!db.generatedSites) db.generatedSites = {};
      db.generatedSites[cleanSlug] = refinedHtml;
      writeDb(db);
    } catch (dbErr) {
      console.warn('[Studio Ajustar Site] Erro ao salvar no db local:', dbErr);
    }

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      html: refinedHtml,
      message: `Ajuste "${instruction}" aplicado com sucesso!`
    });
  } catch (error: any) {
    console.error('[Studio Ajustar Site] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao processar ajuste no site.' },
      { status: 500 }
    );
  }
}
