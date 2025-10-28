# VoltChain IoT

Implementações para dispositivos IoT que coletam dados de energia e enviam para a plataforma VoltChain.

## Status Atual

🚧 **Em desenvolvimento** - Esta pasta será implementada futuramente

## Dispositivos Suportados

### ESP32 (Principal)
- **Microcontrolador**: ESP32-S3 ou ESP32-C3
- **Conectividade**: WiFi integrado
- **Sensores**: Medidores de energia, tensão, corrente
- **Protocolo**: HTTP POST com autenticação HMAC

### Outros Microcontroladores
- **Arduino**: Com módulo WiFi
- **Raspberry Pi**: Para protótipos avançados
- **STM32**: Para aplicações industriais

## Protocolo de Comunicação

### Autenticação HMAC
```cpp
// Exemplo de implementação em C++
String message = deviceId + "." + timestamp + "." + tsDevice + "." + energyKwh;
String signature = hmacSha256(deviceSecret, message);
```

### Headers HTTP
```cpp
http.addHeader("x-device-id", deviceId);
http.addHeader("x-timestamp", timestamp);
http.addHeader("x-signature", signature);
http.addHeader("Content-Type", "application/json");
```

### Payload JSON
```json
{
  "ts_device": "2024-01-01T12:00:00Z",
  "energy_generated_kwh": 1.5,
  "voltage_v": 220.0,
  "current_a": 6.8,
  "frequency_hz": 60.0
}
```

## Estrutura Planejada

```
iot/
├── esp32/                    # Código para ESP32
│   ├── src/
│   │   ├── main.cpp         # Programa principal
│   │   ├── sensors/         # Leitura de sensores
│   │   ├── wifi/            # Configuração WiFi
│   │   ├── crypto/          # Implementação HMAC
│   │   └── api/             # Comunicação com backend
│   ├── lib/                 # Bibliotecas externas
│   ├── platformio.ini       # Configuração PlatformIO
│   └── README.md
├── arduino/                  # Código para Arduino
├── raspberry-pi/            # Scripts Python para RPi
├── stm32/                   # Código para STM32
├── schematics/              # Diagramas elétricos
├── 3d-models/               # Modelos para impressão 3D
└── docs/                    # Documentação técnica
```

## Sensores e Medições

### Medidor de Energia
- **ACS712**: Sensor de corrente AC
- **ZMPT101B**: Transformador de tensão
- **PZEM-004T**: Medidor de energia completo

### Parâmetros Medidos
- **Energia Gerada**: kWh (kilowatt-hora)
- **Tensão**: V (volts)
- **Corrente**: A (amperes)
- **Frequência**: Hz (hertz)

### Calibração
- Fatores de correção para cada sensor
- Validação de leituras
- Filtros para ruído elétrico

## Configuração de Dispositivos

### WiFi
```cpp
// Configuração via web interface
const char* ssid = "Sua_Rede_WiFi";
const char* password = "sua_senha";
```

### Backend
```cpp
// Endpoint do backend
const char* serverUrl = "http://localhost:8080/v1/ingest";
```

### Credenciais
```cpp
// Device ID e secret (gerados no backend)
const char* deviceId = "uuid-do-dispositivo";
const char* deviceSecret = "chave-secreta-base64";
```

## Exemplo de Código ESP32

### Estrutura Básica
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

void setup() {
  Serial.begin(115200);
  setupWiFi();
  setupSensors();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    EnergyReading reading = readEnergyData();
    sendToBackend(reading);
  }
  delay(30000); // Enviar a cada 30 segundos
}
```

### Leitura de Sensores
```cpp
EnergyReading readEnergyData() {
  EnergyReading reading;
  reading.timestamp = getCurrentTimestamp();
  reading.voltage = readVoltage();
  reading.current = readCurrent();
  reading.frequency = readFrequency();
  reading.energy = calculateEnergy(reading.voltage, reading.current);
  return reading;
}
```

## Segurança

### Autenticação
- **HMAC-SHA256**: Assinatura de todas as mensagens
- **Timestamp**: Validação de janela temporal (30s)
- **Device Secret**: Chave única por dispositivo

### Proteção de Dados
- **TLS/HTTPS**: Comunicação criptografada
- **Validação**: Verificação de integridade
- **Rate Limiting**: Controle de frequência de envio

## Monitoramento e Debug

### Logs
- Serial output para debug
- LED status para indicadores visuais
- Web interface para configuração

### Telemetria
- Status de conexão
- Qualidade do sinal WiFi
- Erros de comunicação
- Estatísticas de envio

## Próximos Passos

1. [ ] Implementar código base para ESP32
2. [ ] Criar biblioteca de sensores
3. [ ] Implementar protocolo HMAC
4. [ ] Desenvolver interface de configuração
5. [ ] Criar documentação de hardware
6. [ ] Implementar OTA updates
7. [ ] Adicionar suporte a outros microcontroladores
8. [ ] Criar testes automatizados
9. [ ] Desenvolver ferramentas de calibração
