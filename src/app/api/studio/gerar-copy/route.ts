import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName = 'Comércio Local',
      niche = 'Barbearia',
      city = 'São Paulo - SP',
      toneOfVoice = 'comercial'
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || '';
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      // Fallback estático caso não haja API key configurada
      return NextResponse.json({
        success: true,
        data: {
          headline: `A melhor experiência em ${niche} em ${city}`,
          subheadline: `Qualidade inegociável, atendimento personalizado e estrutura de ponta para você e sua família.`,
          description: `Com anos de tradição e foco absoluto na satisfação dos nossos clientes, a ${businessName} é referência em ${niche} na região de ${city}. Nossa equipe é altamente qualificada e pronta para oferecer um atendimento exclusivo.`,
          services: [
            { name: `Serviço Premium de ${niche}`, price: 'R$ 49,00', description: 'Atendimento completo com os melhores produtos do mercado.' },
            { name: 'Pacote Especial Completo', price: 'R$ 89,00', description: 'Combinação perfeita com o melhor custo-benefício da região.' },
            { name: 'Atendimento Expresso', price: 'R$ 35,00', description: 'Rapidez e precisão para quem tem o dia a dia corrido.' }
          ],
          features: [
            'Ambiente acolhedor, climatizado e confortável',
            'Profissionais certificados com vasta experiência',
            'Facilidade no pagamento: Pix, cartões e parcelamento',
            'Agendamento rápido e prioritário via WhatsApp'
          ],
          faqs: [
            { question: 'Como faço para agendar um horário?', answer: 'Basta clicar no botão do WhatsApp e nossa equipe responderá em minutos!' },
            { question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos Pix com desconto, dinheiro e todos os cartões de crédito/débito.' },
            { question: 'Onde vocês estão localizados?', answer: `Estamos convenientemente localizados em ${city}, com fácil acesso e estacionamento.` }
          ],
          hours: 'Segunda a Sábado das 08h30 às 19h30'
        }
      });
    }

    // Chamada à API Gemini
    const prompt = `Você é um Copywriter Sênior de Altíssima Conversão especializado em negócios locais no Brasil.
Gere o conteúdo completo e persuasivo em Português do Brasil para a Landing Page do seguinte comércio:
- Nome da Empresa: "${businessName}"
- Nicho / Atividade: "${niche}"
- Cidade / Localização: "${city}"
- Tom de Voz: "${toneOfVoice}" (Opções: Luxo/Exclusivo, Comercial Agressivo/Alta Conversão, Jovem/Criativo, Técnico/Institucional)

Retorne EXCLUSIVAMENTE um objeto JSON válido (sem tags markdown \`\`\`json) com a seguinte estrutura exata:
{
  "headline": "Slogan marcante de 5 a 10 palavras que gere desejo imediato",
  "subheadline": "Subtítulo persuasivo de 1 a 2 frases destacando os principais benefícios",
  "description": "Texto institucional convincente de 2 a 3 parágrafos curtos falando da autoridade, equipe e compromisso com o cliente",
  "services": [
    { "name": "Nome do Serviço 1", "price": "R$ XX,00", "description": "Breve descrição atraente do que está incluso" },
    { "name": "Nome do Serviço 2", "price": "R$ XX,00", "description": "Breve descrição atraente do que está incluso" },
    { "name": "Nome do Serviço 3", "price": "R$ XX,00", "description": "Breve descrição atraente do que está incluso" },
    { "name": "Nome do Serviço 4", "price": "R$ XX,00", "description": "Breve descrição atraente do que está incluso" }
  ],
  "features": [
    "Diferencial 1 de alto impacto",
    "Diferencial 2 de comodidade",
    "Diferencial 3 de qualidade técnica",
    "Diferencial 4 de garantia ou agilidade"
  ],
  "faqs": [
    { "question": "Pergunta Frequente 1?", "answer": "Resposta clara e convidativa." },
    { "question": "Pergunta Frequente 2?", "answer": "Resposta clara e convidativa." },
    { "question": "Pergunta Frequente 3?", "answer": "Resposta clara e convidativa." }
  ],
  "hours": "Segunda a Sábado das 08:30 às 19:30"
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API retornou status ${res.status}`);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = candidateText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error('[API Gerar Copy] Erro ao gerar copy com IA:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Falha ao gerar textos com IA. Tente novamente.'
      },
      { status: 500 }
    );
  }
}
