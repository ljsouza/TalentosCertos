-- Fase 1 (Araucária) — seed do tenant + branding data-driven + pacote municipal.
-- O branding (accent, região, copy do hero, cidades) fica em organizacoes.branding
-- (JSONB), permitindo taxonomias e identidade por tenant sem tocar no código.

-- Branding do MaringáPost (a org já existe da 00010 com branding '{}').
update organizacoes set branding = jsonb_build_object(
  'accent', '#1f8a5b',
  'regiao', 'Maringá e região',
  'hero_title', 'O trabalho certo tem endereço aqui.',
  'hero_sub', 'Vagas verificadas, empresas que respondem e o jornalismo do MaringáPost sobre carreira — em um só lugar.',
  'cidades', to_jsonb(array['Maringá','Sarandi','Paiçandu','Marialva','Mandaguari','Mandaguaçu','Astorga','Ângulo','Floresta','Doutor Camargo'])
) where slug = 'maringapost';

-- Tenant Araucária (Prefeitura) — servido em araucaria.pr.gov.br/empregos.
insert into organizacoes (slug, nome, tipo, base_path, dominio, status, branding)
values (
  'araucaria',
  'Araucária Empregos',
  'prefeitura',
  '/empregos',
  'araucaria.pr.gov.br',
  'ativo',
  jsonb_build_object(
    'accent', '#1f6feb',
    'regiao', 'Araucária e região',
    'hero_title', 'Trabalho e oportunidade em Araucária.',
    'hero_sub', 'Vagas, cursos gratuitos e formação profissional — a agência de empregos digital da Prefeitura de Araucária.',
    'cidades', to_jsonb(array['Araucária','Curitiba','Fazenda Rio Grande','Campo Largo','Contenda','Balsa Nova','Lapa','São José dos Pinhais','Pinhais','Colombo'])
  )
)
on conflict (slug) do nothing;

-- Pacote municipal (gratuito, vagas ilimitadas) para empresas de Araucária
-- publicarem após aprovação da Prefeitura.
insert into pacotes (nome, preco, periodo, vagas_limite, recursos, destaque, org_id)
select 'Municipal', 0, 'gratuito', null,
  array['Publicação gratuita de vagas','Painel de candidatos','Match por IA','Selo de empresa verificada']::text[],
  false, o.id
from organizacoes o
where o.slug = 'araucaria'
  and not exists (select 1 from pacotes p where p.org_id = o.id and p.nome = 'Municipal');
