import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-name">Sistema de Monitoreo Hospitalario</span>
        </Link>
      </div>
      
      {currentUser && (
        <div className="navbar-menu">
          <div className="navbar-start">
            <Link to="/dashboard" className="navbar-item">Dashboard</Link>
            <Link to="/pacientes" className="navbar-item">Pacientes</Link>
          </div>
          
          <div className="navbar-end">
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;