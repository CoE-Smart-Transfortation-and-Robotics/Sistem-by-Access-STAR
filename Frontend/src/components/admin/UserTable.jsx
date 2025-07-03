const UserTable = ({ users, onDelete, onEdit }) => {
  return (
    <div className="user-table-container">
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
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge role-${user.role}`}>
                  {user.role}
                </span>
              </td>
              <td>{user.phone}</td>
              <td>{user.nik}</td>
              <td>
                <div className="action-buttons">
                  <button 
                    onClick={() => onEdit(user.id)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete(user.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;