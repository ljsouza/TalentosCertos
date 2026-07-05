"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getBrand } from "@/lib/tenant";
import { contatoDe, emailMarca } from "@/lib/notify";

export async function aprovarPub(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  await supabase
    .from("publicacoes")
    .update({ status: "aprovada", motivo: null, publicado_em: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/conteudo");
}

export async function reprovarPub(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const motivo = String(formData.get("motivo") || "").trim() || "Conteúdo não aprovado pela moderação.";
  const { data: pub } = await supabase.from("publicacoes").select("titulo, empresa:empresas(dono_id,nome)").eq("id", id).maybeSingle();
  await supabase.from("publicacoes").update({ status: "reprovada", motivo }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/conteudo");

  // E-mail à empresa com o motivo (item 1.12). Redação (empresa nula) não notifica.
  const empresa = (pub as { titulo?: string; empresa?: { dono_id?: string; nome?: string } | null } | null)?.empresa;
  if (empresa?.dono_id) {
    const { email, nome } = await contatoDe(empresa.dono_id);
    if (email) {
      const brand = await getBrand();
      await emailMarca(
        email,
        `Publicação não aprovada — ${brand.nome}`,
        "Publicação não aprovada",
        `<p>Olá${nome ? `, ${nome}` : ""}. A publicação <strong>${(pub as { titulo?: string }).titulo ?? ""}</strong> não foi aprovada.</p>
         <p><strong>Motivo:</strong> ${motivo}</p>
         <p>Você pode ajustar e reenviar pelo painel.</p>`,
        brand
      );
    }
  }
}

// Concede/revoga o selo de empresa verificada. Exclusivo do admin (o trigger
// empresas_no_self_verificacao bloqueia qualquer outra origem).
export async function definirVerificacaoEmpresa(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const verificada = String(formData.get("verificada") || "") === "true";
  await supabase.from("empresas").update({ verificada }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath(`/empresa-perfil/${id}`);
  revalidatePath("/");
}

// Ciclo de vida da conta da empresa: aprovar (pendente→ativa), bloquear ou
// reativar. A RLS "admin edita empresas do tenant" garante o escopo por tenant.
const STATUS_EMPRESA = ["pendente", "ativa", "bloqueada"] as const;

export async function definirStatusEmpresa(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!(STATUS_EMPRESA as readonly string[]).includes(status)) return;
  const { data: emp } = await supabase.from("empresas").select("dono_id,nome").eq("id", id).maybeSingle();
  await supabase.from("empresas").update({ status }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath(`/empresa-perfil/${id}`);
  revalidatePath("/");

  // E-mail de aprovação (item 1.02) ao ativar a empresa.
  const dono = (emp as { dono_id?: string; nome?: string } | null);
  if (status === "ativa" && dono?.dono_id) {
    const { email, nome } = await contatoDe(dono.dono_id);
    if (email) {
      const brand = await getBrand();
      await emailMarca(
        email,
        `Cadastro aprovado — ${brand.nome}`,
        "Empresa aprovada ✅",
        `<p>Olá${nome ? `, ${nome}` : ""}. O cadastro da empresa <strong>${dono.nome ?? ""}</strong> foi aprovado pela ${brand.nome}.</p>
         <p>Você já pode publicar vagas no seu painel.</p>`,
        brand
      );
    }
  }
}

// Cobrança manual: o admin vincula/troca o pacote da empresa (ou remove).
export async function definirPacoteEmpresa(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const pacoteId = String(formData.get("pacote_id") || "") || null;
  await supabase.from("empresas").update({ pacote_id: pacoteId }).eq("id", id);
  revalidatePath("/admin");
}
