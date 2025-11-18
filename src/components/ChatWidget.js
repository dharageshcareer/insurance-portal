import React, { useState, useEffect, useRef } from 'react';
import { createChatSession, sendChatMessage } from '../services/apiService';
import './ChatWidget.css';

const ChatWidget = ({ memberId }) => { // The component receives memberId as a prop
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  const toggleChat = async () => {
    const newIsOpenState = !isOpen;
    setIsOpen(newIsOpenState);

    // If we are opening the chat for the first time
    if (newIsOpenState && !sessionId) {
      setIsAgentTyping(true);
      setMessages([]); // Clear any previous error messages
      const newSessionId = await createChatSession();
      if (newSessionId) {
        setSessionId(newSessionId);
        
        // --- THE FIX IS HERE ---
        // Construct the default message using the memberId prop
        const defaultMessage = `Hi, my member id is ${memberId}`;
        
        // 1. Immediately display the user's message in the UI
        setMessages([{ author: 'user', text: defaultMessage }]);
        
        // 2. Send that same message to the backend to get the agent's response
        sendMessage(defaultMessage, newSessionId, true); // Pass a flag to indicate this is the initial message
      } else {
        setMessages([{ author: 'agent', text: 'Error: Could not connect to the chat service.' }]);
        setIsAgentTyping(false);
      }
    }
  };

  const sendMessage = async (messageText, currentSessionId, isInitialMessage = false) => {
    if (!messageText.trim()) return;

    // If it's a new message typed by the user, add it to the chat.
    // We skip this for the initial message because we already added it in toggleChat().
    if (!isInitialMessage) {
        setMessages(prev => [...prev, { author: 'user', text: messageText }]);
        setInputValue('');
    }
    
    setIsAgentTyping(true);

    let agentResponse = '';
    
    await sendChatMessage(
      messageText,
      currentSessionId,
      (chunk) => { // onChunk
        agentResponse += chunk;
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.author === 'agent') {
            return [...prev.slice(0, -1), { author: 'agent', text: agentResponse }];
          } else {
            return [...prev, { author: 'agent', text: agentResponse }];
          }
        });
      },
      () => { // onComplete
        setIsAgentTyping(false);
      },
      (error) => { // onError
        console.error("Chat error:", error);
        setMessages(prev => [...prev, { author: 'agent', text: `Sorry, I encountered an error. ${error}` }]);
        setIsAgentTyping(false);
      }
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue, sessionId);
  };
  
  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Support Assistant</h3>
            <button onClick={toggleChat} className="close-btn">&times;</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.author}`}>
                <div className="avatar">{msg.author === 'user' ? '👤' : '🤖'}</div>
                <div className="text">{msg.text}</div>
              </div>
            ))}
            {isAgentTyping && (
              <div className="message agent typing">
                <div className="avatar">🤖</div>
                <div className="text"><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleFormSubmit} className="chat-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isAgentTyping}
            />
            <button type="submit" disabled={isAgentTyping || !inputValue}>Send</button>
          </form>
        </div>
      )}
      <button onClick={toggleChat} className="floating-chat-button">
        {isOpen ? '✖' : '💬'}
      </button>
    </div>
  );
};

export default ChatWidget;