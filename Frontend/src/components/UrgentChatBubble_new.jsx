import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import './UrgentChatBubble.css';

const UrgentChatBubble = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [urgentChats, setUrgentChats] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userList, setUserList] = useState([]);
  const [urgentAlerts, setUrgentAlerts] = useState([]);
  const messagesEndRef = useRef(null);

  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL RETURNS

  // Initialize based on auth user
  useEffect(() => {
    if (authUser && authUser.id) {
      console.log(`✅ User from auth: ID=${authUser.id}, Role=${authUser.role}, Name=${authUser.name}`);
      
      // Get admin id for user chat, or get user list for admin
      if (authUser.role === 'admin') {
        console.log('👨‍💼 Admin mode activated');
        fetchUserList();
        fetchUrgentChats();
      } else {
        console.log('👤 User mode activated, finding admin...');
        // Find admin for user to chat with
        apiService.getAllUsers?.().then(users => {
          const admin = users?.find(u => u.role === 'admin');
          console.log('🔍 Found admin:', admin);
          setAdminId(admin?.id || 1);
        }).catch(err => {
          console.error('❌ Error fetching admin:', err);
          setAdminId(1);
        });
      }
    }
  }, [authUser]);

  useEffect(() => {
    if (open && authUser?.id) {
      if (authUser.role === 'admin') {
        // Admin: fetch urgent chats and user list
        const interval = setInterval(() => {
          fetchUrgentChats();
          fetchUserList();
        }, 5000);
        return () => clearInterval(interval);
      } else if (adminId) {
        // User: fetch messages with admin
        fetchMessages();
        const interval = setInterval(fetchMessages, 4000);
        return () => clearInterval(interval);
      }
    }
  }, [open, authUser?.id, adminId, authUser?.role]);

  // Separate useEffect for admin message fetching when user is selected
  useEffect(() => {
    if (authUser?.role === 'admin' && selectedUserId && open) {
      console.log('🔄 Admin selected user changed, fetching messages...');
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedUserId, authUser?.role, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debug: Always log render state
  console.log('🔍 UrgentChatBubble render:', { 
    authUser, 
    authLoading
  });

  // ONLY AFTER ALL HOOKS ARE CALLED - Handle conditional rendering
  if (authLoading) {
    return null;
  }

  const isLoggedIn = authUser && authUser.id;
  if (!isLoggedIn) {
    return null;
  }

  const fetchUserList = async () => {
    try {
      console.log('👥 Fetching user list...');
      const users = await apiService.getAllUsers();
      console.log('👥 All users response:', users);
      const userList = users?.filter(u => u.role === 'user') || [];
      console.log('👤 Filtered user list:', userList);
      setUserList(userList);
      
      // Add dummy data if empty for testing
      if (userList.length === 0) {
        console.log('🔧 Adding dummy user data for testing...');
        setUserList([
          { id: 2, name: 'Test User', role: 'user', email: 'test@user.com' },
          { id: 3, name: 'Demo User', role: 'user', email: 'demo@user.com' }
        ]);
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      // Fallback dummy data
      setUserList([
        { id: 2, name: 'Test User', role: 'user', email: 'test@user.com' },
        { id: 3, name: 'Demo User', role: 'user', email: 'demo@user.com' }
      ]);
    }
  };

  const fetchUrgentChats = async () => {
    try {
      console.log('🔍 Fetching urgent chats...');
      const urgents = await apiService.getUrgentChats();
      console.log('🔍 Urgent chats response:', urgents);
      setUrgentChats(urgents || []);
      
      // Check for new urgent messages from users (sender_role = 'user', receiver_role = 'admin')
      const userToAdminUrgents = urgents?.filter(msg => 
        msg.sender_role === 'user' && 
        msg.receiver_role === 'admin' &&
        msg.urgency_analysis?.is_urgent
      ) || [];
      
      console.log('🚨 User to admin urgent messages:', userToAdminUrgents);
      
      const newUrgents = userToAdminUrgents.filter(msg => 
        !urgentAlerts.includes(msg.id) && 
        msg.urgency_analysis?.confidence > 0.7
      );
      
      console.log('🆕 New urgent alerts to show:', newUrgents);
      
      if (newUrgents.length > 0) {
        newUrgents.forEach(msg => {
          console.log('🚨 Showing alert for:', msg);
          alert(`🚨 PESAN URGENT DARI USER!\n\nDari: User ID ${msg.sender_id}\nPesan: ${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}\n\nKategori: ${msg.urgency_analysis?.category}\nTingkat Kepercayaan: ${Math.round(msg.urgency_analysis?.confidence * 100)}%`);
        });
        setUrgentAlerts(prev => [...prev, ...newUrgents.map(msg => msg.id)]);
      }
      
      // Add dummy urgent data if empty for testing
      if ((urgents || []).length === 0) {
        console.log('🔧 Adding dummy urgent data for testing...');
        setTimeout(() => {
          setUrgentChats([
            {
              id: 'dummy1',
              sender_id: 2,
              receiver_id: authUser.id,
              message: 'Darurat! Kereta rusak dan saya terjebak di dalam!',
              sender_role: 'user',
              receiver_role: 'admin',
              urgency_analysis: {
                is_urgent: true,
                confidence: 0.95,
                category: 'kecelakaan'
              },
              timestamp: new Date().toISOString()
            },
            {
              id: 'dummy2',
              sender_id: 3,
              receiver_id: authUser.id,
              message: 'Tolong! Ada penumpang yang pingsan di gerbong 3!',
              sender_role: 'user',
              receiver_role: 'admin',
              urgency_analysis: {
                is_urgent: true,
                confidence: 0.88,
                category: 'kesehatan'
              },
              timestamp: new Date(Date.now() - 300000).toISOString()
            }
          ]);
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Error fetching urgent chats:', err);
      // Fallback dummy data
      setUrgentChats([
        {
          id: 'dummy1',
          sender_id: 2,
          receiver_id: authUser.id,
          message: 'Darurat! Kereta rusak dan saya terjebak di dalam!',
          sender_role: 'user',
          receiver_role: 'admin',
          urgency_analysis: {
            is_urgent: true,
            confidence: 0.95,
            category: 'kecelakaan'
          },
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const targetUserId = authUser.role === 'admin' ? selectedUserId : adminId;
      if (!targetUserId) {
        console.log('⚠️ No target user ID found');
        return;
      }
      
      console.log(`🔍 Fetching messages with user ${targetUserId}`);
      const res = await apiService.getChats({ with_user_id: targetUserId });
      console.log('💬 Messages response:', res);
      setMessages(res);
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const receiverId = authUser.role === 'admin' ? selectedUserId : adminId;
    if (!receiverId) {
      alert(authUser.role === 'admin' ? 'Pilih user untuk dibalas' : 'Admin tidak ditemukan');
      return;
    }
    
    setLoading(true);
    try {
      await apiService.sendChat({ receiver_id: receiverId, message: input });
      setInput('');
      fetchMessages();
      
      // If admin, refresh urgent chats
      if (authUser.role === 'admin') {
        setTimeout(fetchUrgentChats, 1000);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Gagal mengirim pesan');
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection for admin
  const handleUserSelect = (user) => {
    console.log('👤 Admin selecting user:', user);
    setSelectedUserId(user.id);
    setMessages([]);
    // Use setTimeout to ensure state is updated before fetching
    setTimeout(() => {
      fetchMessages();
    }, 100);
  };

  const renderAdminView = () => (
    <div className="chat-window">
      <div className="chat-header">
        <span>🛡️ Admin CS Panel</span>
        <button onClick={() => setOpen(false)}>✖</button>
      </div>
      
      {/* Debug Info */}
      <div style={{padding: '0.5rem', background: '#e8f5e8', fontSize: '0.75rem', color: '#2d5016'}}>
        👨‍💼 Admin: {authUser?.name || authUser?.email || `ID ${authUser?.id}`} | 
        Urgent: {urgentChats.filter(msg => msg.sender_role === 'user' && msg.receiver_role === 'admin').length} | 
        Users: {userList.length}
      </div>
      
      {/* Urgent Alerts - Only show messages from users to admin */}
      {urgentChats.filter(msg => msg.sender_role === 'user' && msg.receiver_role === 'admin').length > 0 ? (
        <div className="urgent-section">
          <div className="urgent-header">🚨 Pesan Urgent dari User ({urgentChats.filter(msg => msg.sender_role === 'user' && msg.receiver_role === 'admin').length})</div>
          <div className="urgent-list">
            {urgentChats.filter(msg => msg.sender_role === 'user' && msg.receiver_role === 'admin').slice(0, 3).map(msg => (
              <div key={msg.id} className="urgent-item" onClick={() => handleUserSelect({ id: msg.sender_id })}>
                <div className="urgent-user">👤 User ID: {msg.sender_id}</div>
                <div className="urgent-message">💬 {msg.message.substring(0, 50)}...</div>
                <div className="urgent-confidence">
                  📊 Confidence: {Math.round((msg.urgency_analysis?.confidence || 0) * 100)}%
                </div>
                <div className="urgent-category">🏷️ Kategori: {msg.urgency_analysis?.category || 'unknown'}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{padding: '1rem', textAlign: 'center', color: '#666', background: '#f9f9f9'}}>
          📭 Tidak ada pesan urgent dari user saat ini
        </div>
      )}
      
      {/* User List */}
      <div className="user-section">
        <div className="user-header">👥 Pilih User untuk Chat ({userList.length} users):</div>
        <div className="user-list">
          {userList.length > 0 ? (
            userList.map(user => (
              <div 
                key={user.id} 
                className={`user-item ${selectedUserId === user.id ? 'selected' : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                👤 {user.name || user.email || `User ${user.id}`} 
                <small style={{color: '#666', marginLeft: '0.5rem'}}>(ID: {user.id})</small>
              </div>
            ))
          ) : (
            <div style={{padding: '1rem', textAlign: 'center', color: '#666'}}>
              👥 Memuat daftar user...
            </div>
          )}
        </div>
      </div>
      
      {/* Chat Messages */}
      {selectedUserId ? (
        <>
          <div style={{padding: '0.5rem 1rem', background: '#e3f2fd', fontSize: '0.8rem', borderTop: '1px solid #ddd'}}>
            💬 Chat dengan: {userList.find(u => u.id === selectedUserId)?.name || `User ${selectedUserId}`}
          </div>
          <div className="chat-body">
            {messages.length > 0 ? (
              messages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.sender_id === authUser?.id ? 'admin' : 'user'}${msg.is_urgent && msg.sender_role === 'user' ? ' urgent' : ''}`}>
                  <div className="msg-sender">
                    {msg.sender_id === authUser?.id ? '🛡️ Admin' : '👤 User'}
                  </div>
                  <div className="msg-text">{msg.message}</div>
                  {msg.is_urgent && msg.sender_role === 'user' && <span className="urgent-label">🚨 URGENT</span>}
                  <div className="msg-time">
                    {new Date(msg.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                  </div>
                </div>
              ))
            ) : (
              <div style={{padding: '2rem', textAlign: 'center', color: '#666'}}>
                💬 Belum ada pesan dengan user ini
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="💬 Balas sebagai admin..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? '⏳' : '📤'} Kirim
            </button>
          </form>
        </>
      ) : (
        <div style={{padding: '2rem', textAlign: 'center', color: '#666'}}>
          👆 Pilih user di atas untuk mulai chat
        </div>
      )}
    </div>
  );

  const renderUserView = () => (
    <div className="chat-window">
      <div className="chat-header">
        <span>💬 Chat CS (Urgensi)</span>
        <button onClick={() => setOpen(false)}>✖</button>
      </div>
      
      {/* User Info */}
      <div style={{padding: '0.5rem', background: '#fff3cd', fontSize: '0.75rem', color: '#856404'}}>
        👤 User: {authUser?.name || authUser?.email || `ID ${authUser?.id}`} | 
        Chat dengan Admin {adminId ? `(ID: ${adminId})` : '(mencari...)'}
      </div>
      
      <div className="chat-body">
        {messages.length > 0 ? (
          messages.map(msg => (
            <div key={msg.id} className={`chat-msg ${msg.sender_id === authUser?.id ? 'user' : 'admin'}${msg.is_urgent && msg.sender_role === 'user' ? ' urgent' : ''}`}>
              <div className="msg-sender">
                {msg.sender_id === authUser?.id ? '👤 Anda' : '🛡️ Admin CS'}
              </div>
              <div className="msg-text">{msg.message}</div>
              {msg.is_urgent && msg.sender_role === 'user' && <span className="urgent-label">🚨 URGENT</span>}
              <div className="msg-time">
                {new Date(msg.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
              </div>
            </div>
          ))
        ) : (
          <div style={{padding: '2rem', textAlign: 'center', color: '#666'}}>
            👋 Mulai chat dengan Customer Service
            <br />
            <small>Ketik "darurat" atau "urgent" untuk pesan penting</small>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="💬 Ketik pesan ke CS..."
          disabled={loading || !adminId}
        />
        <button type="submit" disabled={loading || !input.trim() || !adminId}>
          {loading ? '⏳' : '📤'} Kirim
        </button>
      </form>
    </div>
  );

  return (
    <div className={`urgent-chat-bubble ${open ? 'open' : ''}`}>  
      {!open && (
        <button className="chat-toggle-btn" onClick={() => setOpen(true)}>
          {authUser.role === 'admin' ? (
            <>
              🛡️ <span role="img" aria-label="chat">💬</span> Admin CS
              {urgentChats.filter(msg => msg.sender_role === 'user' && msg.receiver_role === 'admin').length > 0 && (
                <span className="urgent-badge">{urgentChats.filter(msg => msg.sender_role === 'user' && msg.receiver_role === 'admin').length}</span>
              )}
            </>
          ) : (
            <>
              👤 <span role="img" aria-label="chat">💬</span> Chat CS
            </>
          )}
        </button>
      )}
      {open && (authUser.role === 'admin' ? renderAdminView() : renderUserView())}
    </div>
  );
};

export default UrgentChatBubble;
