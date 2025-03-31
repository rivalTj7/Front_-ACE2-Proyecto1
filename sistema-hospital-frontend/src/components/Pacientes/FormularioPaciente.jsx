import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePacientes } from '../../contexts/PacientesContext';
import { useAuth } from '../../contexts/AuthContext';

const FormularioPaciente = () => {
  const { cui } = useParams();
  const navigate = useNavigate();
  const { pacienteSeleccionado, seleccionarPaciente, actualizarPaciente, loading, error } = usePacientes();
  const { isEspecialista } = useAuth();
  const [formData, setFormData] = useState({
    'NOMBRE COMPLETO': '',
    'CUI': '',
    'EDAD': '',
    'TELEFONO': '',
    'SEXO': '',
    'EXPEDIENTE': '',
    'TIPO SANGRE': '',
    'FECHA INGRESO': ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Verificar permisos - solo especialistas pueden editar
  useEffect(() => {
    if (!isEspecialista()) {
      navigate('/pacientes');
      return;
    }
  }, [isEspecialista, navigate]);

  // Cargar datos del paciente
  useEffect(() => {
    const cargarPaciente = async () => {
      try {
        if (!pacienteSeleccionado || pacienteSeleccionado.CUI !== cui) {
          const paciente = seleccionarPaciente(cui);
          
          if (paciente) {
            setFormData({
              'NOMBRE COMPLETO': paciente['NOMBRE COMPLETO'] || '',
              'CUI': paciente.CUI || '',
              'EDAD': paciente.EDAD || '',
              'TELEFONO': paciente.TELEFONO || '',
              'SEXO': paciente.SEXO || '',
              'EXPEDIENTE': paciente.EXPEDIENTE || '',
              'TIPO SANGRE': paciente['TIPO SANGRE'] || '',
              'FECHA INGRESO': paciente['FECHA INGRESO'] || ''
            });
          } else {
            navigate('/pacientes');
          }
        } else {
          setFormData({
            'NOMBRE COMPLETO': pacienteSeleccionado['NOMBRE COMPLETO'] || '',
            'CUI': pacienteSeleccionado.CUI || '',
            'EDAD': pacienteSeleccionado.EDAD || '',
            'TELEFONO': pacienteSeleccionado.TELEFONO || '',
            'SEXO': pacienteSeleccionado.SEXO || '',
            'EXPEDIENTE': pacienteSeleccionado.EXPEDIENTE || '',
            'TIPO SANGRE': pacienteSeleccionado['TIPO SANGRE'] || '',
            'FECHA INGRESO': pacienteSeleccionado['FECHA INGRESO'] || ''
          });
        }
      } catch (err) {
        console.error('Error al cargar datos del paciente:', err);
        setMensaje({
          tipo: 'error',
          texto: 'No se pudieron cargar los datos del paciente.'
        });
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
    
    if (!formData['NOMBRE COMPLETO'].trim()) {
      errores['NOMBRE COMPLETO'] = 'El nombre es obligatorio';
    }
    
    if (!formData['CUI'].trim()) {
      errores['CUI'] = 'El CUI es obligatorio';
    } else if (!/^\d+$/.test(formData['CUI'])) {
      errores['CUI'] = 'El CUI debe contener solo números';
    }
    
    if (!formData['EDAD']) {
      errores['EDAD'] = 'La edad es obligatoria';
    } else if (formData['EDAD'] <= 0 || formData['EDAD'] > 120) {
      errores['EDAD'] = 'La edad debe estar entre 1 y 120 años';
    }
    
    if (!formData['TELEFONO'].trim()) {
      errores['TELEFONO'] = 'El teléfono es obligatorio';
    }
    
    if (!formData['SEXO']) {
      errores['SEXO'] = 'El sexo es obligatorio';
    }
    
    if (!formData['EXPEDIENTE']) {
      errores['EXPEDIENTE'] = 'El número de expediente es obligatorio';
    }
    
    if (!formData['TIPO SANGRE']) {
      errores['TIPO SANGRE'] = 'El tipo de sangre es obligatorio';
    }
    
    if (!formData['FECHA INGRESO']) {
      errores['FECHA INGRESO'] = 'La fecha de ingreso es obligatoria';
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
      // Convertir valores numéricos
      const datosActualizados = {
        ...formData,
        'EDAD': parseInt(formData['EDAD']),
        'EXPEDIENTE': parseInt(formData['EXPEDIENTE'])
      };
      
      const exito = await actualizarPaciente(datosActualizados);
      
      if (exito) {
        setMensaje({
          tipo: 'success',
          texto: 'Información del paciente actualizada correctamente.'
        });
        
        // Redirigir después de un tiempo
        setTimeout(() => {
          navigate(`/pacientes/${cui}`);
        }, 2000);
      } else {
        setMensaje({
          tipo: 'error',
          texto: 'No se pudo actualizar la información del paciente.'
        });
      }
    } catch (err) {
      console.error('Error al actualizar paciente:', err);
      setMensaje({
        tipo: 'error',
        texto: 'Ocurrió un error al guardar los cambios.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Cargando información del paciente...</div>;
  }

  return (
    <div className="formulario-paciente-container">
      <h2>Editar Información del Paciente</h2>
      
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="formulario">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombreCompleto">Nombre Completo</label>
            <input
              type="text"
              id="nombreCompleto"
              name="NOMBRE COMPLETO"
              value={formData['NOMBRE COMPLETO']}
              onChange={handleChange}
              className={formErrors['NOMBRE COMPLETO'] ? 'error' : ''}
            />
            {formErrors['NOMBRE COMPLETO'] && <span className="error-message">{formErrors['NOMBRE COMPLETO']}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="cui">CUI</label>
            <input
              type="text"
              id="cui"
              name="CUI"
              value={formData['CUI']}
              onChange={handleChange}
              disabled // No permitir editar el CUI
              className={formErrors['CUI'] ? 'error' : ''}
            />
            {formErrors['CUI'] && <span className="error-message">{formErrors['CUI']}</span>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edad">Edad</label>
            <input
              type="number"
              id="edad"
              name="EDAD"
              value={formData['EDAD']}
              onChange={handleChange}
              min="1"
              max="120"
              className={formErrors['EDAD'] ? 'error' : ''}
            />
            {formErrors['EDAD'] && <span className="error-message">{formErrors['EDAD']}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="text"
              id="telefono"
              name="TELEFONO"
              value={formData['TELEFONO']}
              onChange={handleChange}
              className={formErrors['TELEFONO'] ? 'error' : ''}
            />
            {formErrors['TELEFONO'] && <span className="error-message">{formErrors['TELEFONO']}</span>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sexo">Sexo</label>
            <select
              id="sexo"
              name="SEXO"
              value={formData['SEXO']}
              onChange={handleChange}
              className={formErrors['SEXO'] ? 'error' : ''}
            >
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
            {formErrors['SEXO'] && <span className="error-message">{formErrors['SEXO']}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="expediente">Expediente</label>
            <input
              type="number"
              id="expediente"
              name="EXPEDIENTE"
              value={formData['EXPEDIENTE']}
              onChange={handleChange}
              className={formErrors['EXPEDIENTE'] ? 'error' : ''}
            />
            {formErrors['EXPEDIENTE'] && <span className="error-message">{formErrors['EXPEDIENTE']}</span>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tipoSangre">Tipo de Sangre</label>
            <select
              id="tipoSangre"
              name="TIPO SANGRE"
              value={formData['TIPO SANGRE']}
              onChange={handleChange}
              className={formErrors['TIPO SANGRE'] ? 'error' : ''}
            >
              <option value="">Seleccionar</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            {formErrors['TIPO SANGRE'] && <span className="error-message">{formErrors['TIPO SANGRE']}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="fechaIngreso">Fecha de Ingreso</label>
            <input
              type="date"
              id="fechaIngreso"
              name="FECHA INGRESO"
              value={formData['FECHA INGRESO']}
              onChange={handleChange}
              className={formErrors['FECHA INGRESO'] ? 'error' : ''}
            />
            {formErrors['FECHA INGRESO'] && <span className="error-message">{formErrors['FECHA INGRESO']}</span>}
          </div>
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
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioPaciente;