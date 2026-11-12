'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export default function ContratoOperadorPage() {
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

      {/* Header oficial */}
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
              <span>Parceria Comercial Autônoma & NDA • Versão 1.0</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight uppercase font-heading">
              TERMO DE ADESÃO À PARCERIA COMERCIAL AUTÔNOMA, PROPRIEDADE INTELECTUAL (NDA) E PROGRAMA BILLY AFILIADOS
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Condições oficiais de parceria autônoma, remuneração comissionada, proteção de propriedade intelectual e regras de afiliação.
            </p>
          </div>

          {/* Preâmbulo e Cláusulas na Íntegra (sem resumos ou omissões) */}
          <div className="space-y-8 text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
            <p className="text-justify text-zinc-300 leading-relaxed">
              Pelo presente instrumento eletrônico, de um lado <strong className="text-white">WEBBILLY TECNOLOGIA E PRESENÇA DIGITAL</strong> (doravante denominada &quot;CONTRATANTE&quot; ou &quot;WEBBILLY&quot;), representada por seu administrador Guilherme Rodrigues Nascimento, com sede em São Paulo/SP, e-mail oficial <a href="mailto:operadores@webbilly.com.br" className="text-[#7abf18] hover:underline">operadores@webbilly.com.br</a>; e, de outro lado, o(a) usuário(a) devidamente identificado(a) no formulário eletrônico de cadastro (doravante denominado(a) &quot;PARCEIRO OPERADOR&quot;), resolvem celebrar o presente Termo de Parceria Comercial Autônoma, mediante as cláusulas e condições a seguir:
            </p>

            {/* CLÁUSULA 1ª */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide border-l-2 border-[#7abf18] pl-3 uppercase">
                CLÁUSULA 1ª — DO OBJETO E DA NATUREZA AUTÔNOMA DA PARCERIA
              </h2>
              <p className="text-justify leading-relaxed">
                <strong>1.1.</strong> O presente Termo tem por objeto estabelecer as regras para a atuação comercial independente do PARCEIRO OPERADOR na prospecção, apresentação de demonstrações e intermediação de vendas dos planos e pacotes digitais da plataforma WEBBILLY (webbilly.com.br) e ecossistema BILLY SUITE.
              </p>
              <p className="text-justify leading-relaxed">
                <strong>1.2. Ausência de Vínculo Empregatício:</strong> As partes declaram expressamente que a relação jurídica estabelecida é estritamente comercial e autônoma, nos termos do Código Civil Brasileiro, não gerando qualquer vínculo empregatício, societário, previdenciário ou subordinação jurídica (art. 3º da CLT). O PARCEIRO OPERADOR possui total liberdade para definir seus próprios horários, dias de atuação, metas pessoais e locais de prospecção, sem exigência de exclusividade ou controle de jornada.
              </p>
            </section>

            {/* CLÁUSULA 2ª */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide border-l-2 border-[#7abf18] pl-3 uppercase">
                CLÁUSULA 2ª — DA REMUNERAÇÃO, COMISSÕES, GAMIFICAÇÃO E REPASSES
              </h2>
              <p className="text-justify leading-relaxed">
                <strong>2.1.</strong> Pelas vendas efetivamente pagas e compensadas por clientes finais indicados pelo PARCEIRO OPERADOR através de seu identificador único no sistema, fará jus às seguintes comissões:
              </p>
              <div className="space-y-2 pl-2 sm:pl-4">
                <div className="flex items-start gap-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7abf18] shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    <strong>Plano Mensal Subdomínio (R$ 29,90/mês):</strong> Comissão recorrente de <strong>R$ 10,00 (dez reais) por mês</strong>, por assinatura ativa e adimplente vinculada ao operador.
                  </p>
                </div>
                <div className="flex items-start gap-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7abf18] shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    <strong>Pacote Site Completo + Domínio Próprio (R$ 490,00 — ciclo de 1 ano):</strong> Comissão única de <strong>30% (trinta por cento)</strong> sobre o valor pago pelo cliente, equivalente a <strong>R$ 147,00 (cento e quarenta e sete reais)</strong> por venda confirmada.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  2.2. Gamificação, Medalhas e Bônus de Promoção (+20%):
                </h3>
                <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm text-zinc-300 leading-relaxed text-justify">
                  <li>
                    A evolução de patentes (Bronze: 10 assinantes recorrentes ativos + 1 venda de domínio no mês; Prata: 35 recorrentes ativos + 5 domínios no mês; Ouro: 50 recorrentes ativos + 15 domínios no mês; Rubi: 100 recorrentes ativos + 25 domínios no mês) segue a apuração automática do painel oficial.
                  </li>
                  <li>
                    Sempre que o PARCEIRO OPERADOR conquistar promoção de faixa de medalha dentro de um mês civil, receberá um bônus extraordinário de <strong>20% (vinte por cento)</strong> calculado sobre o total de suas comissões operacionais daquele respectivo mês.
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  2.3. Programa Billy Afiliados (5%):
                </h3>
                <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm text-zinc-300 leading-relaxed text-justify">
                  <li>
                    Ao atingir no mínimo o nível Bronze, o PARCEIRO OPERADOR poderá habilitar seu link exclusivo de convite.
                  </li>
                  <li>
                    Fará jus à comissão de <strong>5% (cinco por cento)</strong>, equivalente a <strong>R$ 24,50 (vinte e quatro reais e cinquenta centavos)</strong>, por cada venda confirmada do Pacote Site Completo + Domínio Próprio (R$ 490,00) realizada por operadores diretos cadastrados por meio de seu link de convite.
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  2.4. Solicitação de Repasse e Inadimplência:
                </h3>
                <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm text-zinc-300 leading-relaxed text-justify">
                  <li>
                    O PARCEIRO OPERADOR poderá solicitar o repasse do saldo disponível <strong>1 (uma) vez por mês civil</strong> diretamente pelo painel oficial, informando chave Pix de sua titularidade. Caso não solicite em determinado mês, o saldo permanecerá acumulado para retirada futura.
                  </li>
                  <li>
                    Em caso de estorno, chargeback, fraude ou cancelamento antes da compensação bancária, a respectiva comissão será automaticamente estornada.
                  </li>
                </ul>
              </div>
            </section>

            {/* CLÁUSULA 3ª */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide border-l-2 border-[#7abf18] pl-3 uppercase">
                CLÁUSULA 3ª — DA PROPRIEDADE INTELECTUAL, SIGILO (NDA) E NÃO CONCORRÊNCIA
              </h2>
              <p className="text-justify leading-relaxed">
                <strong>3.1. Titularidade Exclusiva:</strong> Todos os softwares, códigos-fonte, aplicativos desktop (BILLY), extensões de navegador, painéis administrativos, templates visuais, marcas (WEBBILLY e BILLY SUITE), domínios, metodologias comerciais e scripts de atendimento são de propriedade exclusiva da CONTRATANTE, protegidos pela Lei nº 9.609/1998 (Lei do Software) e Lei nº 9.279/1996 (Lei da Propriedade Industrial).
              </p>
              <p className="text-justify leading-relaxed">
                <strong>3.2. Licença Revogável:</strong> O acesso concedido ao painel web, aplicativo e extensão Chrome constitui mera licença de uso temporária, pessoal, intransferível e revogável a qualquer momento, sendo expressamente vedada a engenharia reversa, cópia, redistribuição, compartilhamento de credenciais ou comercialização não autorizada.
              </p>
              <p className="text-justify leading-relaxed">
                <strong>3.3. Propriedade da Carteira e Confidencialidade:</strong> Todos os leads, dados cadastrais, sites gerados e contratos firmados com clientes finais pertencem exclusivamente à WEBBILLY. O PARCEIRO OPERADOR compromete-se a manter absoluto sigilo sobre estratégias internas, preços de custo, códigos e informações de clientes durante a vigência desta parceria e pelo prazo de <strong>2 (dois) anos</strong> após seu encerramento, sob pena de responsabilização civil e criminal.
              </p>
            </section>

            {/* CLÁUSULA 4ª */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide border-l-2 border-[#7abf18] pl-3 uppercase">
                CLÁUSULA 4ª — DA CONDUTA COMERCIAL E LGPD
              </h2>
              <p className="text-justify leading-relaxed">
                <strong>4.1.</strong> O PARCEIRO OPERADOR compromete-se a apresentar estritamente as condições oficiais vigentes da plataforma, sendo proibida a promessa de funcionalidades inexistentes, cobrança direta de clientes em conta pessoal ou envio de comunicações abusivas/spam em desacordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              </p>
              <p className="text-justify leading-relaxed">
                <strong>4.2.</strong> O descumprimento de qualquer cláusula deste Termo acarretará o bloqueio imediato das licenças de acesso e a rescisão motivada da parceria.
              </p>
            </section>

            {/* CLÁUSULA 5ª */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide border-l-2 border-[#7abf18] pl-3 uppercase">
                CLÁUSULA 5ª — DO ACEITE ELETRÔNICO E FORO
              </h2>
              <p className="text-justify leading-relaxed">
                <strong>5.1.</strong> O clique no botão de aceite eletrônico, acompanhado do registro do endereço IP, data, hora e credenciais de acesso no banco de dados da plataforma, confere plena validade jurídica a este instrumento, nos termos do art. 10, § 2º da Medida Provisória nº 2.200-2/2001.
              </p>
              <p className="text-justify leading-relaxed">
                <strong>5.2.</strong> Fica eleito o Foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas deste Termo.
              </p>
            </section>
          </div>

          {/* Rodapé Interno do Contrato */}
          <div className="mt-12 pt-6 border-t border-zinc-800 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-zinc-400" />
              <span>Webbilly Tecnologia & Billy Suite • São Paulo/SP</span>
            </div>
            <span>E-mail: operadores@webbilly.com.br • Parcerias Oficiais</span>
          </div>
        </div>
      </main>

      {/* Footer simples */}
      <footer className="border-t border-zinc-800/80 bg-[#0e121a]/80 py-6 text-center text-xs text-zinc-500 no-print">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Webbilly Tecnologia. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-zinc-300 transition">Página Inicial</Link>
            <Link href="/termos" className="hover:text-zinc-300 transition">Termos de Uso do Cliente</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
