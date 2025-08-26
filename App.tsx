import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Switch,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface ArduinoStatus {
  wifiConnected: boolean;
  ledFrenteDireita: boolean;
  ledFrenteEsquerda: boolean;
  ledFreio: boolean;
  ledTrasDireita: boolean;
  ledTrasEsquerda: boolean;
}

export default function App() {
  const [arduinoIP, setArduinoIP] = useState('192.168.1.100'); // IP padrão
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<ArduinoStatus>({
    wifiConnected: false,
    ledFrenteDireita: false,
    ledFrenteEsquerda: false,
    ledFreio: false,
    ledTrasDireita: false,
    ledTrasEsquerda: false,
  });
  const [autoMode, setAutoMode] = useState(false);

  // Função para enviar comandos ao Arduino
  const sendCommand = async (command: string) => {
    try {
      const response = await axios.get(`http://${arduinoIP}/${command}`, {
        timeout: 3000
      });
      
      if (response.status === 200) {
        console.log(`Comando ${command} enviado com sucesso`);
        await getStatus(); // Atualiza o status após enviar comando
      }
    } catch (error) {
      console.error('Erro ao enviar comando:', error);
      Alert.alert('Erro', 'Falha ao enviar comando para o Arduino');
      setIsConnected(false);
    }
  };

  // Função para obter status do Arduino
  const getStatus = async () => {
    try {
      const response = await axios.get(`http://${arduinoIP}/status`, {
        timeout: 3000
      });
      
      if (response.status === 200) {
        setStatus(response.data);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Erro ao obter status:', error);
      setIsConnected(false);
    }
  };

  // Função para testar conexão
  const testConnection = async () => {
    try {
      const response = await axios.get(`http://${arduinoIP}/ping`, {
        timeout: 3000
      });
      
      if (response.status === 200) {
        setIsConnected(true);
        Alert.alert('Sucesso', 'Conectado ao Arduino!');
        await getStatus();
      }
    } catch (error) {
      setIsConnected(false);
      Alert.alert('Erro', 'Não foi possível conectar ao Arduino. Verifique o IP.');
    }
  };

  // Atualiza status periodicamente
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(getStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [isConnected, arduinoIP]);

  // Função para movimentos
  const moveForward = () => sendCommand('forward');
  const moveBackward = () => sendCommand('backward');
  const turnLeft = () => sendCommand('left');
  const turnRight = () => sendCommand('right');
  const stopMovement = () => sendCommand('stop');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="car-sport" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Controle Arduino</Text>
          <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
        </View>

        {/* Configuração de IP */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuração</Text>
          <View style={styles.ipContainer}>
            <TextInput
              style={styles.ipInput}
              value={arduinoIP}
              onChangeText={setArduinoIP}
              placeholder="IP do Arduino"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.connectButton} onPress={testConnection}>
              <Ionicons name="wifi" size={20} color="#fff" />
              <Text style={styles.buttonText}>Conectar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status LEDs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status dos LEDs</Text>
          <View style={styles.ledGrid}>
            <View style={styles.ledRow}>
              <View style={[styles.ledIndicator, { backgroundColor: status.ledFrenteEsquerda ? '#4CAF50' : '#666' }]}>
                <Text style={styles.ledText}>Frente Esq</Text>
              </View>
              <View style={[styles.ledIndicator, { backgroundColor: status.ledFreio ? '#FF9800' : '#666' }]}>
                <Text style={styles.ledText}>Freio</Text>
              </View>
              <View style={[styles.ledIndicator, { backgroundColor: status.ledFrenteDireita ? '#4CAF50' : '#666' }]}>
                <Text style={styles.ledText}>Frente Dir</Text>
              </View>
            </View>
            <View style={styles.ledRow}>
              <View style={[styles.ledIndicator, { backgroundColor: status.ledTrasEsquerda ? '#F44336' : '#666' }]}>
                <Text style={styles.ledText}>Trás Esq</Text>
              </View>
              <View style={[styles.ledIndicator, { backgroundColor: status.wifiConnected ? '#2196F3' : '#666' }]}>
                <Text style={styles.ledText}>WiFi</Text>
              </View>
              <View style={[styles.ledIndicator, { backgroundColor: status.ledTrasDireita ? '#F44336' : '#666' }]}>
                <Text style={styles.ledText}>Trás Dir</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Controles de Movimento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controles</Text>
          
          {/* Botão Frente */}
          <TouchableOpacity 
            style={[styles.moveButton, styles.forwardButton]}
            onPress={moveForward}
            disabled={!isConnected}
          >
            <Ionicons name="chevron-up" size={40} color="#fff" />
            <Text style={styles.moveButtonText}>FRENTE</Text>
          </TouchableOpacity>

          {/* Botões Parar e Trás */}
          <View style={styles.controlRow}>
            <TouchableOpacity 
              style={[styles.moveButton, styles.leftButton]}
              onPress={turnLeft}
              disabled={!isConnected}
            >
              <Ionicons name="chevron-back" size={30} color="#fff" />
              <Text style={styles.moveButtonText}>ESQUERDA</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.moveButton, styles.stopButton]}
              onPress={stopMovement}
              disabled={!isConnected}
            >
              <Ionicons name="stop" size={30} color="#fff" />
              <Text style={styles.moveButtonText}>PARAR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.moveButton, styles.rightButton]}
              onPress={turnRight}
              disabled={!isConnected}
            >
              <Ionicons name="chevron-forward" size={30} color="#fff" />
              <Text style={styles.moveButtonText}>DIREITA</Text>
            </TouchableOpacity>
          </View>

          {/* Botão Trás */}
          <TouchableOpacity 
            style={[styles.moveButton, styles.backwardButton]}
            onPress={moveBackward}
            disabled={!isConnected}
          >
            <Ionicons name="chevron-down" size={40} color="#fff" />
            <Text style={styles.moveButtonText}>TRÁS</Text>
          </TouchableOpacity>
        </View>

        {/* Modo Automático */}
        <View style={styles.section}>
          <View style={styles.autoModeContainer}>
            <Text style={styles.sectionTitle}>Modo Automático</Text>
            <Switch
              value={autoMode}
              onValueChange={setAutoMode}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={autoMode ? '#f5dd4b' : '#f4f3f4'}
              disabled={!isConnected}
            />
          </View>
          <Text style={styles.autoModeDescription}>
            Ativa o modo automático do Arduino (frente → parar → trás → parar)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    marginRight: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  section: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  ipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ipInput: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 16,
  },
  connectButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  ledGrid: {
    alignItems: 'center',
  },
  ledRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  ledIndicator: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  ledText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  moveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 15,
    marginVertical: 5,
    minHeight: 80,
  },
  forwardButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#FF9800',
    flex: 1,
    marginHorizontal: 5,
  },
  leftButton: {
    backgroundColor: '#9C27B0',
    flex: 1,
    marginRight: 5,
  },
  rightButton: {
    backgroundColor: '#9C27B0',
    flex: 1,
    marginLeft: 5,
  },
  backwardButton: {
    backgroundColor: '#F44336',
  },
  moveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  autoModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  autoModeDescription: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
