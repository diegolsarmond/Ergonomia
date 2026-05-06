# Segurança e Autenticação — Documentação Técnica

> **ATENÇÃO:** Este sistema usa autenticação local temporária, adequada apenas para desenvolvimento e homologação interna. Antes de qualquer entrega ao cliente, leia este documento integralmente.

---

## 1. Arquitetura atual (temporária)

O sistema opera em modo **frontend-only**, sem backend ou servidor de autenticação. A persistência de dados é feita via **localforage** (IndexedDB no navegador).

### Fluxo de autenticação

```
Login (username + password)
  → busca usuário no localforage (USERS_STORAGE_KEY)
  → verifica senha com SHA-256 (salt + password)
  → cria AuthSession com expiresAt (+8 horas)
  → persiste sessão no localforage (SESSION_STORAGE_KEY)
  → AuthContext carrega currentUser e session
```

### Arquivos envolvidos

| Arquivo | Responsabilidade |
|---|---|
| `src/domain/auth/authTypes.ts` | Tipos: AppUser, AuthSession, Permission, UserRole |
| `src/domain/auth/permissions.ts` | Mapa ROLE_PERMISSIONS por perfil |
| `src/domain/auth/authDefaults.ts` | Constantes: chaves de storage, duração de sessão |
| `src/domain/auth/passwordService.ts` | Hash/verify de senha via Web Crypto API |
| `src/domain/auth/userRepository.ts` | CRUD de usuários no localforage |
| `src/context/AuthContext.tsx` | Provider React com login, logout, hasPermission |
| `src/components/auth/ProtectedRoute.tsx` | Guard de rota por autenticação |
| `src/components/auth/PermissionGuard.tsx` | Guard de UI por permissão |

---

## 2. Limitações e riscos da implementação atual

### localforage NÃO é segurança produtiva

- Dados armazenados no IndexedDB são acessíveis via DevTools do navegador.
- Qualquer usuário com acesso físico ou remoto ao navegador pode inspecionar ou modificar os dados.
- **Não usar esta implementação para dados sensíveis de clientes em produção.**

### SHA-256 com salt NÃO é suficiente para produção

- SHA-256 é um algoritmo de hash genérico, rápido demais para ser usado como hash de senha em ambiente real.
- Em produção, senhas devem ser hasheadas com algoritmos lentos e resistentes a força bruta.
- A implementação atual é explicitamente marcada como temporária em `passwordService.ts`.

---

## 3. Usuário temporário de desenvolvimento

> ⚠️ **REMOÇÃO OBRIGATÓRIA ANTES DA ENTREGA AO CLIENTE**

| Campo | Valor |
|---|---|
| username | `admin` |
| password | `admin` |
| role | `ADMIN` |
| status | `active` |
| mustChangePassword | `true` |
| ambiente | somente `DEV` (`import.meta.env.DEV === true`) |

Este usuário é criado automaticamente pela função `seedDevelopmentAdminUser()` em `userRepository.ts` **somente em ambiente de desenvolvimento**. Em produção (`import.meta.env.PROD === true`), a função retorna imediatamente sem executar nada.

### Como verificar se o seed está desativado

```bash
npm run build   # gera o bundle de produção
grep -r "admin" dist/  # não deve encontrar credenciais em texto puro
```

### Como remover o seed antes da entrega

1. Remover ou comentar a chamada `seedDevelopmentAdminUser()` em `AuthContext.tsx`.
2. Excluir ou desabilitar a função `seedDevelopmentAdminUser()` em `userRepository.ts`.
3. Garantir que nenhum usuário com username `admin` exista no storage de produção.

---

## 4. Perfis de acesso e permissões

### Perfis disponíveis

| Role | Label | Descrição |
|---|---|---|
| `ADMIN` | Administrador | Acesso total ao sistema |
| `TECHNICAL_RESPONSIBLE` | Resp. Técnico | Cria/edita projetos e catálogos, não gerencia usuários |
| `CONSULTANT` | Consultor | Cria/edita projetos, acesso somente-leitura ao catálogo |
| `CLIENT_VIEWER` | Visualizador | Somente visualização e impressão |

### Mapa de permissões por perfil

| Permissão | ADMIN | TECHNICAL_RESPONSIBLE | CONSULTANT | CLIENT_VIEWER |
|---|:---:|:---:|:---:|:---:|
| USERS_VIEW | ✓ | — | — | — |
| USERS_CREATE | ✓ | — | — | — |
| USERS_EDIT | ✓ | — | — | — |
| USERS_DELETE | ✓ | — | — | — |
| PROJECTS_VIEW | ✓ | ✓ | ✓ | ✓ |
| PROJECTS_CREATE | ✓ | ✓ | ✓ | — |
| PROJECTS_EDIT | ✓ | ✓ | ✓ | — |
| PROJECTS_DELETE | ✓ | ✓ | — | — |
| AEP_VIEW | ✓ | ✓ | ✓ | ✓ |
| AEP_CREATE | ✓ | ✓ | ✓ | — |
| AEP_EDIT | ✓ | ✓ | ✓ | — |
| AEP_DELETE | ✓ | — | — | — |
| AEP_PRINT | ✓ | ✓ | ✓ | ✓ |
| AET_VIEW | ✓ | ✓ | ✓ | ✓ |
| AET_CREATE | ✓ | ✓ | ✓ | — |
| AET_EDIT | ✓ | ✓ | ✓ | — |
| AET_DELETE | ✓ | — | — | — |
| AET_PRINT | ✓ | ✓ | ✓ | ✓ |
| CATALOG_VIEW | ✓ | ✓ | ✓ | — |
| CATALOG_EDIT | ✓ | ✓ | — | — |
| SETTINGS_VIEW | ✓ | — | — | — |
| SETTINGS_EDIT | ✓ | — | — | — |

---

## 5. Recomendações para implementação futura (backend)

### Hashing de senha

- Substituir SHA-256 por **Argon2id** (recomendado) ou **bcrypt** no backend.
- O hash deve ocorrer **exclusivamente no servidor** — o cliente nunca deve enviar senha em texto puro em produção, ou deve usar TLS obrigatório.
- Referência: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

### Sessão e tokens

- Substituir a sessão em localforage por **JWT em cookie httpOnly + Secure + SameSite=Strict**.
- Alternativa: sessão server-side com ID de sessão opaco em cookie.
- Nunca armazenar JWT em localStorage em produção.

### Políticas de segurança

- Implementar expiração e renovação de sessão server-side.
- Implementar bloqueio de conta após N tentativas de login.
- Implementar política de senha mínima (comprimento, complexidade).
- Implementar fluxo de reset de senha por e-mail com token de uso único.
- Implementar log de auditoria de acessos e ações sensíveis.

### Infraestrutura

- Tráfego exclusivamente via HTTPS (TLS 1.2+).
- Remover todo código de seed de desenvolvimento do bundle de produção.
- Separar variáveis de ambiente por contexto (dev/staging/prod).

---

## 6. Checklist pré-entrega ao cliente

- [ ] Usuário `admin/admin` removido ou desabilitado
- [ ] `seedDevelopmentAdminUser()` desabilitado ou removido
- [ ] Nenhuma senha em texto puro no código ou no bundle
- [ ] Build de produção verificado (`npm run build`)
- [ ] Storage limpo antes da entrega (sem dados de homologação)
- [ ] Usuário inicial de produção criado com senha forte
- [ ] `mustChangePassword: true` no primeiro usuário real
- [ ] Documentação de operação entregue ao cliente
