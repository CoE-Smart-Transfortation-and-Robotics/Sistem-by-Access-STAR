import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import '../../styles/user/ChatSimple.css';

const ChatSimple = ({ isAdmin = false }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user list (for admin: all users, for user: only admin)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (isAdmin) {
          const data = await apiService.getAllUsers();
          setUsers(data.filter(u => u.role !== 'admin'));
        } else {
          // Assume admin has user_id = 1
          setUsers([{ id: 1, name: 'Admin' }]);
        }
      } catch (e) {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [isAdmin]);

  // Auto-select user pertama jika hanya ada satu user di daftar
  useEffect(() => {
    if (users.length === 1 && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);


  // Ambil user id login dari localStorage (atau context auth jika ada)
  // Ambil userId dari localStorage (harus sama dengan backend & chat.html)
  const userId = Number(localStorage.getItem('user_id'));


  // Polling: refresh messages setiap detik jika user terpilih
  useEffect(() => {
    if (!selectedUser) return;
    let stopped = false;
    const fetchMessages = async () => {
      try {
        const data = await apiService.getChatWithUser(selectedUser.id);
        const arr = Array.isArray(data) ? data : data.data || [];
        setMessages(arr.map(msg => ({ ...msg, is_sender: Number(msg.sender_id) === Number(userId) })));
      } catch (e) {
        setMessages([]);
      }
    };
    fetchMessages();
    const interval = setInterval(() => {
      if (!stopped) fetchMessages();
    }, 1000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [selectedUser, userId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;
    try {
      await apiService.sendChatMessage({ receiver_id: selectedUser.id, message });
      setMessage('');
      // Refresh messages
      const data = await apiService.getChatWithUser(selectedUser.id);
      const arr = Array.isArray(data) ? data : data.data || [];
      setMessages(arr.map(msg => ({ ...msg, is_sender: Number(msg.sender_id) === Number(userId) })));
    } catch (e) {
      alert('Gagal mengirim pesan');
    }
  };

  return (
    <div className={`chat-simple-wrapper${isAdmin ? ' chat-admin' : ' chat-user'}`}>
      <div className="chat-user-list">
        <h3>{isAdmin ? 'Daftar User' : 'Admin'}</h3>
        <ul>
          {users.map(u => (
            <li
              key={u.id}
              className={selectedUser && selectedUser.id === u.id ? 'active' : ''}
              onClick={() => setSelectedUser(u)}
            >
              <span className="chat-avatar">{(u.name || 'U')[0].toUpperCase()}</span>
              <span className="chat-name">{u.name || `User ${u.id}`}</span>
              {/* Bisa tambahkan preview pesan terakhir & waktu */}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-main-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <span className="chat-header-avatar">{selectedUser.name[0].toUpperCase()}</span>
              <span className="chat-header-name">{selectedUser.name}</span>
            </div>
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    'chat-message ' + (msg.is_sender ? (isAdmin ? 'sent-admin' : 'sent') : (isAdmin ? 'received-admin' : 'received'))
                  }
                >
                  <div className="chat-message-text">{msg.message}</div>
                  <div className="chat-message-time">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                    {msg.is_sender && <span className="read-status">✔✔</span>}
                  </div>
                </div>
              ))}
            </div>
            <form className="chat-input-row" onSubmit={handleSend}>
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Ketik pesan..."
                disabled={loading}
              />
              <button type="submit" disabled={loading || !message.trim()}>Kirim</button>
            </form>
          </>
        ) : (
          <div className="chat-empty">Pilih {isAdmin ? 'user' : 'admin'} untuk mulai chat</div>
        )}
      </div>
    </div>
  );
};

export default ChatSimple;
