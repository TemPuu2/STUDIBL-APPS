import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, MessageCircle, Info, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface UserProfile {
  name: string;
  avatar: string;
  role: string;
  bio?: string;
  online?: boolean;
}

interface UserProfileBottomSheetProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onChat?: () => void;
  onViewFullProfile?: (user: UserProfile) => void;
  isConnected?: boolean;
  onToggleConnect?: (user: UserProfile) => void;
}

export default function UserProfileBottomSheet({ 
  user, 
  isOpen, 
  onClose, 
  onChat, 
  onViewFullProfile,
  isConnected,
  onToggleConnect
}: UserProfileBottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && user && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[210] bg-dark-bg rounded-t-[40px] border-t border-white/10 p-8 pt-4 max-w-lg mx-auto"
          >
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8" />
            
            <div className="flex flex-col items-center text-center">
              <div 
                className="relative mb-4 cursor-pointer active:scale-95 transition-transform"
                onClick={() => onViewFullProfile?.(user)}
              >
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-secondary/20 shadow-2xl" 
                  referrerPolicy="no-referrer"
                />
                {user.online !== undefined && (
                  <div className={user.online ? "absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-dark-bg rounded-full" : "absolute bottom-1 right-1 w-6 h-6 bg-gray-500 border-4 border-dark-bg rounded-full"} />
                )}
              </div>
              
              <h3 
                className="text-xl font-black text-white mb-1 cursor-pointer hover:text-brand-secondary transition-colors"
                onClick={() => onViewFullProfile?.(user)}
              >
                {user.name}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-4">{user.role}</p>
              
              <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-8">
                {user.bio || "No bio yet. Let's connect and study together!"}
              </p>

              <div className="grid grid-cols-3 gap-6 w-full max-w-sm">
                <div className="flex flex-col items-center gap-3 group">
                  <button 
                    onClick={() => onToggleConnect?.(user)}
                    className={cn(
                      "w-14 h-14 rounded-2xl border flex items-center justify-center transition-all active:scale-95",
                      isConnected 
                        ? "bg-brand-secondary text-white border-brand-secondary" 
                        : "bg-white/5 border-white/10 text-white group-hover:bg-brand-secondary group-hover:text-white"
                    )}
                  >
                    {isConnected ? <Check size={24} /> : <UserPlus size={24} />}
                  </button>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    isConnected ? "text-brand-secondary" : "text-white/40 group-hover:text-white"
                  )}>
                    {isConnected ? 'Connected' : 'Connect'}
                  </span>
                </div>
                
                <div className="flex flex-col items-center gap-3 group">
                  <button 
                    onClick={() => {
                      onClose();
                      onChat?.();
                    }}
                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-brand-primary group-hover:text-white transition-all active:scale-95"
                  >
                    <MessageCircle size={24} />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Chat</span>
                </div>

                <div className="flex flex-col items-center gap-3 group">
                  <button 
                    onClick={() => onViewFullProfile?.(user)}
                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-brand-accent group-hover:text-white transition-all active:scale-95"
                  >
                    <Info size={24} />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Info</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
