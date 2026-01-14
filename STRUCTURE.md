# Estrutura de Pastas do Projeto

Esta documentação descreve a organização da estrutura de pastas do projeto, seguindo padrões industriais e de mercado (feature-based architecture).

## 📁 Estrutura de Componentes

```
components/
├── features/                    # Componentes organizados por feature/domínio
│   ├── tickets/                # Feature: Sistema de Tickets
│   │   ├── admin/              # Componentes específicos para administradores
│   │   │   ├── admin-ticket-card.tsx
│   │   │   ├── admin-ticket-edit-modal.tsx
│   │   │   └── admin-ticket-edit.tsx
│   │   ├── shared/             # Componentes compartilhados entre admin e user
│   │   │   ├── attachment-upload.tsx
│   │   │   ├── message-form.tsx
│   │   │   ├── message-list.tsx
│   │   │   ├── rich-text-editor.tsx
│   │   │   ├── ticket-card.tsx
│   │   │   ├── ticket-details.tsx
│   │   │   └── ticket-timer.tsx
│   │   └── user/               # Componentes específicos para usuários
│   │       └── navbar.tsx
│   ├── auth/                   # Feature: Autenticação
│   │   ├── google-button.tsx
│   │   └── password-strength.tsx
│   └── admin/                  # Feature: Painel Administrativo
│       └── sidebar/
│           ├── index.tsx
│           ├── nav-main.tsx
│           └── recent-open.tsx
├── shared/                     # Componentes compartilhados globalmente
│   └── logo/
│       └── TiAiAvatarIcon.tsx
└── ui/                         # Componentes de UI primitivos (Shadcn)
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── select.tsx
    └── ...
```

## 🎯 Princípios da Organização

### 1. **Feature-Based Architecture**

- Componentes agrupados por domínio/funcionalidade (tickets, auth, admin)
- Facilita localização e manutenção
- Permite escalabilidade por feature

### 2. **Separação por Contexto**

- **admin/**: Componentes exclusivos para administradores
- **shared/**: Componentes compartilhados entre diferentes contextos
- **user/**: Componentes exclusivos para usuários finais

### 3. **Componentes Primitivos**

- **ui/**: Componentes base reutilizáveis (Shadcn UI)
- **shared/**: Componentes compartilhados globalmente (logos, etc.)

## 📝 Convenções de Nomenclatura

- **Arquivos**: kebab-case (ex: `admin-ticket-card.tsx`)
- **Componentes**: PascalCase (ex: `AdminTicketCard`)
- **Pastas**: kebab-case (ex: `admin/`, `shared/`)

## 🔄 Imports

### Antes (estrutura antiga):

```typescript
import { AdminTicketCard } from "@/components/tickets/admin-ticket-card";
import { TicketDetails } from "@/components/tickets/ticket-details";
```

### Depois (estrutura nova):

```typescript
import { AdminTicketCard } from "@/components/features/tickets/admin/admin-ticket-card";
import { TicketDetails } from "@/components/features/tickets/shared/ticket-details";
```

## 📊 Benefícios

1. **Manutenibilidade**: Fácil localizar componentes relacionados
2. **Escalabilidade**: Adicionar novas features sem poluir a estrutura
3. **Colaboração**: Time pode trabalhar em features diferentes sem conflitos
4. **Clareza**: Estrutura reflete a organização do negócio
5. **Padrão Industrial**: Segue convenções usadas em projetos enterprise
