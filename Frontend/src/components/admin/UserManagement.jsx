import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import '../../styles/admin/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getAllUsers();
      setUsers(response.users || response);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  const handleEditUser = (userId) => {
    // Navigate to edit user page or open modal
    console.log('Edit user:', userId);
    // TODO: Implement edit functionality
    alert(`Edit functionality for user ${userId} - Coming Soon!`);
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.nik?.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading users...</p>
    </div>
  );

  const UserTable = ({ users, onDelete, onEdit }) => {
    if (users.length === 0) {
      return (
        <div className="no-users">
          <div className="no-users-icon">👥</div>
          <h3>No Users Found</h3>
          <p>No users match your current filters.</p>
        </div>
      );
    }

    return (
      <div className="user-table-container">
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>NIK</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <span className="user-id">#{user.id}</span>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        <span>{user.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="user-name">{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="user-email">{user.email}</span>
                  </td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className="user-phone">{user.phone || '-'}</span>
                  </td>
                  <td>
                    <span className="user-nik">{user.nik || '-'}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => onEdit(user.id)}
                        className="btn-edit"
                        title="Edit User"
                      >
                        <span className="btn-icon">✏️</span>
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(user.id)}
                        className="btn-delete"
                        title="Delete User"
                      >
                        <span className="btn-icon">🗑️</span>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="user-management">
      {/* Header Section */}
      <div className="section-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage all system users and their permissions</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
            <span className="stat-label">Admins</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{users.filter(u => u.role === 'user').length}</span>
            <span className="stat-label">Users</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={loadUsers} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="visitor">Visitor</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {filteredUsers.length} of {users.length} users
          {searchTerm && ` matching "${searchTerm}"`}
          {filterRole !== 'all' && ` with role "${filterRole}"`}
        </p>
      </div>

      {/* User Table */}
      <UserTable 
        users={filteredUsers}
        onDelete={handleDeleteUser}
        onEdit={handleEditUser}
      />
    </div>
  );
};

export default UserManagement;