export type TemplateType = "how-to" | "runbook" | "post-mortem" | "api"

export interface Template {
  id: TemplateType
  name: string
  description: string
  content: string
}

export const templates: Template[] = [
  {
    id: "how-to",
    name: "How-to",
    description: "Guia passo a passo",
    content: `# Como fazer [Título]

Este guia descreve o procedimento para [objetivo].

## Requisitos prévios

Antes de começar, certifique-se de ter:

- Item 1
- Item 2
- Item 3

## Passo 1: [Descrição]

1. Primeira ação
2. Segunda ação
3. Terceira ação

## Passo 2: [Descrição]

\`\`\`bash
# Comando de exemplo
comando --opcao valor
\`\`\`

## Verificação

Após concluir, verifique:

- [ ] Item de verificação 1
- [ ] Item de verificação 2

## Solução de problemas

### Problema comum 1

**Sintoma**: Descrição do problema

**Solução**: Passos para resolver

## Referências

- Link ou referência útil`,
  },
  {
    id: "runbook",
    name: "Runbook",
    description: "Procedimento operacional",
    content: `# Runbook: [Nome do procedimento]

Este runbook descreve o procedimento operacional para [objetivo].

## Objetivo

[Descrição do objetivo do procedimento]

## Escopo

- Ambiente: [Produção/Staging/Desenvolvimento]
- Responsável: [Time/Equipe]
- Frequência: [Diário/Semanal/Conforme necessário]

## Pré-requisitos

- [ ] Item pré-requisito 1
- [ ] Item pré-requisito 2

## Procedimento

### 1. Preparação

\`\`\`bash
# Comandos de preparação
comando1
comando2
\`\`\`

### 2. Execução

1. Passo 1
2. Passo 2
3. Passo 3

### 3. Validação

Execute os seguintes comandos para validar:

\`\`\`bash
# Comandos de validação
verificar-status
\`\`\`

## Rollback

Em caso de problemas, execute:

\`\`\`bash
# Comandos de rollback
rollback-command
\`\`\`

## Monitoramento

Após a execução, monitore:

- Métrica 1
- Métrica 2

## Contatos

- Escalação: [Contato]
- Suporte: [Contato]`,
  },
  {
    id: "post-mortem",
    name: "Post-mortem",
    description: "Análise pós-incidente",
    content: `# Post-mortem: [Nome do incidente]

**Data**: [DD/MM/YYYY]
**Duração**: [X horas/minutos]
**Severidade**: [Crítica/Alta/Média/Baixa]

## Resumo executivo

[Breve descrição do incidente e impacto]

## Timeline

| Hora | Evento |
|------|--------|
| HH:MM | Descrição do evento |
| HH:MM | Descrição do evento |

## Impacto

- **Usuários afetados**: [Número ou descrição]
- **Serviços afetados**: [Lista]
- **Perda de receita**: [Se aplicável]

## Causa raiz

[Análise detalhada da causa raiz do incidente]

## Ações tomadas

1. Ação imediata 1
2. Ação imediata 2
3. Ação de mitigação

## Lições aprendidas

### O que funcionou bem

- Item 1
- Item 2

### O que pode melhorar

- Item 1
- Item 2

## Ações corretivas

- [ ] Ação 1 (Responsável: [Nome], Prazo: [Data])
- [ ] Ação 2 (Responsável: [Nome], Prazo: [Data])
- [ ] Ação 3 (Responsável: [Nome], Prazo: [Data])

## Prevenção

[Medidas preventivas para evitar recorrência]`,
  },
  {
    id: "api",
    name: "API",
    description: "Documentação de API",
    content: `# API: [Nome da API]

[Breve descrição da API e seu propósito]

## Visão geral

**Base URL**: \`https://api.exemplo.com/v1\`

**Versão**: v1.0.0

**Formato de dados**: JSON

## Autenticação

Esta API utiliza autenticação via [Bearer Token / API Key / OAuth 2.0].

### Headers obrigatórios

\`\`\`
Authorization: Bearer {token}
Content-Type: application/json
\`\`\`

### Como obter credenciais

[Instruções para obter token/credenciais]

## Endpoints

### GET /resource

Retorna uma lista de recursos.

**Parâmetros de query**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|----------|------|------------|-----------|
| \`page\` | integer | Não | Número da página (padrão: 1) |
| \`limit\` | integer | Não | Itens por página (padrão: 20, máx: 100) |
| \`filter\` | string | Não | Filtro de busca |

**Exemplo de requisição**:

\`\`\`bash
curl -X GET "https://api.exemplo.com/v1/resource?page=1&limit=10" \\
  -H "Authorization: Bearer {token}" \\
  -H "Content-Type: application/json"
\`\`\`

**Exemplo de resposta (200 OK)**:

\`\`\`json
{
  "data": [
    {
      "id": "123",
      "name": "Recurso exemplo",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
\`\`\`

### GET /resource/{id}

Retorna um recurso específico.

**Parâmetros de path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|----------|------|------------|-----------|
| \`id\` | string | Sim | ID do recurso |

**Exemplo de requisição**:

\`\`\`bash
curl -X GET "https://api.exemplo.com/v1/resource/123" \\
  -H "Authorization: Bearer {token}" \\
  -H "Content-Type: application/json"
\`\`\`

**Exemplo de resposta (200 OK)**:

\`\`\`json
{
  "id": "123",
  "name": "Recurso exemplo",
  "description": "Descrição do recurso",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z"
}
\`\`\`

### POST /resource

Cria um novo recurso.

**Body (JSON)**:

\`\`\`json
{
  "name": "Novo recurso",
  "description": "Descrição do novo recurso",
  "status": "active"
}
\`\`\`

**Exemplo de requisição**:

\`\`\`bash
curl -X POST "https://api.exemplo.com/v1/resource" \\
  -H "Authorization: Bearer {token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Novo recurso",
    "description": "Descrição do novo recurso",
    "status": "active"
  }'
\`\`\`

**Exemplo de resposta (201 Created)**:

\`\`\`json
{
  "id": "456",
  "name": "Novo recurso",
  "description": "Descrição do novo recurso",
  "status": "active",
  "created_at": "2024-01-25T09:15:00Z"
}
\`\`\`

### PUT /resource/{id}

Atualiza um recurso existente.

**Parâmetros de path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|----------|------|------------|-----------|
| \`id\` | string | Sim | ID do recurso |

**Body (JSON)**:

\`\`\`json
{
  "name": "Recurso atualizado",
  "description": "Nova descrição",
  "status": "inactive"
}
\`\`\`

**Exemplo de requisição**:

\`\`\`bash
curl -X PUT "https://api.exemplo.com/v1/resource/123" \\
  -H "Authorization: Bearer {token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Recurso atualizado",
    "description": "Nova descrição",
    "status": "inactive"
  }'
\`\`\`

**Exemplo de resposta (200 OK)**:

\`\`\`json
{
  "id": "123",
  "name": "Recurso atualizado",
  "description": "Nova descrição",
  "status": "inactive",
  "updated_at": "2024-01-25T10:00:00Z"
}
\`\`\`

### DELETE /resource/{id}

Remove um recurso.

**Parâmetros de path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|----------|------|------------|-----------|
| \`id\` | string | Sim | ID do recurso |

**Exemplo de requisição**:

\`\`\`bash
curl -X DELETE "https://api.exemplo.com/v1/resource/123" \\
  -H "Authorization: Bearer {token}" \\
  -H "Content-Type: application/json"
\`\`\`

**Exemplo de resposta (204 No Content)**:

\`\`\`
(sem conteúdo)
\`\`\`

## Códigos de status HTTP

| Código | Descrição |
|--------|-----------|
| \`200\` | OK - Requisição bem-sucedida |
| \`201\` | Created - Recurso criado com sucesso |
| \`204\` | No Content - Requisição bem-sucedida sem conteúdo |
| \`400\` | Bad Request - Requisição inválida |
| \`401\` | Unauthorized - Token inválido ou ausente |
| \`403\` | Forbidden - Sem permissão para acessar o recurso |
| \`404\` | Not Found - Recurso não encontrado |
| \`422\` | Unprocessable Entity - Erro de validação |
| \`429\` | Too Many Requests - Limite de requisições excedido |
| \`500\` | Internal Server Error - Erro interno do servidor |

## Tratamento de erros

Todas as respostas de erro seguem o seguinte formato:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem de erro descritiva",
    "details": {
      "field": "Descrição do erro no campo específico"
    }
  }
}
\`\`\`

### Exemplo de erro (400 Bad Request)

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": {
      "name": "O campo 'name' é obrigatório",
      "status": "O valor 'invalid' não é permitido. Valores aceitos: active, inactive"
    }
  }
}
\`\`\`

## Rate limiting

A API possui limite de requisições por minuto:

- **Limite padrão**: 60 requisições/minuto
- **Limite autenticado**: 300 requisições/minuto

Os headers de resposta incluem informações sobre o rate limit:

\`\`\`
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1706187600
\`\`\`

## Exemplos de integração

### JavaScript (Fetch API)

\`\`\`javascript
const response = await fetch('https://api.exemplo.com/v1/resource', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer {token}',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
\`\`\`

### Python (requests)

\`\`\`python
import requests

headers = {
    'Authorization': 'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.exemplo.com/v1/resource',
    headers=headers
)

data = response.json()
print(data)
\`\`\`

## Changelog

### v1.0.0 (2024-01-15)

- Versão inicial da API
- Endpoints CRUD básicos
- Autenticação via Bearer Token`,
  },
]

export function getTemplate(id: TemplateType): Template | undefined {
  return templates.find((t) => t.id === id)
}
