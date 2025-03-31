import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { currentUser, isEspecialista } = useAuth();
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Menú</h3>
      </div>
      
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="icon-dashboard"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>
        
        <li>
          <NavLink to="/pacientes" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="icon-patients"></i>
            <span>Pacientes</span>
          </NavLink>
        </li>
        
        {isEspecialista() && (
          <li>
            <NavLink to="/diagnosticos" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="icon-diagnostics"></i>
              <span>Diagnósticos</span>
            </NavLink>
          </li>
        )}
        
        <li>
          <NavLink to="/reportes" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="icon-reports"></i>
            <span>Reportes</span>
          </NavLink>
        </li>
      </ul>
      
      <div className="sidebar-footer">
        <span>v1.0.0</span>
      </div>
    </div>
  );
};

export default Sidebar;