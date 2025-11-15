import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('chatbot_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save chat history to localStorage
    if (messages.length > 0) {
      localStorage.setItem('chatbot_history', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: input,
        history: messages.map((m) => m.content),
      });

      const aiMessage = { role: 'assistant', content: response.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to get response', 'error');
      setMessages((prev) => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      setMessages([]);
      localStorage.removeItem('chatbot_history');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: 'black' }}>AI Travel Assistant</h1>
          <button
            onClick={clearHistory}
            style={{
              padding: '8px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Clear History
          </button>
        </div>

        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '5px',
            height: '500px',
            overflowY: 'auto',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'black', marginTop: '50%' }}>
              <p style={{ color: 'black' }}>Start a conversation with the AI travel assistant!</p>
              <p style={{ fontSize: '14px', marginTop: '10px', color: 'black' }}>
                Ask about destinations, travel tips, or planning advice.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    backgroundColor: msg.role === 'user' ? '#007bff' : 'white',
                    color: msg.role === 'user' ? 'white' : 'black',
                    border: msg.role === 'user' ? 'none' : '1px solid #ddd',
                  }}
                >
                  <span style={{ color: msg.role === 'user' ? 'white' : 'black' }}>{msg.content}</span>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
              <div
                style={{
                  padding: '10px 15px',
                  borderRadius: '10px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                }}
              >
                <span style={{ color: 'black' }}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '16px',
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: '16px',
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Chatbot;

