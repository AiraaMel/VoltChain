# VoltChain Energy Platform

Plataforma completa para monitoramento e gestão de energia renovável com integração blockchain.

## 🏗️ Arquitetura do Monorepo

```
voltchain-platform/
├── backend/          # API REST MVP (Node.js + TypeScript)
├── onchain/          # Programa Solana (Anchor Framework)
├── frontend/         # Interface Web (React + Next.js)
└── iot/             # Dispositivos IoT (ESP32 + Arduino)
```

## 🚀 Status do Projeto

| Componente | Status | Descrição |
|------------|--------|-----------|
| **Backend** | ✅ **Implementado** | API MVP com Express, Supabase e Solana |
| **On-chain** | 🚧 **Planejado** | Programa Anchor para Solana |
| **Frontend** | 🚧 **Planejado** | Interface React/Next.js |
| **IoT** | 🚧 **Planejado** | Dispositivos ESP32/Arduino |

## 🎯 Funcionalidades Implementadas

### Backend MVP
- ✅ **API REST** com Express e TypeScript
- ✅ **Banco de Dados** Supabase (PostgreSQL)
- ✅ **Autenticação HMAC** para dispositivos IoT
- ✅ **Integração Solana** (opcional)
- ✅ **Endpoints** para dispositivos, leituras e blockchain
- ✅ **Logging** estruturado com Pino

### Endpoints Disponíveis
- `GET /healthz` - Health check
- `POST /v1/devices` - Criar dispositivo (admin)
- `POST /v1/ingest` - Enviar leitura (HMAC)
- `GET /v1/devices/:id/readings` - Listar leituras (admin)
- `POST /v1/onchain/flush` - Sincronizar blockchain (admin)

## 🛠️ Tecnologias

### Backend
- **Node.js 20+** com TypeScript
- **Express** para API REST
- **Supabase** como banco de dados
- **Solana Web3.js** para blockchain
- **Pino** para logging

### Planejado
- **Anchor Framework** para programa Solana
- **React 18+** com Next.js para frontend
- **ESP32/Arduino** para dispositivos IoT

## 🚀 Quick Start

### 1. Backend (Implementado)

```bash
cd backend
npm install
cp env.example .env
# Configure as variáveis de ambiente
npm run dev
```

### 2. Banco de Dados

```bash
# Execute a migration
supabase db push
# ou
psql -f backend/db/migrations/001_init.sql
```

### 3. Teste da API

```bash
# Health check
curl http://localhost:8080/healthz

# Criar dispositivo
curl -X POST http://localhost:8080/v1/devices \
  -H "Authorization: Bearer dev-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Painel Solar 1"}'
```

## 📋 Próximos Passos

### Backend
- [ ] Implementar testes automatizados
- [ ] Adicionar validação com Zod
- [ ] Implementar rate limiting
- [ ] Melhorar tratamento de erros

### On-chain
- [ ] Configurar ambiente Anchor
- [ ] Implementar programa Solana
- [ ] Criar IDL para integração
- [ ] Deploy em devnet

### Frontend
- [ ] Configurar Next.js com TypeScript
- [ ] Implementar dashboard principal
- [ ] Integrar com backend API
- [ ] Adicionar integração Solana

### IoT
- [ ] Implementar código ESP32
- [ ] Criar biblioteca de sensores
- [ ] Implementar protocolo HMAC
- [ ] Desenvolver interface de configuração

## 🔧 Configuração

### Variáveis de Ambiente (Backend)

```env
# Servidor
PORT=8080

# Supabase (obrigatório)
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico

# Blockchain (opcional)
ONCHAIN_ENABLED=false
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=SeuProgramId1111111111111111111111111111111
SOLANA_WALLET_SECRET=[array JSON ou base58]

# Admin (opcional)
ADMIN_TOKEN=dev-admin-token
```

## 📚 Documentação

- [Backend README](backend/README.md) - API e configuração
- [On-chain README](onchain/README.md) - Programa Solana
- [Frontend README](frontend/README.md) - Interface web
- [IoT README](iot/README.md) - Dispositivos IoT

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:
- Abra uma [issue](https://github.com/voltage/energy-platform/issues)
- Consulte a documentação de cada componente
- Verifique os logs do backend para debugging

---

**VoltChain** - Energia renovável na blockchain 🌱⚡