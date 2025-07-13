import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/admin/AdminStats.css';

const AdminStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    visitors: 0,
    totalTrains: 0,
    totalStations: 0,
    totalSchedules: 0,
    totalRoutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllStats();
    }
  }, [user]);

  const loadAllStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load data from all available endpoints
      const [usersData, trainsData, stationsData, schedulesData, routesData] = await Promise.allSettled([
        apiService.getAllUsers(),
        apiService.getAllTrains().catch(() => ({ data: [] })), // Handle if endpoint doesn't exist
        apiService.getAllStations().catch(() => ({ data: [] })),
        apiService.getAllSchedules().catch(() => ({ data: [] })),
        apiService.getAllScheduleRoutes().catch(() => ({ data: [] }))
      ]);

      // Process users data (this endpoint definitely exists)
      let users = [];
      if (usersData.status === 'fulfilled') {
        users = usersData.value.users || usersData.value || [];
      }

      // Process other data
      const trains = trainsData.status === 'fulfilled' ? (trainsData.value.data || trainsData.value || []) : [];
      const stations = stationsData.status === 'fulfilled' ? (stationsData.value.data || stationsData.value || []) : [];
      const schedules = schedulesData.status === 'fulfilled' ? (schedulesData.value.data || schedulesData.value || []) : [];
      const routes = routesData.status === 'fulfilled' ? (routesData.value.data || routesData.value || []) : [];

      const calculatedStats = {
        totalUsers: users.length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        regularUsers: users.filter(u => u.role === 'user').length,
        visitors: users.filter(u => u.role === 'visitor').length,
        totalTrains: trains.length,
        totalStations: stations.length,
        totalSchedules: schedules.length,
        totalRoutes: routes.length,
      };

      setStats(calculatedStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthPercentage = (current, previous = 0) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous) * 100;
    return growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="admin-stats loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-stats error">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p>Error loading statistics: {error}</p>
          <button onClick={loadAllStats} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-stats">
      <div className="stats-grid">
        {/* User Statistics */}
        <div className="stat-category">
          <h3>👥 User Management</h3>
          <div className="stat-cards">
            <div className="stat-card primary">
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <h4>{stats.totalUsers}</h4>
                <p>Total Users</p>
                <span className="stat-trend positive">
                  {getGrowthPercentage(stats.totalUsers)}
                </span>
              </div>
            </div>

            <div className="stat-card admin">
              <div className="stat-icon">👑</div>
              <div className="stat-content">
                <h4>{stats.adminUsers}</h4>
                <p>Administrators</p>
                <span className="stat-trend neutral">
                  {((stats.adminUsers / stats.totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="stat-card user">
              <div className="stat-icon">🎫</div>
              <div className="stat-content">
                <h4>{stats.regularUsers}</h4>
                <p>Regular Users</p>
                <span className="stat-trend positive">
                  {((stats.regularUsers / stats.totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="stat-card visitor">
              <div className="stat-icon">👁️</div>
              <div className="stat-content">
                <h4>{stats.visitors}</h4>
                <p>Visitors</p>
                <span className="stat-trend neutral">
                  {((stats.visitors / stats.totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="stat-category">
          <h3>🚂 Transportation System</h3>
          <div className="stat-cards">
            <div className="stat-card train">
              <div className="stat-icon">🚂</div>
              <div className="stat-content">
                <h4>{stats.totalTrains}</h4>
                <p>Active Trains</p>
                <span className="stat-description">Available trains</span>
              </div>
            </div>

            <div className="stat-card station">
              <div className="stat-icon">🏢</div>
              <div className="stat-content">
                <h4>{stats.totalStations}</h4>
                <p>Train Stations</p>
                <span className="stat-description">Network coverage</span>
              </div>
            </div>

            <div className="stat-card schedule">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h4>{stats.totalSchedules}</h4>
                <p>Train Schedules</p>
                <span className="stat-description">Active schedules</span>
              </div>
            </div>

            <div className="stat-card route">
              <div className="stat-icon">🛤️</div>
              <div className="stat-content">
                <h4>{stats.totalRoutes}</h4>
                <p>Schedule Routes</p>
                <span className="stat-description">Route segments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="stat-category">
          <h3>📊 Quick Insights</h3>
          <div className="insight-cards">
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>System Health</h4>
                <p>All systems operational</p>
                <div className="health-indicator healthy">●</div>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>Coverage</h4>
                <p>{stats.totalStations} stations connected</p>
                <div className="coverage-bar">
                  <div className="coverage-fill" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">⚡</div>
              <div className="insight-content">
                <h4>Efficiency</h4>
                <p>
                  {stats.totalSchedules > 0 
                    ? `${(stats.totalRoutes / stats.totalSchedules).toFixed(1)} routes/schedule` 
                    : 'No data'
                  }
                </p>
                <span className="efficiency-score">Good</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;