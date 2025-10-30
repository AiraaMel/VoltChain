# 🔗 Integração Phantom Wallet - Documentação

## 📋 Visão Geral

Este documento descreve a implementação completa da integração com Phantom Wallet no VoltChain Dashboard, incluindo o hook reutilizável e o componente de teste.

## 🗂️ Arquivos Criados/Modificados

### 1. `src/hooks/usePhantomWallet.ts` (NOVO)
Hook React reutilizável para gerenciar conexão com Phantom Wallet.

**Funcionalidades:**
- ✅ Detecta disponibilidade da Phantom Wallet
- ✅ Gerencia estado de conexão
- ✅ Listeners para eventos de connect/disconnect
- ✅ Recupera conexão existente
- ✅ Formata endereço para exibição
- ✅ Validação de contexto seguro (localhost ou HTTPS)

### 2. `src/components/wallet/anchor-test-panel.tsx` (MODIFICADO)
Componente de teste atualizado para usar o hook.

**Melhorias:**
- ✅ Botão "Select Wallet" funcional
- ✅ Exibe status de conexão
- ✅ Mostra endereço abreviado da wallet
- ✅ Botão de desconectar
- ✅ Mensagens de erro amigáveis
- ✅ Validações antes de executar transações

### 3. `src/utils/anchorClient.ts` (MANTIDO)
Cliente Anchor mantido como está (já detecta Phantom corretamente).

## 🚀 Como Usar

### Uso Básico do Hook

```tsx
import { usePhantomWallet } from "@/hooks/usePhantomWallet";

function MyComponent() {
  const {
    publicKey,
    isPhantomAvailable,
    isConnecting,
    isConnected,
    connectWallet,
    disconnectWallet,
    getPublicKey,
    getShortAddress,
  } = usePhantomWallet();

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectWallet}>
          {isConnecting ? "Conectando..." : "Select Wallet"}
        </button>
      ) : (
        <div>
          <p>Conectado: {getShortAddress()}</p>
          <button onClick={disconnectWallet}>Desconectar</button>
        </div>
      )}
    </div>
  );
}
```

### API do Hook

#### Propriedades de Estado

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `publicKey` | `string \| null` | Chave pública da wallet conectada |
| `isPhantomAvailable` | `boolean` | Se Phantom está instalada |
| `isConnecting` | `boolean` | Se está conectando no momento |
| `isConnected` | `boolean` | Se está conectado |
| `getPublicKey()` | `() => PublicKey \| null` | Retorna PublicKey do Solana Web3 |
| `getShortAddress()` | `() => string \| null` | Retorna endereço abreviado (xxxx...yyyy) |
| `connectWallet()` | `() => Promise<void>` | Conecta à Phantom |
| `disconnectWallet()` | `() => Promise<void>` | Desconecta da Phantom |

## 🎯 Fluxo de Uso

### 1. Usuário Acessa a Página
```
✅ Dashboard carrega
✅ Hook detecta se Phantom está disponível
✅ Se já estava conectado, restaura a conexão
```

### 2. Usuário Clica em "Select Wallet"
```
✅ Verifica se Phantom está instalada
✅ Abre modal da Phantom
✅ Usuário aprova conexão
✅ Hook atualiza estado: publicKey, isConnected
✅ Console mostra: "✅ Conectado à Phantom Wallet"
```

### 3. Usuário Testa Transações
```
✅ Botões ficam habilitados
✅ Ao clicar, usa publicKey do hook
✅ Transações funcionam corretamente
✅ Logs aparecem no console
```

### 4. Usuário Desconecta
```
✅ Clica em "Desconectar"
✅ Hook limpa estado
✅ PublicKey volta a null
✅ isConnected = false
```

## 🛠️ Tratamento de Erros

### Erro: "Phantom não está disponível"
**Causa:** Phantom Wallet não instalada

**Solução:** 
```tsx
if (!isPhantomAvailable) {
  // Mostrar botão para instalar
  <a href="https://phantom.app/download">Instalar Phantom</a>
}
```

### Erro: "Conectando..." travado
**Causa:** Usuário rejeitou conexão ou erro na Phantom

**Solução:**
- Hook já trata erro 4001 (usuário rejeitou)
- Mostra alert amigável
- Reset automático do isConnecting

### Erro: "window.solana undefined"
**Causa:** Contexto não seguro ou Phantom não carregada

**Solução:**
- Hook verifica contexto seguro (localhost ou HTTPS)
- Listener aguarda Phantom carregar
- Mensagem clara para o usuário

## 🔒 Segurança

### Validações Implementadas

1. **Contexto Seguro**
   ```tsx
   const isSecureContext = window.location.protocol === "https:" || 
                          window.location.hostname === "localhost";
   ```

2. **Verificação de Phantom**
   ```tsx
   if (!provider || !provider.isPhantom) {
     alert("Phantom Wallet não detectada");
     return;
   }
   ```

3. **Tratamento de Erros**
   ```tsx
   try {
     const resp = await provider.connect();
   } catch (err) {
     // Trata erro 4001 (usuário rejeitou)
     // Trata outros erros
   }
   ```

## 🎨 Componente AnchorTestPanel

### Estados Visuais

#### 1. Phantom Não Instalado
```
┌─────────────────────────────────────┐
│ ⚠️  Phantom não está disponível    │
│     Instalar Phantom Wallet        │
└─────────────────────────────────────┘
```

#### 2. Não Conectado
```
┌─────────────────────────────────────┐
│  [🔌 Select Wallet]                 │
│                                     │
│  ℹ️ Certifique-se de ter Phantom... │
└─────────────────────────────────────┘
```

#### 3. Conectado
```
┌─────────────────────────────────────┐
│ ✅ Conectado à Phantom              │
│    9XzK...b7mN  [Desconectar]      │
│                                     │
│  Register User                      │
│  [Simulate] [Send]                  │
│                                     │
│  Energy Report (1 kWh)              │
│  [Simulate] [Send]                  │
└─────────────────────────────────────┘
```

## 📊 Logs no Console

### Conexão Bem-Sucedida
```
✅ Phantom Wallet detectada
✅ Conectado à Phantom Wallet: 9XzK...b7mN
```

### Conexão Recusada
```
❌ Erro ao conectar Phantom: { code: 4001, message: "User rejected..." }
```

### Simulação de Transação
```
🎲 Iniciando simulação de transação...
📝 Instrução: register_user
📦 Argumentos: []
🏦 Contas: {...}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESULTADO DA SIMULAÇÃO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Erro: Nenhum
📈 Unidades de Computação (CU): 12345
💰 Taxa estimada: 5000
📋 Logs do programa:
  1. Program log: ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Simulação bem-sucedida!
```

## 🧪 Testando

### Passo a Passo

1. **Acessar Dashboard**
   ```
   http://localhost:3000/wallet
   ```

2. **Verificar Phantom**
   - ✅ Se instalada: ver "Select Wallet"
   - ❌ Se não: ver "Phantom não disponível"

3. **Conectar**
   - Clicar em "Select Wallet"
   - Aprovar na Phantom
   - Ver endereço abreviado

4. **Testar Simulação**
   - Clicar "Simulate" em qualquer operação
   - Ver console (F12)
   - Confirmar logs

5. **Testar Envio** (Opcional)
   - Clicar "Send"
   - Assinar na Phantom
   - Ver signature no console

### Checklist de Validação

- [ ] Phantom detectada corretamente
- [ ] Botão "Select Wallet" aparece quando não conectado
- [ ] Modal Phantom abre ao clicar
- [ ] Endereço aparece após conectar
- [ ] Botão "Desconectar" funciona
- [ ] Simulações executam sem erro
- [ ] Logs aparecem no console
- [ ] Mensagens de erro são amigáveis

## 🚀 Próximos Passos

### Melhorias Possíveis

1. **Persistência de Conexão**
   ```tsx
   // Salvar em localStorage
   localStorage.setItem("phantom_connected", publicKey);
   ```

2. **Múltiplas Wallets**
   ```tsx
   // Suportar múltiplas carteiras
   const wallets = await getWallets();
   ```

3. **Network Switching**
   ```tsx
   // Trocar entre devnet/mainnet
   await provider.switchNetwork("devnet");
   ```

4. **Balance Display**
   ```tsx
   // Mostrar SOL balance
   const balance = await connection.getBalance(publicKey);
   ```

## 📚 Recursos

- **Phantom Docs**: https://docs.phantom.app/
- **Anchor Docs**: https://www.anchor-lang.com/docs
- **Solana Web3**: https://solana-labs.github.io/solana-web3.js/

## 🐛 Troubleshooting

### Problema: Botão não aparece
**Solução:** Verificar se está em `http://localhost:3000` ou HTTPS

### Problema: Conexão trava
**Solução:** Limpar cache do navegador e recarregar

### Problema: Erro "window.solana undefined"
**Solução:** Aguardar Phantom carregar ou recarregar página

### Problema: Transações falham
**Solução:** Verificar se está em Devnet e tem SOL suficiente

## ✅ Conclusão

A integração está completa e funcional. O hook `usePhantomWallet` pode ser reutilizado em qualquer componente do dashboard para facilitar conexão com Phantom Wallet.

