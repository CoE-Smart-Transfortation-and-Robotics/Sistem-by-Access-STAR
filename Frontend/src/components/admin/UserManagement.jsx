import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import UserTable from './UserTable';
import LoadingSpinner from '../common/LoadingSpinner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  const handleEditUser = (userId) => {
    // Navigate to edit user page or open modal
    console.log('Edit user:', userId);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>User Management</h2>
        <p>Manage all system users</p>
      </div>

      {error && <div className="error">{error}</div>}

      <UserTable 
        users={users}
        onDelete={handleDeleteUser}
        onEdit={handleEditUser}
      />
    </div>
  );
};

export default UserManagement;