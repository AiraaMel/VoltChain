# VoltChain Dashboard

Dashboard moderno para o projeto VoltChain, construído com Next.js, TypeScript, TailwindCSS e shadcn/ui.

## 🚀 Funcionalidades

- **Layout Responsivo**: Sidebar fixa com navegação e topbar com controles
- **Dashboard Completo**: Métricas de energia, preços e ganhos
- **Gráficos Interativos**: Visualização de produção de energia com Recharts
- **Modo Escuro**: Suporte completo a tema claro/escuro
- **Componentes Modernos**: Interface limpa com shadcn/ui
- **Dados Mockados**: Pronto para integração com backend

## 📦 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos
- **Lucide React** - Ícones
- **next-themes** - Gerenciamento de tema

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build de produção
npm start
```

## 🎨 Componentes

### Estrutura Principal
- `Sidebar` - Navegação lateral com nova logo VoltChain (gradiente verde)
- `Topbar` - Barra superior com controles e avatar
- `MetricCard` - Cards de métricas com variações
- `OverviewChart` - Gráfico de produção de energia
- `ClaimCard` - Card de ganhos disponíveis para saque

### Páginas
- `/` - Dashboard principal
- `/energy` - Produção de energia
- `/sales` - Vendas e preços
- `/wallet` - Carteira e ganhos
- `/devices` - Dispositivos IoT

## 🎯 Funcionalidades do Dashboard

### Métricas Principais
- **Total Energy Produced**: 5,234 kWh (+12.5%)
- **Average Price**: $0.38 per kWh (+3.2%)
- **Total Earnings**: $1,989.20 (+8.7%)
- **Active Devices**: 3 dispositivos IoT conectados

### Visualizações
- Gráfico de linha da produção mensal de energia
- Card de ganhos disponíveis para saque ($1,247.85 USDC)

## 🔧 Configuração

O projeto está configurado com:
- Tema padrão: claro
- Cores: Paleta oficial VoltChain (#043915, #4C763B, #B0CE88, #FFFD8F)
- Logo: Nova identidade visual com gradiente verde
- Responsividade: Desktop e tablet
- Dados: Mockados para demonstração

## 🚀 Próximos Passos

1. Integração com backend VoltChain
2. Conexão com blockchain Solana
3. Dados reais de dispositivos IoT
4. Sistema de autenticação
5. Notificações em tempo real

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar e grid
- **Tablet**: Layout adaptado com navegação otimizada
- **Mobile**: Em desenvolvimento

## 🎨 Design System

- **Cores**: Paleta oficial VoltChain (verde escuro, médio, claro e amarelo)
- **Logo**: Nova identidade visual com gradiente verde e amarelo
- **Tipografia**: Inter (Google Fonts)
- **Bordas**: rounded-2xl para cards
- **Sombras**: Leves e sutis
- **Ícones**: Lucide React

---

Desenvolvido para o projeto VoltChain - Plataforma de Tokenização de Energia