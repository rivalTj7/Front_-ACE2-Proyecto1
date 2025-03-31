import api from './api';

export const pacientesService = {
  // Obtener lista de pacientes
  obtenerPacientes: async () => {
    try {
      const response = await api.get('/pacientes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      throw error;
    }
  },

  // Editar información de paciente
  editarPaciente: async (datosPaciente) => {
    try {
      const response = await api.put('/editar_paciente', datosPaciente);
      return response.data;
    } catch (error) {
      console.error('Error al editar paciente:', error);
      throw error;
    }
  }
};
