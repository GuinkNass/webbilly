import type { Metadata } from "next";
import { Roboto_Slab, Open_Sans } from "next/font/google";
import "./globals.css";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap"
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://webbilly.com.br"),
  applicationName: "Webbilly",
  title: {
    default: "Webbilly • Sites Profissionais para Negócios Locais | R$ 29,90/mês",
    template: "%s | Webbilly"
  },
  description: "Webbilly é uma plataforma brasileira de criação e hospedagem de sites profissionais e landing pages para negócios locais por assinatura mensal de R$ 29,90.",
  keywords: [
    "Webbilly",
    "Web Billy",
    "Webbilly Sites",
    "Webbilly Plataforma",
    "sites profissionais",
    "criação de sites para negócios locais",
    "landing pages comércio local",
    "site 29,90",
    "hospedagem de sites profissionais"
  ],
  authors: [{ name: "Webbilly Brasil", url: "https://webbilly.com.br" }],
  creator: "Webbilly Brasil",
  publisher: "Webbilly",
  alternates: {
    canonical: "https://webbilly.com.br"
  },
  openGraph: {
    title: "Webbilly • Sites Profissionais para Negócios Locais | R$ 29,90/mês",
    description: "Webbilly é uma plataforma brasileira de criação e hospedagem de sites profissionais e landing pages para negócios locais por assinatura mensal de R$ 29,90.",
    url: "https://webbilly.com.br",
    siteName: "Webbilly",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/billy-logo.png",
        width: 512,
        height: 512,
        alt: "Logo Oficial Webbilly"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Webbilly • Sites Profissionais para Negócios Locais",
    description: "Webbilly é uma plataforma brasileira de criação e hospedagem de sites profissionais e landing pages para negócios locais por assinatura mensal de R$ 29,90.",
    images: ["/billy-logo.png"]
  },
  icons: {
    icon: "/billy-logo.png",
    shortcut: "/billy-logo.png",
    apple: "/billy-logo.png"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://webbilly.com.br/#organization",
      "name": "Webbilly",
      "alternateName": ["Web Billy", "Webbilly Sites", "Webbilly Plataforma"],
      "url": "https://webbilly.com.br",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://webbilly.com.br/#logo",
        "url": "https://webbilly.com.br/billy-logo.png",
        "caption": "Logo Oficial Webbilly",
        "inLanguage": "pt-BR"
      },
      "image": "https://webbilly.com.br/billy-logo.png",
      "description": "Webbilly é uma plataforma brasileira de criação e hospedagem de sites profissionais e landing pages para negócios locais por assinatura mensal de R$ 29,90.",
      "areaServed": {
        "@type": "Country",
        "name": "BR"
      },
      "sameAs": [
        "https://www.instagram.com/webbilly.com.br",
        "https://webbilly.com.br"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+55-11-94316-8939",
        "contactType": "customer service",
        "areaServed": "BR",
        "availableLanguage": "Portuguese"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://webbilly.com.br/#website",
      "url": "https://webbilly.com.br",
      "name": "Webbilly",
      "alternateName": ["Web Billy", "Webbilly Sites"],
      "description": "Plataforma brasileira de sites profissionais e landing pages para negócios locais.",
      "publisher": {
        "@id": "https://webbilly.com.br/#organization"
      },
      "inLanguage": "pt-BR"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://webbilly.com.br/#software",
      "name": "Webbilly",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, Windows",
      "description": "Plataforma de criação e hospedagem de sites profissionais e landing pages para negócios locais.",
      "offers": {
        "@type": "Offer",
        "price": "29.90",
        "priceCurrency": "BRL"
      },
      "author": {
        "@id": "https://webbilly.com.br/#organization"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://webbilly.com.br/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "O que é a Webbilly?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A Webbilly (webbilly.com.br) é uma plataforma brasileira especializada na criação, hospedagem e gestão de sites profissionais e landing pages para comércios e negócios locais por uma assinatura mensal de R$ 29,90."
          }
        },
        {
          "@type": "Question",
          "name": "Como funciona a criação do site na Webbilly?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "O comerciante recebe um site profissional completo, responsivo para celular, otimizado para o Google e conectado ao WhatsApp para receber pedidos e agendamentos, com hospedagem de alta performance e alterações inclusas sem nenhuma taxa de adesão."
          }
        },
        {
          "@type": "Question",
          "name": "Quanto custa ter um site na Webbilly e como funciona a cobrança?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "O plano padrão da Webbilly custa apenas R$ 29,90 por mês no subdomínio oficial (ex: seunegocio.webbilly.com.br), sem contrato de fidelidade e sem taxa de cancelamento. Você só começa a pagar quando o seu site estiver pronto para ir ao ar."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${robotoSlab.variable} ${openSans.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('webbilly-theme');
                  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#131317] text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
