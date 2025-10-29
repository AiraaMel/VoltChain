# Sales & Pricing Page - VoltChain Dashboard

## 📋 Overview

A página Sales & Pricing foi implementada seguindo o design system VoltChain, mantendo consistência visual e funcional com o dashboard principal e a página de produção.

## 🎯 Features Implementadas

### ✅ Estrutura Geral
- Layout consistente (sidebar + topbar + conteúdo principal)
- Breadcrumb dinâmico: Home / Sales
- Título: "Sales & Pricing"
- Subtítulo: "Track your energy sales and market pricing trends"

### ✅ Cards de Resumo (Grid 4 colunas)
- **Total Revenue**: $1,989.20 — This month
- **Average Price**: $0.38 per kWh — +3.2% from last month
- **Total Sales**: 4,892 kWh — Energy sold this month
- **Profit Margin**: 94.2% — After platform fees

### ✅ Seção Market Insights
- Card com título e subtítulo
- 4 métricas principais:
  - Current Market Price: $0.38 per kWh
  - Price Trend: +3.2% (Last 30 days)
  - Energy Sold: 4,892 kWh (This month)
  - Avg. Sale Price: $0.38 (Your average)
- Ícones apropriados (DollarSign, TrendingUp, Zap, Target)

### ✅ Seção Price Trends e Revenue Breakdown
- **Price Trends**: Gráfico de linha com Recharts (linha azul #0091FF)
- **Revenue Breakdown**: Gráfico de barras com Recharts (barras verdes #4CAF50)
- Dados mockados para 12 meses
- Tooltips interativos
- Design responsivo

### ✅ Seção Sales History
- Tabela completa com histórico de transações
- 5 transações mockadas com dados realistas
- Status colorido (completed em verde)
- Links de transação com ícone external-link
- Design responsivo com scroll horizontal

## 🎨 Style Guide VoltChain

### Cores
- **Primária**: #0091FF
- **Secundária**: #4CAF50
- **Fundo**: #F9FAFB
- **Texto**: #111111
- **Texto secundário**: #6B7280

### Tipografia
- **Fonte**: Inter, sans-serif
- **Títulos**: font-bold
- **Subtítulos**: text-gray-500

### Componentes
- **Cards**: bg-white shadow-sm rounded-2xl p-6
- **Grids**: grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6
- **Dark mode**: Suporte completo com next-themes

## 📁 Estrutura de Arquivos

```
src/
├── app/
│   └── sales/
│       └── page.tsx                    # Página principal
├── components/
│   └── sales/
│       ├── market-insights.tsx         # Métricas de mercado
│       ├── price-trends-chart.tsx      # Gráfico de tendências de preço
│       ├── revenue-breakdown-chart.tsx # Gráfico de receita
│       └── sales-table.tsx             # Tabela de histórico de vendas
```

## 🚀 Como Executar

```bash
cd /home/aira/github/Projects/VoltChain/dashboard
npm run dev
```

Acesse: http://localhost:3000/sales

## 🔧 Componentes Criados

### MarketInsights
- Grid 2x2 com métricas de mercado
- Cards com fundo cinza claro
- Ícones apropriados para cada métrica
- Suporte completo a dark mode

### PriceTrendsChart
- Gráfico de linha com Recharts
- Dados mockados para 12 meses
- Linha azul (#0091FF) com pontos interativos
- Tooltip personalizado

### RevenueBreakdownChart
- Gráfico de barras com Recharts
- Dados mockados para 12 meses
- Barras verdes (#4CAF50) com bordas arredondadas
- Tooltip personalizado

### SalesTable
- Tabela responsiva com scroll horizontal
- 5 transações mockadas
- Status colorido (completed)
- Links de transação com ícone external-link
- Hover effects

## 🎯 Próximos Passos

1. **Integração com API**: Conectar com backend VoltChain
2. **Dados Reais**: Substituir mock data por dados reais
3. **Filtros Avançados**: Adicionar filtros por período
4. **Exportação**: Funcionalidade de exportar relatórios
5. **Notificações**: Alertas de novas vendas

## 📱 Responsividade

- **Desktop**: Layout completo com 4 colunas
- **Tablet**: Grid adaptativo (2 colunas)
- **Mobile**: Layout em coluna única
- **Dark Mode**: Suporte completo

## 🔗 Navegação

- Sidebar atualizada com link para `/sales`
- Breadcrumb dinâmico no topbar
- Navegação consistente com dashboard principal

## 📊 Dados Mockados

### Métricas de Resumo
- Total Revenue: $1,989.20
- Average Price: $0.38 per kWh
- Total Sales: 4,892 kWh
- Profit Margin: 94.2%

### Dados de Gráficos
- Price Trends: 12 meses de dados (Jan-Dec)
- Revenue Breakdown: 12 meses de receita
- Sales History: 5 transações recentes

## 🎨 Componentes Reutilizáveis

- MetricCard (reutilizado do dashboard)
- Cards com design consistente
- Gráficos com Recharts
- Tabela responsiva
- Ícones da lucide-react
