import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    visitors: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiService.getAllUsers();
      const users = response.users || response;
      
      const stats = {
        totalUsers: users.length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        regularUsers: users.filter(u => u.role === 'user').length,
        visitors: users.filter(u => u.role === 'visitor').length,
      };
      
      setStats(stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  return (
    <div className="admin-stats">
      <h3>System Statistics</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Users</h4>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h4>Administrators</h4>
          <p className="stat-number">{stats.adminUsers}</p>
        </div>
        <div className="stat-card">
          <h4>Regular Users</h4>
          <p className="stat-number">{stats.regularUsers}</p>
        </div>
        <div className="stat-card">
          <h4>Visitors</h4>
          <p className="stat-number">{stats.visitors}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;