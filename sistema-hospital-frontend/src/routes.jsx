import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Componentes de autenticación
import RFIDLogin from './components/Auth/RFIDLogin';

// Layouts
import MainLayout from './layouts/MainLayout';

// Dashboard (placeholder inicial)
import Dashboard from './components/Dashboard/Dashboard';

// Ruta protegida que verifica autenticación
const ProtectedRoute = ({ children, requiereEspecialista = false }) => {
  const { currentUser, isEspecialista } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiereEspecialista && !isEspecialista()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<RFIDLogin />} />
      
      {/* Rutas protegidas dentro del layout principal */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Agregar más rutas a medida que se desarrollan los componentes */}
        
        {/* Ruta para redirigir rutas no existentes al dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;