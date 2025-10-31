# 🔧 Como Configurar o Supabase - Guia Rápido

## ⚠️ Problema: "column wallet_address does not exist"

Este erro ocorre quando há conflitos ou tabelas parciais. A nova migration resolve isso.

## 📋 Solução: Migration Corrigida

A migration `003_c2b_transactions.sql` agora usa `DROP TABLE IF EXISTS CASCADE` para evitar conflitos.

## 🚀 Passo a Passo

### 1. Acesse o SQL Editor do Supabase

1. Vá para seu projeto no Supabase
2. Clique em **SQL Editor** no menu lateral
3. Clique em **New query**

### 2. Cole e Execute a Migration

Copie o conteúdo completo de:
- `backend/db/migrations/003_c2b_transactions.sql`

Cole no editor e clique em **Run**.

### 3. Verifique se Funcionou

Você deve ver:
- ✅ "Success. No rows returned"
- Sem erros
- Tabelas criadas

Para verificar:
1. Vá para **Table Editor**
2. Você deve ver 3 novas tabelas:
   - `energy_transactions`
   - `wallet_earnings`
   - `claims`

### 4. Configure Environment Variables

No arquivo `dashboard/.env.local`:

```env
# Supabase - Público
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (anon key)

# Supabase - Service (SECRETO!)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc... (service_role key)
```

### 5. Reinicie o Servidor

```bash
# Pare o servidor (Ctrl+C)
cd dashboard
npm run dev
```

### 6. Teste

1. Abra http://localhost:3000/transactions
2. Conecte Phantom Wallet
3. O console deve parar de mostrar erros
4. Faça uma venda de teste

## 🔍 Troubleshooting

### Erro: "relation already exists"

**Solução:** A migration usa `DROP TABLE IF EXISTS`, então pode reexecutar sem problema.

### Erro: "Invalid API key"

**Causa:** Supabase não configurado  
**Solução:** Configure as variáveis de ambiente

### Erro: "permission denied"

**Causa:** RLS ativo  
**Solução:** A migration desabilita RLS automaticamente

## ✅ Checklist

- [ ] Migration executada com sucesso
- [ ] 3 tabelas criadas
- [ ] Variáveis de ambiente configuradas
- [ ] Servidor reiniciado
- [ ] Sem erros no console
- [ ] Transação de teste funcionando

---

**Pronto!** O sistema agora está completamente funcional com Supabase! 🎉

