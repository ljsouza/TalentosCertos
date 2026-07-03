import { getVagas } from "@/data/vagas";
import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "@/app/HomeClient";

// Server Component: as vagas (com empresa) são buscadas NO SERVIDOR e o HTML
// inicial já chega preenchido — indexável pelo Google. A interatividade
// (busca, filtros, salvar) fica na HomeClient. As vagas salvas vêm do banco
// quando há candidato logado.
export default async function Home() {
  const vagas = await getVagas();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let savedIds: string[] = [];
  let isCandidato = false;
  if (user) {
    const { data: perfil } = await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle();
    isCandidato = perfil?.papel === "candidato";
    if (isCandidato) {
      const { data } = await supabase.from("vagas_salvas").select("vaga_id").eq("candidato_id", user.id);
      savedIds = (data || []).map((r) => r.vaga_id as string);
    }
  }

  return <HomeClient vagas={vagas} savedIds={savedIds} isCandidato={isCandidato} />;
}
