# Homologação AEP e AET — Dados Fictícios de Referência

## 1. Objetivo

Este documento descreve como utilizar os projetos fictícios de homologação para validar se o sistema gera corretamente uma **AEP (Análise Ergonômica Preliminar)** e uma **AET (Análise Ergonômica do Trabalho)** em nível MVP.

Os dados são completamente fictícios e não representam nenhuma empresa ou trabalhador real.

---

## 2. Como limpar dados locais antigos

O sistema usa **localforage** (IndexedDB no navegador) para persistência. Se você tiver dados de sessões anteriores, precisa limpá-los para que os novos mocks sejam carregados.

### Opção A — Botão de desenvolvimento (recomendado)

A função `resetDevelopmentData()` está disponível no contexto `AETContext` em qualquer build (DEV e produção). Ela limpa todo o localforage e recarrega a página, recarregando os mocks iniciais.

> Para expor isso na UI, adicione temporariamente um botão que chame `resetDevelopmentData()` do contexto.

### Opção B — DevTools do navegador

1. Abra o DevTools (F12)
2. Vá em **Application** → **Storage** → **IndexedDB**
3. Expanda o banco `localforage`
4. Clique com botão direito → **Clear**
5. Recarregue a página

### Opção C — Console do navegador

```js
import('localforage').then(lf => lf.default.clear().then(() => location.reload()));
```

Ou diretamente:
```js
indexedDB.deleteDatabase('localforage');
location.reload();
```

---

## 3. Como iniciar o projeto

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` no navegador.

---

## 4. Como acessar a AEP mock

Na tela de dashboard, o projeto **"Padaria Horizonte Azul Ltda."** (reportType: AEP) estará listado.

- Empresa: Padaria Horizonte Azul Ltda.
- CNPJ: 11.222.333/0001-44
- Unidade: Loja Matriz
- Local: Recife – PE
- Avaliador: Mariana Costa Albuquerque (CREFITO-1 123456-F)
- Data: 15/01/2026
- Funções: Atendente de Balcão + Auxiliar de Produção

---

## 5. Como acessar a AET mock

Na tela de dashboard, o projeto **"Metalúrgica Serra Clara S.A."** (reportType: AET) estará listado.

- Empresa: Metalúrgica Serra Clara S.A.
- CNPJ: 55.666.777/0001-88
- Unidade: Planta Contagem
- Local: Contagem – MG
- Avaliador: Ricardo Menezes Duarte (CREA-MG 123456/D)
- Data: 20/01/2026
- Função: Operador de Máquina CNC

---

## 6. Checklist funcional AEP

Acesse o preview da AEP (Padaria Horizonte Azul Ltda.) e verifique:

- [ ] **Capa** — razão social, CNPJ, avaliador, data, localidade
- [ ] **Sumário** — seções listadas
- [ ] **Dados da empresa** — endereço, unidade, produto, grau de risco
- [ ] **Função 1 — Atendente de Balcão**
  - [ ] GHE: GHE-01 Atendimento e Balcão
  - [ ] Número de colaboradores: 4
  - [ ] Condições gerais, acesso, organização, ambiente, fatores biomecânicos, cognitivos, organizacionais
  - [ ] Tarefa prescrita preenchida
  - [ ] Tarefa real preenchida
  - [ ] Conclusão: fatores ergonômicos relacionados à postura em pé
  - [ ] Não indica AET
  - [ ] Inventário de riscos: 2 riscos (Biomecânico, Organizacional)
  - [ ] Matriz de risco: P, G, Score, Nível e Referência Normativa visíveis
- [ ] **Função 2 — Auxiliar de Produção**
  - [ ] GHE: GHE-02 Produção de Panificação
  - [ ] Número de colaboradores: 3
  - [ ] Indica necessidade de AET
  - [ ] Inventário de riscos: 2 riscos (Biomecânico, Ambiental)
- [ ] **Responsabilidade técnica** — assinatura e dados do avaliador

---

## 7. Checklist funcional AET

Acesse o preview da AET (Metalúrgica Serra Clara S.A. — CNPJ 55.666.777/0001-88) e verifique:

- [ ] **Capa** — razão social, CNPJ, avaliador, data, localidade
- [ ] **Sumário** — seções listadas
- [ ] **Análise global** — dados de mercado, produto, local de produção
- [ ] **Organização do trabalho** — turnos (Diurno + Vespertino), pausas, rotatividade
- [ ] **Perfil / Entrevista** — gênero, faixa etária, tempo na função, opiniões sobre condições de trabalho
- [ ] **Exigências** — esforço dinâmico, esforço estático
- [ ] **Cronoanálise** — análise de tempo, movimentação de cargas, deslocamentos
- [ ] **Equipamentos** — Centro de Usinagem CNC (3 un.), Bancada de inspeção (2 un.)
- [ ] **EPIs** — Protetor auricular, Óculos de segurança (ambos obrigatórios)
- [ ] **Ciclo prescrito** — descrição da ordem de produção até inspeção final
- [ ] **Ciclo real** — descrição das atividades reais incluindo limpeza de cavacos e ajustes
- [ ] **Predominância postural** — 55% em pé, 25% caminhando, 10% agachado, 5% sentado, 5% outros
- [ ] **Iluminação NHO 11**
  - [ ] 5 pontos medidos: P1=520, P2=485, P3=510, P4=475, P5=495 lux
  - [ ] Referência: 500 lux
  - [ ] Média calculada: 497 lux
  - [ ] Conclusão: **adequada** (497 ≥ 450 = 90% de 500)
- [ ] **Método científico** — RULA, pontuação 5, risco moderado, recomendações de bancadas
- [ ] **Diagnóstico** — fatores de risco e recomendações descritos
- [ ] **Inventário de riscos** — 3 riscos (Biomecânico ×2, Cognitivo)
  - [ ] Risco 1: P=4, G=3, Score=12, ALTO RISCO
  - [ ] Risco 2: P=3, G=4, Score=12, ALTO RISCO
  - [ ] Risco 3: P=3, G=3, Score=9, ALTO RISCO
- [ ] **Responsabilidade técnica** — assinatura e dados do avaliador

---

## 8. Validação dos cadastros base

Esta seção cobre a verificação manual de que os dados mockados estão corretamente carregados nos menus de cadastros e que o fluxo de criação de projetos a partir deles funciona.

> **Pré-requisito:** limpar o localforage antes do teste (veja Seção 2) para garantir que os mocks sejam semeados do zero.

### 8.1 Cadastros — Empresas

- [ ] Empresa **Padaria Horizonte Azul Ltda.** aparece no menu Empresas
  - CNPJ: `11.222.333/0001-44` · Município: Recife/PE · Grau de Risco: 2
- [ ] Empresa **Metalúrgica Serra Clara S.A.** aparece no menu Empresas
  - CNPJ: `55.666.777/0001-88` · Município: Contagem/MG · Grau de Risco: 3

### 8.2 Cadastros — Unidades

- [ ] Unidade **Loja Matriz** aparece vinculada à Padaria Horizonte Azul
  - Endereço: Rua das Palmeiras, 250 – Boa Vista – Recife/PE
- [ ] Unidade **Planta Contagem** aparece vinculada à Metalúrgica Serra Clara
  - Endereço: Avenida Industrial, 1450 – Cinco – Contagem/MG

### 8.3 Cadastros — Setores

- [ ] Setor **Atendimento ao Balcão** aparece vinculado à Padaria Horizonte (unidade: Loja Matriz)
- [ ] Setor **Produção** aparece vinculado à Padaria Horizonte (unidade: Loja Matriz)
- [ ] Setor **Usinagem** aparece vinculado à Metalúrgica Serra Clara (unidade: Planta Contagem)

### 8.4 Cadastros — Funções/Cargos

- [ ] Função **Atendente de Balcão** aparece vinculada ao setor Atendimento ao Balcão (CBO 5244-05)
- [ ] Função **Auxiliar de Produção** aparece vinculada ao setor Produção (CBO 8483-05)
- [ ] Função **Operador de Máquina CNC** aparece vinculada ao setor Usinagem (CBO 7323-10)

### 8.5 Fluxo — Criação de projetos a partir dos cadastros

- [ ] Ao criar novo projeto, o dropdown **Selecionar Cliente Cadastrado** lista Padaria Horizonte e Metalúrgica Serra Clara
- [ ] Ao selecionar **Padaria Horizonte**, os campos Razão Social, CNPJ, Endereço, Local, Grau de Risco e Produto são preenchidos automaticamente
- [ ] Após selecionar a empresa, o campo **Unidade** exibe dropdown com "Loja Matriz"
- [ ] Ao selecionar Loja Matriz, Endereço e Local são atualizados com os dados da unidade
- [ ] Ao criar novo projeto **AEP** com Padaria e navegar para "Nova Função":
  - [ ] O campo **Nome da Função** exibe dropdown com "Atendente de Balcão" e "Auxiliar de Produção"
  - [ ] Ao selecionar "Atendente de Balcão", os campos Nome, Setor ("Atendimento ao Balcão") e Unidade ("Loja Matriz") são preenchidos
  - [ ] O campo de texto ao lado do dropdown ainda permite digitação manual
- [ ] Ao criar novo projeto **AET** com Metalúrgica Serra Clara e navegar para "Nova Função":
  - [ ] O campo **Nome da Função** exibe dropdown com "Operador de Máquina CNC"
  - [ ] Ao selecionar, os campos Nome, Setor ("Usinagem") e Unidade ("Planta Contagem") são preenchidos

---

## 9. Pendências conhecidas

| Item | Status |
|------|--------|
| PDF profissional | PDF ainda gerado via `window.print()` — sem paginação automática |
| Sumário com páginas reais | Sumário exibe seções, mas sem numeração de páginas real |
| NHO 11 — modelos avançados | Apenas SIMPLE_AVERAGE implementado; RECTANGULAR_REGULAR_GRID, RECTANGULAR_SINGLE_LINE e CENTRAL_LUMINAIRE usam fallback para SIMPLE_AVERAGE |
| Métodos científicos | RULA, REBA e NIOSH registrados como texto — sem calculadoras interativas integradas |
| PDF profissional | Futuro: gerador PDF server-side ou biblioteca como `react-pdf` |
| Atualização automática de NHO 11 nos mocks | Os valores pré-calculados no mockData.ts precisam ser atualizados manualmente se a fórmula mudar |
