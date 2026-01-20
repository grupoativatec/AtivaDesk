import { Doc } from "@/components/features/docs/DocCard"

export const mockDocs: Doc[] = [
  {
    id: "1",
    title: "Procedimento de acesso VPN corporativa",
    slug: "procedimento-acesso-vpn",
    summary: "Passo a passo para configurar e acessar a VPN corporativa em diferentes sistemas operacionais.",
    category: "Infra",
    tags: ["vpn", "rede", "acesso-remoto"],
    status: "published",
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "u-1",
    authorName: "Michael Silva",
    views: 120,
    content: `# Procedimento de acesso VPN corporativa

Este documento descreve o procedimento completo para configurar e acessar a VPN corporativa em diferentes sistemas operacionais.

## Requisitos prévios

Antes de iniciar, certifique-se de ter:

- Credenciais de acesso corporativo válidas
- Aplicativo VPN instalado (OpenVPN ou cliente compatível)
- Arquivo de configuração (.ovpn) fornecido pela equipe de TI

## Configuração no Windows

### Instalação do cliente

1. Baixe o cliente OpenVPN do site oficial
2. Execute o instalador e siga as instruções
3. Reinicie o computador se solicitado

### Importação do perfil

1. Abra o cliente OpenVPN
2. Clique em "Importar perfil"
3. Selecione o arquivo .ovpn fornecido
4. Digite suas credenciais quando solicitado

## Configuração no macOS

### Instalação via Homebrew

\`\`\`bash
brew install openvpn
\`\`\`

### Configuração manual

1. Copie o arquivo .ovpn para \`/usr/local/etc/openvpn/\`
2. Execute: \`sudo openvpn --config /usr/local/etc/openvpn/seu-perfil.ovpn\`

## Configuração no Linux

### Ubuntu/Debian

\`\`\`bash
sudo apt-get update
sudo apt-get install openvpn
sudo openvpn --config /caminho/para/seu-perfil.ovpn
\`\`\`

## Solução de problemas

### Erro de autenticação

- Verifique se suas credenciais estão corretas
- Confirme que sua conta está ativa no sistema corporativo
- Entre em contato com o suporte se o problema persistir

### Conexão lenta

- Verifique sua conexão de internet
- Tente conectar em um horário de menor tráfego
- Considere usar uma conexão cabeada ao invés de Wi-Fi

## Suporte

Para problemas adicionais, entre em contato com a equipe de TI através do sistema de tickets.`,
  },
  {
    id: "2",
    title: "Deploy padrão de aplicações Node.js",
    slug: "deploy-nodejs-padrao",
    summary: "Guia operacional para deploy de aplicações Node.js usando pipeline CI/CD e padrões internos.",
    category: "Sistemas",
    tags: ["deploy", "nodejs", "ci-cd"],
    status: "published",
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "u-2",
    authorName: "Ana Pereira",
    views: 85,
    content: `# Deploy padrão de aplicações Node.js

Este guia descreve o processo padrão para deploy de aplicações Node.js em nosso ambiente de produção.

## Visão geral

O processo de deploy é automatizado através de pipeline CI/CD usando GitHub Actions e Docker.

## Pré-requisitos

- Repositório configurado no GitHub
- Dockerfile presente no repositório
- Variáveis de ambiente configuradas no GitHub Secrets

## Estrutura do pipeline

### Etapas principais

1. **Build**: Compilação da aplicação
2. **Test**: Execução de testes automatizados
3. **Deploy**: Publicação no ambiente de produção

### Exemplo de workflow

\`\`\`yaml
name: Deploy Node.js

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t app:latest .
      - name: Deploy to production
        run: ./scripts/deploy.sh
\`\`\`

## Variáveis de ambiente

Certifique-se de configurar as seguintes variáveis:

- \`NODE_ENV=production\`
- \`DATABASE_URL\`
- \`JWT_SECRET\`
- \`API_KEY\`

## Rollback

Em caso de problemas, execute:

\`\`\`bash
./scripts/rollback.sh
\`\`\`

## Monitoramento

Após o deploy, monitore:

- Logs da aplicação
- Métricas de performance
- Taxa de erro`,
  },
  {
    id: "3",
    title: "Checklist de mudança em produção",
    slug: "checklist-mudanca-producao",
    summary: "Checklist obrigatório para qualquer intervenção em ambientes de produção, incluindo validações e rollback.",
    category: "Processos",
    tags: ["mudanca", "producao", "checklist"],
    status: "draft",
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "u-1",
    authorName: "Michael Silva",
    views: 40,
    content: `# Checklist de mudança em produção

Este checklist deve ser seguido para qualquer mudança em ambientes de produção.

## Antes da mudança

- [ ] Mudança documentada e aprovada
- [ ] Plano de rollback definido
- [ ] Backup do estado atual realizado
- [ ] Equipe notificada sobre a janela de manutenção

## Durante a mudança

- [ ] Passos executados conforme documentação
- [ ] Logs monitorados em tempo real
- [ ] Validações intermediárias realizadas

## Após a mudança

- [ ] Testes de validação executados
- [ ] Monitoramento ativo por 24h
- [ ] Documentação atualizada`,
  },
  {
    id: "4",
    title: "Padrão de autenticação com JWT",
    slug: "padrao-autenticacao-jwt",
    summary: "Definição de padrões para emissão, renovação e validação de tokens JWT em sistemas internos.",
    category: "Segurança",
    tags: ["jwt", "auth", "seguranca"],
    status: "published",
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "u-3",
    authorName: "Carlos Lima",
    views: 200,
    content: `# Padrão de autenticação com JWT

Este documento define os padrões para implementação de autenticação JWT em nossos sistemas.

## Estrutura do token

### Header

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

### Payload

\`\`\`json
{
  "sub": "user-id",
  "iat": 1234567890,
  "exp": 1234571490,
  "role": "USER"
}
\`\`\`

## Tempo de expiração

- **Access token**: 15 minutos
- **Refresh token**: 7 dias

## Renovação

O refresh token deve ser usado para obter um novo access token antes da expiração.

## Validação

Sempre valide:

1. Assinatura do token
2. Tempo de expiração
3. Claims obrigatórios`,
  },
  {
    id: "5",
    title: "Procedimento de backup diário do banco de dados",
    slug: "backup-diario-banco-dados",
    summary: "Runbook detalhado para execução, verificação e restauração de backups diários do banco de dados.",
    category: "Infra",
    tags: ["backup", "banco-de-dados", "rotina"],
    status: "published",
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "u-2",
    authorName: "Ana Pereira",
    views: 60,
    archived: true,
    content: `# Procedimento de backup diário do banco de dados

Este runbook descreve o procedimento completo para backups diários.

## Execução

O backup é executado automaticamente às 02:00 AM.

## Verificação

Após o backup, verifique:

- Tamanho do arquivo
- Integridade do backup
- Logs de erro`,
  },
  {
    id: "6",
    title: "Checklist pós-incidente crítico",
    slug: "checklist-pos-incidente-critico",
    summary: "Checklist para execução de ações após incidentes críticos, incluindo comunicação, correções e lições aprendidas.",
    category: "Geral",
    tags: ["incidente", "post-mortem", "checklist"],
    status: "draft",
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "u-3",
    authorName: "Carlos Lima",
    views: 30,
    content: `# Checklist pós-incidente crítico

Este checklist deve ser seguido após a resolução de um incidente crítico.

## Imediatamente após resolução

- [ ] Serviço restaurado e validado
- [ ] Equipe notificada sobre a resolução
- [ ] Incidente documentado no sistema

## Nas próximas 24 horas

- [ ] Post-mortem agendado
- [ ] Análise de causa raiz iniciada
- [ ] Ações corretivas identificadas

## Semana seguinte

- [ ] Post-mortem realizado
- [ ] Lições aprendidas documentadas
- [ ] Melhorias implementadas`,
  },
]

// Funções movidas para o store Zustand
