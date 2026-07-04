"use server";
import { revalidatePath } from "next/cache";
import { requireCandidato } from "@/lib/auth";
import { getBrand } from "@/lib/tenant";
import { contatoDe, emailMarca } from "@/lib/notify";

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
  if (error) return;

  const { data: vaga } = await supabase
    .from("vagas")
    .select("titulo, empresa:empresas(dono_id,nome)")
    .eq("id", vagaId)
    .maybeSingle();
  if (!vaga) return;
  const empresa = (vaga as { titulo?: string; empresa?: { dono_id?: string; nome?: string } | null }).empresa;
  const brand = await getBrand();

  // Confirmação ao candidato (item 1.05/1.07).
  if (user.email) {
    await emailMarca(
      user.email,
      `Candidatura enviada — ${vaga.titulo}`,
      "Candidatura enviada! ✅",
      `<p>Sua candidatura para <strong>${vaga.titulo}</strong> (${empresa?.nome || "a empresa"}) foi registrada.</p>
       <p>Você pode acompanhar o status no seu painel.</p>`,
      brand
    );
  }

  // Notificação imediata à empresa (item 1.07).
  if (empresa?.dono_id) {
    const [{ email: empEmail }, { nome: candNome }] = await Promise.all([
      contatoDe(empresa.dono_id),
      contatoDe(user.id),
    ]);
    if (empEmail) {
      await emailMarca(
        empEmail,
        `Nova candidatura — ${vaga.titulo}`,
        "Você recebeu uma nova candidatura",
        `<p><strong>${candNome || "Um candidato"}</strong> se candidatou à vaga <strong>${vaga.titulo}</strong>.</p>
         <p>Veja o perfil e o match no seu painel de candidatos.</p>`,
        brand
      );
    }
  }
}
