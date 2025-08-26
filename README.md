# Controle Arduino - React Native App

Este projeto é uma interface mobile desenvolvida em React Native com Expo e TypeScript para controlar um carrinho Arduino via Wi-Fi.

## 🚗 Funcionalidades

- **Controle de Movimento**: Frente, trás, esquerda, direita e parar
- **Lógica de Direção**: Sistema de joystick com LEDs direcionais
- **Status em Tempo Real**: Visualização do status dos LEDs do carrinho
- **Monitoramento Wi-Fi**: Indicador de conexão Wi-Fi do Arduino
- **Modo Automático**: Sequência automática com todos os movimentos
- **Interface Intuitiva**: Design moderno e responsivo

## 📱 Capturas de Tela

### Interface Principal
- Configuração de IP do Arduino
- Status dos LEDs em tempo real
- Controles de movimento
- Modo automático

## 🛠 Tecnologias Utilizadas

### App Mobile
- **React Native** com Expo
- **TypeScript**
- **Axios** para comunicação HTTP
- **Expo Vector Icons** para ícones

### Arduino
- **ESP32** ou similar com Wi-Fi
- **Servidor Web** integrado
- **ArduinoJson** para API REST

## 🚀 Como Usar

### 1. Configuração do Arduino

1. Abra o arquivo `arduino_code/carrinho_wifi_server.ino` no Arduino IDE
2. Instale as bibliotecas necessárias:
   - `WiFi` (já incluída no ESP32)
   - `WebServer` (já incluída no ESP32)
   - `ArduinoJson` (instale pela biblioteca do Arduino IDE)

3. Configure sua rede Wi-Fi no código:
   ```cpp
   const char* ssid = "SUA_REDE_WIFI";
   const char* password = "SUA_SENHA_WIFI";
   ```

4. Conecte os LEDs nos pinos conforme definido:
   - LED Frente Direita: Pino 19
   - LED Frente Esquerda: Pino 27 (atualizado)
   - LED Freio: Pino 22
   - LED Trás Direita: Pino 33
   - LED Trás Esquerda: Pino 23
   - LED Wi-Fi Conectado: Pino 26
   - LED Wi-Fi Desconectado: Pino 25

5. Faça o upload do código para o Arduino

### 2. Executando o App

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o projeto:
   ```bash
   npm start
   ```

3. Use o Expo Go para escanear o QR code e testar no seu celular

### 3. Conectando ao Arduino

1. Abra o app no seu celular
2. No Monitor Serial do Arduino, encontre o IP atribuído (ex: 192.168.1.100)
3. Digite este IP no campo "IP do Arduino" no app
4. Toque em "Conectar"
5. Se conectado com sucesso, você verá o indicador verde no header

## 📡 API Endpoints do Arduino

O Arduino expõe os seguintes endpoints HTTP:

- `GET /forward` - Move o carrinho para frente
- `GET /backward` - Move o carrinho para trás
- `GET /left` - Vira o carrinho para a esquerda
- `GET /right` - Vira o carrinho para a direita
- `GET /stop` - Para o movimento do carrinho
- `GET /status` - Retorna o status atual dos LEDs
- `GET /ping` - Testa a conexão
- `GET /auto/on` - Ativa o modo automático
- `GET /auto/off` - Desativa o modo automático

### Exemplo de Resposta do Status

```json
{
  "wifiConnected": true,
  "ledFrenteDireita": false,
  "ledFrenteEsquerda": false,
  "ledFreio": true,
  "ledTrasDireita": false,
  "ledTrasEsquerda": false,
  "autoMode": false,
  "ip": "192.168.1.100"
}
```

## 🔧 Configuração de Rede

### Opção 1: Conectar à sua rede Wi-Fi existente
- Configure o SSID e senha da sua rede no código Arduino
- O Arduino receberá um IP da sua rede
- Use este IP no app para se conectar

### Opção 2: Criar um hotspot no Arduino (Modo AP)
Para implementar modo Access Point, modifique o código Arduino:

```cpp
// Em vez de WiFi.begin(), use:
WiFi.softAP("Arduino-Car", "12345678");
IPAddress IP = WiFi.softAPIP();
```

## 🎮 Como Usar os Controles

1. **Frente**: Toque no botão verde com seta para cima
2. **Esquerda**: Toque no botão roxo com seta para esquerda
3. **Parar**: Toque no botão laranja com ícone de stop
4. **Direita**: Toque no botão roxo com seta para direita
5. **Trás**: Toque no botão vermelho com seta para baixo
6. **Modo Automático**: Use o switch para ativar/desativar

## 🎯 Lógica de Direção (Joystick)

### Virar à Direita:
- Acende: LED frente direita + LED trás esquerda
- Apaga: LED frente esquerda + LED trás direita + LED freio

### Virar à Esquerda:
- Acende: LED frente esquerda + LED trás direita  
- Apaga: LED frente direita + LED trás esquerda + LED freio

## 🔍 Indicadores Visuais

### Status dos LEDs

- **Verde**: LEDs da frente (direita/esquerda)
- **Laranja**: LED de freio
- **Vermelho**: LEDs de trás (direita/esquerda)
- **Azul**: Status Wi-Fi conectado

### Conexão
- **Indicador Verde**: Conectado ao Arduino
- **Indicador Vermelho**: Desconectado

## 🐛 Solução de Problemas

### Arduino não conecta ao Wi-Fi
- Verifique SSID e senha
- Certifique-se que a rede é 2.4GHz (ESP32 não suporta 5GHz)
- Reinicie o Arduino

### App não conecta ao Arduino
- Verifique se o IP está correto
- Certifique-se que o celular está na mesma rede do Arduino
- Teste o endpoint diretamente no navegador: `http://IP_DO_ARDUINO/ping`

### LEDs não acendem
- Verifique as conexões dos pinos
- Teste com LEDs simples primeiro
- Verifique se os pinos estão corretos no código

## 🔄 Próximas Melhorias

- [ ] Controle de velocidade (PWM)
- [ ] Integração com sensores (distância, temperatura)
- [ ] Modo de patrulhamento automático
- [ ] Gravação de trajetos
- [ ] Câmera ao vivo
- [ ] Controle por joystick virtual

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e pessoais.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests

## 📞 Suporte

Se encontrar problemas ou tiver dúvidas, abra uma issue no repositório do projeto.
