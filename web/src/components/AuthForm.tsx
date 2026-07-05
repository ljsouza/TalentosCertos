"use client";
import { useActionState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signIn, signUp } from "@/app/auth/actions";

type Mode = "login" | "signup";
type Papel = "candidato" | "empresa";

export function AuthForm({ mode, papel = "candidato" }: { mode: Mode; papel?: Papel }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, undefined);

  // OAuth roda no navegador e volta pela rota /auth/callback.
  const oauth = async (provider: "google" | "facebook") => {
    const supabase = createClient();
    const next = papel === "empresa" ? "/painel-empresa" : "/painel-candidato";
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/empregos/auth/callback?next=${next}` },
    });
  };

  return (
    <div className="auth-form">
      <div className="oauth-row">
        <button type="button" className="oauth-btn oauth-google" onClick={() => oauth("google")}>
          <svg className="oauth-ic" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
          </svg>
          Continuar com Google
        </button>
        <button type="button" className="oauth-btn oauth-facebook" onClick={() => oauth("facebook")}>
          <svg className="oauth-ic" width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79v8.44C19.61 23.08 24 18.09 24 12.07z" />
          </svg>
          Continuar com Facebook
        </button>
      </div>
      <div className="auth-sep"><span>ou</span></div>

      <form action={formAction} className="auth-fields">
        {mode === "signup" && (
          <>
            <input type="hidden" name="papel" value={papel} />
            <label>
              {papel === "empresa" ? "Nome da empresa" : "Seu nome"}
              <input name="nome" required autoComplete="name" />
            </label>
          </>
        )}
        <label>
          E-mail
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Senha
          <input name="password" type="password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>

        {mode === "signup" && (
          <div style={{ display: "grid", gap: 8, fontSize: 12.5, color: "var(--ink-60)", margin: "4px 0" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <input type="checkbox" name="c_candidaturas" required style={{ marginTop: 2 }} />
              <span>Li e concordo com a <a href="/privacidade" style={{ color: "var(--accent)" }}>Política de Privacidade</a> e autorizo o uso dos meus dados na plataforma. (obrigatório)</span>
            </label>
            {papel !== "empresa" && (
              <>
                <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <input type="checkbox" name="c_whatsapp" style={{ marginTop: 2 }} />
                  <span>Aceito receber alertas de vagas por WhatsApp (Radar). (opcional)</span>
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <input type="checkbox" name="c_compartilhamento" style={{ marginTop: 2 }} />
                  <span>Autorizo compartilhar meu perfil com empresas parceiras. (opcional)</span>
                </label>
              </>
            )}
          </div>
        )}

        {state?.erro && <p className="auth-erro" role="alert">{state.erro}</p>}

        <button type="submit" className="btn btn-primary btn-full" disabled={pending}>
          {pending ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
