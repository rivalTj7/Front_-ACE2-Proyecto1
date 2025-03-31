import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePacientes } from '../../contexts/PacientesContext';
import { useAuth } from '../../contexts/AuthContext';
import { diagnosticosService } from '../../services/diagnosticosService';
import { pdfService } from '../../services/pdfService';

const DetallePaciente = () => {
  const { cui } = useParams();
  const navigate = useNavigate();
  const { seleccionarPaciente, pacienteSeleccionado } = usePacientes();
  const { currentUser, isEspecialista } = useAuth();
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Cargar datos del paciente si no está en contexto
        if (!pacienteSeleccionado || pacienteSeleccionado.CUI !== cui) {
          seleccionarPaciente(cui);
        }
        
        // Cargar diagnósticos del paciente
        const datosDiagnosticos = await diagnosticosService.obtenerDiagnosticos(cui);
        setDiagnosticos(datosDiagnosticos);
      } catch (err) {
        console.error('Error al cargar datos del paciente:', err);
        setError('No se pudieron cargar los datos del paciente.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [cui, pacienteSeleccionado, seleccionarPaciente]);

  const handleGenerarHistorial = async () => {
    try {
      if (!pacienteSeleccionado || diagnosticos.length === 0) {
        return;
      }
      
      const pdfBlob = await pdfService.generarHistorialMedico(pacienteSeleccionado, diagnosticos);
      
      // Crear URL y descargar
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historial_medico_${pacienteSeleccionado.CUI}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('No se pudo generar el historial médico.');
    }
  };

  const handleNuevoDiagnostico = () => {
    navigate(`/diagnosticos/nuevo/${cui}`);
  };

  if (loading) {
    return <div className="loading-spinner">Cargando información del paciente...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!pacienteSeleccionado) {
    return <div className="error-message">Paciente no encontrado</div>;
  }

  return (
    <div className="detalle-paciente-container">
      <div className="header-actions">
        <h2>Información del Paciente</h2>
        <div className="action-buttons">
          <button 
            className="btn-historial" 
            onClick={handleGenerarHistorial}
          >
            Generar Historial PDF
          </button>
          
          {isEspecialista() && !pacienteSeleccionado.ALTA && (
            <button 
              className="btn-diagnostico" 
              onClick={handleNuevoDiagnostico}
            >
              Nuevo Diagnóstico
            </button>
          )}
        </div>
      </div>

      <div className="patient-header">
        <div className="patient-photo">
          {pacienteSeleccionado.FOTOGRAFIA ? (
            <img 
              src={pacienteSeleccionado.FOTOGRAFIA} 
              alt={pacienteSeleccionado['NOMBRE COMPLETO']} 
            />
          ) : (
            <div className="placeholder-photo">
              {pacienteSeleccionado['NOMBRE COMPLETO'][0]}
            </div>
          )}
        </div>
        
        <div className="patient-summary">
          <h3>{pacienteSeleccionado['NOMBRE COMPLETO']}</h3>
          <p><strong>CUI:</strong> {pacienteSeleccionado.CUI}</p>
          <p><strong>Edad:</strong> {pacienteSeleccionado.EDAD} años</p>
          <p><strong>Estado:</strong> 
            <span className={pacienteSeleccionado.ALTA ? 'alta' : 'tratamiento'}>
              {pacienteSeleccionado.ALTA ? 'Alta médica' : 'En tratamiento'}
            </span>
          </p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`} 
          onClick={() => setActiveTab('info')}
        >
          Información General
        </button>
        <button 
          className={`tab ${activeTab === 'diagnosticos' ? 'active' : ''}`} 
          onClick={() => setActiveTab('diagnosticos')}
        >
          Historial de Diagnósticos
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="info-tab">
            <div className="info-section">
              <h4>Datos de Identificación</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Nombre Completo:</span>
                  <span className="value">{pacienteSeleccionado['NOMBRE COMPLETO']}</span>
                </div>
                <div className="info-item">
                  <span className="label">CUI:</span>
                  <span className="value">{pacienteSeleccionado.CUI}</span>
                </div>
                <div className="info-item">
                  <span className="label">Edad:</span>
                  <span className="value">{pacienteSeleccionado.EDAD} años</span>
                </div>
                <div className="info-item">
                  <span className="label">Sexo:</span>
                  <span className="value">{pacienteSeleccionado.SEXO}</span>
                </div>
                <div className="info-item">
                  <span className="label">Teléfono:</span>
                  <span className="value">{pacienteSeleccionado.TELEFONO}</span>
                </div>
                <div className="info-item">
                  <span className="label">Expediente:</span>
                  <span className="value">{pacienteSeleccionado.EXPEDIENTE}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tipo de Sangre:</span>
                  <span className="value">{pacienteSeleccionado['TIPO SANGRE']}</span>
                </div>
                <div className="info-item">
                  <span className="label">Fecha de Ingreso:</span>
                  <span className="value">{pacienteSeleccionado['FECHA INGRESO']}</span>
                </div>
                <div className="info-item">
                  <span className="label">Última Consulta:</span>
                  <span className="value">{pacienteSeleccionado['FECHA_ULTIMA'] || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Doctor Asignado:</span>
                  <span className="value">{pacienteSeleccionado['NOMBRE_DOCTOR'] || 'No asignado'}</span>
                </div>
              </div>
            </div>
            
            {/* Mostrar diagnóstico actual si el paciente no está de alta */}
            {!pacienteSeleccionado.ALTA && diagnosticos.length > 0 && (
              <div className="info-section">
                <h4>Diagnóstico Actual</h4>
                <div className="diagnostico-actual">
                  <p><strong>Diagnóstico Principal:</strong> {diagnosticos[0].DIAGNOSTICO_PRINCIPAL}</p>
                  <p><strong>Síntomas:</strong> {diagnosticos[0].SINTOMAS}</p>
                  <p><strong>Antecedentes:</strong> {diagnosticos[0].ANTECEDENTES}</p>
                  <p><strong>Condiciones:</strong> {diagnosticos[0].CONDICIONES}</p>
                  <p><strong>Alergias:</strong> {diagnosticos[0].ALERGIAS}</p>
                  <p><strong>Plan de Tratamiento:</strong> {diagnosticos[0].PLAN_TRATAMIENTO}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'diagnosticos' && (
          <div className="diagnosticos-tab">
            {diagnosticos.length === 0 ? (
              <p className="no-diagnosticos">No hay diagnósticos registrados para este paciente.</p>
            ) : (
              <div className="diagnosticos-timeline">
                {diagnosticos.map((diag, index) => (
                  <div key={diag.ID} className="diagnostico-item">
                    <div className="timeline-bullet"></div>
                    <div className="diagnostico-content">
                      <div className="diagnostico-header">
                        <h4>{diag.DIAGNOSTICO_PRINCIPAL}</h4>
                        <span className="fecha">
                          {new Date(diag.TIEMPO_INICIAL).toLocaleDateString()}
                          {diag.TIEMPO_FINAL && ` - ${new Date(diag.TIEMPO_FINAL).toLocaleDateString()}`}
                        </span>
                      </div>
                      <p className="sintomas"><strong>Síntomas:</strong> {diag.SINTOMAS}</p>
                      <p className="tratamiento"><strong>Tratamiento:</strong> {diag.PLAN_TRATAMIENTO}</p>
                      
                      {diag.TIEMPO_FINAL && (
                        <button 
                          className="btn-certificado"
                          onClick={() => {
                            // Lógica para descargar certificado de alta de este diagnóstico
                          }}
                        >
                          Descargar Certificado de Alta
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetallePaciente;