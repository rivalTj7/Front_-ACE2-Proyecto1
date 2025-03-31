import React, { useState } from 'react';
import { usePacientes } from '../../contexts/PacientesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ListaPacientes = () => {
  const { pacientes, loading, error, seleccionarPaciente } = usePacientes();
  const { isEspecialista } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  // Filtrar pacientes según término de búsqueda
  const pacientesFiltrados = busqueda.trim() === '' 
    ? pacientes 
    : pacientes.filter(p => 
        p['NOMBRE COMPLETO'].toLowerCase().includes(busqueda.toLowerCase()) || 
        p.CUI.includes(busqueda)
      );

  const handleVerPaciente = (cui) => {
    seleccionarPaciente(cui);
    navigate(`/pacientes/${cui}`);
  };

  const handleEditarPaciente = (cui) => {
    seleccionarPaciente(cui);
    navigate(`/pacientes/editar/${cui}`);
  };

  if (loading) {
    return <div className="loading-spinner">Cargando pacientes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="pacientes-container">
      <div className="header-actions">
        <h2>Lista de Pacientes</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre o CUI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {pacientesFiltrados.length === 0 ? (
        <div className="no-results">No se encontraron pacientes</div>
      ) : (
        <div className="pacientes-grid">
          {pacientesFiltrados.map((paciente) => (
            <div key={paciente.CUI} className="paciente-card">
              <div className="paciente-foto">
                {paciente.FOTOGRAFIA ? (
                  <img 
                    src={paciente.FOTOGRAFIA} 
                    alt={paciente['NOMBRE COMPLETO']} 
                  />
                ) : (
                  <div className="placeholder-img">
                    {paciente['NOMBRE COMPLETO'][0]}
                  </div>
                )}
              </div>
              
              <div className="paciente-info">
                <h3>{paciente['NOMBRE COMPLETO']}</h3>
                <p><strong>CUI:</strong> {paciente.CUI}</p>
                <p><strong>Expediente:</strong> {paciente.EXPEDIENTE}</p>
                <p className={`estado ${paciente.ALTA ? 'dado-alta' : 'en-tratamiento'}`}>
                  {paciente.ALTA ? 'Alta médica' : 'En tratamiento'}
                </p>
              </div>
              
              <div className="paciente-actions">
                <button 
                  className="btn-ver" 
                  onClick={() => handleVerPaciente(paciente.CUI)}
                >
                  Ver detalles
                </button>
                
                {isEspecialista() && (
                  <button 
                    className="btn-editar" 
                    onClick={() => handleEditarPaciente(paciente.CUI)}
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaPacientes;