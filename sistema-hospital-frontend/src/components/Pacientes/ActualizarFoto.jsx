import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePacientes } from '../../contexts/PacientesContext';

const ActualizarFoto = () => {
  const { cui } = useParams();
  const navigate = useNavigate();
  const { seleccionarPaciente, pacienteSeleccionado, actualizarFotoPaciente } = usePacientes();
  const [foto, setFoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [capturando, setCapturando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Cargar datos del paciente
  useEffect(() => {
    if (!pacienteSeleccionado || pacienteSeleccionado.CUI !== cui) {
      const paciente = seleccionarPaciente(cui);
      if (!paciente) {
        navigate('/pacientes');
      }
    }
  }, [cui, pacienteSeleccionado, seleccionarPaciente, navigate]);

  // Iniciar cámara web
  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCapturando(true);
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setMensaje({
        tipo: 'error',
        texto: 'No se pudo acceder a la cámara web.'
      });
    }
  };

  // Detener cámara web
  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
      setCapturando(false);
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      detenerCamara();
    };
  }, []);

  // Capturar foto desde la cámara
  const capturarFoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(
      videoRef.current,
      0, 0,
      canvas.width, canvas.height
    );
    
    // Convertir a imagen
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPreviewUrl(dataUrl);
    
    // En un caso real, aquí convertiríamos a Blob para subir al servidor
    canvas.toBlob(blob => {
      setFoto(blob);
    }, 'image/jpeg', 0.8);
    
    detenerCamara();
  };

  // Manejar carga desde el dispositivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tipo y tamaño
      if (!file.type.startsWith('image/')) {
        setMensaje({
          tipo: 'error',
          texto: 'Por favor, seleccione un archivo de imagen válido.'
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB máximo
        setMensaje({
          tipo: 'error',
          texto: 'La imagen es demasiado grande. Máximo 5MB.'
        });
        return;
      }
      
      setFoto(file);
      
      // Crear URL para previsualización
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Subir foto
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!foto) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor, capture o seleccione una foto.'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // En un caso real, aquí subiríamos la foto al servidor
      // y obtendríamos la URL de la imagen almacenada
      
      // Simulamos la URL que obtendríamos del servidor
      const fotoUrl = previewUrl; // Usamos el dataURL como simulación
      
      const exito = await actualizarFotoPaciente(cui, fotoUrl);
      
      if (exito) {
        setMensaje({
          tipo: 'success',
          texto: 'Fotografía actualizada correctamente.'
        });
        
        // Redirigir después de un tiempo
        setTimeout(() => {
          navigate(`/pacientes/${cui}`);
        }, 2000);
      } else {
        throw new Error('No se pudo actualizar la foto');
      }
    } catch (err) {
      console.error('Error al actualizar foto:', err);
      setMensaje({
        tipo: 'error',
        texto: 'Ocurrió un error al actualizar la fotografía.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!pacienteSeleccionado) {
    return <div className="loading-spinner">Cargando información del paciente...</div>;
  }

  return (
    <div className="actualizar-foto-container">
      <h2>Actualizar Fotografía del Paciente</h2>
      
      <div className="paciente-info">
        <h3>{pacienteSeleccionado['NOMBRE COMPLETO']}</h3>
        <p><strong>CUI:</strong> {pacienteSeleccionado.CUI}</p>
      </div>
      
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}
      
      <div className="foto-options">
        <div className="option-card">
          <h3>Tomar fotografía</h3>
          <div className="camera-container">
            {capturando ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  className="camera-preview"
                ></video>
                <button 
                  className="btn-capturar"
                  onClick={capturarFoto}
                >
                  Capturar Foto
                </button>
                <button 
                  className="btn-cancelar-camara"
                  onClick={detenerCamara}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button 
                className="btn-iniciar-camara"
                onClick={iniciarCamara}
                disabled={!!previewUrl}
              >
                Iniciar Cámara
              </button>
            )}
          </div>
        </div>
        
        <div className="option-card">
          <h3>Subir imagen</h3>
          <div className="upload-container">
            <input
              type="file"
              id="fotoInput"
              accept="image/*"
              onChange={handleFileChange}
              disabled={!!previewUrl}
              className="file-input"
            />
            <label 
              htmlFor="fotoInput" 
              className="file-label"
              style={{ opacity: previewUrl ? 0.5 : 1 }}
            >
              Seleccionar Archivo
            </label>
          </div>
        </div>
      </div>
      
      {previewUrl && (
        <div className="preview-container">
          <h3>Vista previa</h3>
          <img 
            src={previewUrl} 
            alt="Vista previa" 
            className="foto-preview" 
          />
          <div className="preview-actions">
            <button 
              className="btn-reiniciar"
              onClick={() => {
                setPreviewUrl('');
                setFoto(null);
              }}
              disabled={submitting}
            >
              Reiniciar
            </button>
            <button 
              className="btn-guardar"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar Fotografía'}
            </button>
          </div>
        </div>
      )}
      
      <div className="form-actions">
        <button 
          className="btn-volver"
          onClick={() => navigate(`/pacientes/${cui}`)}
          disabled={submitting}
        >
          Volver a Perfil del Paciente
        </button>
      </div>
    </div>
  );
};

export default ActualizarFoto;