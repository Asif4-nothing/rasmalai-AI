// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Plus, Sparkles, User, Menu, Settings, MessageSquare, X } from 'lucide-react';

// Make sure VITE_GEMINI_API_KEY is in your .env file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [messages, setMessages] = useState([
    { text: "Namaste! Main Rasmalai AI hoon. Aaj main aapki kya madad kar sakta hoon?",Sx sender: "ai" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages(prev => [...prev, { text: userText, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(userText);
      const response = await result.response;
      setMessages(prev => [...prev, { text: response.text(), sender: "ai" }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        text: "Maaf kijiye, kuch technical gadbad ho gayi hai (API Error). Kripya internet check karein ya baad mein try karein.", 
        sender: "ai" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([{ text: "Nayi shuruaat! Boliye kya poochna chahte hain?", sender: "ai" }]);
    setSidebarOpen(false); // Close mobile menu on new chat
  };

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Sparkles size={24} color="#10b981" />
          <span>Rasmalai AI</span>
          {/* Close button for mobile */}
          <button 
            className="mobile-menu-btn" 
            style={{marginLeft: 'auto', color: 'white'}}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={startNewChat}>
          <Plus size={20} />
          <span>New Chat</span>
        </button>

        <div className="history-section">
          <p className="history-label">RECENT CHATS</p>
          <button className="history-item"><MessageSquare size={16} /> Python roadmap...</button>
          <button className="history-item"><MessageSquare size={16} /> React components</button>
          <button className="history-item"><MessageSquare size={16} /> Debugging tips</button>
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="history-item">
            <Settings size={18} /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Rasmalai AI</span>
            <span style={{ fontSize: '0.7rem', background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: '12px' }}>
              BETA
            </span>
          </div>
        </header>

        <div className="chat-area">
          {messages.map((m, i) => (
            <div key={i} className={`msg-wrapper ${m.sender}`}>
              <div className={`avatar ${m.sender === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                {m.sender === 'user' ? <User size={20} /> : <Sparkles size={20} />}
              </div>
              <div className={`bubble ${m.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                {m.text}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="msg-wrapper">
              <div className="avatar ai-avatar"><Sparkles size={20} /></div>
              <div className="bubble ai-bubble">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="input-container">
          <div className="input-box">
            <Plus size={24} color="#94a3b8" style={{ cursor: 'pointer' }} />
            <input 
              placeholder="Ask Rasmalai AI anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              className="send-btn" 
              onClick={handleSend} 
              disabled={!input.trim() || loading}
            >
              <Send size={18} />
            </button>
          </div>
          <p className="disclaimer">
            Rasmalai AI can make mistakes. Please check important info.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
