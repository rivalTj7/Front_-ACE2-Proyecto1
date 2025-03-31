import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RFIDLogin = () => {
  const [rfidInput, setRfidInput] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const { login, error } = useAuth();
  const navigate = useNavigate();

  // Simular lectura de RFID con entrada manual por ahora
  const handleRFIDSubmit = async (e) => {
    e.preventDefault();
    
    if (!rfidInput.trim()) {
      setStatus('error');
      return;
    }
    
    setStatus('loading');
    
    try {
      const userData = await login(parseInt(rfidInput));
      setStatus('success');
      
      // Redirigir según el rol
      if (userData.ROL === 2 || userData.ROL === 1) { // Especialista o Residente
        navigate('/dashboard');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error("Error en login:", err);
      setStatus('error');
    }
  };

  // Temporizador para cambiar estado de alerta
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="rfid-login-container">
      <div className="rfid-login-card">
        <h2>Sistema de Monitoreo Hospitalario</h2>
        <p>Acceso con Tarjeta RFID</p>
        
        {status === 'error' && (
          <div className="alert alert-danger">
            {error || 'Error de autenticación. Por favor, intente nuevamente.'}
          </div>
        )}
        
        {status === 'success' && (
          <div className="alert alert-success">
            Autenticación exitosa. Redirigiendo...
          </div>
        )}
        
        <form onSubmit={handleRFIDSubmit}>
          <div className="form-group">
            <label htmlFor="rfidInput">ID de Tarjeta RFID:</label>
            <input
              type="text"
              id="rfidInput"
              className="form-control"
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value)}
              placeholder="Ingrese ID de RFID manualmente"
              disabled={status === 'loading'}
            />
            <small className="form-text text-muted">
              En un entorno real, este campo sería completado automáticamente al escanear la tarjeta RFID.
            </small>
          </div>
          
          <button 
            type="submit" 
            className={`btn btn-primary ${status === 'loading' ? 'loading' : ''}`}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Verificando...' : 'Acceder'}
          </button>
        </form>
        
        <div className="rfid-instruction">
          <p>Acerque su tarjeta RFID al lector para acceder al sistema</p>
        </div>
      </div>
    </div>
  );
};

export default RFIDLogin;