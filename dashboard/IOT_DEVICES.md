# IoT Devices Page - VoltChain Dashboard

## 📋 Overview

A página IoT Devices foi implementada seguindo o design system VoltChain, mantendo consistência visual e funcional com o dashboard principal e as outras páginas.

## 🎯 Features Implementadas

### ✅ Estrutura Geral
- Layout consistente (sidebar + topbar + conteúdo principal)
- Breadcrumb dinâmico: Home / Devices
- Título: "IoT Devices"
- Subtítulo: "Manage and monitor your energy production devices"

### ✅ Cards de Resumo (Grid 4 colunas)
- **Total Devices**: 3 — Connected devices ⚙️
- **Active Devices**: 3 — Currently producing ⚡
- **Offline Devices**: 0 — Not responding ⚠️
- **System Health**: 100% — All systems operational ✅

### ✅ Botão Add Device
- Botão verde escuro no topo direito
- Abre modal para adicionar novo dispositivo
- Ícone Plus da lucide-react

### ✅ Modal: Add New IoT Device
- Formulário completo com campos:
  - Device Name (input)
  - Device Type (select: Solar, Wind, Hydro, Battery)
  - Device ID (input)
  - API Key (input)
  - Location (input)
  - Capacity (input number com sufixo kWh)
- Botões: Cancel (cinza) e Add Device (verde escuro)
- Validação de campos obrigatórios

### ✅ Lista de Dispositivos
- 3 dispositivos mockados:
  - **Solar Panel Array A**: Rooftop - North, 1847/2000 kWh, 92.35% efficiency
  - **Solar Panel Array B**: Rooftop - South, 1923/2000 kWh, 96.15% efficiency
  - **Wind Turbine Unit 1**: Ground Level, 1464/1800 kWh, 81.33% efficiency

### ✅ Cards de Dispositivos
- Ícones diferenciados por tipo (Sun, Wind, Cpu)
- Status badges coloridos (active, offline, maintenance)
- Barras de progresso animadas
- Informações detalhadas (Device ID, Efficiency, Last Sync)
- Menu de opções (ellipsis-vertical)

### ✅ Seção Device Configuration
- Card lateral direito com configurações globais
- Toggles para Auto-sync e Real-time monitoring
- Dropdowns para Sync Frequency e Data Retention
- Campo API Endpoint
- Botão Save Configuration

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
│   └── iot/
│       └── page.tsx                    # Página principal
├── components/
│   ├── ui/
│   │   ├── dialog.tsx                  # Modal dialog
│   │   ├── switch.tsx                  # Toggle switch
│   │   ├── select.tsx                  # Dropdown select
│   │   ├── input.tsx                   # Input field
│   │   └── label.tsx                   # Form label
│   └── iot/
│       ├── device-card.tsx             # Card de dispositivo
│       ├── add-device-dialog.tsx       # Modal de adicionar dispositivo
│       └── device-config-card.tsx      # Card de configuração
```

## 🚀 Como Executar

```bash
cd /home/aira/github/Projects/VoltChain/dashboard
npm run dev
```

Acesse: http://localhost:3000/iot

## 🔧 Componentes Criados

### DeviceCard
- Card individual para cada dispositivo IoT
- Ícones diferenciados por tipo de dispositivo
- Status badges coloridos
- Barras de progresso animadas
- Informações detalhadas de produção e eficiência
- Menu de opções no canto superior direito

### AddDeviceDialog
- Modal responsivo com formulário completo
- Validação de campos obrigatórios
- Select para tipo de dispositivo
- Input com sufixo para capacidade
- Botões de ação (Cancel/Add Device)

### DeviceConfigCard
- Configurações globais para todos os dispositivos
- Toggles para Auto-sync e Real-time monitoring
- Dropdowns para frequência e retenção de dados
- Campo de API Endpoint
- Botão de salvar configurações

## 🎯 Próximos Passos

1. **Integração com API**: Conectar com backend VoltChain
2. **Dados Reais**: Substituir mock data por dados reais
3. **Funcionalidade de Adicionar**: Implementar adição real de dispositivos
4. **Configurações**: Salvar configurações no backend
5. **Notificações**: Alertas de status dos dispositivos

## 📱 Responsividade

- **Desktop**: Layout completo com 2 colunas (dispositivos + configuração)
- **Tablet**: Grid adaptativo
- **Mobile**: Layout em coluna única
- **Dark Mode**: Suporte completo

## 🔗 Navegação

- Sidebar atualizada com link para `/iot`
- Breadcrumb dinâmico no topbar
- Navegação consistente com dashboard principal

## 📊 Dados Mockados

### Dispositivos
- **Solar Panel Array A**: 1847/2000 kWh, 92.35% efficiency
- **Solar Panel Array B**: 1923/2000 kWh, 96.15% efficiency
- **Wind Turbine Unit 1**: 1464/1800 kWh, 81.33% efficiency

### Métricas
- Total Devices: 3
- Active Devices: 3
- Offline Devices: 0
- System Health: 100%

## 🎨 Componentes Reutilizáveis

- MetricCard (reutilizado do dashboard)
- Dialog (shadcn/ui)
- Switch (shadcn/ui)
- Select (shadcn/ui)
- Input (shadcn/ui)
- Label (shadcn/ui)
- Button (shadcn/ui)

## 🔧 Dependências Adicionadas

- @radix-ui/react-dialog
- @radix-ui/react-switch
- @radix-ui/react-select
- @radix-ui/react-label
- class-variance-authority

## 🎯 Funcionalidades Futuras

- Integração com APIs de dispositivos IoT
- Monitoramento em tempo real
- Alertas de status
- Configurações avançadas por dispositivo
- Histórico de dados
- Exportação de relatórios
