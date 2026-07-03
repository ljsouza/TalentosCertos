import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { TENANT_HEADER } from "@/lib/tenant";

// Renova a sessão do Supabase a cada request, propaga os cookies atualizados e
// injeta o slug do tenant (resolvido no proxy) como header de request, para a
// aplicação resolver a organização corrente.
export async function updateSession(request: NextRequest, tenantSlug: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_HEADER, tenantSlug);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Importante: não rodar lógica entre createServerClient e getUser().
  await supabase.auth.getUser();

  return response;
}
