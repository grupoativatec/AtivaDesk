# Sistema de Gestão de TI

Sistema completo de gestão de tickets, tarefas, projetos e documentação para equipes de TI. Desenvolvido com Next.js 16, TypeScript, Prisma e PostgreSQL.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Rotas](#rotas)
- [Regras de Negócio](#regras-de-negócio)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Modelos de Dados](#modelos-de-dados)
- [Instalação e Execução](#instalação-e-execução)
- [Scripts Disponíveis](#scripts-disponíveis)

## 🎯 Sobre o Projeto

Sistema de gestão completo para equipes de TI que oferece:

- **Sistema de Tickets**: Gestão de chamados com categorização, priorização, atribuição e rastreamento de tempo
- **Gestão de Tarefas**: Criação, atribuição e acompanhamento de tarefas com registro de tempo
- **Gestão de Projetos**: Organização de projetos com tarefas associadas
- **Kanban**: Quadros Kanban para visualização e gestão de trabalho
- **Documentação**: Sistema de documentação com categorias, favoritos e controle de versão
- **Equipes**: Gestão de equipes para organização de trabalho
- **Notificações**: Sistema de notificações em tempo real
- **Colaboradores Externos**: Gestão de acessos para colaboradores externos

## 🛠 Tecnologias

### Frontend
- **Next.js 16.1.1** - Framework React com App Router
- **React 19.2.3** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Shadcn UI** - Componentes de UI
- **Framer Motion** - Animações
- **TipTap** - Editor de texto rico
- **Zustand** - Gerenciamento de estado
- **React Hook Form** - Formulários
- **Zod** - Validação de schemas

### Backend
- **Next.js API Routes** - API REST
- **Prisma 7.2.0** - ORM
- **PostgreSQL** - Banco de dados
- **JWT (jose)** - Autenticação
- **bcrypt** - Hash de senhas
- **Google Auth Library** - OAuth Google

### Ferramentas
- **ESLint** - Linting
- **TypeScript** - Compilação e type-checking

## 📁 Estrutura de Pastas

```
ti-main/
├── app/                          # App Router do Next.js
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── admin/                    # Painel administrativo
│   │   ├── dashboard/
│   │   ├── tickets/
│   │   ├── tarefas/
│   │   ├── projetos/
│   │   ├── kanban/
│   │   ├── docs/
│   │   ├── users/
│   │   ├── acessos/
│   │   └── colaboradores/
│   ├── tickets/                  # Área do usuário (tickets)
│   │   ├── [id]/
│   │   └── new/
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticação
│   │   ├── tickets/              # Endpoints de tickets
│   │   ├── kanban/               # Endpoints de Kanban
│   │   ├── upload/               # Upload de arquivos
│   │   └── admin/                # Endpoints administrativos
│   └── page.tsx                  # Página inicial
│
├── components/                    # Componentes React
│   ├── features/                  # Componentes por feature
│   │   ├── tickets/              # Componentes de tickets
│   │   │   ├── admin/            # Componentes admin
│   │   │   ├── shared/           # Componentes compartilhados
│   │   │   └── user/             # Componentes usuário
│   │   ├── auth/                 # Componentes de autenticação
│   │   └── admin/                # Componentes administrativos
│   ├── shared/                   # Componentes compartilhados globalmente
│   └── ui/                       # Componentes primitivos (Shadcn)
│
├── lib/                          # Bibliotecas e utilitários
│   ├── auth/                     # Autenticação (JWT, cookies, Google OAuth)
│   ├── api/                      # Clientes de API
│   ├── kanban/                   # Lógica de Kanban
│   ├── routes/                   # Configuração de rotas
│   ├── stores/                   # Stores Zustand
│   ├── utils/                    # Funções utilitárias
│   ├── constants.ts              # Constantes
│   ├── notifications.ts         # Sistema de notificações
│   └── prisma.ts                 # Cliente Prisma
│
├── prisma/                       # Schema e migrações
│   ├── schema.prisma            # Schema do banco de dados
│   └── migrations/              # Migrações do Prisma
│
├── public/                       # Arquivos estáticos
│   ├── audio/                    # Sons de notificação
│   └── uploads/                  # Arquivos enviados
│
├── scripts/                      # Scripts utilitários
│   └── import-acessos.ts        # Script de importação
│
├── hooks/                        # React Hooks customizados
├── provider/                     # Providers React
├── middleware.ts                 # Middleware do Next.js
├── next.config.ts                # Configuração do Next.js
├── tsconfig.json                 # Configuração TypeScript
└── package.json                 # Dependências do projeto
```

### Princípios da Organização

- **Feature-Based Architecture**: Componentes agrupados por domínio/funcionalidade
- **Separação por Contexto**: Componentes específicos para admin, user e shared
- **Componentes Primitivos**: UI base reutilizável (Shadcn UI)

## 🛣 Rotas

### Rotas Públicas

Rotas que não requerem autenticação:

- `/login` - Página de login
- `/register` - Página de registro

### Rotas Protegidas - Usuário (USER/AGENT)

- `/tickets` - Lista de tickets do usuário
- `/tickets/new` - Criar novo ticket
- `/tickets/[id]` - Detalhes do ticket

### Rotas Protegidas - Administrador (ADMIN)

- `/admin/dashboard` - Dashboard administrativo
- `/admin/tickets` - Gestão de tickets
- `/admin/tarefas` - Gestão de tarefas
- `/admin/projetos` - Gestão de projetos
- `/admin/kanban` - Quadros Kanban
- `/admin/docs` - Documentação
- `/admin/users` - Gestão de usuários
- `/admin/acessos` - Gestão de acessos
- `/admin/colaboradores` - Gestão de colaboradores externos

### Rotas da API

#### Autenticação (Públicas)
- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/register` - Registro de novo usuário
- `GET /api/auth/google` - Iniciar OAuth Google
- `GET /api/auth/google/callback` - Callback OAuth Google

#### Autenticação (Protegidas)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Obter usuário atual

#### Tickets (Protegidas)
- `GET /api/tickets` - Listar tickets do usuário
- `POST /api/tickets` - Criar novo ticket
- `GET /api/tickets/[id]` - Obter ticket específico
- `GET /api/tickets/[id]/messages` - Obter mensagens do ticket

#### Kanban (Protegidas)
- `GET /api/kanban/boards` - Listar quadros
- `POST /api/kanban/boards` - Criar quadro
- `GET /api/kanban/boards/[boardId]` - Obter quadro
- `GET /api/kanban/boards/[boardId]/cards` - Obter cards do quadro
- `POST /api/kanban/cards/[cardId]/move` - Mover card

#### Upload (Protegida)
- `POST /api/upload` - Upload de arquivos

#### Admin (Apenas ADMIN)
- `GET /api/admin/tickets` - Listar todos os tickets
- `POST /api/admin/tickets/[id]/assign` - Atribuir ticket
- `POST /api/admin/tickets/[id]/timer` - Controlar timer do ticket
- `GET /api/admin/tasks` - Listar tarefas
- `POST /api/admin/tasks` - Criar tarefa
- `GET /api/admin/projects` - Listar projetos
- `POST /api/admin/projects` - Criar projeto
- `GET /api/admin/users` - Listar usuários
- `GET /api/admin/notifications` - Listar notificações
- `GET /api/admin/docs` - Listar documentos
- E outras rotas administrativas...

## 📐 Regras de Negócio

### Sistema de Tickets

1. **Criação de Tickets**
   - Usuários podem criar tickets com título, descrição, categoria, prioridade e unidade
   - Tickets são criados com status `OPEN` por padrão
   - Notificações são enviadas para todos os administradores quando um novo ticket é criado

2. **Atribuição de Tickets**
   - Apenas administradores podem atribuir tickets a outros usuários ou equipes
   - Um ticket pode ter um responsável (assignee) e/ou uma equipe responsável

3. **Status de Tickets**
   - `OPEN`: Ticket aberto, aguardando atendimento
   - `IN_PROGRESS`: Ticket em andamento (timer inicia automaticamente)
   - `RESOLVED`: Ticket resolvido
   - `CLOSED`: Ticket fechado

4. **Timer de Tickets**
   - Timer inicia automaticamente quando status muda para `IN_PROGRESS`
   - Timer pode ser pausado e retomado
   - Tempo pausado é acumulado em `totalPausedSeconds`
   - Tempo total é calculado quando ticket é resolvido/fechado

5. **Mensagens e Anexos**
   - Usuários e administradores podem enviar mensagens nos tickets
   - Mensagens podem ser marcadas como internas (não visíveis para usuário)
   - Anexos podem ser adicionados aos tickets

### Sistema de Tarefas

1. **Criação de Tarefas**
   - Tarefas podem ser criadas com ou sem projeto associado
   - Tarefas têm status, prioridade, unidade e horas estimadas

2. **Status de Tarefas**
   - `BACKLOG`: Tarefa no backlog
   - `TODO`: Tarefa a fazer
   - `IN_PROGRESS`: Tarefa em progresso
   - `DONE`: Tarefa concluída

3. **Atribuição**
   - Tarefas podem ter múltiplos responsáveis (assignees)
   - Tarefas podem ser atribuídas a equipes

4. **Registro de Tempo**
   - Usuários podem registrar tempo trabalhado em tarefas
   - Tipos de tempo: `DEV`, `TEST`, `MEETING`, `REWORK`
   - Horas são armazenadas como Decimal (suporta 0.5h, 1.5h, etc.)

5. **Atividades**
   - Sistema registra todas as atividades nas tarefas (criação, atualização, mudança de status, etc.)

### Sistema de Projetos

1. **Criação de Projetos**
   - Projetos têm nome, código (único), status e unidade opcional
   - Status: `ACTIVE` ou `ARCHIVED`

2. **Tarefas e Equipes**
   - Projetos podem ter múltiplas tarefas associadas
   - Projetos podem ser atribuídos a equipes

### Sistema Kanban

1. **Quadros**
   - Quadros podem ser criados com ou sem projeto associado
   - Quadros têm membros com roles: `VIEWER`, `EDITOR`, `ADMIN`

2. **Colunas**
   - Colunas representam status: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`
   - Cada quadro pode ter uma coluna por status

3. **Cards**
   - Cards podem ser vinculados a tarefas existentes
   - Cards têm título, descrição, prioridade, tags e data de vencimento
   - Cards podem ser movidos entre colunas (drag and drop)

### Sistema de Documentação

1. **Documentos**
   - Documentos têm título, slug (único), resumo, conteúdo, categoria e status
   - Categorias: `INFRA`, `SISTEMAS`, `PROCESSOS`, `SEGURANCA`, `GERAL`
   - Status: `DRAFT` ou `PUBLISHED`
   - Documentos podem ser arquivados

2. **Favoritos**
   - Usuários podem favoritar documentos
   - Sistema rastreia visualizações

### Sistema de Notificações

1. **Tipos de Notificação**
   - `NEW_TICKET`: Novo ticket criado
   - `NEW_MESSAGE`: Nova mensagem no ticket
   - `TICKET_ASSIGNED`: Ticket atribuído
   - `TICKET_STATUS_CHANGED`: Status do ticket alterado
   - `TICKET_PRIORITY_CHANGED`: Prioridade do ticket alterada
   - `TASK_CREATED`: Nova tarefa criada
   - `TASK_STATUS_CHANGED`: Status da tarefa alterado
   - `TASK_UPDATED`: Tarefa atualizada
   - `TASK_ASSIGNED`: Tarefa atribuída
   - `PROJECT_CREATED`: Novo projeto criado
   - `PROJECT_TASK_ADDED`: Tarefa adicionada ao projeto
   - `PROJECT_UPDATED`: Projeto atualizado

2. **Status**
   - `UNREAD`: Não lida
   - `READ`: Lida

### Colaboradores Externos

1. **Gestão de Acessos**
   - Sistema permite cadastro de colaboradores externos
   - Colaboradores têm categoria, departamento e credenciais de acesso
   - Senhas são criptografadas e podem ser descriptografadas por administradores

## 🔐 Autenticação e Autorização

### Autenticação

1. **Métodos de Autenticação**
   - Login com email/senha (bcrypt)
   - OAuth Google

2. **JWT Tokens**
   - Tokens JWT são armazenados em cookies HTTP-only
   - Tokens contêm: `sub` (userId), `role`, `tokenVersion`
   - Expiração configurável (padrão: 7 dias)
   - Sistema de `tokenVersion` para invalidar tokens (logout forçado)

3. **Middleware**
   - Middleware do Next.js protege rotas automaticamente
   - Redireciona usuários não autenticados para `/login`
   - Redireciona usuários autenticados tentando acessar login/register para rota padrão

### Autorização por Roles

1. **Roles Disponíveis**
   - `USER`: Usuário final (pode criar e visualizar seus tickets)
   - `AGENT`: Agente (mesmas permissões de USER)
   - `ADMIN`: Administrador (acesso completo ao sistema)

2. **Proteção de Rotas**
   - Rotas `/admin/*` requerem role `ADMIN`
   - Rotas `/api/admin/*` requerem role `ADMIN`
   - Usuários não-admin são redirecionados para `/tickets`

3. **Rotas Padrão por Role**
   - `ADMIN`: `/admin/dashboard`
   - `USER`/`AGENT`: `/tickets`

## 💾 Modelos de Dados

### Principais Entidades

- **User**: Usuários do sistema (roles: USER, AGENT, ADMIN)
- **Ticket**: Chamados de suporte
- **TicketMessage**: Mensagens nos tickets
- **TicketAttachment**: Anexos dos tickets
- **Task**: Tarefas de projeto
- **Project**: Projetos
- **TimeEntry**: Registros de tempo trabalhado
- **KanbanBoard**: Quadros Kanban
- **KanbanCard**: Cards do Kanban
- **Document**: Documentos
- **Notification**: Notificações
- **Team**: Equipes
- **ColaboradorExterno**: Colaboradores externos
- **CategoriaColaborador**: Categorias de colaboradores

### Enums Principais

- **UserRole**: USER, AGENT, ADMIN
- **TicketStatus**: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- **TicketPriority**: LOW, MEDIUM, HIGH, URGENT
- **TicketCategory**: HARDWARE, SOFTWARE, NETWORK, EMAIL, ACCESS, OTHER
- **TaskStatus**: BACKLOG, TODO, IN_PROGRESS, DONE
- **KanbanStatus**: TODO, IN_PROGRESS, REVIEW, DONE

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL
- npm, yarn, pnpm ou bun

### Passos

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd ti-main
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   # Banco de dados
   DATABASE_URL="postgresql://user:password@localhost:5432/ti_db"

   # JWT
   JWT_SECRET="seu-secret-jwt-aqui"
   JWT_EXPIRES_IN="7d"

   # Google OAuth (opcional)
   GOOGLE_CLIENT_ID="seu-google-client-id"
   GOOGLE_CLIENT_SECRET="seu-google-client-secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Configure o banco de dados**
   ```bash
   # Execute as migrações
   npx prisma migrate dev
   
   # (Opcional) Gere o cliente Prisma
   npx prisma generate
   ```

5. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

6. **Acesse a aplicação**
   
   Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa ESLint

## 📝 Notas Adicionais

- O projeto utiliza **soft delete** para usuários (campo `deletedAt`)
- Sistema de notificações com som de alerta
- Upload de arquivos para `/public/uploads`
- Editor de texto rico (TipTap) para descrições e mensagens
- Sistema de temas (dark/light mode) com next-themes
- Drag and drop para Kanban com @dnd-kit

## 🤝 Contribuindo

Este é um projeto interno. Para contribuições, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Proprietário - Todos os direitos reservados.
