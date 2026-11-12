'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function TermosDeUsoPage() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col justify-between selection:bg-[#7abf18]/30 selection:text-white">
      {/* Estilos para impressão limpa em PDF/Papel */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #111827 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-contract {
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #111827 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          .print-contract h1,
          .print-contract h2,
          .print-contract h3,
          .print-contract strong {
            color: #000000 !important;
          }
          .print-contract p,
          .print-contract li {
            color: #1f2937 !important;
          }
        }
      `}</style>

      {/* Header oficial Webbilly */}
      <header className="border-b border-zinc-800/80 bg-[#0e121a]/90 backdrop-blur-md sticky top-0 z-30 no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition group py-1.5 px-2.5 rounded-lg hover:bg-zinc-800/60"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Voltar</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <Link href="/" className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white font-heading">
                Web<span className="text-[#7abf18]">billy</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700/60 transition shadow-sm"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo do Contrato */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <div className="bg-[#0e121a]/70 border border-zinc-800/90 rounded-2xl p-6 sm:p-12 shadow-2xl print-contract">
          {/* Badge & Cabeçalho */}
          <div className="border-b border-zinc-800 pb-8 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7abf18]/10 border border-[#7abf18]/30 text-[#7abf18] text-xs font-bold tracking-wide uppercase mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Instrumento Jurídico Oficial • Versão 1.0</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight uppercase font-heading">
              TERMOS DE USO E CONTRATO DE LICENCIAMENTO DE PRESENÇA DIGITAL — WEBBILLY
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Registro público e termos aplicáveis a clientes e contratantes da plataforma Webbilly Tecnologia.
            </p>
          </div>

          {/* Preâmbulo e Cláusulas na Íntegra (sem resumos ou omissões) */}
          <div className="space-y-8 text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
            <p className="text-justify text-zinc-300 leading-relaxed">
              Pelo presente instrumento eletrônico, <strong className="text-white">WEBBILLY TECNOLOGIA E PRESENÇA DIGITAL</strong> (doravante &quot;CONTRATADA&quot;), representada por Guilherme Rodrigues Nascimento, e-mail oficial <a href="mailto:contato@webbilly.com.br" className="text-[#7abf18] hover:underline">contato@webbilly.com.br</a> e suporte <a href="mailto:sac@webbilly.com.br" className="text-[#7abf18] hover:underline">sac@webbilly.com.br</a>, e o(a) <strong className="text-white">CLIENTE</strong> identificado(a) no cadastro e proposta comercial (doravante &quot;CONTRATANTE&quot;), ajustam as condições de prestação de serviços digitais a seguir:
            </p>

            {/* CLÁUSULA 1ª */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide border-l-2 border-[#7abf18] pl-3 uppercase">
                CLÁUSULA 1ª — DO OBJETO E MODALIDADES DE CONTRATAÇÃO
              </h2>
              <p className="text-justify">
                <strong>1.1.</strong> A CONTRATADA disponibiliza ao CONTRATANTE solução tecnológica de criação, publicação e hospedagem de página profissional na internet (Landing Page / Site Comercial), conforme a modalidade escolhida na proposta comercial:
              </p>
              <div className="space-y-4 pl-2 sm:pl-4">
                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7abf18] shrink-0" />
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      Modalidade A — Plano Mensal em Subdomínio (*.webbilly.com.br):
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-300 pl-6 leading-relaxed text-justify">
                    Assinatura recorrente no valor de <strong>R$ 29,90 (vinte e nove reais e noventa centavos) por mês</strong>, sem taxa de adesão e sem fidelidade mínima. Inclui hospedagem em subdomínio oficial webbilly.com.br, certificado de segurança SSL e o direito a até 2 (duas) solicitações de alterações simples de conteúdo por mês (textos, horários, links ou imagens fornecidas pelo cliente), não acumulativas para meses seguintes.
                  </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7abf18] shrink-0" />
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      Modalidade B — Pacote Site Completo + Domínio Próprio (Ciclo de 1 Ano):
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-300 pl-6 leading-relaxed text-justify">
                    Pagamento único no valor de <strong>R$ 490,00 (quatrocentos e noventa reais)</strong>, que libera o site completo publicado sob domínio próprio registrado (.com.br ou equivalente disponível) pelo período de 12 (doze) meses contados da ativação.
                  </p>
                  <p className="text-sm text-zinc-300 pl-6 leading-relaxed text-justify">
                    <strong>Renovação Anual:</strong> Após o término do período de 12 meses, a manutenção da publicação e a renovação do domínio próprio por mais 1 (um) ano poderão ser realizadas mediante o pagamento da taxa anual de <strong>R$ 70,00 (setenta reais)</strong>.
                  </p>
                  <p className="text-sm text-zinc-300 pl-6 leading-relaxed text-justify">
                    <strong>Atualizações Sob Demanda (Sem Recorrência):</strong> Nesta modalidade não há cobrança de mensalidade. Correções de eventuais falhas técnicas são gratuitas; solicitações de alteração de conteúdo (troca de fotos, textos, tabela de preços ou promoções) serão atendidas sob demanda mediante taxa única de <strong>R$ 29,90 (vinte e nove reais e noventa centavos)</strong> por solicitação em lote, sem qualquer vínculo de recorrência.
                  </p>
                </div>
              </div>
            </section>

            {/* CLÁUSULA 2ª */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide border-l-2 border-[#7abf18] pl-3 uppercase">
                CLÁUSULA 2ª — DA SUSPENSÃO AUTOMÁTICA POR INADIMPLÊNCIA E CANCELAMENTO
              </h2>
              <p className="text-justify leading-relaxed">
                <strong>2.1. Suspensão Imediata:</strong> O não pagamento da mensalidade na data de vencimento (Modalidade A) ou a não renovação anual após o vencimento do ciclo de 12 meses (Modalidade B) autoriza a CONTRATADA a suspender imediatamente a exibição pública do site, substituindo-o por aviso administrativo de publicação pausada até a regularização financeira.
              </p>
              <p className="text-justify leading-relaxed">
                <strong>2.2. Cancelamento:</strong> Na Modalidade A (Mensal), o CONTRATANTE pode solicitar o cancelamento a qualquer momento antes da geração da próxima fatura mensal, sem multa rescisória. Na Modalidade B (Anual), por envolver registro imediato de domínio próprio e alocação dedicada de configuração, não há reembolso proporcional após o registro do domínio.
              </p>
            </section>

            {/* CLÁUSULA 3ª */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide border-l-2 border-[#7abf18] pl-3 uppercase">
                CLÁUSULA 3ª — DAS RESPONSABILIDADES SOBRE CONTEÚDO E PROPRIEDADE INTELECTUAL
              </h2>
              <p className="text-justify leading-relaxed">
                <strong>3.1. Conteúdo Fornecido:</strong> O CONTRATANTE declara ser legítimo titular ou possuir autorização de uso sobre todas as marcas, logotipos, fotografias, textos, preços e informações inseridos em sua página, isentando a CONTRATADA de qualquer responsabilidade civil ou penal perante terceiros.
              </p>
              <p className="text-justify leading-relaxed">
                <strong>3.2. Infraestrutura e Código:</strong> A arquitetura de software, templates, estrutura de código e painel administrativo permanecem sob titularidade exclusiva da CONTRATADA, sendo concedida ao CONTRATANTE licença de uso vinculada à vigência e adimplência do plano contratado.
              </p>
            </section>

            {/* CLÁUSULA 4ª */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide border-l-2 border-[#7abf18] pl-3 uppercase">
                CLÁUSULA 4ª — DA PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)
              </h2>
              <p className="text-justify leading-relaxed">
                <strong>4.1.</strong> As partes comprometem-se a cumprir integralmente a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), utilizando os dados cadastrais exclusivamente para a execução deste contrato, emissão de cobranças e suporte técnico.
              </p>
            </section>

            {/* CLÁUSULA 5ª */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide border-l-2 border-[#7abf18] pl-3 uppercase">
                CLÁUSULA 5ª — DO ACEITE ELETRÔNICO E FORO
              </h2>
              <p className="text-justify leading-relaxed">
                <strong>5.1.</strong> O aceite eletrônico realizado no momento da contratação ou geração de pagamento, registrado com data, hora e endereço IP, confere plena validade jurídica a este instrumento.
              </p>
              <p className="text-justify leading-relaxed">
                <strong>5.2.</strong> Fica eleito o Foro da Comarca de São Paulo/SP para resolver quaisquer questões decorrentes deste instrumento.
              </p>
            </section>
          </div>

          {/* Rodapé Interno do Contrato */}
          <div className="mt-12 pt-6 border-t border-zinc-800 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>Webbilly Tecnologia • CNPJ e Operação em São Paulo/SP</span>
            </div>
            <span>E-mail: contato@webbilly.com.br • SAC: sac@webbilly.com.br</span>
          </div>
        </div>
      </main>

      {/* Footer simples */}
      <footer className="border-t border-zinc-800/80 bg-[#0e121a]/80 py-6 text-center text-xs text-zinc-500 no-print">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Webbilly Tecnologia. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-zinc-300 transition">Página Inicial</Link>
            <Link href="/contrato-operador" className="hover:text-zinc-300 transition">Contrato de Operadores</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
