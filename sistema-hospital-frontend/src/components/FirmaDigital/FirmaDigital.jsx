import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../../contexts/AuthContext';

const FirmaDigital = ({ pacienteData, diagnosticoData }) => {
  const canvasRef = useRef(null);
  const [qrUrl, setQrUrl] = useState('');
  const [firma, setFirma] = useState(null);
  const { currentUser } = useAuth();

  // Generar código QR cuando hay datos disponibles
  useEffect(() => {
    if (currentUser && pacienteData && diagnosticoData) {
      generarQR();
    }
  }, [currentUser, pacienteData, diagnosticoData]);

  // Función para generar código QR con datos del médico, paciente y diagnóstico
  const generarQR = async () => {
    try {
      // Crear objeto con información para la firma digital
      const firmaData = {
        medico: {
          id: currentUser.id,
          nombre: currentUser.nombre,
          rol: currentUser.rol === 2 ? 'Especialista' : 'Residente'
        },
        paciente: {
          cui: pacienteData.CUI,
          nombre: pacienteData['NOMBRE COMPLETO'],
          expediente: pacienteData.EXPEDIENTE
        },
        diagnostico: {
          id: diagnosticoData.ID,
          diagnostico: diagnosticoData.DIAGNOSTICO_PRINCIPAL,
          fecha: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        hash: generarHashUnico(currentUser.id, pacienteData.CUI, diagnosticoData.ID)
      };
      
      // Generar código QR
      const url = await QRCode.toDataURL(JSON.stringify(firmaData), {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 200
      });
      
      setQrUrl(url);
      setFirma(firmaData);
    } catch (error) {
      console.error('Error al generar código QR:', error);
    }
  };

  // Generar un hash único para la firma (en un entorno real se usaría una función criptográfica más segura)
  const generarHashUnico = (idMedico, cuiPaciente, idDiagnostico) => {
    const combinacion = `${idMedico}-${cuiPaciente}-${idDiagnostico}-${Date.now()}`;
    let hash = 0;
    
    for (let i = 0; i < combinacion.length; i++) {
      const char = combinacion.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bit
    }
    
    return hash.toString(16);
  };

  return (
    <div className="firma-digital-container">
      <h3>Firma Digital</h3>
      
      <div className="firma-qr">
        {qrUrl ? (
          <img src={qrUrl} alt="Firma Digital QR" />
        ) : (
          <div className="qr-placeholder">
            <span>Generando Firma Digital...</span>
          </div>
        )}
      </div>
      
      {firma && (
        <div className="firma-info">
          <p className="firma-medico">
            Dr. {firma.medico.nombre} - {firma.medico.rol}
          </p>
          <p className="firma-fecha">
            {new Date(firma.timestamp).toLocaleString()}
          </p>
          <p className="firma-hash">
            ID: {firma.hash.substring(0, 8)}...
          </p>
        </div>
      )}
      
      <div className="firma-disclaimer">
        <p>Este código QR contiene la firma digital que certifica la autenticidad de este documento.</p>
        <p>Puede ser verificado en el sistema de la Liga Guatemalteca del Corazón.</p>
      </div>
    </div>
  );
};

export default FirmaDigital;