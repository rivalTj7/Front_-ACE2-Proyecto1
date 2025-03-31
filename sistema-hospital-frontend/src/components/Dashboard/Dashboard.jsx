import React, { useState, useEffect } from 'react';
import { mqttService } from '../../services/mqttService';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [mqttConnected, setMqttConnected] = useState(false);
  const [ecgData, setEcgData] = useState([]);
  const [oxigenData, setOxigenData] = useState([]);

  // Conectar a MQTT al cargar el componente
  useEffect(() => {
    const conectarMQTT = async () => {
      try {
        await mqttService.connect();
        setMqttConnected(true);
        
        // Suscribirse a topics
        const unsubscribeECG = mqttService.subscribe('sensores/ecg', (mensaje) => {
          setEcgData(prevData => {
            const newData = [...prevData, mensaje];
            if (newData.length > 50) { // Mantener solo los últimos 50 puntos
              return newData.slice(-50);
            }
            return newData;
          });
        });
        
        const unsubscribeOxigeno = mqttService.subscribe('sensores/oxigeno', (mensaje) => {
          setOxigenData(prevData => {
            const newData = [...prevData, mensaje];
            if (newData.length > 50) { // Mantener solo los últimos 50 puntos
              return newData.slice(-50);
            }
            return newData;
          });
        });
        
        return () => {
          // Limpiar al desmontar
          unsubscribeECG();
          unsubscribeOxigeno();
          mqttService.disconnect();
        };
      } catch (error) {
        console.error('Error al conectar con MQTT:', error);
        setMqttConnected(false);
      }
    };
    
    conectarMQTT();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Dashboard de Monitoreo</h2>
      
      <div className="connection-status">
        <span className={`status-indicator ${mqttConnected ? 'connected' : 'disconnected'}`}></span>
        <span className="status-text">
          {mqttConnected ? 'Conectado al sistema de monitoreo' : 'Desconectado del sistema de monitoreo'}
        </span>
      </div>
      
      <div className="dashboard-content">
        <p>Bienvenido al sistema de monitoreo hospitalario, {currentUser?.nombre}.</p>
        <p>Aquí se mostrarán los datos de monitoreo en tiempo real.</p>
        
        {/* Los gráficos se implementarán en una fase posterior */}
        <div className="placeholder-charts">
          <div className="placeholder-chart">
            <h3>ECG</h3>
            <div className="chart-placeholder">
              <p>Datos recibidos: {ecgData.length}</p>
            </div>
          </div>
          
          <div className="placeholder-chart">
            <h3>Oxigenación</h3>
            <div className="chart-placeholder">
              <p>Datos recibidos: {oxigenData.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;