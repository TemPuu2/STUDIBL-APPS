import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, Target, Trophy, BarChart2, Users, Bell, BookOpen, WifiOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { NotificationItem } from './types';
import { ChatProvider } from './lib/ChatContext';
import { LectureLibraryProvider } from './lib/LectureLibraryContext';
import { StreakProvider, useStreak } from './lib/StreakContext';
import { StatsProvider, useStats } from './lib/StatsContext';
import { DocumentProgressProvider } from './lib/DocumentProgressContext';
import { VideoProgressProvider } from './lib/VideoProgressContext';
import { MissionsProvider } from './lib/MissionsContext';

// Screens
import Dashboard from './components/Dashboard';
import AITutor from './components/AITutor';
import Missions from './components/Missions';
import Quizzes from './components/Quizzes';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import Lectures from './components/Lectures';
import Community from './components/Community';

// Components
import Notifications from './components/Notifications';
import { useOffline } from './lib/useOffline';
import { 
  DashboardSkeleton, 
  AITutorSkeleton, 
  LecturesSkeleton, 
  QuizzesSkeleton,
  CommunitySkeleton, 
  MissionsSkeleton, 
  AnalyticsSkeleton, 
  ProfileSkeleton, 
  NotificationsSkeleton 
} from './components/Skeletons';

type Tab = 'home' | 'ai' | 'lectures' | 'missions' | 'quizzes' | 'analytics' | 'profile' | 'notifications' | 'community';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Daily Mission Complete',
    message: 'You have mastered "Quantum Gates". +50 XP and 5 Gems added!',
    time: '2m ago',
    type: 'success',
    read: false
  },
  {
    id: '2',
    title: 'Weakness Alert',
    message: 'Your performance in "Thermodynamics" has dropped. Practice now?',
    time: '1h ago',
    type: 'alert',
    read: false
  },
  {
    id: '3',
    title: 'New Quiz Available',
    message: 'The Weekly Math Arena is live. Compete now for ranking points!',
    time: '3h ago',
    type: 'info',
    read: true
  }
];

function AppMain() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isTabLoading, setIsTabLoading] = useState(true);
  const [aiTutorTopic, setAiTutorTopic] = useState<string | null>(null);
  const [resumeMission, setResumeMission] = useState<any | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const isOffline = useOffline();
  
  const { streak } = useStreak();
  const { overallAccuracy, studyVelocity, subjects } = useStats();

  // Tab navigation with skeleton loading
  const navigateToTab = React.useCallback((tab: Tab) => {
    if (tab === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(tab);
    
    // Slight delay to showcase skeleton and prevent flicker
    setTimeout(() => {
      setIsTabLoading(false);
    }, 400); 
  }, [activeTab]);

  const handleResume = React.useCallback((mission: any) => {
    setResumeMission(mission);
    if (!mission.type) {
      navigateToTab('home');
      return;
    }

    switch (mission.type) {
      case 'lecture':
      case 'video':
      case 'voice':
      case 'reading':
        navigateToTab('lectures');
        break;
      case 'quiz':
      case 'exam':
        navigateToTab('quizzes');
        break;
      case 'ai-breakdown':
      case 'review':
        navigateToTab('ai');
        break;
      default:
        navigateToTab('home');
    }
  }, [navigateToTab]);

  const handleClearResume = React.useCallback(() => {
    setResumeMission(null);
  }, []);

  // Reset nav visibility and clear resume mission when changing tabs manually (optional)
  // Or maybe keep resumeMission until the screen handles it.
  useEffect(() => {
    setIsNavVisible(activeTab !== 'ai');
  }, [activeTab]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = React.useCallback((notif: Omit<NotificationItem, 'id' | 'time' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const memoizedSetNavVisibility = React.useCallback((visible: boolean) => {
    if (activeTab === 'ai') {
      setIsNavVisible(false);
      return;
    }
    setIsNavVisible(visible);
  }, [activeTab]);

  useEffect(() => {
    // Simulate initial data loading/hydration
    const timer = setTimeout(() => {
      setIsTabLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToAITutor = React.useCallback((topic: string) => {
    setAiTutorTopic(topic);
    navigateToTab('ai');
  }, [navigateToTab]);

  const handleClearTopic = React.useCallback(() => {
    setAiTutorTopic(null);
  }, []);

  const isScreenRestricted = isOffline && !['lectures', 'profile'].includes(activeTab);

  const renderRestrictedMessage = () => (
    <div className="h-full flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6 animate-pulse">
        <WifiOff size={40} />
      </div>
      <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">Offline Mode Control</h2>
      <p className="text-white/40 text-sm leading-relaxed max-w-[240px]">
        This feature requires an active network connection. Please check your signal or switch to your 
        <button 
          onClick={() => navigateToTab('lectures')}
          className="text-brand-primary font-black mx-1 hover:underline"
        >
          Offline Library
        </button>
      </p>
    </div>
  );

  const renderScreen = () => {
    if (isScreenRestricted) return renderRestrictedMessage();
    if (isTabLoading) {
      switch (activeTab) {
        case 'home': return <DashboardSkeleton />;
        case 'ai': return <AITutorSkeleton />;
        case 'missions': return <MissionsSkeleton />;
        case 'quizzes': return <QuizzesSkeleton />;
        case 'analytics': return <AnalyticsSkeleton />;
        case 'lectures': return <LecturesSkeleton />;
        case 'community': return <CommunitySkeleton />;
        case 'profile': return <ProfileSkeleton />;
        case 'notifications': return <NotificationsSkeleton />;
        default: return <DashboardSkeleton />;
      }
    }

    switch (activeTab) {
      case 'home': return <Dashboard onNavigate={navigateToTab} onResume={handleResume} />;
      case 'ai': return (
        <AITutor 
          preselectedTopic={aiTutorTopic} 
          onClearTopic={handleClearTopic} 
          onNavigate={navigateToTab}
          resumeMission={resumeMission}
          onClearResume={handleClearResume}
        />
      );
      case 'missions': return <Missions onAddNotification={addNotification} onResume={handleResume} />;
      case 'quizzes': return (
        <Quizzes 
          resumeMission={resumeMission}
          onClearResume={handleClearResume}
        />
      );
      case 'analytics': return <Analytics onNavigateAI={handleNavigateToAITutor} />;
      case 'lectures': return (
        <Lectures 
          resumeMission={resumeMission}
          onClearResume={handleClearResume}
        />
      );
      case 'community': return <Community setNavVisibility={memoizedSetNavVisibility} onAddNotification={addNotification} />;
      case 'profile': return <Profile />;
      case 'notifications': return (
        <Notifications 
          notifications={notifications}
          setNotifications={setNotifications}
          onClose={() => navigateToTab('home')} 
        />
      );
      default: return <Dashboard onNavigate={navigateToTab} onResume={handleResume} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-0 md:p-6 lg:p-10">
      {/* Desktop Grid Layout */}
      <div className="w-full h-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-8 items-start">
        
        {/* Left Sidebar (Desktop Only) */}
        <aside className="hidden lg:flex flex-col gap-6 h-[768px]">
          {isOffline && (
            <div className="glass-card bg-orange-500/10 border-orange-500/20 p-4">
              <div className="flex items-center gap-2 text-orange-400 mb-1">
                <WifiOff size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Offline Mode</span>
              </div>
              <p className="text-[10px] text-orange-400/60 leading-tight">Syncing paused. Local access enabled for downloaded content.</p>
            </div>
          )}
          <div className="glass-card flex-1">
            <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-8">Academic Intelligence</h3>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-full border-4 border-brand-primary flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                {Math.round(overallAccuracy)}%
              </div>
              <div>
                <p className="text-sm font-bold text-white/90">Mastery Level</p>
                <p className="text-[10px] text-brand-primary font-bold">+3.1% this week</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <SidebarProgress label="Logic & Inference" status={subjects.Logic > 80 ? "Mastered" : "Progressing"} color={subjects.Logic > 80 ? "bg-brand-primary" : "bg-brand-secondary"} width={`${subjects.Logic}%`} />
              <SidebarProgress label="Code Architecture" status={subjects.Code > 80 ? "Mastered" : "Progressing"} color={subjects.Code > 80 ? "bg-brand-primary" : "bg-brand-secondary"} width={`${subjects.Code}%`} />
              <SidebarProgress label="Pure Mathematics" status={subjects.Math > 80 ? "Mastered" : "Progressing"} color={subjects.Math > 80 ? "bg-brand-primary" : "bg-brand-secondary"} width={`${subjects.Math}%`} />
            </div>
          </div>
          <div className="glass-card py-4 overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-brand-secondary/10 blur-xl rounded-full" />
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Study Velocity</p>
            <p className="text-2xl font-black">{(studyVelocity * 7).toFixed(1)}h <span className="text-xs font-normal text-brand-secondary tracking-normal">/ week</span></p>
          </div>
        </aside>

        {/* Center: Mobile Shell Container */}
        <div className="flex justify-center items-center">
          <div className="relative w-full h-[100dvh] md:w-[360px] md:h-[780px] bg-black md:rounded-[48px] md:border-[8px] md:border-dark-muted md:shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
            
            {/* Fixed App Top Bar */}
            <header className="flex justify-between items-center px-6 pt-6 pb-2 z-40 border-b border-white/5">
              <h1 className="text-xl font-black text-brand-primary tracking-tighter">Studibl</h1>
              <div className="flex items-center gap-2">
                {isOffline && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20 mr-2">
                    <WifiOff size={10} /> Offline
                  </div>
                )}
                <button 
                  onClick={() => navigateToTab('quizzes')}
                  className={cn(
                    "p-2 rounded-xl transition-all active:scale-90",
                    activeTab === 'quizzes' ? "bg-brand-secondary/10 text-brand-secondary" : "hover:bg-white/5 text-white/60"
                  )}
                >
                  <Trophy size={18} />
                </button>
                <button 
                  onClick={() => navigateToTab('notifications')}
                  className={cn(
                    "relative p-2 rounded-xl transition-all active:scale-90",
                    activeTab === 'notifications' ? "bg-brand-primary/10 text-brand-primary" : "hover:bg-white/5 text-white/60"
                  )}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-brand-primary text-black font-black text-[9px] rounded-full border-2 border-black flex items-center justify-center animate-in zoom-in duration-300">
                      {unreadCount}
                    </div>
                  )}
                </button>
                <button 
                  onClick={() => navigateToTab('profile')}
                  className={cn(
                    "w-8 h-8 rounded-full border overflow-hidden active:scale-90 transition-transform",
                    activeTab === 'profile' ? "border-brand-primary" : "border-white/10"
                  )}
                >
                  <img src="https://picsum.photos/seed/alex/100/100" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              </div>
            </header>

            {/* Dynamic Content */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
              <AnimatePresence>
                {isOffline && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-orange-500/10 border-b border-orange-500/20 px-6 py-2 shrink-0 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-orange-400">
                      <AlertTriangle size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Offline Mode Enabled</span>
                    </div>
                    <p className="text-[9px] text-orange-400/60 font-medium mt-1 uppercase tracking-tight">Accessing local cache. AI features & feed limited.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full"
                  >
                    {renderScreen()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Navigation Bar */}
            <AnimatePresence>
              {isNavVisible && (
                <motion.nav 
                  initial={{ y: 72, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 72 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 40,
                    mass: 0.8
                  }}
                  className="h-[72px] bg-[rgba(10,10,10,0.9)] backdrop-blur-md flex justify-around items-center px-2 z-50 border-t border-dark-border shrink-0"
                >
                  <NavButton 
                    active={activeTab === 'home'} 
                    onClick={() => navigateToTab('home')} 
                    icon={<Home size={20} />} 
                    label="Home" 
                  />
                  <NavButton 
                    active={activeTab === 'ai'} 
                    onClick={() => navigateToTab('ai')} 
                    icon={<MessageSquare size={20} />} 
                    label="AI Tutor" 
                  />
                  <NavButton 
                    active={activeTab === 'lectures'} 
                    onClick={() => navigateToTab('lectures')} 
                    icon={<BookOpen size={20} />} 
                    label="Lectures" 
                  />
                  <NavButton 
                    active={activeTab === 'community'} 
                    onClick={() => navigateToTab('community')} 
                    icon={<Users size={20} />} 
                    label="Community" 
                  />
                  <NavButton 
                    active={activeTab === 'missions'} 
                    onClick={() => navigateToTab('missions')} 
                    icon={<Target size={20} />} 
                    label="Missions" 
                  />
                  <NavButton 
                    active={activeTab === 'analytics'} 
                    onClick={() => navigateToTab('analytics')} 
                    icon={<BarChart2 size={20} />} 
                    label="Stats" 
                  />
                </motion.nav>
              )}
            </AnimatePresence>

            {/* Android Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/10 rounded-full z-50" />
          </div>
        </div>

        {/* Right Sidebar (Desktop Only) */}
        <aside className="hidden lg:flex flex-col gap-6 h-[768px]">
          <div className="glass-card bg-brand-secondary/5 border-brand-secondary/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-secondary mb-4">AI Tutor Hub</h3>
            <div className="bg-black/40 rounded-xl p-4 mb-4 border border-white/5">
              <p className="text-[10px] text-white/30 mb-2 italic tracking-tight font-medium">Context: Applied Heat Transfer PDF</p>
              <p className="text-xs text-white/80 leading-relaxed font-medium">"I've analyzed your notes. You usually struggle with the Stefan-Boltzmann constant application. Want a quick breakdown?"</p>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left text-[11px] p-3 rounded-xl border border-white/5 bg-white/2 bg-white/0 hover:bg-white/5 transition font-bold">Explain Radiative Transfer</button>
              <button className="w-full text-left text-[11px] p-3 rounded-xl border border-white/5 bg-white/2 bg-white/0 hover:bg-white/5 transition font-bold">Generate Exam Question</button>
            </div>
          </div>

          <div className="glass-card flex-1 overflow-hidden relative">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6">Mission Path</h3>
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-white/5" />
              <div className="space-y-10">
                <PathStep title="Fundamental Laws" status="Completed • Yesterday" active color="bg-brand-primary" />
                <PathStep title="Entropy & Enthalpy" status="Active • 45% Complete" active color="bg-brand-secondary" />
                <PathStep title="Second Law Analysis" status="Locked" color="bg-white/10" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 glass-card p-4 text-center">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Streak</p>
              <p className="text-xl font-black text-orange-400 font-mono tracking-tighter">🔥 {streak}</p>
            </div>
            <div className="flex-1 glass-card p-4 text-center">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Rank</p>
              <p className="text-xl font-black text-brand-secondary font-mono tracking-tighter">#12</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StatsProvider>
      <ChatProvider>
        <LectureLibraryProvider>
          <DocumentProgressProvider>
            <VideoProgressProvider>
              <MissionsProvider>
                <StreakProvider>
                  <AppMain />
                </StreakProvider>
              </MissionsProvider>
            </VideoProgressProvider>
          </DocumentProgressProvider>
        </LectureLibraryProvider>
      </ChatProvider>
    </StatsProvider>
  );
}

function SidebarProgress({ label, status, color, width }: { label: string, status: string, color: string, width: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-bold mb-2">
        <span className="text-white/60">{label}</span>
        <span className={status === 'Weak' ? 'text-red-400' : status === 'Mastered' ? 'text-brand-primary' : 'text-brand-secondary'}>{status}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width }} />
      </div>
    </div>
  );
}

function PathStep({ title, status, active, color }: { title: string, status: string, active?: boolean, color: string }) {
  return (
    <div className="relative">
      <div className={cn(
        "absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 border-dark-bg z-10 transition-all",
        color,
        active ? "ring-4 ring-white/5" : "grayscale"
      )} />
      <p className={cn("text-xs font-bold mb-0.5", active ? "text-white" : "text-white/20")}>{title}</p>
      <p className="text-[9px] text-white/30 font-bold uppercase tracking-tight">{status}</p>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 w-12",
        active ? "text-brand-primary" : "text-white/40 hover:text-white/60"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-xl transition-colors duration-300",
        active && "bg-brand-primary/10"
      )}>
        {icon}
      </div>
      {active && (
        <motion.span 
          layoutId="tab-label"
          className="text-[9px] font-bold uppercase tracking-wider"
        >
          {label}
        </motion.span>
      )}
    </button>
  );
}
