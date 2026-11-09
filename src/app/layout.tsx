import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Webbilly • Sites Profissionais para Negócios Locais | R$ 29,90/mês",
  description: "Criamos e mantemos sua landing page profissional adaptada para celular no subdomínio da Webbilly por apenas R$ 29,90/mês. Sem taxa de adesão, sem burocracia e pronto em minutos.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
