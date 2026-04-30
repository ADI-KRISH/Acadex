import { useState, useEffect, useRef } from 'react';
import Topbar from '../components/Topbar';
import ChatMessage from '../components/ChatMessage';
import ChatCustomizeModal from '../components/ChatCustomizeModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiGetMessages, apiSendMessage } from '../services/api';
import { CLASS_MAP } from '../services/mockData';
import './ChatPage.css';

export default function ChatPage() {
  const { user }           = useAuth();
  const { settings }       = useTheme();
  const [activeRoom, setActiveRoom] = useState('cs');
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [chatStyle, setChatStyle]   = useState({ bg: '#0f0f13', bubble: '#3d3680', fontSize: 14, name: '' });
  const bottomRef = useRef(null);

  useEffect(() => {
    apiGetMessages(activeRoom).then(setMessages);
  }, [activeRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMsg = async () => {
    if (!input.trim()) return;
    const msg = await apiSendMessage(activeRoom, input.trim());
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } };

  const groupName = chatStyle.name || `${CLASS_MAP[activeRoom]?.label} — General`;

  return (
    <>
      <Topbar title="Group Chat" showSearch={false} />
      <div className="chat-shell">

        {/* Room list */}
        <div className="chat-rooms">
          <div className="rooms-title">Chats</div>
          {Object.entries(CLASS_MAP).map(([k, { label, color }]) => (
            <div
              key={k}
              className={`room-item ${activeRoom === k ? 'active' : ''}`}
              onClick={() => setActiveRoom(k)}
            >
              <div className="room-dot" style={{ background: color }} />
              <span>{label}</span>
              {k === 'cs' && <span className="badge" style={{ marginLeft:'auto' }}>3</span>}
            </div>
          ))}
        </div>

        {/* Chat window */}
        <div className="chat-window">
          <div className="chat-header">
            <div className="avatar" style={{ width:36, height:36, background:`linear-gradient(135deg,${CLASS_MAP[activeRoom]?.color},#5cb8e4)` }}>
              {CLASS_MAP[activeRoom]?.label[0]}
            </div>
            <div>
              <div className="chat-title">{groupName}</div>
              <div className="chat-members">42 members · 8 online <span style={{ width:7, height:7, background:'var(--green)', borderRadius:'50%', display:'inline-block', marginLeft:6 }} /></div>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
              <button className="btn btn-ghost" style={{ fontSize:12 }} onClick={() => setCustomOpen(true)}>🎨 Customise</button>
            </div>
          </div>

          <div className="chat-messages" style={{ background: chatStyle.bg }}>
            {messages.map(m => (
              <ChatMessage key={m.id} msg={m} chatBg={chatStyle.bg} bubbleColor={chatStyle.bubble} />
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              type="text"
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              style={{ fontSize: chatStyle.fontSize }}
            />
            <button className="send-btn" onClick={sendMsg} disabled={!input.trim()}>➤</button>
          </div>
        </div>
      </div>

      <ChatCustomizeModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        groupName={groupName}
        onApply={(style) => setChatStyle(prev => ({ ...prev, ...style }))}
      />
    </>
  );
}
