import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI } from '../../services/api';
import { io } from 'socket.io-client';
import { Send, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatRoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [roomDetails, setRoomDetails] = useState(null);
  
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchRoomAndMessages = async () => {
      try {
        setLoading(true);
        // We could fetch room details separately, but for simplicity, let's just fetch messages
        // and get the room from the list, or add an API to get a single room.
        // Actually, we need to know the room name. Let's just fetch all rooms and find it.
        const roomsRes = await chatAPI.getRooms();
        const room = roomsRes.data.chatRooms.find(r => r._id === id);
        if (room) setRoomDetails(room);

        const messagesRes = await chatAPI.getMessages(id);
        setMessages(messagesRes.data.messages);
      } catch (error) {
        toast.error('Failed to load messages');
        navigate('/chat');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomAndMessages();

    // 2. Setup Socket.IO
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      withCredentials: true
    });

    socketRef.current.emit('join_room', id);

    socketRef.current.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.emit('leave_room', id);
      socketRef.current.disconnect();
    };
  }, [id, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketRef.current.emit('send_message', {
      roomId: id,
      senderId: user._id,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center shadow-sm">
        <button 
          onClick={() => navigate('/chat')}
          className="mr-4 text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{roomDetails?.name || 'Chat Room'}</h1>
          <p className="text-xs text-gray-500">
            {roomDetails?.classGroup?.name} - {roomDetails?.classGroup?.stream}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No messages yet. Be the first to start the discussion!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender?._id === user._id;
            const senderName = isMe ? 'You' : `${msg.sender?.profile?.firstName} ${msg.sender?.profile?.lastName}`;
            
            return (
              <div key={msg._id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-gray-500 mb-1 ml-1">{senderName}</span>
                <div 
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isMe 
                      ? 'bg-primary-600 text-white rounded-br-sm' 
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full resize-none rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-3 px-4"
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-primary-600 p-3 text-white shadow-sm hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[46px] w-[46px]"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoomDetail;
