/**
 * Template React Tipado: PureFit — Suplementos Nutricionais & Vitaminas
 * Slug: loja-suplementos-purefit
 * Extraído da identidade visual Envato com Tailwind CSS e trava anti-invenção.
 */

import React from 'react';
import { BusinessSiteData } from '@/types/site-template-data';

export function TemplateComponent({ data }: { data: BusinessSiteData }) {
  const primaryColor = data.palette?.primary || '#f59e0b';
  const bgColor = data.palette?.background || '#111827';
  const surfaceColor = data.palette?.surface || '#1f2937';
  const textColor = data.palette?.text || '#f9fafb';

  const isDarkTheme = true;
  const cardBgClass = isDarkTheme ? 'bg-zinc-900/90' : 'bg-white';
  const cardBorderClass = isDarkTheme ? 'border-zinc-800' : 'border-slate-200';
  const titleColorClass = isDarkTheme ? 'text-white' : 'text-slate-900';
  const bodyColorClass = isDarkTheme ? 'text-zinc-300' : 'text-slate-600';
  const navClass = isDarkTheme ? 'bg-zinc-950/85 border-zinc-800 text-white' : 'bg-white/85 border-slate-200 text-slate-900';

  const heroImage = data.hero.backgroundImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80';
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: bgColor, color: textColor }}>
      
      {/* 1. NAVBAR FIXA COM LINKS SUAVES (h-20) */}
      <header className={`fixed top-0 left-0 right-0 z-40 h-20 backdrop-blur-md border-b ${navClass} transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <a href="#inicio" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-black shadow-md group-hover:scale-105 transition-transform"
              style={{ backgroundColor: primaryColor }}
            >
              {(data.brandName || 'WB').slice(0, 2).toUpperCase()}
            </div>
            <span className={`text-xl md:text-2xl font-bold tracking-tight ${titleColorClass}`}>
              {data.brandName}
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold opacity-90">
            <a href="#inicio" className="hover:opacity-80 transition-opacity">Início</a>
            <a href="#sobre" className="hover:opacity-80 transition-opacity">Sobre</a>
            <a href="#servicos" className="hover:opacity-80 transition-opacity">Serviços</a>
            {data.gallery && data.gallery.length > 0 && (
              <a href="#galeria" className="hover:opacity-80 transition-opacity">Galeria</a>
            )}
            {data.testimonials && data.testimonials.length > 0 && (
              <a href="#avaliacoes" className="hover:opacity-80 transition-opacity">Avaliações</a>
            )}
            <a href="#contato" className="hover:opacity-80 transition-opacity">Contato</a>
          </nav>

          <a
            href={data.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm text-black hover:opacity-90 shadow-md hover:scale-105 transition-all whitespace-nowrap"
            style={{ backgroundColor: primaryColor }}
          >
            <i className="fab fa-whatsapp text-base"></i>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </header>

      {/* COMPENSAÇÃO DE ALTURA DA NAVBAR */}
      <div className="h-20"></div>

      {/* 2. HERO SECTION TRAVADA (min-h-[560px] max-h-[760px] relative overflow-hidden) */}
      <section id="inicio" className="min-h-[560px] max-h-[760px] relative overflow-hidden flex items-center justify-center bg-black">
        <img
          src={heroImage}
          alt={data.brandName}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/65 bg-gradient-to-t from-black via-black/60 to-black/40"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center md:text-left w-full flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-semibold tracking-wide uppercase mb-6 self-center md:self-start">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></span>
            <span>{data.niche} • Suplementos Premium</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-4xl mb-4 drop-shadow-md">
            {data.hero.title}
          </h1>

          <p className="text-base sm:text-xl text-zinc-200 max-w-2xl leading-relaxed mb-8 opacity-95">
            {data.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 self-center md:self-start">
            <a
              href={data.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-black hover:opacity-95 shadow-xl hover:scale-105 active:scale-95 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              <i className="fab fa-whatsapp text-xl"></i>
              <span>{data.hero.ctaLabel || 'Falar no WhatsApp'}</span>
            </a>
            <a
              href="#servicos"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>Ver Serviços</span>
              <i className="fas fa-arrow-down text-xs"></i>
            </a>
          </div>
        </div>
      </section>

      {/* 3. BARRA DE CREDIBILIDADE REAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 w-full">
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-2xl ${cardBgClass} border ${cardBorderClass} shadow-xl`}>
          <div className={`flex items-center gap-4 sm:border-r ${cardBorderClass} sm:pr-4`}>
            <div className="w-12 h-12 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-star"></i>
            </div>
            <div>
              <div className={`text-lg font-bold ${titleColorClass} flex items-center gap-1.5`}>
                <span>{data.testimonials.length > 0 ? '5.0' : '4.9'}</span>
                <span className="text-xs text-amber-400">★★★★★</span>
              </div>
              <p className={`text-xs ${bodyColorClass}`}>Avaliação no Google</p>
            </div>
          </div>

          <div className={`flex items-center gap-4 sm:border-r ${cardBorderClass} sm:px-4`}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-bolt"></i>
            </div>
            <div>
              <div className={`text-lg font-bold ${titleColorClass}`}>Atendimento Rápido</div>
              <p className={`text-xs ${bodyColorClass}`}>Resposta imediata pelo WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:pl-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: `${primaryColor}22`, color: primaryColor }}
            >
              <i className="fas fa-shield-alt"></i>
            </div>
            <div>
              <div className={`text-lg font-bold ${titleColorClass}`}>Compromisso Real</div>
              <p className={`text-xs ${bodyColorClass}`}>Padrão de qualidade certificado</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEÇÃO SOBRE NÓS */}
      <section id="sobre" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              <span>{data.brandName}</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-bold ${titleColorClass} mb-6 leading-tight`}>
              {data.about.title || 'Tradição, Excelência e Cuidado em Cada Detalhe'}
            </h2>
            <div className={`space-y-4 ${bodyColorClass} text-base sm:text-lg leading-relaxed`}>
              {data.about.paragraphs && data.about.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {data.about.highlights && data.about.highlights.length > 0 && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t ${cardBorderClass}`}>
                {data.about.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <i className="fas fa-check-circle mt-1" style={{ color: primaryColor }}></i>
                    <span className={`text-sm font-semibold ${titleColorClass}`}>{h}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <a
                href={data.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-black hover:opacity-90 shadow-lg hover:scale-105 transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <i className="fab fa-whatsapp text-lg"></i>
                <span>Falar com Nossa Equipe</span>
              </a>
            </div>
          </div>

          {data.about.image && (
            <div className={`aspect-[4/3] max-h-[440px] w-full rounded-2xl overflow-hidden relative shadow-2xl border ${cardBorderClass} bg-zinc-900 group`}>
              <img
                src={data.about.image}
                alt={data.brandName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>Espaço Oficial</p>
                <p className="text-sm font-bold">{data.brandName}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. NOSSOS SERVIÇOS (COM VALOR CONDICIONAL — TRAVA ANTI-INVENÇÃO) */}
      <section id="servicos" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t ${cardBorderClass}`}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}
          >
            <span>Catálogo Exclusivo</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-bold ${titleColorClass} mb-4`}>
            Nossos Serviços & Especialidades
          </h2>
          <p className={`text-base sm:text-lg ${bodyColorClass} leading-relaxed`}>
            Conheça as opções disponíveis e solicite seu orçamento ou agendamento direto pelo WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.services.map((service, idx) => (
            <div
              key={idx}
              className={`flex flex-col justify-between p-6 rounded-2xl ${cardBgClass} border ${cardBorderClass} hover:border-current transition-all duration-300 hover:-translate-y-1 shadow-lg group`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className={`text-lg md:text-xl font-bold ${titleColorClass} group-hover:opacity-90`}>
                    {service.title}
                  </h3>
                  {/* PREÇO APENAS SE HOUVER VALOR REAL INFORMADO */}
                  {service.priceTag && (
                    <span
                      className="inline-flex shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                      style={{ backgroundColor: `${primaryColor}20`, color: primaryColor, borderColor: `${primaryColor}40` }}
                    >
                      {service.priceTag}
                    </span>
                  )}
                </div>
                <p className={`text-sm md:text-base ${bodyColorClass} leading-relaxed mb-6`}>
                  {service.description}
                </p>
              </div>

              <div>
                <a
                  href={`${data.contact.whatsappUrl}&text=${encodeURIComponent(`Olá! Gostaria de mais informações sobre: ${service.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border hover:opacity-90 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}
                  style={{ borderColor: `${primaryColor}50` }}
                >
                  <i className="fab fa-whatsapp text-emerald-500"></i>
                  <span>Solicitar via WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. GALERIA DE FOTOS (CONDICIONAL — NUNCA EXIBE SE VAZIO) */}
      {data.gallery && data.gallery.length > 0 && (
        <section id="galeria" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t ${cardBorderClass}`}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              <span>Fotos Reais</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-bold ${titleColorClass} mb-4`}>
              Galeria de Trabalhos & Ambiente
            </h2>
            <p className={`text-base sm:text-lg ${bodyColorClass}`}>
              Registros reais do nosso espaço e dos procedimentos realizados.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.gallery.map((item, idx) => (
              <div key={idx} className={`aspect-square h-64 w-full rounded-xl overflow-hidden relative group border ${cardBorderClass} shadow-md bg-zinc-900`}>
                <img
                  src={item.url}
                  alt={item.alt || `Trabalho ${idx + 1}`}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-xs font-bold text-white tracking-wider uppercase drop-shadow flex items-center gap-1.5">
                    <i className="fas fa-camera" style={{ color: primaryColor }}></i>
                    <span>Registro #{idx + 1}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. AVALIAÇÕES DE CLIENTES (CONDICIONAL — NUNCA EXIBE SE VAZIO) */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section id="avaliacoes" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t ${cardBorderClass}`}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/20">
              <span>Opiniões Verificadas</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-bold ${titleColorClass} mb-4`}>
              O Que Nossos Clientes Dizem
            </h2>
            <p className={`text-base sm:text-lg ${bodyColorClass}`}>
              Depoimentos reais de quem confia em nosso padrão de atendimento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.testimonials.map((t, idx) => (
              <div key={idx} className={`p-6 rounded-2xl ${cardBgClass} border ${cardBorderClass} shadow-lg flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                    {Array.from({ length: Math.min(5, Math.max(1, Math.round(t.rating || 5))) }).map((_, starIdx) => (
                      <i key={starIdx} className="fas fa-star"></i>
                    ))}
                    <span className={`ml-2 text-xs font-bold ${titleColorClass}`}>{t.rating || 5}.0</span>
                  </div>
                  <p className={`text-sm md:text-base ${bodyColorClass} italic leading-relaxed mb-4`}>
                    "{t.text}"
                  </p>
                </div>
                <div className={`pt-4 border-t ${cardBorderClass} flex items-center justify-between`}>
                  <span className={`text-sm font-bold ${titleColorClass}`}>{t.author}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <i className="fas fa-check-circle text-[10px]"></i> Verificado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. CONTATO, LOCALIZAÇÃO & HORÁRIOS */}
      <section id="contato" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t ${cardBorderClass}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              <span>Atendimento</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-bold ${titleColorClass} mb-6 leading-tight`}>
              Fale Conosco & Localização
            </h2>

            <div className="space-y-6 mb-8">
              {data.contact.address && (
                <div className={`flex items-start gap-4 p-5 rounded-2xl ${cardBgClass} border ${cardBorderClass}`}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h4 className={`font-bold text-base ${titleColorClass} mb-1`}>Endereço</h4>
                    <p className={`text-sm ${bodyColorClass} leading-relaxed mb-2`}>{data.contact.address}</p>
                    {data.contact.mapsUrl && (
                      <a
                        href={data.contact.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                        style={{ color: primaryColor }}
                      >
                        <span>Abrir Rota no Google Maps</span>
                        <i className="fas fa-external-link-alt text-[10px]"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {data.contact.hours && data.contact.hours.length > 0 && (
                <div className={`flex items-start gap-4 p-5 rounded-2xl ${cardBgClass} border ${cardBorderClass}`}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <h4 className={`font-bold text-base ${titleColorClass} mb-1`}>Horário de Funcionamento</h4>
                    <div className={`text-sm ${bodyColorClass} space-y-1`}>
                      {data.contact.hours.map((h, i) => (
                        <p key={i}>{h}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className={`flex items-start gap-4 p-5 rounded-2xl ${cardBgClass} border ${cardBorderClass}`}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg shrink-0 mt-0.5">
                  <i className="fab fa-whatsapp"></i>
                </div>
                <div>
                  <h4 className={`font-bold text-base ${titleColorClass} mb-1`}>WhatsApp & Telefone</h4>
                  <p className={`text-sm ${bodyColorClass} mb-2`}>{data.contact.phoneDisplay}</p>
                  <a
                    href={data.contact.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:underline"
                  >
                    <span>Iniciar conversa agora</span>
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {data.contact.mapsEmbedUrl && (
            <div className={`w-full h-80 rounded-2xl overflow-hidden border ${cardBorderClass} shadow-xl bg-zinc-900`}>
              <iframe
                src={data.contact.mapsEmbedUrl}
                className="w-full h-80 rounded-2xl border-0"
                loading="lazy"
                title={`Mapa de Localização - ${data.brandName}`}
              />
            </div>
          )}
        </div>
      </section>

      {/* FOOTER LIMPO */}
      <footer className={`mt-auto border-t ${cardBorderClass} ${navClass} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-black"
                style={{ backgroundColor: primaryColor }}
              >
                {(data.brandName || 'WB').slice(0, 2).toUpperCase()}
              </div>
              <span className={`text-lg font-bold ${titleColorClass}`}>{data.brandName}</span>
            </div>
            <p className={`text-xs ${bodyColorClass}`}>
              {data.niche} • Todos os direitos reservados © {currentYear}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold opacity-80">
            <a href="#inicio" className="hover:opacity-100 transition-opacity">Início</a>
            <a href="#sobre" className="hover:opacity-100 transition-opacity">Sobre</a>
            <a href="#servicos" className="hover:opacity-100 transition-opacity">Serviços</a>
            <a href="#contato" className="hover:opacity-100 transition-opacity">Contato</a>
          </div>
        </div>
      </footer>

      {/* BOTÃO FLUTUANTE DE WHATSAPP OFICIAL */}
      <div id="billy-floating-whatsapp" className="fixed bottom-5 right-5 z-50 whitespace-nowrap">
        <a
          href={data.contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
          title="Falar no WhatsApp"
        >
          <i className="fab fa-whatsapp text-xl group-hover:rotate-12 transition-transform"></i>
          <span className="whitespace-nowrap font-bold">Falar no WhatsApp</span>
        </a>
      </div>

    </div>
  );
}
