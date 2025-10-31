# 🚀 Integração Anchor + Phantom Wallet

Este documento explica como usar a integração Anchor/Phantom implementada no VoltChain Dashboard.

## 📋 Arquivos Criados

### 1. `src/utils/anchorClient.ts`
Cliente principal para interação com o programa Solana via Anchor:

- **`simulateWithPhantom()`**: Simula transações sem enviar
- **`sendWithPhantom()`**: Envia transações reais para devnet
- **Funções auxiliares**: PDAs (Pool, UserPosition, UserClaim, Sale)

### 2. `src/components/wallet/anchor-test-panel.tsx`
Painel de teste com botões para simular e enviar transações

### 3. `src/app/wallet/page.tsx`
Página Wallet atualizada com o painel de teste

## 🎯 Instruções Instruções

### Pré-requisitos

1. **Phantom Wallet** instalada no navegador
2. **Conta em Devnet** configurada na Phantom
3. **Tokens SOL** na devnet (pegar no faucet)

### Como Usar

1. Acesse: `http://localhost:3000/wallet`
2. Role até o painel **"Anchor Integration Test"**
3. Escolha uma operação:
   - **Register User**: Registrar novo usuário no programa
   - **Energy Report**: Reportar produção de energia

4. Clique nos botões:
   - **Simulate**: Testa sem enviar (veja logs no console)
   - **Send**: Envia transação real (abre modal Phantom)

## 📊 Exemplo de Uso Programático

### Simular Registro de Usuário

```typescript
import { simulateWithPhantom, getUserPositionAddress } from '@/utils/anchorClient';
import { PublicKey } from '@solana/web3.js';

// Conectar à Phantom
const wallet = window.solana;
await wallet.connect();

const userPubkey = wallet.publicKey;

// Simular
await simulateWithPhantom(
  "register_user",
  [],
  {
    userPosition: await getUserPositionAddress(userPubkey),
    owner: userPubkey,
    systemProgram: new PublicKey("11111111111111111111111111111111"),
  }
);
```

### Enviar Relatório de Energia

```typescript
import { sendWithPhantom, getPoolAddress, getUserPositionAddress } from '@/utils/anchorClient';

const wallet = window.solana;
await wallet.connect();

const userPubkey = wallet.publicKey;

// Enviar (abre modal Phantom para assinar)
const txSig = await sendWithPhantom(
  "energy_report",
  [1000000], // 1 kWh em micro kWh (1_000_000)
  {
    pool: await getPoolAddress(),
    userPosition: await getUserPositionAddress(userPubkey),
    owner: userPubkey,
  }
);

console.log("Transaction:", txSig);
```

## 🔧 Instruções Disponíveis

### 1. `register_user`
Registra um novo usuário no programa.

**Argumentos**: Nenhum

**Contas**:
- `userPosition`: PDA do usuário
- `owner`: PublicKey do usuário (signer)
- `systemProgram`: System Program

### 2. `energy_report`
Reporta energia gerada.

**Argumentos**: 
- `delta_kwh_micro` (u64): Energia em micro kWh

**Contas**:
- `pool`: PDA da pool
- `userPosition`: PDA do usuário
- `owner`: PublicKey do usuário (signer)

### 3. `record_sale`
Registra uma venda.

**Argumentos**:
- `kwh_sold_micro` (u64)
- `revenue_brl_cents` (u64)
- `fee_bps` (u16)

**Contas**:
- `pool`: PDA da pool
- `sale`: PDA da sale
- `authority`: Autoridade (signer)
- `systemProgram`: System Program

### 4. `burn_and_mark`
Queima tokens e marca para claim.

**Argumentos**:
- `sale_id` (u64)
- `kwh_to_burn_micro` (u64)

**Contas**:
- `pool`: PDA da pool
- `userPosition`: PDA do usuário
- `userClaim`: PDA da claim
- `owner`: PublicKey do usuário (signer)
- `systemProgram`: System Program

### 5. `finalize_sale`
Finaliza uma venda.

**Argumentos**:
- `sale_id` (u64)

**Contas**:
- `pool`: PDA da pool
- `sale`: PDA da sale
- `authority`: Autoridade (signer)

## 🎨 Funções Auxiliares PDAs

### getPoolAddress()
```typescript
const poolAddress = await getPoolAddress();
```

### getUserPositionAddress(owner: PublicKey)
```typescript
const userPos = await getUserPositionAddress(userPubkey);
```

### getUserClaimAddress(owner: PublicKey, saleId: number)
```typescript
const userClaim = await getUserClaimAddress(userPubkey, 1);
```

### getSaleAddress(poolPeriod: number)
```typescript
const sale = await getSaleAddress(period);
```

## 🐛 Debugging

### Ver Logs
1. Abra DevTools (F12)
2. Vá para a aba **Console**
3. Execute uma simulação
4. Veja os logs detalhados:
   - ✅ Conexão com Phantom
   - 📋 Programa carregado
   - 📊 Resultado da simulação
   - 📈 Unidades de Computação
   - 💰 Taxa estimada
   - 📝 Logs do programa

### Erros Comuns

#### "Phantom não está disponível"
- Instale a extensão Phantom Wallet
- Atualize a página

#### "User position not found"
- Execute `register_user` primeiro

#### "Insufficient funds"
- Peça SOL no faucet da devnet
- URL: https://faucet.solana.com/

#### "Pool not initialized"
- Execute `initialize_pool` primeiro (requer authority)

## 📚 Recursos

- **IDL**: `src/lib/idl.json`
- **Program ID**: `718k7JFp8Tf56eMTpTJMqmwNxME738nh48bXCiCm1BrR`
- **Network**: Devnet (`https://api.devnet.solana.com`)
- **Explorer**: https://solscan.io/?cluster=devnet

## 🔐 Segurança

⚠️ **Importante**: Este código é para desenvolvimento. Em produção:
- Valide todas as entradas
- Adicione tratamento de erros robusto
- Use confirmation antes de enviar
- Implemente rate limiting
- Armazene logs apropriados

## 📝 Próximos Passos

1. Adicionar mais instruções de teste
2. Implementar tratamento de erros do programa
3. Adicionar confirmação visual de transações
4. Integrar com histórico de transações
5. Criar fluxo completo de produção → venda → claim

