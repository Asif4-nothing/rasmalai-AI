import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Image as ImgIcon, Plus, XCircle } from 'lucide-react';

// Isse replace karo
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [messages, setMessages] = useState([{ text: "Welcome to Rasmalai AI", sender: "ai" }]);
  const [input, setInput] = useState("");
  const [imgData, setImgData] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const convertToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({
        inlineData: { data: reader.result.split(',')[1], mimeType: file.type },
      });
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!input && !imgData) return;
    const currentInput = input;
    const currentImg = imgData;
    
    setMessages(prev => [...prev, { text: currentInput, sender: "user", img: currentImg?.url }]);
    setLoading(true); setInput(""); setImgData(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      let result;
      if (currentImg) {
        const imagePart = await convertToBase64(currentImg.file);
        result = await model.generateContent([currentInput || "Describe this image", imagePart]);
      } else {
        result = await model.generateContent(currentInput);
      }
      const text = await result.response.text();
      setMessages(prev => [...prev, { text, sender: "ai" }]);
    } catch (e) {
      setMessages(prev => [...prev, { text: "Error: Network issue.", sender: "ai" }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="new-chat" onClick={() => window.location.reload()}><Plus size={18}/> New Chat</div>
        <p style={{color:'#555', fontSize:'12px', marginTop:'auto'}}>Rasmalai AI v2.0</p>
      </div>

      <div className="main">
        <div className="chat-header">Rasmalai AI</div>

        <div className="chat-window">
          {messages.map((m, i) => (
            <div key={i} className={`msg-row ${m.sender === 'user' ? 'user-row' : 'ai-row'}`}>
              <div className="txt">
                {m.img && <img src={m.img} className="uploaded-img" alt="input" />}
                <p>{m.text}</p>
              </div>
            </div>
          ))}
          {loading && <div className="msg-row ai-row">Rasmalai is typing</div>}
          <div ref={scrollRef} />
        </div>

        <div className="input-area">
          {imgData && (
            <div className="preview-box">
              <img src={imgData.url} alt="preview" />
              <XCircle size={18} onClick={() => setImgData(null)} style={{cursor:'pointer', color:'#ff4444'}}/>
            </div>
          )}
          <div className="input-wrapper">
            <input type="file" id="file" hidden accept="image/*" onChange={(e) => setImgData({file: e.target.files[0], url: URL.createObjectURL(e.target.files[0])})} />
            <label htmlFor="file" className="btn"><ImgIcon size={20}/></label>
            <input 
              placeholder="Ask anything..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            />
            <button className="btn" onClick={handleSend} disabled={loading}>
              <Send size={20} style={{color: (input || imgData) ? '#ffdb58' : '#888'}}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
