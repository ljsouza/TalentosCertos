import type { Metadata } from "next";
import { Newsreader, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import type { CSSProperties } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Analytics } from "@/components/Analytics";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/tenant";

// Fontes do protótipo (display serifada + sans + mono), self-hosted via next/font.
const newsreader = Newsreader({ variable: "--display", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const archivo = Archivo({ variable: "--sans", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ variable: "--mono", subsets: ["latin"], weight: ["500"] });

// Metadata por tenant (título/descrição refletem a marca do tenant corrente).
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    title: { default: brand.nome, template: `%s · ${brand.nome}` },
    description: `Portal de empregos — ${brand.regiao}.`,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let perfil: { nome: string; papel: string } | null = null;
  if (user) {
    const { data } = await supabase.from("perfis").select("nome,papel").eq("id", user.id).maybeSingle();
    perfil = data;
  }

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const brand = await getBrand();
  // Cor de destaque por tenant (temiza --accent usado no app inteiro).
  const appStyle = brand.accent ? ({ ["--accent"]: brand.accent } as CSSProperties) : undefined;

  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${archivo.variable} ${jetbrains.variable}`}>
      <body>
        {gaId && <Analytics gaId={gaId} />}
        <div className="app" style={appStyle}>
          <SiteHeader user={perfil} brand={brand} />
          <main className="main">{children}</main>
          <SiteFooter brand={brand} />
        </div>
      </body>
    </html>
  );
}
