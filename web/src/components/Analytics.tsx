"use client";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

// GA4 — 1 propriedade do domínio. Como é SPA, dispara um page_view a cada troca
// de rota (some-se ao tempo de uso do domínio principal). Só carrega se
// NEXT_PUBLIC_GA_ID estiver definido.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function Tracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const qs = searchParams?.toString();
    window.gtag("event", "page_view", { page_path: qs ? `${pathname}?${qs}` : pathname });
  }, [pathname, searchParams, gaId]);
  return null;
}

export function Analytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
      <Suspense fallback={null}>
        <Tracker gaId={gaId} />
      </Suspense>
    </>
  );
}
