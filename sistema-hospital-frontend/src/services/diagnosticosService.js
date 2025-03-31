import api from './api';

export const diagnosticosService = {
  // Obtener diagnósticos por CUI de paciente
  obtenerDiagnosticos: async (cui) => {
    try {
      const response = await api.get(`/diagnostico?cui=${cui}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener diagnósticos:', error);
      throw error;
    }
  },

  // Crear nuevo diagnóstico
  crearDiagnostico: async (diagnostico) => {
    try {
      const response = await api.post('/diagnostico', diagnostico);
      return response.data;
    } catch (error) {
      console.error('Error al crear diagnóstico:', error);
      throw error;
    }
  },

  // Actualizar diagnóstico existente
  actualizarDiagnostico: async (diagnostico) => {
    try {
      const response = await api.put('/diagnostico', diagnostico);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar diagnóstico:', error);
      throw error;
    }
  },

  // Dar de alta a un paciente
  darAltaPaciente: async (datosAlta) => {
    try {
      const response = await api.put('/alta_paciente', datosAlta);
      return response.data;
    } catch (error) {
      console.error('Error al dar de alta al paciente:', error);
      throw error;
    }
  },
  
  // Obtener estadísticas de alta paciente
  obtenerEstadisticasAlta: async (cuiPaciente) => {
    try {
      const response = await api.get(`/alta_paciente?cui_paciente=${cuiPaciente}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de alta:', error);
      throw error;
    }
  }
};