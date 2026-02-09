import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Plus, Sparkles, User, Menu, X, Settings, MessageSquare } from 'lucide-react';

const API_KEY = ""; // Teri API key
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! Main hoon Rasmalai AI. Bataiye aaj main aapki kaise madad kar sakta hoon?", sender: "ai" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

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
      setMessages(prev => [...prev, { text: "Error: API key issue ya network error. Check kar lo.", sender: "ai" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-900">
            <Sparkles size={18} />
          </div>
          <span>Rasmalai AI</span>
        </div>

        <button className="new-chat-btn" onClick={() => setMessages([{ text: "Boliye, nayi chat shuru karte hain!", sender: "ai" }])}>
          <Plus size={20} />
          <span>New Chat</span>
        </button>

        <div className="history-section">
          <p style={{padding: '0 1rem', fontSize: '0.7rem', color: '#6ee7b7', marginBottom: '0.5rem'}}>RECENT</p>
          <button className="history-item"><MessageSquare size={14} /> Python learning roadmap...</button>
          <button className="history-item"><MessageSquare size={14} /> Fix my CSS bug</button>
        </div>

        <div style={{padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
          <div className="history-item" style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <Settings size={16} /> Settings
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-nav">
          <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <Menu className="mobile-menu-icon" onClick={() => setSidebarOpen(true)} style={{cursor:'pointer'}} />
            <span style={{fontWeight:600}}>Rasmalai AI <span style={{fontSize:'0.6rem', background:'#d1fae5', color:'#065f46', padding:'2px 8px', borderRadius:'10px', marginLeft:'5px'}}>BETA</span></span>
          </div>
        </header>

        <div className="chat-area">
          {messages.map((m, i) => (
            <div key={i} className={`msg-wrapper ${m.sender === 'user' ? 'user-msg-wrapper' : ''}`}>
              <div className={`avatar ${m.sender === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                {m.sender === 'user' ? <User size={18} /> : <Sparkles size={16} />}
              </div>
              <div className={`bubble ${m.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                {m.text}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="msg-wrapper">
              <div className="avatar ai-avatar"><Sparkles size={16} /></div>
              <div className="bubble ai-bubble">
                <span className="dot"></span> <span className="dot"></span> <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="input-container">
          <div className="input-box">
            <Plus size={20} color="#94a3b8" style={{cursor:'pointer'}} />
            <input 
              placeholder="Ask Rasmalai AI anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
              <Send size={18} />
            </button>
          </div>
          <p style={{textAlign:'center', fontSize:'0.65rem', color:'#94a3b8', marginTop:'10px'}}>
            Rasmalai AI can make mistakes. Check important info.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
