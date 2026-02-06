import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Phone, Video, MoreVertical, Image as ImageIcon, 
  Camera, Mic, Send, Lock, ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import { useCall } from '@/context/CallContext';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chatApi } from '@/api/chat';
import type { Message as ApiMessage, Room } from '@/types';
import { profilesApi } from '@/api/profiles';
import IceBreakerOverlay from '@/components/IceBreakerOverlay';

type UiMessage = {
  id: string;
  text?: string;
  image?: string;
  audio?: boolean;
  sender: 'me' | 'other';
  timestamp: number;
  type: 'text' | 'image' | 'audio';
};

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { startCall } = useCall();
  const { user } = useAuthStore();
  const isFemale = user?.gender === 'F';

  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [otherProfileName, setOtherProfileName] = useState<string>('User');
  const [presence, setPresence] = useState<'busy' | 'active'>('active');
  const [showIceBreaker, setShowIceBreaker] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      try {
        if (!userId) return;
        try {
          const p = await profilesApi.getById(Number(userId));
          setOtherProfileName(p.display_name || `User #${userId}`);
        } catch (e) {
          console.error(e);
        }
        try {
          const pr = await chatApi.getPresence(Number(userId));
          setPresence(pr.status);
        } catch (e) {
          console.error(e);
        }
        const r = await chatApi.createRoom(Number(userId));
        setRoom(r);
        const msgs = await chatApi.getMessages(r.id);
        const toUi = (m: ApiMessage): UiMessage => ({
          id: String(m.id),
          text: m.content,
          sender: m.sender === user?.id ? 'me' : 'other',
          timestamp: new Date(m.created_at).getTime(),
          type: 'text',
        });
        setMessages(msgs.map(toUi));
      } catch (e) {
        console.error('chat init error', e);
      }
    };
    init();
  }, [userId, user?.id]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Deduct Coin Logic
    if (isFemale) {
      toast.success("Message sent (Free for Women)");
    } else {
      toast.success("Message sent (-1 Coin)");
    }

    const newMessage: UiMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'me',
      timestamp: Date.now(),
      type: 'text',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    if (room) {
      try {
        await chatApi.sendMessage(room.id, newMessage.text || '');
      } catch (e) {
        console.error('send message error', e);
      }
    }
  };

  const handleSendImage = () => {
    // Simulate Image Picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Deduct 5 coins
        if (isFemale) {
          toast.success("Image sent (Free for Women)");
        } else {
          toast.success("Image sent (-5 Coins)");
        }
        
        const newMessage: UiMessage = {
          id: Date.now().toString(),
          image: URL.createObjectURL(file),
          sender: 'me',
          timestamp: Date.now(),
          type: 'image',
        };
        setMessages(prev => [...prev, newMessage]);
        if (room) {
          chatApi.sendMessage(room.id, newMessage.image || '', 'image', newMessage.image);
        }
      }
    };
    input.click();
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      if (isFemale) {
        toast.success("Voice message sent (Free for Women)");
      } else {
        toast.success("Voice message sent (-1 Coin)");
      }
      const newMessage: UiMessage = {
        id: Date.now().toString(),
        audio: true,
        sender: 'me',
        timestamp: Date.now(),
        type: 'audio',
      };
      setMessages(prev => [...prev, newMessage]);
    } else {
      setIsRecording(true);
      toast.info("Recording... Tap again to send");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-3 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="relative">
            <Avatar className="w-10 h-10 border border-gray-200">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${userId}`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 leading-tight">{otherProfileName}</h2>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {presence === 'busy' ? 'Busy' : 'Active'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={() => setShowIceBreaker(true)} className="px-3 py-2 bg-gray-100 rounded text-sm mr-2">
            Games
          </button>
          <button onClick={() => startCall('voice')} className="p-2 hover:bg-gray-100 rounded-full text-blue-600">
            <Phone className="w-6 h-6" />
          </button>
          <button onClick={() => startCall('video')} className="p-2 hover:bg-gray-100 rounded-full text-pink-600">
            <Video className="w-6 h-6" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-yellow-50 px-4 py-2 text-xs text-center text-yellow-800 flex items-center justify-center gap-1 border-b border-yellow-100">
        <Lock className="w-3 h-3" /> Messages are end-to-end encrypted. No one outside this chat can read them.
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                msg.sender === 'me' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}
            >
              {msg.type === 'text' && <p>{msg.text}</p>}
              
              {msg.type === 'image' && (
                <div className="rounded-lg overflow-hidden">
                   <img src={msg.image} alt="Shared" className="w-full h-auto max-h-60 object-cover" />
                </div>
              )}

              {msg.type === 'audio' && (
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="h-1 bg-white/40 flex-1 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-white"></div>
                  </div>
                  <span className="text-xs opacity-80">0:05</span>
                </div>
              )}

              <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-primary-100' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button onClick={handleSendImage} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <Camera className="w-6 h-6" />
          </button>
          <button onClick={handleSendImage} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full hidden sm:block">
            <ImageIcon className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
             <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isFemale ? "Type a message..." : "Type a message (1 coin)..."}
              className="w-full bg-gray-100 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>

          {inputValue.trim() ? (
            <button 
              onClick={handleSendMessage}
              className="p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-600 active:scale-95 transition-transform"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleVoiceRecord}
              className={`p-3 rounded-full shadow-lg transition-all ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white hover:bg-primary-600'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      {showIceBreaker && <IceBreakerOverlay onClose={() => setShowIceBreaker(false)} />}
    </div>
  );
}
