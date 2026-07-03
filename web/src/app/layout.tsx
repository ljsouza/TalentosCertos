import type { Metadata } from "next";
import { Newsreader, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Analytics } from "@/components/Analytics";
import { createClient } from "@/lib/supabase/server";

// Fontes do protótipo (display serifada + sans + mono), self-hosted via next/font.
const newsreader = Newsreader({ variable: "--display", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const archivo = Archivo({ variable: "--sans", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ variable: "--mono", subsets: ["latin"], weight: ["500"] });

export const metadata: Metadata = {
  title: {
    default: "MaringáPost Empregos",
    template: "%s · MaringáPost Empregos",
  },
  description: "O portal de empregos do MaringáPost — vagas verificadas no Norte do Paraná.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let perfil: { nome: string; papel: string } | null = null;
  if (user) {
    const { data } = await supabase.from("perfis").select("nome,papel").eq("id", user.id).maybeSingle();
    perfil = data;
  }

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${archivo.variable} ${jetbrains.variable}`}>
      <body>
        {gaId && <Analytics gaId={gaId} />}
        <div className="app">
          <SiteHeader user={perfil} />
          <main className="main">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
