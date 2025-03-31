import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserInfo = () => {
  const { currentUser, logout } = useAuth();
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <div className="user-info">
      <div className="user-details">
        <span className="user-name">{currentUser.nombre}</span>
        <span className="user-role">
          {currentUser.rol === 2 ? 'Especialista' : 'Residente'}
        </span>
      </div>
      
      <button className="logout-btn" onClick={logout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default UserInfo;