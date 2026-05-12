import { useState, useEffect, useRef } from 'react';
import Topbar from '../components/Topbar';
import ChatMessage from '../components/ChatMessage';
import ChatCustomizeModal from '../components/ChatCustomizeModal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { apiGetChatRooms, apiGetMessages, socket } from '../services/api';
import './ChatPage.css';

export default function ChatPage() {
  const { user } = useAuth();
  const { activeClass } = useApp();
  const [rooms, setRooms]           = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [chatStyle, setChatStyle]   = useState({ bg: '#0f0f13', bubble: '#3d3680', fontSize: 14, name: '' });
  const [loading, setLoading]       = useState(true);
  const bottomRef = useRef(null);

  // Load chat rooms
  useEffect(() => {
    apiGetChatRooms()
      .then(res => {
        const chatRooms = res.data?.chatRooms || [];
        setRooms(chatRooms);
        if (chatRooms.length > 0) setActiveRoom(chatRooms[0]);
      })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  // Connect socket & join room when active room changes
  useEffect(() => {
    if (!activeRoom) return;

    socket.connect();
    socket.emit('join_room', activeRoom._id);

    // Load message history
    setLoading(true);
    apiGetMessages(activeRoom._id)
      .then(res => {
        setMessages(res.data?.messages || []);
        setLoading(false);
      })
      .catch(() => { setMessages([]); setLoading(false); });

    // Listen for new messages
    const handler = (msg) => setMessages(prev => [...prev, msg]);
    socket.on('receive_message', handler);

    return () => {
      socket.emit('leave_room', activeRoom._id);
      socket.off('receive_message', handler);
    };
  }, [activeRoom]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMsg = () => {
    if (!input.trim() || !activeRoom) return;
    socket.emit('send_message', {
      roomId:   activeRoom._id,
      senderId: user?._id,
      content:  input.trim(),
    });
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  // Map message to display shape
  const displayMsg = (m) => {
    const isMe = m.sender?._id === user?._id || m.sender === user?._id;
    const firstName = m.sender?.profile?.firstName || '';
    const lastName  = m.sender?.profile?.lastName  || '';
    const name      = `${firstName} ${lastName}`.trim() || m.sender?.username || 'Unknown';
    const initials  = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const time      = new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return { ...m, name, initials, text: m.content, time, mine: isMe, color: '#7c6af7' };
  };

  const filteredRooms = rooms.filter(r => 
    activeClass === 'all' || r.classGroup?.name === activeClass
  );

  return (
    <>
      <Topbar title="Group Chat" showSearch={false} />
      <div className="chat-shell">
        {/* Room list */}
        <div className="chat-rooms">
          <div className="rooms-title">Chats</div>
          {filteredRooms.length === 0 ? (
            <div style={{ padding: '12px', fontSize: 12, color: 'var(--muted)' }}>
              No chat rooms found for {activeClass}.
            </div>
          ) : (
            filteredRooms.map(room => (
              <div key={room._id}
                className={`room-item ${activeRoom?._id === room._id ? 'active' : ''}`}
                onClick={() => setActiveRoom(room)}>
                <div className="room-dot" style={{ background: '#3ccf91' }} />
                <span>{room.name}</span>
              </div>
            ))
          )}
        </div>

        {/* Chat window */}
        <div className="chat-window">
          {activeRoom ? (
            <>
              <div className="chat-header">
                <div className="avatar" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #7c6af7, #5cb8e4)' }}>
                  {activeRoom.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="chat-title">{chatStyle.name || activeRoom.name}</div>
                  <div className="chat-members">{activeRoom.classGroup?.name || ''}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setCustomOpen(true)}>🎨 Customise</button>
                </div>
              </div>

              <div className="chat-messages" style={{ background: chatStyle.bg }}>
                {loading ? (
                  <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', marginTop: 40 }}>Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', marginTop: 40 }}>No messages yet. Say hello! 👋</div>
                ) : (
                  messages.map(m => <ChatMessage key={m._id} msg={displayMsg(m)} bubbleColor={chatStyle.bubble} />)
                )}
                <div ref={bottomRef} />
              </div>

              <div className="chat-input-area">
                <input className="chat-input" type="text"
                  placeholder="Type a message…"
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  style={{ fontSize: chatStyle.fontSize }} />
                <button className="send-btn" onClick={sendMsg} disabled={!input.trim()}>➤</button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🗨️</div>
              <div className="empty-title">Select a chat room</div>
            </div>
          )}
        </div>
      </div>

      <ChatCustomizeModal
        open={customOpen} onClose={() => setCustomOpen(false)}
        groupName={chatStyle.name || activeRoom?.name}
        onApply={(s) => setChatStyle(prev => ({ ...prev, ...s }))}
      />
    </>
  );
}
