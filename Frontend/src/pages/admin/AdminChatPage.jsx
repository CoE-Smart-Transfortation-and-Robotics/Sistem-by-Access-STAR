import React from 'react';
import ChatSimple from '../../components/user/ChatSimple';
import '../../styles/user/ChatSimple.css';

const AdminChatPage = () => {
  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Admin Chat</h2>
      <ChatSimple isAdmin={true} />
    </div>
  );
};

export default AdminChatPage;
