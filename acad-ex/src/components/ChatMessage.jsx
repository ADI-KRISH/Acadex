import './ChatMessage.css';

export default function ChatMessage({ msg, chatBg, bubbleColor }) {
  return (
    <div className={`msg ${msg.mine ? 'mine' : ''}`}>
      {!msg.mine && (
        <div
          className="msg-avatar avatar"
          style={{ width:28, height:28, fontSize:11, background:`${msg.color}22`, color:msg.color }}
        >
          {msg.initials}
        </div>
      )}
      <div className="msg-content">
        {!msg.mine && <div className="msg-name">{msg.name}</div>}
        <div
          className="msg-bubble"
          style={msg.mine ? { background:`${bubbleColor}33`, borderColor:`${bubbleColor}66` } : {}}
        >
          {msg.text}
        </div>
        <div className="msg-time">{msg.time}</div>
      </div>
    </div>
  );
}
