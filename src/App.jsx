// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Plus, Sparkles, User, Menu, MessageSquare, X, Trash2, ChevronRight } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  // Load history from localStorage on initial render
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ?JKSON.parse(saved) : [];
  });
  
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  // Initialize a new chat if no history exists or just start clean
  useEffect(() => {
    if (activeChatId) {
      const chat = history.find(c => c.id === activeChatId);
      if (chat) setMessages(chat.messages);
    } else {
      setMessages([{ text: "Namaste! Main Rasmalai AI hoon. Boliye aaj kya banayein?", sender: "ai", id: Date.now() }]);
    }
  }, [activeChatId]);

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory',JKSON.stringify(history));
  }, [history]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    const userMsg = { text: userText, sender: "user", id: Date.now() };
    
    // Optimistic Update
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // If this is a new chat (no active ID), create one
    let currentChatId = activeChatId;
    if (!currentChatId) {
      currentChatId = Date.now();
      setActiveChatId(currentChatId);
      // Create new session in history
      const newSession = {
        id: currentChatId,
        title: userText.slice(0, 30) + (userText.length > 30 ? "..." : ""),
        timestamp: new Date().toLocaleDateString(),
        messages: newMessages
      };
      setHistory(prev => [newSession, ...prev]);
    } else {
      // Update existing session
      updateHistory(currentChatId, newMessages);
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(userText);
      const response = await result.response;
      const aiText = response.text();
      const aiMsg = { text: aiText, sender: "ai", id: Date.now() + 1 };
      
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      updateHistory(currentChatId, finalMessages);
      
    } catch (err) {
      console.error(err);
      const errorMsg = { text: "Thoda issue hai boss (API Error). Check internet connection.", sender: "ai", id: Date.now() + 1 };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const updateHistory = (chatId, updatedMsgs) => {
    setHistory(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, messages: updatedMsgs } : chat
    ));
  };

  const startNewChat = () => {
    setActiveChatId(null); // Reset to null to trigger "new chat" UI
    setSidebarOpen(false);
  };

  const loadChat = (id) => {
    setActiveChatId(id);
    setSidebarOpen(false);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Overlay with blur */}
      <div 
        className={`mobile-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-area">
            <Sparkles size={24} className="logo-icon" />
            <span className="logo-text">Rasmalai AI</span>
          </div>
          <button className="close-btn-mobile" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={startNewChat}>
          <Plus size={18} />
          <span>New Chat</span>
        </button>

        <div className="history-section">
          <p className="history-label">YOUR CONVERSATIONS</p>
          {history.length === 0 ? (
            <div className="empty-history">No chats yet</div>
          ) : (
            history.map(chat => (
              <div 
                key={chat.id} 
                className={`history-item ${activeChatId === chat.id ? 'active' : ''}`}
                onClick={() => loadChat(chat.id)}
              >
                <MessageSquare size={16} className="history-icon"/>
                <span className="history-title">{chat.title}</span>
                <button 
                  className="delete-chat-btn"
                  onClick={(e) => deleteChat(e, chat.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar user-avatar-sm">
              <User size={16} />
            </div>
            <span>User</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-nav">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="nav-title">
            {activeChatId ? history.find(h => h.id === activeChatId)?.title || "Chat" : "New Chat"}
          </span>
          <div className="nav-badge">BETA</div>
        </header>

        <div className="chat-area">
          {messages.map((m) => (
            <div key={m.id} className={`msg-wrapper ${m.sender}`}>
              <div className={`avatar ${m.sender === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                {m.sender === 'user' ? <User size={20} /> : <Sparkles size={20} />}
              </div>
              <div className={`bubble ${m.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                {m.text}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="msg-wrapper ai">
              <div className="avatar ai-avatar"><Sparkles size={20} /></div>
              <div className="bubble ai-bubble loading">
                <div className="dot"></div><div className="dot"></div><div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} style={{ height: '10px' }} />
        </div>

        <div className="input-container">
          <div className="input-box glass-effect">
            <input 
              placeholder="Ask me anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              className={`send-btn ${input.trim() ? 'active' : ''}`}
              onClick={handleSend} 
              disabled={!input.trim() || loading}
            >
              {loading ? <div className="spinner"></div> : <Send size={20} />}
            </button>
          </div>
          <p className="disclaimer">
            AI can make mistakes. Verify important info.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
