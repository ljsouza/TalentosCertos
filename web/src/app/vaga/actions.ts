"use server";
import { revalidatePath } from "next/cache";
import { requireCandidato } from "@/lib/auth";
import { enviarEmail, layoutEmail } from "@/lib/email";

// Salva/dessalva uma vaga (toggle) para o candidato logado.
// Anônimo é redirecionado para /entrar pela requireCandidato.
export async function toggleSalvar(formData: FormData): Promise<void> {
  const vagaId = String(formData.get("vagaId") || "");
  const { user, supabase } = await requireCandidato();
  const { data: existe } = await supabase
    .from("vagas_salvas")
    .select("vaga_id")
    .eq("candidato_id", user.id)
    .eq("vaga_id", vagaId)
    .maybeSingle();
  if (existe) {
    await supabase.from("vagas_salvas").delete().eq("candidato_id", user.id).eq("vaga_id", vagaId);
  } else {
    await supabase.from("vagas_salvas").insert({ candidato_id: user.id, vaga_id: vagaId });
  }
  revalidatePath("/", "layout");
}

// Candidatar-se a uma vaga. Se não estiver logado como candidato,
// requireCandidato redireciona para /entrar (ou / se for empresa).
export async function aplicarVaga(formData: FormData): Promise<void> {
  const vagaId = String(formData.get("vagaId") || "");
  const { user, supabase } = await requireCandidato();
  // unique(vaga_id, candidato_id) evita duplicar; ignora conflito.
  const { error } = await supabase.from("candidaturas").upsert(
    { vaga_id: vagaId, candidato_id: user.id },
    { onConflict: "vaga_id,candidato_id", ignoreDuplicates: true }
  );
  revalidatePath(`/vaga/${vagaId}`);

  // E-mail de confirmação ao candidato (não bloqueia se falhar).
  if (!error && user.email) {
    const { data: vaga } = await supabase
      .from("vagas")
      .select("titulo, empresa:empresas(nome)")
      .eq("id", vagaId)
      .maybeSingle();
    if (vaga) {
      const empresa = (vaga as { empresa?: { nome?: string } | null }).empresa?.nome || "a empresa";
      await enviarEmail({
        to: user.email,
        subject: `Candidatura enviada — ${vaga.titulo}`,
        html: layoutEmail(
          "Candidatura enviada! ✅",
          `<p>Sua candidatura para <strong>${vaga.titulo}</strong> (${empresa}) foi registrada.</p>
           <p>Você pode acompanhar o status no seu painel.</p>
           <p><a href="https://pagempregos.vercel.app/empregos/painel-candidato" style="color:#1f8a5b;font-weight:bold">Ver minhas candidaturas →</a></p>`
        ),
      });
    }
  }
}
