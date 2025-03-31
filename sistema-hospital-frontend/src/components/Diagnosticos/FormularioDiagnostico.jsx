import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiagnosticos } from '../../contexts/DiagnosticosContext';
import { usePacientes } from '../../contexts/PacientesContext';
import { useAuth } from '../../contexts/AuthContext';

const FormularioDiagnostico = () => {
  const { cui } = useParams();
  const navigate = useNavigate();
  const { crearDiagnostico, loading: loadingDiagnostico } = useDiagnosticos();
  const { seleccionarPaciente, pacienteSeleccionado, loading: loadingPaciente } = usePacientes();
  const { currentUser, isEspecialista } = useAuth();
  const [formData, setFormData] = useState({
    CUI_PACIENTE: cui,
    DIAGNOSTICO_PRINCIPAL: '',
    SINTOMAS: '',
    ANTECEDENTES: '',
    CONDICIONES: '',
    ALERGIAS: '',
    PLAN_TRATAMIENTO: '',
    TIEMPO_INICIAL: new Date().toISOString(),
    ARCHIVO: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Verificar permisos - solo especialistas pueden crear diagnósticos
  useEffect(() => {
    if (!isEspecialista()) {
      navigate('/pacientes');
      return;
    }
  }, [isEspecialista, navigate]);

  // Cargar datos del paciente
  useEffect(() => {
    const cargarPaciente = async () => {
      if (!pacienteSeleccionado || pacienteSeleccionado.CUI !== cui) {
        const paciente = seleccionarPaciente(cui);
        if (!paciente) {
          navigate('/pacientes');
        }
      }
    };

    cargarPaciente();
  }, [cui, pacienteSeleccionado, seleccionarPaciente, navigate]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico cuando el usuario corrige el campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const errores = {};
    
    if (!formData.DIAGNOSTICO_PRINCIPAL.trim()) {
      errores.DIAGNOSTICO_PRINCIPAL = 'El diagnóstico principal es obligatorio';
    }
    
    if (!formData.SINTOMAS.trim()) {
      errores.SINTOMAS = 'Los síntomas son obligatorios';
    }
    
    if (!formData.PLAN_TRATAMIENTO.trim()) {
      errores.PLAN_TRATAMIENTO = 'El plan de tratamiento es obligatorio';
    }
    
    setFormErrors(errores);
    return Object.keys(errores).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const timeStampActual = new Date().toISOString();
      const diagnosticoData = {
        ...formData,
        TIEMPO_INICIAL: timeStampActual
      };
      
      await crearDiagnostico(diagnosticoData);
      
      setMensaje({
        tipo: 'success',
        texto: 'Diagnóstico registrado correctamente.'
      });
      
      // Redirigir después de un tiempo
      setTimeout(() => {
        navigate(`/pacientes/${cui}`);
      }, 2000);
    } catch (err) {
      console.error('Error al crear diagnóstico:', err);
      setMensaje({
        tipo: 'error',
        texto: 'Ocurrió un error al registrar el diagnóstico.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPaciente || loadingDiagnostico) {
    return <div className="loading-spinner">Cargando...</div>;
  }

  if (!pacienteSeleccionado) {
    return <div className="error-message">Paciente no encontrado</div>;
  }

  return (
    <div className="formulario-diagnostico-container">
      <h2>Nuevo Diagnóstico</h2>
      
      <div className="paciente-info">
        <h3>{pacienteSeleccionado['NOMBRE COMPLETO']}</h3>
        <p><strong>CUI:</strong> {pacienteSeleccionado.CUI}</p>
        <p><strong>Edad:</strong> {pacienteSeleccionado.EDAD} años</p>
        <p><strong>Tipo de Sangre:</strong> {pacienteSeleccionado['TIPO SANGRE']}</p>
      </div>
      
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="formulario">
        <div className="form-group">
          <label htmlFor="diagnosticoPrincipal">Diagnóstico Principal</label>
          <input
            type="text"
            id="diagnosticoPrincipal"
            name="DIAGNOSTICO_PRINCIPAL"
            value={formData.DIAGNOSTICO_PRINCIPAL}
            onChange={handleChange}
            className={formErrors.DIAGNOSTICO_PRINCIPAL ? 'error' : ''}
          />
          {formErrors.DIAGNOSTICO_PRINCIPAL && <span className="error-message">{formErrors.DIAGNOSTICO_PRINCIPAL}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="sintomas">Síntomas Reportados</label>
          <textarea
            id="sintomas"
            name="SINTOMAS"
            value={formData.SINTOMAS}
            onChange={handleChange}
            rows="3"
            className={formErrors.SINTOMAS ? 'error' : ''}
          />
          {formErrors.SINTOMAS && <span className="error-message">{formErrors.SINTOMAS}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="antecedentes">Antecedentes Médicos</label>
          <textarea
            id="antecedentes"
            name="ANTECEDENTES"
            value={formData.ANTECEDENTES}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="condiciones">Condiciones Preexistentes</label>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="diabetes"
                name="condicion-diabetes"
                onChange={(e) => {
                  const newCondiciones = e.target.checked
                    ? formData.CONDICIONES + (formData.CONDICIONES ? ', Diabetes' : 'Diabetes')
                    : formData.CONDICIONES.replace(/, Diabetes|Diabetes,\s|Diabetes/g, '');
                  
                  setFormData(prev => ({
                    ...prev,
                    CONDICIONES: newCondiciones
                  }));
                }}
              />
              <label htmlFor="diabetes">Diabetes</label>
            </div>
            
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="hipertension"
                name="condicion-hipertension"
                onChange={(e) => {
                  const newCondiciones = e.target.checked
                    ? formData.CONDICIONES + (formData.CONDICIONES ? ', Hipertensión' : 'Hipertensión')
                    : formData.CONDICIONES.replace(/, Hipertensión|Hipertensión,\s|Hipertensión/g, '');
                  
                  setFormData(prev => ({
                    ...prev,
                    CONDICIONES: newCondiciones
                  }));
                }}
              />
              <label htmlFor="hipertension">Hipertensión</label>
            </div>
            
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="asma"
                name="condicion-asma"
                onChange={(e) => {
                  const newCondiciones = e.target.checked
                    ? formData.CONDICIONES + (formData.CONDICIONES ? ', Asma' : 'Asma')
                    : formData.CONDICIONES.replace(/, Asma|Asma,\s|Asma/g, '');
                  
                  setFormData(prev => ({
                    ...prev,
                    CONDICIONES: newCondiciones
                  }));
                }}
              />
              <label htmlFor="asma">Asma</label>
            </div>
          </div>
          
          <textarea
            id="condiciones"
            name="CONDICIONES"
            value={formData.CONDICIONES}
            onChange={handleChange}
            rows="2"
            placeholder="Otras condiciones..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="alergias">Alergias Conocidas</label>
          <textarea
            id="alergias"
            name="ALERGIAS"
            value={formData.ALERGIAS}
            onChange={handleChange}
            rows="2"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="planTratamiento">Plan de Tratamiento</label>
          <textarea
            id="planTratamiento"
            name="PLAN_TRATAMIENTO"
            value={formData.PLAN_TRATAMIENTO}
            onChange={handleChange}
            rows="4"
            className={formErrors.PLAN_TRATAMIENTO ? 'error' : ''}
          />
          {formErrors.PLAN_TRATAMIENTO && <span className="error-message">{formErrors.PLAN_TRATAMIENTO}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="archivo">Archivo Adjunto (Opcional)</label>
          <input
            type="file"
            id="archivo"
            onChange={(e) => {
              // En una implementación real, aquí subirías el archivo al servidor
              // y obtendrías la URL para guardarlo en el formulario
              if (e.target.files && e.target.files[0]) {
                setFormData(prev => ({
                  ...prev,
                  ARCHIVO: 'url_archivo_subido' // Simulación
                }));
              }
            }}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancelar"
            onClick={() => navigate(`/pacientes/${cui}`)}
          >
            Cancelar
          </button>
          
          <button 
            type="submit" 
            className="btn-guardar"
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : 'Registrar Diagnóstico'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioDiagnostico;