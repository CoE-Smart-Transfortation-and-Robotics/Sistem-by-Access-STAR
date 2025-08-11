import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import './UrgentChatBubble.css';

const UrgentChatBubble = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState('user');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get user info from localStorage/session
    const user = JSON.parse(localStorage.getItem('user'));
    setUserId(user?.id);
    setRole(user?.role || 'user');
    // Get admin id (could be static or fetched)
    apiService.getAllUsers?.().then(users => {
      const admin = users?.find(u => u.role === 'admin');
      setAdminId(admin?.id);
    });
  }, []);

  useEffect(() => {
    if (open && userId && adminId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [open, userId, adminId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await apiService.getChats({ with_user_id: adminId });
      setMessages(res);
    } catch (err) {
      // ...
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      await apiService.sendChat({ receiver_id: adminId, message: input });
      setInput('');
      fetchMessages();
    } catch (err) {
      // ...
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`urgent-chat-bubble ${open ? 'open' : ''}`}>  
      {!open && (
        <button className="chat-toggle-btn" onClick={() => setOpen(true)}>
          <span role="img" aria-label="chat">💬</span> Chat CS
        </button>
      )}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Chat CS (Urgensi)</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>
          <div className="chat-body">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg ${msg.sender_id === userId ? 'user' : 'admin'}${msg.is_urgent ? ' urgent' : ''}`}>
                <div className="msg-text">{msg.message}</div>
                {msg.is_urgent && <span className="urgent-label">URGENT</span>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>Kirim</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UrgentChatBubble;
