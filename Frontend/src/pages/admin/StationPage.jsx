import React from 'react';
import StationManagement from '../../components/admin/StationManagement';

const StationManagementPage = () => {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <nav className="breadcrumb">
          <span>Admin</span> / <span>Station Management</span>
        </nav>
      </div>
      
      <main className="page-content">
        <StationManagement />
      </main>
    </div>
  );
};

export default StationManagementPage;