# VoltChain Backend MVP

Backend minimalista para a plataforma VoltChain, implementando coleta de dados de energia e integração com blockchain Solana.

## Stack

- **Node.js 20+** com TypeScript
- **Express** para API REST
- **Supabase** como banco de dados
- **Solana Web3.js** para integração blockchain
- **Pino** para logging estruturado

## Instalação

```bash
cd backend
npm install
```

## Configuração

1. Copie o arquivo de exemplo:
```bash
cp env.example .env
```

2. Configure as variáveis de ambiente no `.env`:

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

## Banco de Dados

Execute a migration para criar as tabelas:

```bash
# Via Supabase CLI
supabase db push

# Ou via psql
psql -f db/migrations/001_init.sql
```

## Scripts

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Migrations
npm run migrate

# Testes
npm test
```

## Endpoints

### Health Check
- `GET /healthz` - Status da aplicação

### Dispositivos
- `POST /v1/devices` - Criar dispositivo (admin)
- `GET /v1/devices/:id/readings` - Listar leituras (admin)

### Ingestão de Dados
- `POST /v1/ingest` - Enviar leitura de energia (HMAC)

### Blockchain
- `POST /v1/onchain/flush` - Enviar leituras pendentes (admin)

## Protocolo HMAC

### Headers Obrigatórios
- `x-device-id`: ID do dispositivo
- `x-timestamp`: Timestamp em milissegundos
- `x-signature`: Assinatura HMAC-SHA256 em base64url

### Payload
```json
{
  "ts_device": "2024-01-01T12:00:00Z",
  "energy_generated_kwh": 1.5,
  "voltage_v": 220.0,
  "current_a": 6.8,
  "frequency_hz": 60.0
}
```

### Assinatura
Mensagem: `${device_id}.${timestamp_ms}.${ts_device}.${energy_generated_kwh}`
Assinatura: `base64url(HMAC_SHA256(device_secret, mensagem))`

## Exemplo de Uso

### 1. Criar Dispositivo
```bash
curl -X POST http://localhost:8080/v1/devices \
  -H "Authorization: Bearer dev-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Painel Solar 1", "location": {"lat": -23.5, "lng": -46.6}}'
```

### 2. Enviar Leitura
```bash
# Calcular assinatura (exemplo em JavaScript)
const deviceId = "device-uuid";
const timestamp = Date.now().toString();
const tsDevice = "2024-01-01T12:00:00Z";
const energy = 1.5;
const message = `${deviceId}.${timestamp}.${tsDevice}.${energy}`;
const signature = hmacSign(deviceSecret, message);

curl -X POST http://localhost:8080/v1/ingest \
  -H "x-device-id: device-uuid" \
  -H "x-timestamp: 1704110400000" \
  -H "x-signature: assinatura_base64url" \
  -H "Content-Type: application/json" \
  -d '{"ts_device": "2024-01-01T12:00:00Z", "energy_generated_kwh": 1.5}'
```

### 3. Enviar para Blockchain
```bash
curl -X POST http://localhost:8080/v1/onchain/flush \
  -H "Authorization: Bearer dev-admin-token"
```

## Estrutura do Projeto

```
backend/
├── src/
│   ├── routes/          # Endpoints da API
│   ├── services/        # Supabase e Solana
│   ├── utils/           # Utilitários (crypto)
│   └── server.ts        # Servidor principal
├── db/
│   └── migrations/      # Scripts SQL
├── package.json
├── tsconfig.json
└── README.md
```

## Próximos Passos

- [ ] Implementar testes automatizados
- [ ] Adicionar validação com Zod
- [ ] Implementar rate limiting
- [ ] Adicionar CORS e Helmet
- [ ] Melhorar tratamento de erros
- [ ] Implementar fila para processamento assíncrono
