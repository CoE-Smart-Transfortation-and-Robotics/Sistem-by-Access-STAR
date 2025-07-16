import AdminStats from '../../components/admin/AdminStats';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';


const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: '👥',
      title: 'User Management',
      description: 'Manage system users and permissions',
      action: () => navigate('/admin/users'),
      color: '#3B82F6'
    },
    {
      icon: '🚂',
      title: 'Train Management',
      description: 'Add, edit, and manage trains',
      action: () => navigate('/admin/train-management'),
      color: '#EF4444'
    },
    {
      icon: '🏢',
      title: 'Station Management',
      description: 'Manage stations and locations',
      action: () => console.log('Station Management - Coming Soon'),
      color: '#06B6D4'
    },
    {
    icon: '📅', 
    title: 'Train Schedules', 
    description: 'Manage train schedules and timetables', 
    action: () => navigate('/admin/schedules'), 
    color: '#EF4444'
  },
  ];

  const allServices = [
    {
      icon: '🚂',
      title: 'Train Fleet',
      description: 'Manage train fleet and maintenance',
      action: 'train-fleet',
      color: '#EF4444'
    },
    {
      icon: '🏢',
      title: 'Station Network',
      description: 'Manage station network and facilities',
      action: 'station-network',
      color: '#06B6D4'
    },
    {
      icon: '📅',
      title: 'Schedule Management',
      description: 'Manage train schedules and routes',
      action: 'schedule-management',
      color: '#84CC16'
    },
    {
      icon: '🛤️',
      title: 'Route Planning',
      description: 'Plan and optimize train routes',
      action: 'route-planning',
      color: '#F97316'
    },
    {
      icon: '🎫',
      title: 'Booking System',
      description: 'Monitor and manage bookings',
      action: 'booking-system',
      color: '#8B5CF6'
    },
    {
      icon: '💰',
      title: 'Revenue Management',
      description: 'Track revenue and financial reports',
      action: 'revenue-management',
      color: '#10B981'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'View detailed analytics and insights',
      action: 'analytics',
      color: '#F59E0B'
    },
    {
      icon: '⚙️',
      title: 'System Settings',
      description: 'Configure system parameters',
      action: 'system-settings',
      color: '#64748B'
    }
  ];

  const recentActivities = [
    {
      icon: '👤',
      title: 'New User Registration',
      description: '3 new users registered today',
      time: '2 hours ago',
      type: 'user'
    },
    {
      icon: '🎫',
      title: 'High Booking Volume',
      description: '47 tickets booked in the last hour',
      time: '1 hour ago',
      type: 'booking'
    },
    {
      icon: '🚂',
      title: 'Train Schedule Updated',
      description: 'Schedule updated for KA Lodaya',
      time: '3 hours ago',
      type: 'schedule'
    },
    {
      icon: '🏢',
      title: 'Station Maintenance',
      description: 'Maintenance completed at Bandung Station',
      time: '5 hours ago',
      type: 'maintenance'
    },
    {
      icon: '📊',
      title: 'Daily Report Generated',
      description: 'Daily operations report is ready',
      time: '6 hours ago',
      type: 'report'
    }
  ];

  const handleActionClick = (action) => {
    switch (action) {
      case 'train-fleet':
        navigate('/admin/train-management')
        break;
      case 'station-network':
        console.log('Station Network Management - Coming Soon');
        break;
      case 'schedule-management':
        console.log('Schedule Management - Coming Soon');
        break;
      case 'route-planning':
        console.log('Route Planning - Coming Soon');
        break;
      case 'booking-system':
        console.log('Booking System - Coming Soon');
        break;
      case 'revenue-management':
        console.log('Revenue Management - Coming Soon');
        break;
      case 'analytics':
        console.log('Analytics Dashboard - Coming Soon');
        break;
      case 'system-settings':
        console.log('System Settings - Coming Soon');
        break;
      default:
        console.log(`Action: ${action} - Coming Soon!`);
    }
  };

  return (
        <div className="admin-dashboard-container">
          {/* Welcome Hero Section */}
          <div className="admin-hero">
            <div className="hero-content">
              <div className="welcome-text">
                <h1>Welcome Back, {user?.name}!</h1>
                <p>Manage and monitor your STAR System with comprehensive administrative tools and real-time insights</p>
              </div>
              <div className="admin-avatar">
                <div className="avatar-circle">
                  <span className="avatar-icon">👑</span>
                </div>
                <div className="admin-badge">
                  <span>System Administrator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <div 
                  key={index}
                  className="quick-action-card admin-primary" 
                  onClick={action.action}
                >
                  <div className="action-icon" style={{ backgroundColor: action.color }}>
                    {action.icon}
                  </div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                  <div className="action-arrow">→</div>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-section">
            <h2>System Statistics</h2>
            <AdminStats />
          </div>

          {/* All Administrative Services */}
          <div className="all-services-section">
            <h2>Administrative Services</h2>
            <div className="admin-services-grid">
              {allServices.map((service, index) => (
                <div 
                  key={index} 
                  className="admin-service-card"
                  onClick={() => handleActionClick(service.action)}
                >
                  <div className="service-header">
                    <div 
                      className="service-icon" 
                      style={{ backgroundColor: service.color }}
                    >
                      {service.icon}
                    </div>
                    <h3>{service.title}</h3>
                  </div>
                  <p>{service.description}</p>
                  <div className="service-footer">
                    <span className="learn-more">Manage →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="recent-activities-section">
            <h2>Recent System Activities</h2>
            <div className="activities-container">
              <div className="activities-list">
                {recentActivities.map((activity, index) => (
                  <div key={index} className={`activity-item activity-${activity.type}`}>
                    <div className="activity-icon">
                      {activity.icon}
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    <div className="activity-status">
                      <div className="status-dot"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="activity-summary">
                <h3>Today's Summary</h3>
                <div className="summary-stats">
                  <div className="summary-item">
                    <span className="summary-number">12</span>
                    <span className="summary-label">Total Activities</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-number">3</span>
                    <span className="summary-label">Critical Updates</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-number">8</span>
                    <span className="summary-label">System Changes</span>
                  </div>
                </div>
                
                <div className="system-health">
                  <h4>System Health</h4>
                  <div className="health-indicators">
                    <div className="health-item">
                      <span className="health-label">Database</span>
                      <div className="health-status healthy">●</div>
                    </div>
                    <div className="health-item">
                      <span className="health-label">API Services</span>
                      <div className="health-status healthy">●</div>
                    </div>
                    <div className="health-item">
                      <span className="health-label">Train Network</span>
                      <div className="health-status healthy">●</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
};

export default AdminDashboard;