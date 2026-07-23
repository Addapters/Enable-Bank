import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Enable Bank", template: "%s | Enable Bank" },
  description: "A plataforma colaborativa de doação, troca e venda de produtos de apoio — gratuita, acessível e construída para quem mais precisa.",
  keywords: ["produtos de apoio", "deficiência", "doação", "troca", "acessibilidade", "Portugal"],
  authors: [{ name: "Addapters Org" }],
  openGraph: {
    title: "Enable Bank",
    description: "Plataforma colaborativa de produtos de apoio",
    locale: "pt_PT",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" className={`h-full ${nunito.variable}`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
