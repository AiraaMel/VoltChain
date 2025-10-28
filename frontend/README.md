# VoltChain Frontend

Interface web para a plataforma VoltChain.

## Status Atual

🚧 **Em desenvolvimento** - Esta pasta será implementada futuramente

## Tecnologias Planejadas

### Stack Principal
- **React 18+** com TypeScript
- **Next.js 14+** para SSR/SSG
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes

### Integração
- **@solana/wallet-adapter** para carteiras
- **@supabase/supabase-js** para dados
- **Chart.js** ou **Recharts** para gráficos
- **React Query** para cache de dados

## Funcionalidades Planejadas

### Dashboard Principal
- **Visão Geral**: Estatísticas de energia gerada
- **Gráficos**: Consumo e geração ao longo do tempo
- **Mapa**: Localização dos dispositivos
- **Status**: Estado dos dispositivos conectados

### Gestão de Dispositivos
- **Cadastro**: Adicionar novos dispositivos
- **Configuração**: Parâmetros e localização
- **Monitoramento**: Status em tempo real
- **Histórico**: Leituras e eventos

### Blockchain Integration
- **Carteira**: Conectar carteira Solana
- **Transações**: Visualizar transações on-chain
- **Recompensas**: Tokens ganhos por geração
- **Governança**: Participar em votações

### Perfil do Usuário
- **Configurações**: Preferências e notificações
- **Relatórios**: Exportar dados
- **API Keys**: Gerenciar chaves de acesso
- **Histórico**: Atividade e transações

## Estrutura Planejada

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── hooks/          # Custom hooks
│   ├── services/       # API e integrações
│   ├── utils/          # Utilitários
│   └── styles/         # Estilos globais
├── public/             # Assets estáticos
├── next.config.js      # Configuração Next.js
├── tailwind.config.js  # Configuração Tailwind
└── package.json
```

## Design System

### Cores
- **Primária**: Verde energia (#10B981)
- **Secundária**: Azul tecnologia (#3B82F6)
- **Neutras**: Cinza escala (#F9FAFB → #111827)

### Componentes
- Cards de estatísticas
- Gráficos interativos
- Tabelas de dados
- Formulários responsivos
- Modais e notificações

## Integração com Backend

### API Endpoints
- `GET /healthz` - Status do sistema
- `POST /v1/devices` - Gerenciar dispositivos
- `GET /v1/devices/:id/readings` - Leituras
- `POST /v1/onchain/flush` - Sincronizar blockchain

### Autenticação
- **Admin Token**: Para operações administrativas
- **HMAC**: Para dispositivos IoT
- **Wallet**: Para operações blockchain

## Próximos Passos

1. [ ] Configurar Next.js com TypeScript
2. [ ] Implementar design system
3. [ ] Criar componentes base
4. [ ] Integrar com backend API
5. [ ] Implementar dashboard principal
6. [ ] Adicionar integração Solana
7. [ ] Implementar responsividade
8. [ ] Adicionar testes
9. [ ] Deploy e CI/CD
