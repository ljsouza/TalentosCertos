"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEmpresa } from "@/lib/auth";
import { gerarEmbedding, textoVaga } from "@/lib/embeddings";
import { getBrand } from "@/lib/tenant";
import { contatoDe, emailMarca } from "@/lib/notify";
import { enviarWhatsApp } from "@/lib/whatsapp";
import { validarCNPJ, soDigitos } from "@/lib/validacao";
import { notificarRadar } from "@/lib/radar";

type Estado = { erro?: string; ok?: boolean } | undefined;

// Quebra um textarea em itens (1 por linha), limpando vazios.
const linhas = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export async function createVaga(_prev: Estado, formData: FormData): Promise<Estado> {
  const { empresa, supabase } = await requireEmpresa();
  if (!empresa) return { erro: "Empresa não encontrada para esta conta." };

  // Conta só publica depois de aprovada pelo MaringáPost.
  if (empresa.status !== "ativa") {
    return {
      erro:
        empresa.status === "pendente"
          ? "Sua conta está em análise. A publicação de vagas libera após a aprovação do MaringáPost."
          : "Sua conta está bloqueada. Fale com o MaringáPost para regularizar.",
    };
  }

  // Cobrança manual: exige um plano ativo e respeita o limite mensal de vagas.
  if (!empresa.pacote_id) {
    return { erro: "Nenhum plano ativo na sua conta. Fale com o MaringáPost para ativar um pacote." };
  }
  const { data: pacote } = await supabase
    .from("pacotes")
    .select("nome,vagas_limite")
    .eq("id", empresa.pacote_id)
    .maybeSingle();
  const limite: number | null = pacote?.vagas_limite ?? null; // null = ilimitado
  if (limite != null) {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("vagas")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresa.id)
      .gte("criado_em", inicioMes.toISOString());
    if ((count ?? 0) >= limite) {
      return { erro: `Você atingiu o limite de ${limite} vaga(s)/mês do plano ${pacote?.nome ?? ""}. Faça upgrade para publicar mais.` };
    }
  }

  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return { erro: "Informe o título da vaga." };

  const salMin = formData.get("salario_min");
  const salMax = formData.get("salario_max");
  const filtroPergunta = String(formData.get("filtro_pergunta") || "").trim();

  const area = String(formData.get("area") || "") || null;
  const cidade = String(formData.get("cidade") || "") || null;
  const salarioMax = salMax ? Number(salMax) : null;
  const descricao = String(formData.get("descricao") || "") || null;
  const requisitos = linhas(String(formData.get("requisitos") || ""));

  const { data: nova, error } = await supabase.from("vagas").insert({
    empresa_id: empresa.id,
    titulo,
    area,
    cidade,
    modalidade: String(formData.get("modalidade") || "") || null,
    tipos: formData.getAll("tipos").map(String),
    salario_min: salMin ? Number(salMin) : null,
    salario_max: salarioMax,
    experiencia: String(formData.get("experiencia") || "") || null,
    descricao,
    requisitos,
    beneficios: linhas(String(formData.get("beneficios") || "")),
    filtro_pergunta: filtroPergunta || null,
    filtro_formato: filtroPergunta ? "audio" : null,
    prazo: String(formData.get("prazo") || "") || null,
    status: "aberta",
  }).select("id").single();

  if (error) return { erro: error.message };

  // Embedding para o match semântico (não bloqueia se falhar).
  const emb = await gerarEmbedding(textoVaga({ titulo, area, descricao, requisitos }));
  if (emb && nova) await supabase.from("vagas").update({ embedding: emb }).eq("id", nova.id);

  // Radar de Vagas (item 1.14): alerta imediato por WhatsApp aos candidatos
  // compatíveis com radar ativo. Não bloqueia a publicação se falhar.
  if (nova) {
    try {
      await notificarRadar({ id: nova.id, titulo, area, cidade, org_id: empresa.org_id, salario_max: salarioMax });
    } catch (e) {
      console.error("[radar] falha ao notificar:", e);
    }
  }

  revalidatePath("/painel-empresa");
  revalidatePath("/"); // a vaga já aparece na home
  redirect("/painel-empresa");
}

export async function atualizarPerfilEmpresa(_prev: Estado, formData: FormData): Promise<Estado> {
  const { empresa, supabase } = await requireEmpresa();
  if (!empresa) return { erro: "Empresa não encontrada para esta conta." };

  const nome = String(formData.get("nome") || "").trim();
  if (!nome) return { erro: "Informe o nome da empresa." };

  const fundadaRaw = String(formData.get("fundada") || "").trim();
  const fundada = fundadaRaw ? Number(fundadaRaw) : null;
  if (fundada !== null && (!Number.isInteger(fundada) || fundada < 1800 || fundada > new Date().getFullYear())) {
    return { erro: "Ano de fundação inválido." };
  }

  // CNPJ opcional, mas se informado precisa ser válido.
  const cnpjRaw = String(formData.get("cnpj") || "").trim();
  if (cnpjRaw && !validarCNPJ(cnpjRaw)) return { erro: "CNPJ inválido." };
  const cnpj = cnpjRaw ? soDigitos(cnpjRaw) : null;

  // O dono edita só os campos institucionais — `verificada` é exclusiva do admin.
  const { error } = await supabase
    .from("empresas")
    .update({
      nome,
      razao_social: String(formData.get("razao_social") || "") || null,
      ...(cnpj ? { cnpj } : {}),
      setor: String(formData.get("setor") || "") || null,
      sobre: String(formData.get("sobre") || "") || null,
      sobre_longo: String(formData.get("sobre_longo") || "") || null,
      fundada,
      funcionarios: String(formData.get("funcionarios") || "") || null,
      site: String(formData.get("site") || "") || null,
      endereco: String(formData.get("endereco") || "") || null,
      destaques: linhas(String(formData.get("destaques") || "")),
      video_youtube: String(formData.get("video_youtube") || "") || null,
      logo_url: String(formData.get("logo_url") || "") || null,
    })
    .eq("id", empresa.id);

  if (error) return { erro: error.message };

  revalidatePath("/painel-empresa");
  revalidatePath(`/empresa-perfil/${empresa.id}`);
  return { ok: true };
}

export async function encerrarVaga(formData: FormData): Promise<void> {
  const { supabase } = await requireEmpresa();
  const id = String(formData.get("id") || "");
  await supabase.from("vagas").update({ status: "encerrada" }).eq("id", id);
  revalidatePath("/painel-empresa");
  revalidatePath("/");
}

// Empresa muda o status de uma candidatura das suas vagas.
// A RLS "empresa atualiza candidatura" (0004) garante o escopo.
const STATUS_CAND = ["enviada", "triagem", "selecionada", "recusada"] as const;

const STATUS_LABEL: Record<string, string> = {
  enviada: "Enviada", triagem: "Em análise", selecionada: "Selecionado(a)", recusada: "Não selecionado(a)",
};

export async function atualizarStatusCandidatura(formData: FormData): Promise<void> {
  const { empresa, supabase } = await requireEmpresa();
  const id = String(formData.get("candidatura_id") || "");
  const status = String(formData.get("status") || "");
  const vagaId = String(formData.get("vaga_id") || "");
  if (!(STATUS_CAND as readonly string[]).includes(status)) return;

  const { data: cand } = await supabase
    .from("candidaturas")
    .select("candidato_id, vaga:vagas(titulo)")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("candidaturas").update({ status }).eq("id", id);
  revalidatePath(`/painel-empresa/vaga/${vagaId}`);

  // Notifica o candidato (item 1.08) e, ao recusar, envia WhatsApp humanizado (1.09).
  const candidatoId = (cand as { candidato_id?: string } | null)?.candidato_id;
  const vagaTitulo = (cand as { vaga?: { titulo?: string } | null } | null)?.vaga?.titulo || "a vaga";
  const empresaNome = empresa?.nome || "a empresa";
  if (candidatoId) {
    const { email, nome, telefone } = await contatoDe(candidatoId);
    const brand = await getBrand();
    const primeiro = (nome || "").split(" ")[0] || "";
    if (email) {
      await emailMarca(
        email,
        `Atualização da sua candidatura — ${vagaTitulo}`,
        "Sua candidatura foi atualizada",
        `<p>Olá${primeiro ? `, ${primeiro}` : ""}. O status da sua candidatura para <strong>${vagaTitulo}</strong> (${empresaNome}) mudou para <strong>${STATUS_LABEL[status]}</strong>.</p>
         <p>Acompanhe no seu painel.</p>`,
        brand
      );
    }
    if (status === "recusada" && telefone) {
      await enviarWhatsApp({
        to: telefone,
        texto: `Olá${primeiro ? ` ${primeiro}` : ""}! Agradecemos muito seu interesse na vaga "${vagaTitulo}" (${empresaNome}). Desta vez seguimos com outros perfis, mas seu currículo fica no nosso radar para próximas oportunidades. Continue de olho no portal — sucesso! 💚`,
      });
    }
  }
}
