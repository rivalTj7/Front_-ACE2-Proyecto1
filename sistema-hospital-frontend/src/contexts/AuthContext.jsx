import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Intentar cargar usuario desde localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error("Error verificando estado de autenticación:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  // Función para autenticar usuario por RFID
  const login = async (userId) => {
    setError(null);
    setLoading(true);
    
    try {
      // Verificar rol y permisos del usuario
      const response = await api.put('/rol', { ID_USUARIO: userId });
      const userData = response.data;
      
      // Guardar usuario en contexto y localStorage
      const userInfo = {
        id: userId,
        rol: userData.ROL,
        nombre: userData.NOMBRE
      };
      
      setCurrentUser(userInfo);
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      
      return userData;
    } catch (err) {
      setError('Error de autenticación. Verifique sus credenciales.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Verificar si el usuario es especialista (rol 2)
  const isEspecialista = () => {
    return currentUser?.rol === 2;
  };

  // Verificar si el usuario es residente (rol 1)
  const isResidente = () => {
    return currentUser?.rol === 1;
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isEspecialista,
    isResidente
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}