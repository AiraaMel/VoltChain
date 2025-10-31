# 🔧 Como Configurar o Supabase

## ⚠️ Status Atual

O sistema está rodando perfeitamente, mas mostra erros de "Invalid API key" porque o Supabase ainda não foi configurado.

**Isso é esperado!** As transações on-chain funcionam normalmente no Phantom, mas o histórico no banco de dados requer configuração.

## 📋 Passo a Passo

### 1. Criar Conta no Supabase

1. Vá para https://supabase.com
2. Clique em "Start your project"
3. Crie uma conta ou faça login com GitHub

### 2. Criar Novo Projeto

1. Clique em "New Project"
2. Preencha:
   - **Name:** VoltChain (ou qualquer nome)
   - **Database Password:** Crie uma senha forte (salve ela!)
   - **Region:** Escolha a mais próxima (ex: South America)
3. Clique em "Create new project"
4. Aguarde ~2 minutos para provisioning

### 3. Obter Credenciais

1. No dashboard do Supabase, vá para **Settings → API**
2. Copie as seguintes informações:

```
Project URL: https://xxxxxxxxx.supabase.co
anon/public key: eyJhbGc...
service_role key: eyJhbGc...
```

⚠️ **IMPORTANTE:** A `service_role` key é secreta! Nunca exponha no frontend.

### 4. Criar as Tabelas

1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Abra o arquivo `backend/db/migrations/003_c2b_transactions.sql`
4. Copie todo o conteúdo SQL
5. Cole no editor do Supabase
6. Clique em "Run" (ou Cmd/Ctrl + Enter)

Verifique se foi criado com sucesso - você deve ver mensagens de "success".

### 5. Configurar Environment Variables

**No arquivo `dashboard/.env.local`:**

```env
# Solana
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_NETWORK=devnet

# Market Wallet (opcional)
NEXT_PUBLIC_MARKET_PUBKEY=sua_wallet_devnet

# Supabase - Público (safe para expor no frontend)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Supabase - Service (SECRETO! Server-side only)
SUPABASE_URL=https://seu-projeto-id.supabase.co
SUPABASE_SERVICE_KEY=sua-service-role-key-aqui

# Preços
PRICE_PER_KWH_USD=0.38
```

### 6. Reiniciar o Servidor

Após configurar as variáveis de ambiente:

```bash
# Pare o servidor (Ctrl+C no terminal do dashboard)
# Depois inicie novamente:
cd dashboard
npm run dev
```

### 7. Verificar

1. Abra http://localhost:3000/transactions
2. Conecte sua Phantom Wallet (Devnet)
3. Deve aparecer:
   - ✅ Balance: $0.00 (sem histórico ainda)
   - ✅ Sem erros no console
   - ✅ Interface funcionando

## 🧪 Testar o Fluxo Completo

### Passo 1: Obter SOL Devnet

```bash
# Se você tem Solana CLI instalado:
solana airdrop 2 SUA_WALLET_ADDRESS --url https://api.devnet.solana.com

# Ou use o faucet web:
# https://faucet.solana.com
```

### Passo 2: Enviar uma Venda

1. Na página `/transactions`
2. Digite `10` kWh
3. Clique "Send Sale"
4. Aprove na Phantom
5. Aguarde confirmação

**O que deve acontecer:**
- ✅ Phantom assina a transação
- ✅ Transação confirmada on-chain
- ✅ Balance aumenta para $3.80
- ✅ Histórico aparece na tabela
- ✅ Transação visível no Solana Explorer

### Passo 3: Verificar no Supabase

1. Vá para o dashboard do Supabase
2. Vá para **Table Editor**
3. Clique na tabela `energy_transactions`
4. Você deve ver sua transação lá!

### Passo 4: Fazer Claim

1. Clique "Claim Earnings"
2. Aprove na Phantom
3. Aguarde confirmação

**O que deve acontecer:**
- ✅ Balance volta para $0.00
- ✅ Claim aparece no histórico
- ✅ Registrado no Supabase

## 🔍 Troubleshooting

### Erro: "Invalid API key"

**Causa:** Supabase não configurado  
**Solução:** Siga os passos 1-6 acima

### Erro: "Table does not exist"

**Causa:** Migration SQL não executada  
**Solução:** Execute `003_c2b_transactions.sql` no SQL Editor

### Erro: "Cannot read property 'available_to_claim'"

**Causa:** Tabela vazia  
**Solução:** Faça uma primeira venda - o sistema criará o registro automaticamente

### Transação não aparece no banco

**Causa:** Service role key incorreta  
**Solução:** Verifique se `SUPABASE_SERVICE_KEY` está correto no `.env.local`

### Dashboard não carrega dados

**Causa:** Anon key incorreta  
**Solução:** Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto

## 📊 Estrutura do Banco de Dados

Após criar as tabelas, você terá:

```
energy_transactions
├── id (UUID)
├── wallet_address (TEXT)
├── kwh (NUMERIC)
├── price_per_kwh (NUMERIC)
├── total_usd (NUMERIC)
├── tx_signature (TEXT)
├── tx_status (pending/confirmed/failed)
└── created_at, confirmed_at

wallet_earnings
├── wallet_address (TEXT, PK)
├── available_to_claim (NUMERIC)
├── total_earned (NUMERIC)
└── updated_at

claims
├── id (UUID)
├── wallet_address (TEXT)
├── amount (NUMERIC)
├── claim_tx_signature (TEXT)
├── status (pending/confirmed/failed)
└── requested_at, completed_at
```

## ✅ Checklist Final

- [ ] Conta Supabase criada
- [ ] Projeto criado
- [ ] Migration SQL executada
- [ ] Credentials copiadas
- [ ] `.env.local` configurado
- [ ] Servidor reiniciado
- [ ] Phantom conectado
- [ ] SOL Devnet obtido
- [ ] Primeira venda testada
- [ ] Dados aparecendo no Supabase

## 🎉 Pronto!

Uma vez configurado, o sistema funcionará completamente:

- ✅ Transações on-chain (Phantom)
- ✅ Histórico no banco (Supabase)
- ✅ Balance atualizado
- ✅ Tudo sincronizado

---

**Precisa de ajuda?** Abra um issue ou consulte a documentação do Supabase.

