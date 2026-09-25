import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trophy, 
  Calendar, 
  Target, 
  Zap, 
  Clock, 
  TrendingUp, 
  ShieldCheck,
  Brain,
  Share2,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface QuizHistoryItem {
  id: string;
  title: string;
  score: number;
  total: number;
  date: string;
  isExam?: boolean;
}

interface MissionDetailBottomSheetProps {
  item: QuizHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MissionDetailBottomSheet({ 
  item, 
  isOpen, 
  onClose 
}: MissionDetailBottomSheetProps) {
  if (!item) return null;

  const mastery = Math.round((item.score / item.total) * 100);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-[200] backdrop-blur-md"
          />
          
          {/* Bottom Sheet */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[210] bg-[#0a0a0b] rounded-t-[40px] border-t border-white/5 pb-10 max-w-lg mx-auto overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Handle Bar */}
            <div className="pt-3 pb-2">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto" />
            </div>

            {/* Content Container */}
            <div className="px-6 py-4 max-h-[85vh] overflow-y-auto scrollbar-hide">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                      item.isExam 
                        ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20" 
                        : "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20"
                    )}>
                      {item.isExam ? 'Final Protocol' : 'Mission Success'}
                    </span>
                    <span className="text-[10px] text-white/30 font-bold flex items-center gap-1 uppercase tracking-widest">
                      <Calendar size={10} /> {item.date}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black italic uppercase text-white tracking-tight leading-tight pt-1">
                    {item.title}
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="glass-card p-6 rounded-[32px] border-white/5 flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-3">
                    <Target size={24} />
                  </div>
                  <div className="text-2xl font-black text-white">{item.score}/{item.total}</div>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Raw Score</p>
                </div>

                <div className="glass-card p-6 rounded-[32px] border-brand-secondary/20 bg-brand-secondary/5 flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary mb-3">
                    <Trophy size={24} />
                  </div>
                  <div className="text-2xl font-black text-white">{mastery}%</div>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Neural Mastery</p>
                </div>
              </div>

              {/* Insights Section */}
              <div className="space-y-4 mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 px-2 flex items-center gap-2">
                  <Brain size={12} /> Post-Mission Insights
                </h3>
                
                <div className="glass-card p-5 rounded-[28px] border-white/5 space-y-4">
                  <InsightItem 
                    icon={<Zap size={14} className="text-brand-primary" />}
                    title="Cognitive Speed"
                    value="Fast"
                    description="You answered 20% faster than average."
                  />
                  <div className="h-px bg-white/5 mx-2" />
                  <InsightItem 
                    icon={<ShieldCheck size={14} className="text-brand-secondary" />}
                    title="Accuracy Streak"
                    value="8x Combo"
                    description="Flawless execution during the core section."
                  />
                  <div className="h-px bg-white/5 mx-2" />
                  <InsightItem 
                    icon={<TrendingUp size={14} className="text-emerald-400" />}
                    title="Progression"
                    value="+12% Gain"
                    description="Significant improvement since your last run."
                  />
                </div>
              </div>

              {/* Summary / Notes */}
              <div className="glass-card p-6 rounded-[32px] border-white/5 mb-10 bg-white/[0.01]">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3">Tactical Briefing</h4>
                <p className="text-xs text-white/50 leading-relaxed font-medium italic">
                   The performance indicates high retention in core concepts. However, we've identified a slight latency in your response to "Complex System Interactions." A deeper review of these modules is recommended before the next milestone.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="flex items-center justify-center gap-2 py-4 glass border-white/10 text-white font-black uppercase tracking-widest rounded-2xl text-[9px] hover:bg-white/5 transition-all active:scale-95 group"
                >
                  <Share2 size={14} className="group-hover:scale-110 transition-transform" /> Share Results
                </button>
                <button 
                  className="flex items-center justify-center gap-2 py-4 bg-brand-primary text-black font-black uppercase tracking-widest rounded-2xl text-[9px] hover:shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] transition-all active:scale-95 group"
                >
                  Redeem Rewards <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InsightItem({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-white/80">{title}</span>
          <span className="text-[10px] font-black text-brand-secondary uppercase">{value}</span>
        </div>
        <p className="text-[10px] text-white/30 leading-tight">{description}</p>
      </div>
    </div>
  );
}
