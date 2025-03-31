import React, { createContext, useState, useContext } from 'react';
import { diagnosticosService } from '../services/diagnosticosService';

const DiagnosticosContext = createContext();

export function useDiagnosticos() {
  return useContext(DiagnosticosContext);
}

export function DiagnosticosProvider({ children }) {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [diagnosticoActual, setDiagnosticoActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar diagnósticos de un paciente
  const cargarDiagnosticos = async (cui) => {
    try {
      setLoading(true);
      const data = await diagnosticosService.obtenerDiagnosticos(cui);
      setDiagnosticos(data);
      return data;
    } catch (err) {
      console.error('Error al cargar diagnósticos:', err);
      setError('No se pudieron cargar los diagnósticos del paciente.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo diagnóstico
  const crearDiagnostico = async (diagnostico) => {
    try {
      setLoading(true);
      const response = await diagnosticosService.crearDiagnostico(diagnostico);
      
      // Actualizar lista local de diagnósticos
      await cargarDiagnosticos(diagnostico.CUI_PACIENTE);
      
      return response;
    } catch (err) {
      console.error('Error al crear diagnóstico:', err);
      setError('No se pudo registrar el diagnóstico del paciente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar diagnóstico existente
  const actualizarDiagnostico = async (diagnostico) => {
    try {
      setLoading(true);
      const response = await diagnosticosService.actualizarDiagnostico(diagnostico);
      
      // Actualizar lista local de diagnósticos
      if (diagnostico.CUI_PACIENTE) {
        await cargarDiagnosticos(diagnostico.CUI_PACIENTE);
      }
      
      return response;
    } catch (err) {
      console.error('Error al actualizar diagnóstico:', err);
      setError('No se pudo actualizar el diagnóstico del paciente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Dar de alta a un paciente
  const darAltaPaciente = async (datosAlta) => {
    try {
      setLoading(true);
      const response = await diagnosticosService.darAltaPaciente(datosAlta);
      return response;
    } catch (err) {
      console.error('Error al dar de alta al paciente:', err);
      setError('No se pudo registrar el alta del paciente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas de alta de un paciente
  const obtenerEstadisticasAlta = async (cuiPaciente) => {
    try {
      setLoading(true);
      const response = await diagnosticosService.obtenerEstadisticasAlta(cuiPaciente);
      return response;
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      setError('No se pudieron obtener las estadísticas del paciente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    diagnosticos,
    diagnosticoActual,
    loading,
    error,
    cargarDiagnosticos,
    crearDiagnostico,
    actualizarDiagnostico,
    darAltaPaciente,
    obtenerEstadisticasAlta,
    setDiagnosticoActual
  };

  return (
    <DiagnosticosContext.Provider value={value}>
      {children}
    </DiagnosticosContext.Provider>
  );
}