import React, { useState, useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid
} from 'recharts';
import { 
  TrendingUp, Award, Brain, AlertTriangle, Zap, 
  ArrowRight, Target, Flame, Star, Activity, 
  Calendar, Shield, Rocket, Sparkles, ChevronRight,
  TrendingDown, Info, Clock, CheckCircle2, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStats, SubjectCategory, MissionLogItem } from '../lib/StatsContext';
import { cn } from '../lib/utils';

// --- Components ---

const HeroProgressRing = ({ percentage, size = 120, strokeWidth = 8, color = "#CCFF00" }: { percentage: number, size?: number, strokeWidth?: number, color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: isNaN(offset) ? circumference : offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black italic tracking-tighter text-white">{Math.round(percentage)}%</span>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Accuracy</span>
      </div>
    </div>
  );
};

const Heatmap = ({ logs }: { logs: any[] }) => {
  // Simple Mock Heatmap for demonstration - real one would group by date
  const days = Array.from({ length: 42 }, (_, i) => ({
    intensity: Math.floor(Math.random() * 4), // 0 to 3
    active: Math.random() > 0.3
  }));

  return (
    <div className="grid grid-cols-7 gap-1.5 self-center">
      {days.map((day, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.01 }}
          className={cn(
            "w-3.5 h-3.5 rounded-[3px] transition-all",
            day.intensity === 0 ? "bg-white/[0.03]" :
            day.intensity === 1 ? "bg-brand-primary/20" :
            day.intensity === 2 ? "bg-brand-primary/50" :
            "bg-brand-primary shadow-[0_0_8px_rgba(204,255,0,0.3)]"
          )}
        />
      ))}
    </div>
  );
};

const MissionLogCard = ({ log }: { log: MissionLogItem }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="group relative pl-8 pb-8 last:pb-0 font-sans"
  >
    {/* Timeline Line */}
    <div className="absolute left-[11px] top-2 bottom-0 w-px bg-white/5 group-last:bg-transparent" />
    
    {/* Timeline Dot */}
    <div className={cn(
      "absolute left-0 top-1.5 w-6 h-6 rounded-lg border-4 border-dark-bg z-10 flex items-center justify-center shadow-lg",
      log.isExam ? "bg-brand-secondary" : "bg-brand-primary"
    )}>
      {log.isExam ? <Activity size={10} className="text-white" /> : <Shield size={10} className="text-dark-bg" />}
    </div>

    <div className="glass-card p-4 hover:border-white/10 transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{log.date}</span>
        <span className={cn(
          "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
          log.score / log.total > 0.8 ? "bg-emerald-500/10 text-emerald-400" :
          log.score / log.total > 0.5 ? "bg-orange-500/10 text-orange-400" :
          "bg-red-500/10 text-red-400"
        )}>
          {Math.round((log.score / log.total) * 100)}% Match
        </span>
      </div>
      <h4 className="text-xs font-bold text-white mb-1 group-hover:text-brand-primary transition-colors">{log.title}</h4>
      <div className="flex items-center gap-3">
         <div className="flex items-center gap-1">
            <Zap size={10} className="text-brand-primary" />
            <span className="text-[9px] font-bold text-white/40">+{log.xpGained} XP</span>
         </div>
         <div className="flex items-center gap-1">
            <Clock size={10} className="text-white/20" />
            <span className="text-[9px] font-bold text-white/40">{Math.round(log.timeSpentSeconds / 60)}m</span>
         </div>
         <span className="text-[9px] font-black text-brand-secondary uppercase ml-auto">{log.type}</span>
      </div>
    </div>
  </motion.div>
);

// --- Main Component ---

export default function Analytics({ onNavigateAI }: { onNavigateAI: (topic: string) => void }) {
  const { 
    totalXP, 
    overallAccuracy, 
    level,
    rankTitle,
    missionLogs,
    subjects, 
    progressHistory,
    studyVelocity
  } = useStats();

  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly'>('weekly');

  // Derived Data
  const xpToNextLevel = level * 1000;
  const currentLevelXP = totalXP % 1000;
  const levelProgress = (currentLevelXP / xpToNextLevel) * 100;

  const radarData = useMemo(() => Object.entries(subjects).map(([subject, value]) => ({
    subject,
    A: value,
    fullMark: 100
  })), [subjects]);

  const chartData = useMemo(() => progressHistory.slice(-7).map(h => ({
    name: h.date.split('-').slice(1).join('/'),
    accuracy: h.accuracy,
    xp: h.xp
  })), [progressHistory]);

  const examData = useMemo(() => {
    const exams = missionLogs.filter(m => m.isExam);
    const avgScore = exams.length > 0 
      ? (exams.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / exams.length) * 100
      : 0;
    
    return [
      { name: 'Stability', value: avgScore || 0 },
      { name: 'Variance', value: 100 - (avgScore || 0) }
    ];
  }, [missionLogs]);

  const COLORS = ['#CCFF00', '#1A1A1A'];

  return (
    <div className="h-full space-y-8 px-6 pt-3 pb-24 overflow-y-auto scrollbar-hide bg-dark-bg/50">
      
      {/* 1. PERFORMANCE HERO SECTION */}
      <section className="relative glass-card bg-gradient-to-br from-brand-secondary/5 to-transparent border-brand-secondary/10 overflow-hidden font-sans">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-primary/10 blur-[80px] rounded-full" />
        
        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
          <div className="relative">
            <HeroProgressRing percentage={overallAccuracy} size={160} />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-2 -right-2 bg-dark-bg border border-white/10 p-2 rounded-xl shadow-xl"
            >
              <Award size={20} className="text-brand-secondary" />
            </motion.div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
              {rankTitle}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 py-0.5 bg-brand-primary/10 rounded-full">LEVEL {level}</span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{totalXP.toLocaleString()} TOTAL XP</span>
            </div>
          </div>

          <div className="w-full space-y-2">
             <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/30 px-1">
                <span>XP Progress</span>
                <span>{xpToNextLevel - currentLevelXP} XP TO Lvl {level + 1}</span>
             </div>
             <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  className="h-full bg-brand-secondary shadow-[0_0_15px_rgba(0,224,255,0.4)]"
                />
             </div>
          </div>

          <div className="grid grid-cols-3 w-full gap-4 pt-4 border-t border-white/5">
             <div className="text-center">
                <p className="text-sm font-black italic">{missionLogs.length}</p>
                <p className="text-[8px] font-black text-white/20 uppercase">Missions</p>
             </div>
             <div className="text-center">
                <p className="text-sm font-black italic text-orange-400">🔥 7</p>
                <p className="text-[8px] font-black text-white/20 uppercase">Streak</p>
             </div>
             <div className="text-center">
                <p className="text-sm font-black italic text-brand-primary">+{Math.round(studyVelocity * 10)}%</p>
                <p className="text-[8px] font-black text-white/20 uppercase">Improvement</p>
             </div>
          </div>
        </div>
      </section>

      {/* 2. PERFORMANCE TREND ANALYTICS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <Activity size={14} className="text-brand-secondary" /> Trend Analytics
          </h3>
          <div className="flex gap-1.5 p-1 bg-white/5 rounded-lg border border-white/10">
            {(['daily', 'weekly'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                  timeFilter === f ? "bg-white/10 text-white shadow-sm" : "text-white/30 hover:text-white/60"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-4 pr-2 h-64 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={80} className="text-brand-secondary" />
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#00E0FF', fontWeight: 'bold' }}
              />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 'bold' }} 
              />
              <YAxis hide />
              <Area 
                type="monotone" 
                dataKey="xp" 
                stroke="#00E0FF" 
                fillOpacity={1} 
                fill="url(#colorXp)" 
                strokeWidth={3}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. SUBJECT MASTERY & 4. EXAM BREAKDOWN (Responsive Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject Mastery Heatmap */}
        <div className="glass-card space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
             <Calendar size={14} className="text-brand-primary" /> Mastery Heatmap
           </h3>
           <div className="flex flex-col items-center gap-6">
             <Heatmap logs={missionLogs} />
             <div className="flex justify-between w-full text-[8px] font-black uppercase tracking-widest text-white/20">
                <span>Last 6 Weeks</span>
                <span>Elite Performance</span>
             </div>
           </div>
           
           <div className="space-y-3 pt-2">
              {Object.entries(subjects).slice(0, 3).map(([name, progress]) => (
                <div key={name} className="space-y-1.5">
                   <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-white/60">{name}</span>
                      <span className="text-brand-primary">{progress}%</span>
                   </div>
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-brand-primary"
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Exam Performance Breakdown */}
        <div className="glass-card flex flex-col items-center">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center justify-start w-full gap-2 mb-6">
             <Shield size={14} className="text-brand-secondary" /> Stabilization Meta
           </h3>
           <div className="h-48 w-full relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={examData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {examData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black italic">{Math.round(examData[0].value)}%</span>
                <span className="text-[7px] font-black uppercase tracking-widest text-white/20">Consistency</span>
             </div>
           </div>
           <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                <span className="text-[8px] font-black uppercase text-white/40">Success Rate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="text-[8px] font-black uppercase text-white/40">Error Margin</span>
              </div>
           </div>
        </div>
      </section>

      {/* 5. SKILL RADAR ANALYTICS */}
      <section className="glass-card">
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
             <Brain size={14} className="text-brand-primary" /> Intelligence Radar
           </h3>
           <motion.button 
             whileTap={{ scale: 0.95 }}
             className="text-[9px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1.5"
           >
             Optimize <Sparkles size={10} />
           </motion.button>
         </div>
         <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} />
                  <Radar
                    name="Mastery"
                    dataKey="A"
                    stroke="#CCFF00"
                    fill="#CCFF00"
                    fillOpacity={0.3}
                    animationDuration={2000}
                  />
               </RadarChart>
            </ResponsiveContainer>
         </div>
         <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3 rounded-2xl bg-white/2 border border-white/5">
               <p className="text-[8px] font-black text-white/20 uppercase mb-1">Strongest Pillar</p>
               <p className="text-xs font-bold text-emerald-400 uppercase tracking-tight italic">
                 {Object.entries(subjects).sort((a,b) => (b[1] as number) - (a[1] as number))[0][0]}
               </p>
            </div>
            <div className="p-3 rounded-2xl bg-white/2 border border-white/5">
               <p className="text-[8px] font-black text-white/20 uppercase mb-1">Target Weakness</p>
               <p className="text-xs font-bold text-red-400 uppercase tracking-tight italic">
                 {Object.entries(subjects).sort((a,b) => (a[1] as number) - (b[1] as number))[0][0]}
               </p>
            </div>
         </div>
      </section>

      {/* 6. AI PERFORMANCE INSIGHTS */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
          <Sparkles size={14} className="text-brand-primary" /> Intelligence Feed
        </h3>
        {Object.entries(subjects).sort((a,b) => (a[1] as number) - (b[1] as number)).slice(0, 2).map(([subject, mastery], i) => (
          <RecommendationItem 
              key={subject}
              title={i === 0 ? "Critical Cognitive Gap" : "Performance Variance Detected"}
              topic={`${subject} Mastery Protocol`}
              impact={i === 0 ? "Critical" : "High"}
              detail={`Your mastery in ${subject} is currently at ${mastery}%. Behavioral analysis suggests a regression in fundamental concepts. Immediate review is advised.`}
              onAction={() => onNavigateAI(`${subject} fundamentals`)}
          />
        ))}
      </section>

      {/* 7. MISSION LOG TIMELINE */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
             <Rocket size={14} className="text-brand-primary" /> Mission History
           </h3>
           <span className="text-[10px] font-black text-white/20">{missionLogs.length} Records</span>
        </div>
        
        <div className="flex flex-col">
          {missionLogs.slice(0, 10).map((log, i) => (
             <MissionLogCard key={log.id || i} log={log} />
          ))}
        </div>

        <motion.button 
          whileHover={{ x: 5 }}
          className="w-full py-4 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white/40 transition-all flex items-center justify-center gap-2"
        >
          Access Full Archive <ChevronRight size={14} />
        </motion.button>
      </section>

    </div>
  );
}

// --- Helper UI Components ---

function RecommendationItem({ title, topic, impact, detail, onAction }: { title: string, topic: string, impact: 'Critical' | 'High' | 'Medium', detail: string, onAction: () => void }) {
    return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={onAction}
          className="glass-card group hover:border-brand-primary/30 transition-all cursor-pointer relative overflow-hidden font-sans"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {impact === 'Critical' ? <AlertTriangle size={64} className="text-red-500" /> : <Zap size={64} className="text-brand-primary" />}
            </div>

            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      impact === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-brand-primary'
                    )} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{title}</span>
                </div>
                <span className={cn(
                  "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                  impact === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                )}>
                    {impact}
                </span>
            </div>
            <h4 className="font-black text-sm italic mb-2 text-white group-hover:text-brand-primary transition-colors">{topic}</h4>
            <p className="text-xs text-white/50 leading-relaxed mb-4 max-w-[90%] font-medium">{detail}</p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary group-hover:gap-4 transition-all">
                Engage Assessment <ArrowRight size={14} />
            </div>
        </motion.div>
    );
}
