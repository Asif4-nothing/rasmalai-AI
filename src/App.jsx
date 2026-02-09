import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Image as ImgIcon, Plus, Trash2 } from 'lucide-react';

const API_KEY = "AIzaSyBKShwzw4BIj68K32-sCQa6dunbJPQaTh8"; // Teri API Key
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [messages, setMessages] = useState([{ text: "Welcome to rasmalai.", sender: "ai" }]);
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
    const userMsg = { text: input, sender: "user", img: imgData?.url };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true); setInput(""); setImgData(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      let result;
      if (imgData) {
        const imagePart = await convertToBase64(imgData.file);
        result = await model.generateContent([input || "Describe this image", imagePart]);
      } else {
        result = await model.generateContent(input);
      }
      const text = await result.response.text();
      setMessages(prev => [...prev, { text, sender: "ai" }]);
    } catch (e) {
      setMessages(prev => [...prev, { text: "Error: API limit ya network check kar.", sender: "ai" }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="new-chat" onClick={() => window.location.reload()}><Plus size={18}/> New Chat</div>
        <div style={{color:'#666', fontSize:'12px'}}>HISTORY (Coming Soon)</div>
      </div>

      <div className="main">
        <div className="chat-window">
          {messages.map((m, i) => (
            <div key={i} className={`msg-row ${m.sender === 'user' ? 'user-row' : 'ai-row'}`}>
              <div className={`avatar ${m.sender === 'user' ? 'user-av' : 'ai-av'}`}>{m.sender === 'user' ? 'U' : 'R'}</div>
              <div className="txt">
                {m.img && <img src={m.img} className="uploaded-img" alt="input" />}
                <p>{m.text}</p>
              </div>
            </div>
          ))}
          {loading && <div className="msg-row ai-row">Rasmalai ban rahi hai... 🍮</div>}
          <div ref={scrollRef} />
        </div>

        <div className="input-area">
          {imgData && <div className="preview-box"><img src={imgData.url} /><Trash2 onClick={() => setImgData(null)} style={{cursor:'pointer', color:'red'}}/></div>}
          <div className="input-wrapper">
            <input type="file" id="file" hidden onChange={(e) => setImgData({file: e.target.files[0], url: URL.createObjectURL(e.target.files[0])})} />
            <label htmlFor="file" className="btn"><ImgIcon /></label>
            <input placeholder="Ask Rasmalai AI..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
            <button className="btn" onClick={handleSend}><Send /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;