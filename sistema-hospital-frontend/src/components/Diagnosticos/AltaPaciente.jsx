import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiagnosticos } from '../../contexts/DiagnosticosContext';
import { usePacientes } from '../../contexts/PacientesContext';
import { useAuth } from '../../contexts/AuthContext';
import { pdfService } from '../../services/pdfService';

const AltaPaciente = () => {
  const { cui, idDiagnostico } = useParams();
  const navigate = useNavigate();
  const { 
    cargarDiagnosticos, 
    darAltaPaciente, 
    obtenerEstadisticasAlta,
    loading: loadingDiagnostico 
  } = useDiagnosticos();
  const { 
    seleccionarPaciente, 
    pacienteSeleccionado, 
    loading: loadingPaciente 
  } = usePacientes();
  const { currentUser, isEspecialista } = useAuth();
  
  const [diagnostico, setDiagnostico] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Verificar permisos - solo especialistas pueden dar de alta
  useEffect(() => {
    if (!isEspecialista()) {
      navigate('/pacientes');
      return;
    }
  }, [isEspecialista, navigate]);

  // Cargar datos del paciente y diagnóstico
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar paciente si no está en contexto
        if (!pacienteSeleccionado || pacienteSeleccionado.CUI !== cui) {
          const paciente = seleccionarPaciente(cui);
          if (!paciente) {
            navigate('/pacientes');
            return;
          }
        }
        
        // Cargar diagnósticos del paciente
        const diagnosticos = await cargarDiagnosticos(cui);
        const diagActual = diagnosticos.find(d => d.ID.toString() === idDiagnostico);
        
        if (!diagActual) {
          setMensaje({
            tipo: 'error',
            texto: 'No se encontró el diagnóstico especificado.'
          });
          return;
        }
        
        setDiagnostico(diagActual);
        
        // Obtener estadísticas previas
        const stats = await obtenerEstadisticasAlta(cui);
        setEstadisticas(stats);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setMensaje({
          tipo: 'error',
          texto: 'No se pudieron cargar los datos necesarios.'
        });
      }
    };

    cargarDatos();
  }, [cui, idDiagnostico, pacienteSeleccionado, seleccionarPaciente, cargarDiagnosticos, obtenerEstadisticasAlta, navigate]);

  // Manejar proceso de alta
  const handleDarAlta = async () => {
    if (!diagnostico || !pacienteSeleccionado || !currentUser) {
      setMensaje({
        tipo: 'error',
        texto: 'Información incompleta para procesar el alta.'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const timeStampActual = new Date().toISOString();
      
      // Registrar el alta
      const datosAlta = {
        ID_DIAGNOSTICO: diagnostico.ID,
        TIEMPO_FINAL: timeStampActual
      };
      
      const resultadoAlta = await darAltaPaciente(datosAlta);
      
      if (!resultadoAlta) {
        throw new Error('Error al procesar el alta');
      }
      
      // Generar PDF de alta
      const doctor = {
        NOMBRE: currentUser.nombre,
        ID_USUARIO: currentUser.id
      };
      
      const pdfBlob = await pdfService.generarCertificadoAlta(
        pacienteSeleccionado,
        { ...diagnostico, TIEMPO_FINAL: timeStampActual },
        doctor,
        resultadoAlta || estadisticas
      );
      
      // Descargar PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alta_medica_${pacienteSeleccionado.CUI}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMensaje({
        tipo: 'success',
        texto: 'Paciente dado de alta exitosamente. Se ha descargado el certificado.'
      });
      
      // Redirigir después de un tiempo
      setTimeout(() => {
        navigate(`/pacientes/${cui}`);
      }, 3000);
    } catch (err) {
      console.error('Error al dar de alta:', err);
      setMensaje({
        tipo: 'error',
        texto: 'Ocurrió un error al procesar el alta del paciente.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPaciente || loadingDiagnostico) {
    return <div className="loading-spinner">Cargando...</div>;
  }

  if (!pacienteSeleccionado || !diagnostico) {
    return (
      <div className="error-container">
        <div className="error-message">
          No se pudo cargar la información necesaria para el alta.
        </div>
        <button 
          className="btn-volver"
          onClick={() => navigate(`/pacientes/${cui}`)}
        >
          Volver al perfil del paciente
        </button>
      </div>
    );
  }

  return (
    <div className="alta-paciente-container">
      <h2>Alta Médica</h2>
      
      <div className="paciente-info">
        <h3>{pacienteSeleccionado['NOMBRE COMPLETO']}</h3>
        <p><strong>CUI:</strong> {pacienteSeleccionado.CUI}</p>
        <p><strong>Expediente:</strong> {pacienteSeleccionado.EXPEDIENTE}</p>
        <p><strong>Ingreso:</strong> {pacienteSeleccionado['FECHA INGRESO']}</p>
      </div>
      
      <div className="diagnostico-info">
        <h3>Información del Diagnóstico</h3>
        <p><strong>Diagnóstico Principal:</strong> {diagnostico.DIAGNOSTICO_PRINCIPAL}</p>
        <p><strong>Síntomas:</strong> {diagnostico.SINTOMAS}</p>
        <p><strong>Plan de Tratamiento:</strong> {diagnostico.PLAN_TRATAMIENTO}</p>
        <p><strong>Fecha de Inicio:</strong> {new Date(diagnostico.TIEMPO_INICIAL).toLocaleString()}</p>
      </div>
      
      {estadisticas && (
        <div className="estadisticas-info">
          <h3>Estadísticas durante el tratamiento</h3>
          <div className="estadistica-item">
            <span>Valor Máximo ECG:</span>
            <span className="valor">{estadisticas.Maximo}</span>
          </div>
          <div className="estadistica-item">
            <span>Valor Mínimo ECG:</span>
            <span className="valor">{estadisticas.Minimo}</span>
          </div>
          <div className="estadistica-item">
            <span>Valor Promedio ECG:</span>
            <span className="valor">{estadisticas.Promedio}</span>
          </div>
        </div>
      )}
      
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}
      
      <div className="confirmacion-alta">
        <p className="advertencia">
          Está a punto de dar de alta al paciente. Esta acción generará un certificado
          de alta médica y no podrá ser revertida. ¿Desea continuar?
        </p>
        
        <div className="action-buttons">
          <button 
            className="btn-cancelar"
            onClick={() => navigate(`/pacientes/${cui}`)}
            disabled={submitting}
          >
            Cancelar
          </button>
          
          <button 
            className="btn-alta"
            onClick={handleDarAlta}
            disabled={submitting}
          >
            {submitting ? 'Procesando...' : 'Confirmar Alta Médica'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AltaPaciente;