import React from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info, Trash2, CheckCheck } from 'lucide-react';
import { motion, PanInfo, AnimatePresence } from 'motion/react';
import { NotificationItem } from '../types';
import { cn } from '../lib/utils';

export default function Notifications({ 
  notifications, 
  setNotifications, 
  onClose 
}: { 
  notifications: NotificationItem[], 
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>,
  onClose: () => void 
}) {

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleItemDragEnd = (id: string, info: PanInfo) => {
    if (info.offset.x > 100) {
      markAsRead(id);
    } else if (info.offset.x < -100) {
      deleteNotification(id);
    }
  };

  return (
    <div className="h-full flex flex-col pt-4">
      <header className="px-6 py-4 flex justify-between items-center border-b border-dark-border bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Bell size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Inbox</h2>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-none">Management Center</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={markAllAsRead} 
            title="Mark all as read"
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-brand-primary active:text-brand-primary active:bg-brand-primary/10"
          >
            <CheckCheck size={20} />
          </motion.button>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={20} className="text-white/40" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <div className="px-2 mb-2">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Swipe left to del • right to read</p>
        </div>
        <AnimatePresence initial={false} mode="popLayout">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="relative rounded-2xl overflow-hidden bg-black/20"
            >
              {/* Swipe Background Decorations - Layered behind card */}
              <div className="absolute inset-0 flex justify-between items-center px-8">
                <motion.div 
                  className="flex items-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-widest"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 0.5, x: 0 }}
                >
                  <CheckCheck size={16} /> Mark Read
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 0.5, x: 0 }}
                >
                  Delete <Trash2 size={16} />
                </motion.div>
              </div>

              <motion.div
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => handleItemDragEnd(n.id, info)}
                whileDrag={{ scale: 1.01, zIndex: 30 }}
                className={cn(
                  "relative border-none p-5 group transition-all duration-500 z-10 touch-pan-y cursor-grab active:cursor-grabbing rounded-2xl shadow-2xl",
                  !n.read 
                    ? 'bg-gradient-to-br from-[#1A1A1A] to-[#141414] border border-brand-primary/20' 
                    : 'bg-[#0F0F0F]/80 border border-white/5 grayscale-[0.5]'
                )}
              >
                <div className={cn("transition-all duration-500", n.read ? "opacity-40 italic" : "opacity-100")}>
                  {!n.read && (
                    <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-brand-primary rounded-full shadow-[0_0_12px_rgba(204,255,0,0.8)]" />
                  )}
                  
                  <div className="flex gap-4">
                    <div className={cn(
                      "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                      n.type === 'success' ? 'border-brand-primary/30 text-brand-primary bg-brand-primary/5' :
                      n.type === 'alert' ? 'border-red-500/30 text-red-500 bg-red-500/5' :
                      'border-brand-secondary/30 text-brand-secondary bg-brand-secondary/5',
                      n.read && "border-white/5 text-white/20 bg-transparent"
                    )}>
                      {n.type === 'success' ? <CheckCircle2 size={22} /> :
                       n.type === 'alert' ? <AlertCircle size={22} /> :
                       <Info size={22} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className={cn(
                          "text-sm font-bold truncate leading-tight transition-colors duration-500",
                          !n.read ? 'text-white' : 'text-white/40'
                        )}>
                          {n.title}
                        </h3>
                        <span className="text-[9px] text-white/20 font-black uppercase shrink-0 mt-0.5">{n.time}</span>
                      </div>
                      <p className={cn(
                        "text-xs leading-relaxed line-clamp-2 transition-colors duration-500",
                        !n.read ? 'text-white/60' : 'text-white/20'
                      )}>
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Overlay - Visible only when marked as read via swipe or button */}
                <AnimatePresence>
                  {n.read && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    >
                      <CheckCheck size={40} className="text-brand-primary/10" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {notifications.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/10">
              <Bell size={32} />
            </div>
            <p className="text-white/40 text-sm font-bold">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
