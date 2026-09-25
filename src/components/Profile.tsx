import React, { useState, useMemo } from 'react';
import { 
  User, Settings, CreditCard, ChevronRight, BarChart as BarChartIcon, Book, Award, Bell, 
  Shield, LogOut, Share2, Flame, Brain, CheckCircle2, WifiOff, ArrowLeft, Camera, 
  Mail, Globe, Lock, Smartphone, Save, AlertTriangle, Smartphone as Phone,
  GraduationCap, Medal, Star, TrendingUp, Calendar, Target, Clock, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useOffline } from '../lib/useOffline';
import { useStreak } from '../lib/StreakContext';
import { useLectureLibrary } from '../lib/LectureLibraryContext';
import { useStats } from '../lib/StatsContext';
import { useDocumentProgress } from '../lib/DocumentProgressContext';
import { useVideoProgress } from '../lib/VideoProgressContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

type ProfileView = 'main' | 'edit-profile' | 'notifications' | 'security' | 'plan' | 'enrolled' | 'certificates' | 'forecast';

const MOCK_BADGES = [
  { id: '1', name: '7-Day Streak', icon: <Flame size={14} />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: '2', name: 'Logic Master', icon: <Brain size={14} />, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
  { id: '3', name: 'Top 1% Engineering', icon: <Award size={14} />, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
  { id: '4', name: 'Course Finisher', icon: <CheckCircle2 size={14} />, color: 'text-green-500', bg: 'bg-green-500/10' },
];

export default function Profile() {
  const isOffline = useOffline();
  const { streak } = useStreak();
  const { totalXP, level, rankTitle, overallAccuracy } = useStats();
  const [activeView, setActiveView] = useState<ProfileView>('main');

  const { recentCourses } = useLectureLibrary();
  const { missionLogs } = useStats();
  const certificatesCount = missionLogs.filter(m => m.accuracy === 100 && m.type === 'Exam').length + 3; // +3 mock base

  const renderView = () => {
    switch (activeView) {
      case 'edit-profile':
        return <EditProfile onBack={() => setActiveView('main')} />;
      case 'notifications':
        return <NotificationSettings onBack={() => setActiveView('main')} />;
      case 'security':
        return <SecuritySettings onBack={() => setActiveView('main')} />;
      case 'plan':
        return <PlanDetails onBack={() => setActiveView('main')} />;
      case 'enrolled':
        return <EnrolledSubjects onBack={() => setActiveView('main')} />;
      case 'certificates':
        return <CertificatesAndBadges onBack={() => setActiveView('main')} />;
      case 'forecast':
        return <SemesterForecast onBack={() => setActiveView('main')} />;
      default:
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4 group cursor-pointer" onClick={() => setActiveView('edit-profile')}>
                <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-28 h-28 rounded-full p-1.5 bg-gradient-to-tr from-brand-primary to-brand-secondary">
                   <div className="w-full h-full rounded-full bg-dark-bg p-1 overflow-hidden">
                      <img src="https://picsum.photos/seed/alex/200/200" alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                   </div>
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-xl glass border border-white/20 flex items-center justify-center text-brand-primary">
                  <Camera size={16} />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Alex Simmons</h1>
              <p className="text-sm text-white/40 mb-6">{rankTitle} • Academic Specialist</p>
              
              {/* Leveling indicator */}
              <div className="w-full max-w-xs mb-8">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Level {level}</span>
                    <span className="text-[10px] font-bold text-white/20">{totalXP.toLocaleString()} XP</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalXP % 1000) / 10}%` }}
                      className="h-full bg-brand-primary" 
                    />
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-6 w-full max-w-xs mb-10">
                <StatMini label="Courses" value={recentCourses.length.toString()} />
                <StatMini label="Accuracy" value={`${Math.round(overallAccuracy)}%`} />
                <StatMini label="Streak" value={streak.toString()} />
              </div>

              {/* Badges Gallery */}
              <div className="w-full">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 px-4">Legacy Achievements</h3>
                 <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4">
                    {MOCK_BADGES.map(badge => (
                       <div key={badge.id} className="flex flex-col items-center gap-2 shrink-0 group">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-xl transition-all group-hover:scale-110", badge.bg)}>
                             <div className={badge.color}>{badge.icon}</div>
                          </div>
                          <span className="text-[9px] font-bold text-white/40 whitespace-nowrap tracking-tight">{badge.name}</span>
                       </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div 
              onClick={() => setActiveView('plan')}
              className={cn(
                "relative overflow-hidden group cursor-pointer",
                isOffline && "opacity-40 grayscale pointer-events-none"
              )}
            >
              <div className="absolute inset-0 bg-brand-secondary/80 translate-y-1 group-hover:translate-y-0 transition-transform rounded-[32px]" />
              <div className="relative bg-brand-secondary p-6 rounded-[32px] text-white flex justify-between items-center">
                  <div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Current Plan</div>
                     <h3 className="text-xl font-bold">Studibl Pro</h3>
                     <p className="text-white/60 text-xs">Unlock Advanced Neural Tutoring</p>
                  </div>
                  <ChevronRight size={20} className="text-white/60" />
              </div>
            </div>

            {/* Settings Sections */}
            <div className={cn("space-y-6", isOffline && "opacity-50")}>
              <Section title="Academic Profile">
                <MenuLink icon={<User size={18} />} title="Edit Personal Info" detail="Verified" onClick={() => setActiveView('edit-profile')} disabled={isOffline} />
                <MenuLink icon={<Book size={18} />} title="Enrolled Subjects" detail={`${recentCourses.length} active`} onClick={() => setActiveView('enrolled')} disabled={isOffline} />
                <MenuLink icon={<Award size={18} />} title="Certificates & Badges" detail={`${certificatesCount} earned`} onClick={() => setActiveView('certificates')} disabled={isOffline} />
                <MenuLink icon={<BarChartIcon size={18} />} title="Semester Forecast" detail="3.8 GPA Est." onClick={() => setActiveView('forecast')} disabled={isOffline} />
              </Section>

              <Section title="System">
                <MenuLink icon={<Bell size={18} />} title="Notifications" onClick={() => setActiveView('notifications')} disabled={isOffline} />
                <MenuLink icon={<Shield size={18} />} title="Privacy & Security" onClick={() => setActiveView('security')} disabled={isOffline} />
                <MenuLink icon={<Share2 size={18} />} title="Invite Study Group" disabled={isOffline} />
              </Section>

              <Section>
                <button 
                  disabled={isOffline}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-500/5 text-red-400 font-bold text-sm border border-red-500/10 hover:bg-red-500/10 transition-all disabled:opacity-20"
                >
                  <span className="flex items-center gap-3">
                    <LogOut size={18} /> Log Out
                  </span>
                  <ChevronRight size={16} />
                </button>
              </Section>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full px-6 pt-3 pb-6 overflow-y-auto scrollbar-hide">
      {isOffline && (
        <div className="mb-8 flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400 animate-in fade-in slide-in-from-top-2">
          <WifiOff size={20} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Limited Access</p>
            <p className="text-[9px] opacity-60 font-medium leading-tight">Some profile synchronization and settings are unavailable offline.</p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>

      <div className="text-center mt-12 opacity-20 hover:opacity-100 transition-opacity pb-10">
        <p className="text-[10px] font-mono font-bold tracking-widest">STUDIBL OS v3.4.2-STABLE</p>
      </div>
    </div>
  );
}

function StatMini({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold">{value}</span>
      <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
    </div>
  );
}

function Section({ title, children }: { title?: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4">{title}</h3>}
      <div className="glass-card !p-0 border-none bg-white/[0.03] rounded-[32px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function MenuLink({ icon, title, detail, disabled, onClick }: { icon: React.ReactNode, title: string, detail?: string, disabled?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "p-4 flex items-center justify-between transition-all border-b border-dark-border last:border-none group",
        disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5 cursor-pointer"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/40 transition-colors",
          !disabled && "group-hover:text-brand-primary"
        )}>
          {icon}
        </div>
        <span className="text-sm font-bold text-white/80">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {detail && <span className="text-[10px] font-bold text-white/20 uppercase tracking-tight">{detail}</span>}
        <ChevronRight size={16} className="text-white/10 group-hover:text-white/30 transition-all" />
      </div>
    </div>
  );
}

// Sub-components for views
function EditProfile({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-white/40 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h2 className="text-lg font-black uppercase tracking-tight">Edit Academic Info</h2>
      </header>

      <div className="flex flex-col items-center mb-10">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-brand-primary to-brand-secondary">
            <div className="w-full h-full rounded-full bg-dark-bg p-1 overflow-hidden">
               <img src="https://picsum.photos/seed/alex/200/200" alt="Avatar" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-xl bg-brand-primary text-black flex items-center justify-center shadow-lg transform translate-x-1 translate-y-1">
            <Camera size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <InputGroup label="Full Name" value="Alex Simmons" icon={<User size={16} />} />
        <InputGroup label="Institutional Email" value="alex.s@physics.stanford.edu" icon={<Mail size={16} />} />
        <InputGroup label="Academic Major" value="Cloud Infrastructure & Fluid Dynamics" icon={<Globe size={16} />} />
        <InputGroup label="Contact Number" value="+1 (555) 012-3456" icon={<Phone size={16} />} />
      </div>

      <button className="w-full py-4 mt-8 rounded-2xl bg-brand-primary text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
        <Save size={16} /> Save Changes
      </button>
    </div>
  );
}

function NotificationSettings({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-white/40 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h2 className="text-lg font-black uppercase tracking-tight">Notification Engine</h2>
      </header>

      <Section title="Sync Preferences">
        <ToggleItem title="Study Reminders" description="AI-driven prompts based on focus windows" active />
        <ToggleItem title="Course Progress" description="Milestone alerts and weekly recaps" active />
        <ToggleItem title="Mission Updates" description="New daily and seasonal challenges" />
      </Section>

      <Section title="Security Alerts">
        <ToggleItem title="New Device Login" description="Alert when logged in from new hardware" active />
        <ToggleItem title="Account Activity" description="Critical security updates and reports" active />
      </Section>
    </div>
  );
}

function SecuritySettings({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-white/40 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h2 className="text-lg font-black uppercase tracking-tight">Privacy & Firewall</h2>
      </header>

      <div className="space-y-6">
        <MenuLink icon={<Lock size={18} />} title="Change Access Key" detail="Updated 2m ago" />
        <MenuLink icon={<Smartphone size={18} />} title="Two-Factor Neural Link" detail="Enabled" />
        <MenuLink icon={<Shield size={18} />} title="Biometric Lockdown" detail="Face ID" />
      </div>

      <div className="p-6 rounded-[32px] bg-red-500/5 border border-red-500/10 mt-10">
        <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
          <AlertTriangle size={16} /> Danger Zone
        </h4>
        <p className="text-xs text-white/30 mb-6 font-medium leading-relaxed">
          Permanent removal of your academic neural weights and lecture history. This action is irreversible.
        </p>
        <button className="w-full py-4 rounded-2xl bg-white/5 text-red-400 font-black uppercase tracking-widest text-[9px] hover:bg-red-500/10 transition-colors">
          Deactivate Academic Protocol
        </button>
      </div>
    </div>
  );
}

function PlanDetails({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-white/40 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h2 className="text-lg font-black uppercase tracking-tight">Studibl Blueprint</h2>
      </header>

      <div className="glass-card bg-brand-secondary/10 border-brand-secondary/20 p-8 rounded-[40px] text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand-secondary/20 flex items-center justify-center text-brand-secondary mx-auto mb-6 shadow-2xl shadow-brand-secondary/20">
          <CreditCard size={40} />
        </div>
        <h3 className="text-2xl font-black italic tracking-tighter mb-2">Studibl Pro</h3>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6">Active since Oct 2025</p>
        
        <div className="flex items-center justify-center gap-1 mb-8">
          <span className="text-xs text-white/40 font-bold">$</span>
          <span className="text-4xl font-black">12.99</span>
          <span className="text-xs text-white/40 font-bold">/mo</span>
        </div>

        <div className="space-y-3 text-left mb-8">
          <PlanFeature text="Unlimited AI Token Extraction" />
          <PlanFeature text="Neural Note Synthesis" />
          <PlanFeature text="Offline Knowledge Vaults" />
          <PlanFeature text="Ad-Free Academic Focus" />
        </div>

        <button className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all">
          Manage Subscription
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4">Billing History</h3>
        <div className="space-y-px">
          <BillingItem date="08 May 2026" amount="$12.99" status="Paid" />
          <BillingItem date="08 April 2026" amount="$12.99" status="Paid" />
          <BillingItem date="08 March 2026" amount="$12.99" status="Paid" />
        </div>
      </div>
    </div>
  );
}

function PlanFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium text-white/80">
      <div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
        <CheckCircle2 size={12} />
      </div>
      {text}
    </div>
  );
}

function BillingItem({ date, amount, status }: { date: string, amount: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-4 glass-card border-none bg-white/[0.02] last:rounded-b-[24px] first:rounded-t-[24px]">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white/80">{date}</span>
        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{status}</span>
      </div>
      <span className="text-sm font-black text-brand-secondary">{amount}</span>
    </div>
  );
}

function InputGroup({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-primary transition-colors">
          {icon}
        </div>
        <input 
          type="text" 
          defaultValue={value}
          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white/80 focus:outline-none focus:border-brand-primary/30 focus:bg-white/[0.05] transition-all"
        />
      </div>
    </div>
  );
}

function ToggleItem({ title, description, active }: { title: string, description: string, active?: boolean }) {
  const [isOn, setIsOn] = useState(active);
  return (
    <div className="p-4 flex items-center justify-between border-b border-dark-border last:border-none">
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-bold text-white/80 mb-0.5">{title}</h4>
        <p className="text-[10px] text-white/30 font-medium leading-relaxed">{description}</p>
      </div>
      <button 
        onClick={() => setIsOn(!isOn)}
        className={cn(
          "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
          isOn ? "bg-brand-primary" : "bg-white/10"
        )}
      >
        <motion.div 
          animate={{ x: isOn ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-4 h-4 bg-white rounded-full shadow-sm" 
        />
      </button>
    </div>
  );
}

// --- New Profile Pages ---

function EnrolledSubjects({ onBack }: { onBack: () => void }) {
  const { recentCourses, unifiedLectures } = useLectureLibrary();

  const filteredCourses = useMemo(() => {
    return recentCourses.filter(course => {
      // Exclude AI course
      if (course.courseName === 'AI') return false;
      
      // Check if course has at least one "official" lecture (not uploaded, not from AI)
      const hasMockLecture = unifiedLectures.some(l => 
        l.course === course.courseName && 
        !l.isMine && 
        !l.isFromAI
      );
      
      return hasMockLecture;
    });
  }, [recentCourses, unifiedLectures]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-white/40 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h2 className="text-lg font-black uppercase tracking-tight">Enrolled Subjects</h2>
      </header>

      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.courseName} className="glass-card hover:border-brand-primary/20 transition-all p-5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-sm">{course.courseName}</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Academic Session 2026</p>
                </div>
                <div className="p-2 bg-white/5 rounded-xl">
                  <Book size={16} className="text-brand-primary" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 bg-white/5 rounded-3xl text-white/10">
              <Book size={40} />
            </div>
            <p className="text-xs font-bold text-white/20 uppercase tracking-widest">No enrolled mock courses found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CertificatesAndBadges({ onBack }: { onBack: () => void }) {
  const { missionLogs } = useStats();
  const completedMissions = missionLogs.filter(m => m.accuracy === 100).length;

  const CERTIFICATES = [
    { title: 'Neural Infrastructure Specialist', issuer: 'Studibl Academy', date: 'Oct 2025', id: 'CERT-001' },
    { title: 'Advanced Logic Architecture', issuer: 'Studibl Academy', date: 'Jan 2026', id: 'CERT-002' },
    { title: 'Reactive System Design', issuer: 'Studibl Academy', date: 'March 2026', id: 'CERT-003' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-white/40 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h2 className="text-lg font-black uppercase tracking-tight">Credentials</h2>
      </header>

      {/* Badges Section */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4 flex items-center gap-2">
          <Medal size={14} className="text-brand-primary" /> Achievement Badges
        </h3>
        <div className="grid grid-cols-2 gap-4">
           {MOCK_BADGES.concat([
             { id: '5', name: 'Speed Demon', icon: <Zap size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
             { id: '6', name: 'Elite Guardian', icon: <Shield size={14} />, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' }
           ]).map(badge => (
             <div key={badge.id} className="glass-card flex flex-col items-center gap-3 p-6 group hover:border-white/10 transition-all">
                <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl transition-all group-hover:scale-110", badge.bg)}>
                   <div className={cn("scale-150", badge.color)}>{badge.icon}</div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white uppercase tracking-tight mb-1">{badge.name}</p>
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Earned April 2026</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Certificates Section */}
      <section className="space-y-4 pt-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4 flex items-center gap-2">
          <Award size={14} className="text-brand-secondary" /> Verified Certificates
        </h3>
        {CERTIFICATES.map((cert) => (
          <div key={cert.id} className="glass-card relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Medal size={80} className="text-brand-secondary" />
             </div>
             <div className="flex items-start gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-brand-secondary shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black italic text-white uppercase tracking-tight mb-1 group-hover:text-brand-secondary transition-colors">{cert.title}</h4>
                  <p className="text-[10px] font-bold text-white/40 mb-4">{cert.issuer} • {cert.date}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-white/20">{cert.id}</span>
                    <button className="text-[9px] font-black uppercase tracking-widest text-brand-secondary bg-brand-secondary/10 px-3 py-1.5 rounded-lg border border-brand-secondary/20 hover:bg-brand-secondary hover:text-white transition-all">View Proof</button>
                  </div>
                </div>
             </div>
          </div>
        ))}
        {completedMissions > 10 && (
          <div className="p-8 border border-dashed border-white/5 rounded-[32px] text-center space-y-4">
             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
               <Star size={24} />
             </div>
             <div className="space-y-1">
                <p className="text-xs font-bold text-white/60 italic">New Milestone Approaching</p>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Complete 5 more perfect missions to unlock</p>
             </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SemesterForecast({ onBack }: { onBack: () => void }) {
  const { overallAccuracy, progressHistory, studyVelocity } = useStats();

  // Mock forecast data
  const forecastData = useMemo(() => {
    const historical = progressHistory.slice(-14).map(h => h.accuracy);
    const avg = historical.reduce((a, b) => a + b, 0) / (historical.length || 1);
    
    return Array.from({ length: 14 }, (_, i) => ({
      day: `Wk ${Math.floor(i / 7) + 1}`,
      historical: i < historical.length ? historical[i] : null,
      forecast: i >= historical.length - 1 ? avg + (Math.sin(i) * 5) : null
    }));
  }, [progressHistory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-white/40 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h2 className="text-lg font-black uppercase tracking-tight">Academic Forecast</h2>
      </header>

      {/* Hero Prediction */}
      <div className="glass-card bg-gradient-to-br from-brand-primary/5 to-transparent border-brand-primary/10 p-8 rounded-[40px] text-center relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Target size={120} className="text-brand-primary" />
        </div>
        
        <div className="relative z-10">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-4">Estimated GPA Output</p>
          <h3 className="text-6xl font-black italic tracking-tighter text-white mb-2">3.82</h3>
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs">
             <TrendingUp size={14} /> +0.15 Expected
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
             <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase mb-1">Consistency</p>
                <p className="text-sm font-black italic">Excellent</p>
             </div>
             <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase mb-1">Risk Factor</p>
                <p className="text-sm font-black italic text-brand-secondary">Low</p>
             </div>
          </div>
        </div>
      </div>

      {/* Projection Chart */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4 flex items-center gap-2">
          <Calendar size={14} className="text-white/40" /> Performance Projection
        </h3>
        <div className="glass-card h-64 p-4 pr-2">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                 <defs>
                   <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorFore" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis hide />
                 <YAxis hide domain={[0, 100]} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                   itemStyle={{ color: '#CCFF00', fontWeight: 'bold' }}
                 />
                 <Area 
                   type="monotone" 
                   dataKey="historical" 
                   stroke="#CCFF00" 
                   fillOpacity={1} 
                   fill="url(#colorHist)" 
                   strokeWidth={3} 
                 />
                 <Area 
                   type="monotone" 
                   dataKey="forecast" 
                   stroke="#00E0FF" 
                   strokeDasharray="5 5"
                   fillOpacity={1} 
                   fill="url(#colorFore)" 
                   strokeWidth={2} 
                 />
              </AreaChart>
           </ResponsiveContainer>
           <div className="flex justify-between items-center px-4 mt-2">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-primary" />
                 <span className="text-[8px] font-black uppercase text-white/30">Historical</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-secondary border border-dashed border-brand-secondary" />
                 <span className="text-[8px] font-black uppercase text-white/30">AI Prediction</span>
              </div>
           </div>
        </div>
      </section>

      {/* AI Strategy Insights */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4 flex items-center gap-2">
          <Brain size={14} className="text-brand-primary" /> Neural Strategy
        </h3>
        
        <div className="space-y-3">
           <StrategyInsight 
              icon={<TrendingUp size={16} />}
              title="Ascension Detected"
              text="Your study velocity has increased by 12% this week. Maintaining this pace will result in early course completion by Week 14."
              color="text-emerald-400"
           />
           <StrategyInsight 
              icon={<Shield size={16} />}
              title="Stability Protocol"
              text="Morning focus windows are showing 40% higher accuracy. Neural network recommends shifting Math units to 08:00 AM slots."
              color="text-brand-secondary"
           />
           <StrategyInsight 
              icon={<Zap size={16} />}
              title="XP Velocity"
              text="At current XP rate, you will reach Level 50 before the term finals, unlocking the 'Senior Architect' status."
              color="text-brand-primary"
           />
        </div>
      </section>
    </div>
  );
}

function StrategyInsight({ icon, title, text, color }: { icon: React.ReactNode, title: string, text: string, color: string }) {
  return (
    <div className="glass-card hover:bg-white/[0.05] transition-all p-4 border border-white/5">
       <div className="flex items-center gap-3 mb-2">
          <div className={cn("p-2 bg-white/5 rounded-xl shrink-0", color)}>
            {icon}
          </div>
          <h4 className="text-xs font-black italic text-white uppercase tracking-tight">{title}</h4>
       </div>
       <p className="text-[10px] text-white/40 leading-relaxed font-medium">{text}</p>
    </div>
  );
}
