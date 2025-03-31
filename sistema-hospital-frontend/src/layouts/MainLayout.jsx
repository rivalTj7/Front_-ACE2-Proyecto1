import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/UI/Navbar';
import Sidebar from '../components/UI/Sidebar';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;