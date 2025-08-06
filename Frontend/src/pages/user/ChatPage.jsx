import React from 'react';
import ChatSimple from '../../components/user/ChatSimple';
import '../../styles/user/ChatSimple.css';

const ChatPage = () => {
  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Chat dengan Admin</h2>
      <ChatSimple isAdmin={false} />
    </div>
  );
};

export default ChatPage;
