import React, { createContext, useState, useContext, useEffect } from 'react';
import { pacientesService } from '../services/pacientesService';

const PacientesContext = createContext();

export function usePacientes() {
  return useContext(PacientesContext);
}

export function PacientesProvider({ children }) {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar lista de pacientes al iniciar
  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        setLoading(true);
        const data = await pacientesService.obtenerPacientes();
        setPacientes(data);
      } catch (err) {
        console.error('Error al cargar pacientes:', err);
        setError('No se pudieron cargar los pacientes. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    cargarPacientes();
  }, []);

  // Seleccionar un paciente por CUI
  const seleccionarPaciente = (cui) => {
    const paciente = pacientes.find(p => p.CUI === cui);
    setPacienteSeleccionado(paciente || null);
    return paciente;
  };

  // Actualizar datos de un paciente
  const actualizarPaciente = async (datosPaciente) => {
    try {
      setLoading(true);
      await pacientesService.editarPaciente(datosPaciente);
      
      // Actualizar la lista local de pacientes
      setPacientes(prevPacientes => 
        prevPacientes.map(p => 
          p.CUI === datosPaciente.CUI ? { ...p, ...datosPaciente } : p
        )
      );
      
      // Si es el paciente seleccionado, actualizarlo también
      if (pacienteSeleccionado?.CUI === datosPaciente.CUI) {
        setPacienteSeleccionado(prev => ({ ...prev, ...datosPaciente }));
      }
      
      return true;
    } catch (err) {
      console.error('Error al actualizar paciente:', err);
      setError('No se pudo actualizar la información del paciente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar foto de un paciente
  const actualizarFotoPaciente = async (cui, fotografia) => {
    try {
      setLoading(true);
      const paciente = pacientes.find(p => p.CUI === cui);
      
      if (!paciente) {
        throw new Error('Paciente no encontrado');
      }
      
      const datosActualizados = { ...paciente, FOTOGRAFIA: fotografia };
      await pacientesService.editarPaciente(datosActualizados);
      
      // Actualizar la lista local
      setPacientes(prevPacientes => 
        prevPacientes.map(p => 
          p.CUI === cui ? { ...p, FOTOGRAFIA: fotografia } : p
        )
      );
      
      // Actualizar paciente seleccionado si es necesario
      if (pacienteSeleccionado?.CUI === cui) {
        setPacienteSeleccionado(prev => ({ ...prev, FOTOGRAFIA: fotografia }));
      }
      
      return true;
    } catch (err) {
      console.error('Error al actualizar fotografía:', err);
      setError('No se pudo actualizar la fotografía del paciente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar pacientes por nombre o CUI
  const buscarPacientes = (query) => {
    if (!query) return pacientes;
    
    const queryLower = query.toLowerCase();
    return pacientes.filter(
      p => p['NOMBRE COMPLETO'].toLowerCase().includes(queryLower) || 
           p.CUI.includes(query)
    );
  };

  const value = {
    pacientes,
    pacienteSeleccionado,
    loading,
    error,
    seleccionarPaciente,
    actualizarPaciente,
    actualizarFotoPaciente,
    buscarPacientes
  };

  return (
    <PacientesContext.Provider value={value}>
      {children}
    </PacientesContext.Provider>
  );
}