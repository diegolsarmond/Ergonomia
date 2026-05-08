# Migrações — Sistema Ergonomia

Scripts SQL para PostgreSQL ≥ 14, mapeando todas as entidades do sistema (atualmente em LocalForage) para um banco de dados relacional.

## Ordem de execução

| Arquivo | Conteúdo |
|---------|----------|
| `001_create_auth.sql` | `usuarios`, `perfis_customizados`, `perfil_permissoes`, `usuario_permissoes`, `sessoes` |
| `002_create_catalog.sql` | `empresas`, `unidades`, `setores`, `cargos_padrao`, `epis`, `equipamentos_padrao`, `perguntas_entrevista`, `turnos`, `classificacoes_risco`, `modelos_texto_relatorio`, `modelos_metodo_cientifico`, `perguntas_checklist`, `fatores_risco_biomecanico`, `parametros_normativos_iluminancia` |
| `003_create_projects.sql` | `analise_trabalho` (AET), `analise_preliminar` (AEP), `aet_avaliadores`, `funcoes` e todos os sub-itens |
| `004_create_illuminance_measurements.sql` | Malha de medição de iluminância (geometrias A1–A6, NHO 11) |
| `005_create_aep_assessment.sql` | Avaliação AEP estruturada: biomecânica, psicossocial, RACI, gatilhos AET |
| `006_seed_defaults.sql` | Dados iniciais: classificações de risco, parâmetros normativos, textos padrão, usuário ADMIN |
| `007_seed_mock_catalog.sql` | Dados mock do catálogo: 5 empresas, 6 unidades, 12 setores, 10 cargos, 14 EPIs, 20 equipamentos, 7 turnos, 11 pausas, 13 perguntas de entrevista, 10 checklist, 4 classificações de risco, 6 métodos científicos, 8 textos de relatório, 32 fatores de risco biomecânico, 13 parâmetros normativos de iluminância |

## Como executar

```bash
psql -U postgres -d ergonomia_db \
  -f migrations/001_create_auth.sql \
  -f migrations/002_create_catalog.sql \
  -f migrations/003_create_projects.sql \
  -f migrations/004_create_illuminance_measurements.sql \
  -f migrations/005_create_aep_assessment.sql \
  -f migrations/006_seed_defaults.sql \
  -f migrations/007_seed_mock_catalog.sql
```

## Diagrama de dependências

```
001_auth
  └── (independente)

002_catalog
  └── (independente)

003_projects
  ├── depende de 002 (perguntas_checklist)
  └── cria: funcoes, funcao_iluminacoes, funcao_riscos_ergonomicos...

004_illuminance_measurements
  ├── depende de 003 (funcoes)
  └── referencia aep_avaliacoes (FK adicionada em 005)

005_aep_assessment
  ├── depende de 003 (funcoes)
  ├── depende de 002 (fatores_risco_biomecanico)
  └── finaliza FK de 004 (medicoes_iluminancia → aep_avaliacoes)

006_seed
  ├── depende de 001 (usuarios)
  └── depende de 002 (classificacoes_risco, parametros_normativos_iluminancia, modelos_texto_relatorio)
```

## Estrutura de tabelas

```
analise_trabalho (AET)          analise_preliminar (AEP)
├── aet_avaliadores (N:N)        └── funcoes (1:N)  ──────────────────┐
└── funcoes (1:N)  ─────────────────────────────────────────────────┐ │
                                                                     ↓ ↓
funcoes
    ├── funcao_iluminacoes (1:1)
    │   ├── iluminacao_pontos_medicao
    │   └── iluminacao_checklist_itens
    ├── funcao_metodos_cientificos (1:N)
    ├── funcao_imagens (1:N)
    ├── funcao_equipamentos (1:N)
    ├── funcao_epis (1:N)
    ├── funcao_riscos_ergonomicos (1:N)
    ├── funcao_melhorias (1:N)
    ├── funcao_respostas_checklist (1:N)
    └── aep_avaliacoes (1:1)
        ├── aep_registros_fotograficos (1:N)
        ├── aep_itens_biomecanica (1:N)
        ├── aep_ferramentas_cientificas (1:N)
        ├── aep_respostas_psicossocial (1:N)
        ├── aep_gatilhos_aet (1:N)
        ├── aep_acoes_raci (1:N)
        └── medicoes_iluminancia (1:N)
            ├── medicao_iluminancia_linhas (1:N)
            │   └── medicao_linha_valores (1:N)
            ├── medicao_pontos_grade (1:N)
            ├── medicao_linha_medias (1:N)
            ├── medicao_verificacao_itens (1:N)
            └── medicao_inconsistencia_itens (1:N)
```

## Notas

- Todos os IDs são `UUID` gerados com `gen_random_uuid()` (extensão `pgcrypto`)
- Acrônimos mantidos no original: UUID, CNPJ, CEP, CBO, EPI, IRC, RULA, REBA, NIOSH, AET, AEP, RACI, LGPD
- Campos `*_url` / `imagem_url` armazenam imagens em base64 — considere mover para object storage (S3/MinIO) em produção
- A coluna `pontuacao` em `funcao_riscos_ergonomicos` é gerada automaticamente (`probabilidade × gravidade`)
- A FK `medicoes_iluminancia → aep_avaliacoes` é adicionada em `005` via `ALTER TABLE` (dependência circular resolvida por ordem de execução)
- O usuário ADMIN criado em `006` tem `alterar_senha = TRUE`; substitua o `senha_hash` pelo hash real (bcrypt/PBKDF2)
