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
  title: "Webbilly • Sites Profissionais para Negócios Locais | R$ 29,90/mês",
  description: "Criamos e mantemos sua landing page profissional adaptada para celular no subdomínio oficial da Webbilly por apenas R$ 29,90/mês. Sem taxa de adesão, sem burocracia e pronto em minutos.",
  icons: {
    icon: "/billy-logo.png",
    shortcut: "/billy-logo.png",
    apple: "/billy-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${robotoSlab.variable} ${openSans.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0e14] text-[#e2e8f0] font-sans selection:bg-[#7abf18] selection:text-white">
        {children}
      </body>
    </html>
  );
}
