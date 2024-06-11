import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { UserContext } from './UserContext';
import './Chat.css';

const socket = io('http://localhost:4500');

const Chat = () => {
  const { user, loading } = useContext(UserContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user?.username) {
      socket.emit('user connected', user.username);
    }

    socket.on('chat history', (chatHistory) => {
      setMessages(chatHistory);
    });

    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chat history');
      socket.off('chat message');
    };
  }, [user]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && user?.username) {
      socket.emit('chat message', { message });
      setMessage('');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to chat.</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Online Users</h2>
      </div>
      <div className="chat-messages">
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.username}: </strong>{msg.message}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-input-container">
        <form className="chat-input-form" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="chat-input"
          />
          <button type="submit" className="chat-send-button">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
