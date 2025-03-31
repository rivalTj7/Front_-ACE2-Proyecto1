import mqtt from 'mqtt';

export class MqttService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
  }

  connect(brokerUrl = 'ws://localhost:8083/mqtt') {
    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(brokerUrl);
      
      this.client.on('connect', () => {
        console.log('Conectado al broker MQTT');
        resolve();
      });
      
      this.client.on('error', (err) => {
        console.error('Error de conexión MQTT:', err);
        reject(err);
      });
      
      this.client.on('message', (topic, message) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          
          if (this.subscriptions[topic]) {
            this.subscriptions[topic].forEach(callback => callback(parsedMessage));
          }
        } catch (e) {
          console.error('Error al procesar mensaje MQTT:', e);
        }
      });
    });
  }

  subscribe(topic, callback) {
    if (!this.client) {
      throw new Error('Cliente MQTT no inicializado');
    }
    
    this.client.subscribe(topic);
    
    if (!this.subscriptions[topic]) {
      this.subscriptions[topic] = [];
    }
    
    this.subscriptions[topic].push(callback);
    
    return () => {
      this.subscriptions[topic] = this.subscriptions[topic].filter(cb => cb !== callback);
      
      if (this.subscriptions[topic].length === 0) {
        this.client.unsubscribe(topic);
        delete this.subscriptions[topic];
      }
    };
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.subscriptions = {};
    }
  }
}

export const mqttService = new MqttService();