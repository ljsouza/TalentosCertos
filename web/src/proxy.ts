import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { tenantSlugFromHost } from "@/lib/tenant";

// Next 16: "Middleware" foi renomeado para "Proxy" (mesma funcionalidade).
// Roda antes de cada request: resolve o tenant a partir do host e renova a
// sessão do Supabase. A resolução slug → org_id acontece na aplicação (lib/tenant),
// não aqui — o proxy só faz trabalho leve e passa o slug via header.
export async function proxy(request: NextRequest) {
  const slug = tenantSlugFromHost(request.headers.get("host"));
  return await updateSession(request, slug);
}

export const config = {
  // Roda em tudo, menos assets estáticos e imagens.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
