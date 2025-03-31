import api from './api';

export const authService = {
  // Verificar rol de usuario por ID RFID
  verificarRol: async (idUsuario) => {
    try {
      const response = await api.put('/rol', { ID_USUARIO: idUsuario });
      return response.data;
    } catch (error) {
      console.error('Error al verificar rol:', error);
      throw error;
    }
  },

  // Obtener información del usuario actual
  obtenerInfoUsuario: async () => {
    try {
      const response = await api.get('/rol');
      return response.data;
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      throw error;
    }
  }
};