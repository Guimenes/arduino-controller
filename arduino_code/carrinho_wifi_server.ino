#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// Substitua com o nome e a senha da sua rede Wi-Fi
const char* ssid = "Control";
const char* password = "12345678";

// Criar servidor web na porta 80
WebServer server(80);

// Definição dos pinos para os LEDs
const int ledFrenteDireita = 19;
const int ledFrenteEsquerda = 27;
const int ledFreio = 22;
const int ledTrasDireita = 33;
const int ledTrasEsquerda = 23;

// LEDs de status Wi-Fi
const int ledWifiConectado = 26;
const int ledWifiDesconectado = 25;

// Variáveis de controle
bool modoAutomatico = false;
unsigned long ultimoMovimento = 0;
int estadoMovimento = 0; // 0=frente, 1=parar, 2=trás, 3=parar, 4=direita, 5=parar, 6=esquerda, 7=parar

void setup() {
  // Inicia a comunicação serial
  Serial.begin(115200);
  delay(100);

  // Configura todos os pinos como saídas
  pinMode(ledFrenteDireita, OUTPUT);
  pinMode(ledFrenteEsquerda, OUTPUT);
  pinMode(ledFreio, OUTPUT);
  pinMode(ledTrasDireita, OUTPUT);
  pinMode(ledTrasEsquerda, OUTPUT);
  pinMode(ledWifiConectado, OUTPUT);
  pinMode(ledWifiDesconectado, OUTPUT);

  // Garante estado inicial
  digitalWrite(ledWifiConectado, LOW);
  digitalWrite(ledWifiDesconectado, HIGH);
  parar();

  // Exibe a mensagem inicial
  Serial.println();
  Serial.println("Conectando ao Wi-Fi...");
  Serial.print("SSID: ");
  Serial.println(ssid);

  // Inicia a conexão
  WiFi.begin(ssid, password);

  // Espera a conexão ser estabelecida
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Se a conexão for bem-sucedida, exibe as informações
  Serial.println("");
  Serial.println("Wi-Fi conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());

  // Atualiza LEDs de status
  digitalWrite(ledWifiConectado, HIGH);
  digitalWrite(ledWifiDesconectado, LOW);

  // Configurar rotas do servidor web
  setupRoutes();

  // Iniciar servidor
  server.begin();
  Serial.println("Servidor HTTP iniciado");
  Serial.println("Endpoints disponíveis:");
  Serial.println("GET /forward - Mover para frente");
  Serial.println("GET /backward - Mover para trás");
  Serial.println("GET /left - Virar para esquerda");
  Serial.println("GET /right - Virar para direita");
  Serial.println("GET /stop - Parar movimento");
  Serial.println("GET /status - Obter status dos LEDs");
  Serial.println("GET /ping - Testar conexão");
  Serial.println("GET /auto/on - Ativar modo automático");
  Serial.println("GET /auto/off - Desativar modo automático");
}

void setupRoutes() {
  // Rota para mover para frente
  server.on("/forward", HTTP_GET, []() {
    irParaFrente();
    modoAutomatico = false;
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", "{\"status\":\"moving_forward\"}");
    Serial.println("Comando recebido: Frente");
  });

  // Rota para mover para trás
  server.on("/backward", HTTP_GET, []() {
    irParaTras();
    modoAutomatico = false;
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", "{\"status\":\"moving_backward\"}");
    Serial.println("Comando recebido: Trás");
  });

  // Rota para virar à direita
  server.on("/right", HTTP_GET, []() {
    virarDireita();
    modoAutomatico = false;
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", "{\"status\":\"turning_right\"}");
    Serial.println("Comando recebido: Direita");
  });

  // Rota para virar à esquerda
  server.on("/left", HTTP_GET, []() {
    virarEsquerda();
    modoAutomatico = false;
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", "{\"status\":\"turning_left\"}");
    Serial.println("Comando recebido: Esquerda");
  });

  // Rota para parar
  server.on("/stop", HTTP_GET, []() {
    parar();
    modoAutomatico = false;
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", "{\"status\":\"stopped\"}");
    Serial.println("Comando recebido: Parar");
  });

  // Rota para obter status
  server.on("/status", HTTP_GET, []() {
    String json = getStatusJson();
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", json);
  });

  // Rota para ping (teste de conexão)
  server.on("/ping", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", "{\"status\":\"pong\"}");
  });

  // Rota para ativar modo automático
  server.on("/auto/on", HTTP_GET, []() {
    modoAutomatico = true;
    estadoMovimento = 0;
    ultimoMovimento = millis();
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", "{\"auto_mode\":true}");
    Serial.println("Modo automático ativado");
  });

  // Rota para desativar modo automático
  server.on("/auto/off", HTTP_GET, []() {
    modoAutomatico = false;
    parar();
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", "{\"auto_mode\":false}");
    Serial.println("Modo automático desativado");
  });

  // Rota 404
  server.onNotFound([]() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(404, "application/json", "{\"error\":\"endpoint_not_found\"}");
  });
}

String getStatusJson() {
  DynamicJsonDocument doc(512);
  
  doc["wifiConnected"] = (WiFi.status() == WL_CONNECTED);
  doc["ledFrenteDireita"] = digitalRead(ledFrenteDireita);
  doc["ledFrenteEsquerda"] = digitalRead(ledFrenteEsquerda);
  doc["ledFreio"] = digitalRead(ledFreio);
  doc["ledTrasDireita"] = digitalRead(ledTrasDireita);
  doc["ledTrasEsquerda"] = digitalRead(ledTrasEsquerda);
  doc["autoMode"] = modoAutomatico;
  doc["ip"] = WiFi.localIP().toString();
  
  String output;
  serializeJson(doc, output);
  return output;
}

// Função para simular o movimento para frente
void irParaFrente() {
  digitalWrite(ledFrenteDireita, HIGH);
  digitalWrite(ledFrenteEsquerda, HIGH);
  digitalWrite(ledFreio, LOW);
  digitalWrite(ledTrasDireita, LOW);
  digitalWrite(ledTrasEsquerda, LOW);
}

// Função para simular o movimento para trás
void irParaTras() {
  digitalWrite(ledFrenteDireita, LOW);
  digitalWrite(ledFrenteEsquerda, LOW);
  digitalWrite(ledFreio, LOW);
  digitalWrite(ledTrasDireita, HIGH);
  digitalWrite(ledTrasEsquerda, HIGH);
}

// Função para simular o carrinho parado
void parar() {
  digitalWrite(ledFrenteDireita, LOW);
  digitalWrite(ledFrenteEsquerda, LOW);
  digitalWrite(ledFreio, HIGH); // Acende o LED de freio
  digitalWrite(ledTrasDireita, LOW);
  digitalWrite(ledTrasEsquerda, LOW);
}

// Função para virar à direita
void virarDireita() {
  digitalWrite(ledFrenteDireita, HIGH);  // Acende frente direita
  digitalWrite(ledFrenteEsquerda, LOW);  // Apaga frente esquerda
  digitalWrite(ledFreio, LOW);           // Apaga freio
  digitalWrite(ledTrasDireita, LOW);     // Apaga trás direita
  digitalWrite(ledTrasEsquerda, HIGH);   // Acende trás esquerda
}

// Função para virar à esquerda
void virarEsquerda() {
  digitalWrite(ledFrenteDireita, LOW);   // Apaga frente direita
  digitalWrite(ledFrenteEsquerda, HIGH); // Acende frente esquerda
  digitalWrite(ledFreio, LOW);           // Apaga freio
  digitalWrite(ledTrasDireita, HIGH);    // Acende trás direita
  digitalWrite(ledTrasEsquerda, LOW);    // Apaga trás esquerda
}

void executarModoAutomatico() {
  unsigned long agora = millis();
  
  if (agora - ultimoMovimento >= 2000) { // Muda estado a cada 2 segundos
    switch (estadoMovimento) {
      case 0: // Frente
        irParaFrente();
        estadoMovimento = 1;
        Serial.println("Auto: Movendo para frente");
        break;
      case 1: // Parar após frente
        parar();
        estadoMovimento = 2;
        Serial.println("Auto: Parado");
        break;
      case 2: // Trás
        irParaTras();
        estadoMovimento = 3;
        Serial.println("Auto: Movendo para trás");
        break;
      case 3: // Parar após trás
        parar();
        estadoMovimento = 4;
        Serial.println("Auto: Parado");
        break;
      case 4: // Direita
        virarDireita();
        estadoMovimento = 5;
        Serial.println("Auto: Virando à direita");
        break;
      case 5: // Parar após direita
        parar();
        estadoMovimento = 6;
        Serial.println("Auto: Parado");
        break;
      case 6: // Esquerda
        virarEsquerda();
        estadoMovimento = 7;
        Serial.println("Auto: Virando à esquerda");
        break;
      case 7: // Parar após esquerda
        parar();
        estadoMovimento = 0;
        Serial.println("Auto: Parado");
        break;
    }
    ultimoMovimento = agora;
  }
}

void loop() {
  // Processa requisições HTTP
  server.handleClient();

  // Monitora conexão Wi-Fi em tempo real
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(ledWifiConectado, HIGH);
    digitalWrite(ledWifiDesconectado, LOW);
  } else {
    digitalWrite(ledWifiConectado, LOW);
    digitalWrite(ledWifiDesconectado, HIGH);
  }

  // Executa modo automático se ativado
  if (modoAutomatico) {
    executarModoAutomatico();
  }

  delay(10); // Pequeno delay para não sobrecarregar o processador
}
