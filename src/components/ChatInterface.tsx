import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  ArrowLeft, 
  Image as ImageIcon, 
  FileText, 
  Mic,
  Camera,
  Check,
  CheckCheck,
  Phone,
  Video,
  Search,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  attachment?: {
    name: string;
    url: string;
    size?: string;
  };
}

interface ChatInterfaceProps {
  chat: {
    id: string;
    user: {
      name: string;
      avatar: string;
      online: boolean;
      role?: string;
    };
  };
  currentUserId: string;
  onBack: () => void;
  onSendMessage: (text: string) => void;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'other',
    text: 'Hey! Did you manage to solve that integration problem from yesterday?',
    time: '10:30 AM',
    status: 'read',
    type: 'text'
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Not yet, I\'m still struggling with the trig substitution part. The Navier-Stokes tip Sarah shared in the feed helped though!',
    time: '10:32 AM',
    status: 'read',
    type: 'text'
  },
  {
    id: '3',
    senderId: 'other',
    text: 'I found this resource that explains it perfectly. Check it out.',
    time: '10:35 AM',
    status: 'read',
    type: 'text'
  },
  {
    id: '4',
    senderId: 'other',
    text: 'Integration Methods.pdf',
    time: '10:35 AM',
    status: 'read',
    type: 'file',
    attachment: {
      name: 'Integration Methods.pdf',
      url: '#',
      size: '2.4 MB'
    }
  },
  {
    id: '5',
    senderId: 'me',
    text: 'This is gold! Thanks a lot. Want to review it together at 4 PM?',
    time: '10:40 AM',
    status: 'delivered',
    type: 'text'
  }
];

export default function ChatInterface({ chat, currentUserId, onBack, onSendMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (type: string) => {
    setShowAttachments(false);
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setShowAttachments(false);
      }
    };

    if (showAttachments) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttachments]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newMessage: Message = {
      id: generateId(),
      senderId: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    onSendMessage(inputText);
    setInputText('');

    // Simulate response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response: Message = {
          id: generateId(),
          senderId: 'other',
          text: 'Sure, 4 PM works for me! See you in the study library.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          type: 'text'
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 z-50 bg-dark-bg flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between backdrop-blur-xl bg-dark-bg/80 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <img 
                src={chat.user.avatar} 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-brand-secondary/30 transition-all" 
                alt={chat.user.name}
              />
              {chat.user.online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-dark-bg rounded-full shadow-lg" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">{chat.user.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-green-500 font-black uppercase tracking-widest leading-none">
                  {chat.user.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-95">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-8 scrollbar-hide space-y-8 max-w-4xl mx-auto w-full"
      >
        <div className="flex justify-center mb-10">
          <span className="px-5 py-2 rounded-2xl bg-white/[0.03] text-[9px] font-black uppercase tracking-widest text-white/20 border border-white/5 backdrop-blur-md">
            Academic Discussion • Oct 24
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%] relative group",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "p-4 rounded-[2rem] text-sm font-medium leading-relaxed shadow-2xl transition-all duration-300",
                isMe 
                  ? "bg-brand-primary text-dark-bg rounded-tr-sm hover:translate-x-[-4px]" 
                  : "bg-white/[0.03] text-white/80 border border-white/5 backdrop-blur-xl rounded-tl-sm hover:translate-x-[4px]"
              )}>
                {msg.type === 'text' && msg.text}
                
                {msg.type === 'file' && msg.attachment && (
                  <div className="flex items-center gap-4 py-1">
                    <div className={cn(
                      "w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-inner",
                      isMe ? "bg-dark-bg/10 text-dark-bg" : "bg-brand-secondary/20 text-brand-secondary"
                    )}>
                      <FileText size={24} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        "text-xs font-black truncate mb-0.5",
                        isMe ? "text-dark-bg" : "text-white"
                      )}>{msg.attachment.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest opacity-40",
                          isMe ? "text-dark-bg" : "text-white"
                        )}>{msg.attachment.size}</span>
                        <div className={cn("w-1 h-1 rounded-full", isMe ? "bg-dark-bg/20" : "bg-white/10")} />
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest opacity-40",
                          isMe ? "text-dark-bg" : "text-white"
                        )}>PDF Document</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2.5 px-2">
                <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.15em]">{msg.time}</span>
                {isMe && (
                  <div className={cn(
                    "transition-colors",
                    msg.status === 'read' ? "text-brand-secondary" : "text-brand-primary/40"
                  )}>
                    {msg.status === 'read' ? <CheckCheck size={12} strokeWidth={3} /> : <Check size={12} strokeWidth={3} />}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start mr-auto"
          >
            <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none flex gap-1 items-center border border-white/5">
              <motion.span 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-1.5 h-1.5 rounded-full bg-white/40"
              />
              <motion.span 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-white/40"
              />
              <motion.span 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                className="w-1.5 h-1.5 rounded-full bg-white/40"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-6 border-t border-white/5 bg-dark-bg/50 backdrop-blur-xl">
        <div className="relative group max-w-4xl mx-auto w-full">
          <div className="absolute inset-0 bg-brand-secondary/5 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative bg-white/[0.03] border border-white/5 rounded-3xl p-2 flex items-end gap-2 focus-within:border-brand-secondary/30 transition-all">
            <textarea 
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message"
              className="flex-1 bg-transparent border-none outline-none py-2.5 px-4 text-sm text-white placeholder:text-white/10 resize-none min-h-[40px] max-h-[120px] scrollbar-hide"
            />
            <div className="flex items-center gap-1 shrink-0 p-0.5 relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onSendMessage(`[Attached: ${file.name}]`);
                    // In a real app we would upload and send message here
                  }
                }}
              />
              <AnimatePresence>
                {showAttachments && (
                  <motion.div
                    ref={attachmentMenuRef}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-full right-0 mb-4 bg-[#0A0A0A] border border-white/10 rounded-3xl p-3 flex flex-col gap-2 min-w-[180px] shadow-[0_20px_100px_rgba(0,0,0,1)] z-50"
                  >
                    <button 
                      onClick={() => handleFileSelect('gallery')}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group w-full text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-brand-secondary/20 flex items-center justify-center text-brand-secondary group-hover:scale-110 transition-transform">
                        <ImageIcon size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Gallery</span>
                    </button>
                    <button 
                      onClick={() => handleFileSelect('camera')}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group w-full text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                        <Camera size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Camera</span>
                    </button>
                    <button 
                      onClick={() => handleFileSelect('files')}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group w-full text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                        <FileText size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Documents</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setShowAttachments(!showAttachments)}
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90",
                  showAttachments ? "bg-white/10 text-white" : "text-white/20 hover:text-white"
                )}
              >
                <Paperclip size={20} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 ml-1 shadow-lg",
                  inputText.trim() 
                    ? "bg-brand-primary text-dark-bg shadow-brand-primary/20" 
                    : "bg-white/5 text-white/20"
                )}
              >
                <Send size={18} strokeWidth={2.5} className={cn(inputText.trim() && "translate-x-0.5 -translate-y-0.5")} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
