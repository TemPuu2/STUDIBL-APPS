import React from 'react';
import { Play, ClipboardCheck, MessageCircle, ChevronRight, Zap, Trophy, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useOffline } from '../lib/useOffline';
import { useLectureLibrary } from '../lib/LectureLibraryContext';
import { useStats } from '../lib/StatsContext';
import { useDocumentProgress } from '../lib/DocumentProgressContext';
import { useVideoProgress } from '../lib/VideoProgressContext';
import { useMissions } from '../lib/MissionsContext';
import StudyGoals from './StudyGoals';

export default function Dashboard({ onNavigate, onResume }: { onNavigate: (tab: any) => void, onResume: (mission: any) => void }) {
  const isOffline = useOffline();
  const { recentCourses, unifiedLectures } = useLectureLibrary();
  const { getProgress: getDocProgress } = useDocumentProgress();
  const { getVideoProgress } = useVideoProgress();
  const { overallAccuracy, progressHistory } = useStats();
  const { currentMission } = useMissions();

  const handleResumeClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentMission) {
      onResume(currentMission);
    } else {
      onNavigate('lectures');
    }
  };

  const { missions } = useMissions();

  const handleResumeCourse = (courseName: string) => {
    // 1. Find the latest UNFINISHED mission associated with this course
    const courseMissions = missions.filter(m => 
      (m.topic === courseName || m.courseId === courseName) && 
      m.status !== 'completed'
    );
    
    if (courseMissions.length > 0) {
      // Sort by updatedAt desc to get the truly latest interaction
      const latest = [...courseMissions].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      onResume(latest);
      return;
    }

    // 2. Fallback: If all are completed, find any mission for this course to at least show the last material
    const allCourseMissions = missions.filter(m => m.topic === courseName || m.courseId === courseName);
    if (allCourseMissions.length > 0) {
      const latest = [...allCourseMissions].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      onResume(latest);
      return;
    }

    // 3. Last Fallback: Find the first lecture in this course and start it
    const courseLectures = unifiedLectures.filter(l => l.course === courseName);
    if (courseLectures.length > 0) {
      onNavigate('lectures');
      // We could potentially trigger a resume to this specific lecture here if we had its ID,
      // but going to the lectures tab which will be influenced by recentCourses is a safe fallback.
    } else {
      onNavigate('lectures');
    }
  };

  const getCourseProgress = (courseName: string) => {
    const courseLectures = unifiedLectures.filter(l => l.course === courseName);
    if (courseLectures.length === 0) return 0;
    
    const totalProgress = courseLectures.reduce((acc, l) => {
      let progress = 0;
      if (l.type === 'video' || l.type === 'voice') {
        progress = getVideoProgress(l.id)?.progress || 0;
      } else {
        progress = getDocProgress(l.id) || 0;
      }
      return acc + progress;
    }, 0);
    
    return Math.round(totalProgress / courseLectures.length);
  };

  const getCourseLevel = (progress: number) => {
    if (progress === 0) return "Not Started";
    if (progress < 25) return "Initiated";
    if (progress < 50) return "Developing";
    if (progress < 75) return "Advanced";
    if (progress < 95) return "Mastering";
    return "Completed";
  };

  const displayCourses = recentCourses.slice(0, 3);

  return (
    <div className="h-full px-6 pt-3 pb-12 overflow-y-auto scrollbar-hide">
      {/* Daily Mission Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (currentMission) {
            onResume(currentMission);
          } else {
            onNavigate('lectures');
          }
        }}
        className="relative overflow-hidden group cursor-pointer mb-8 rounded-[32px] bg-gradient-to-br from-brand-primary to-brand-secondary p-8 text-dark-bg"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          {currentMission?.type === 'quiz' ? <ClipboardCheck size={120} strokeWidth={1} /> : <Zap size={120} strokeWidth={1} />}
        </div>
        <div className="relative z-10">
          <div className="pill-tag !bg-black !text-brand-primary mb-4 w-fit flex items-center gap-2 shadow-lg ring-1 ring-white/10">
            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
            Current Mission
          </div>
          <h3 className="text-2xl font-bold mb-2 truncate">
            {currentMission ? currentMission.title : 'Ready to Start?'}
          </h3>
          <p className="text-dark-bg/70 text-sm mb-6 max-w-[200px]">
            {currentMission ? `${currentMission.duration} estimated • ${currentMission.type?.replace('-', ' ')}` : 'Select an activity to begin your journey'}
          </p>
          
          <div className="flex gap-2 mb-6 h-1 w-full max-w-[200px] bg-dark-bg/10 rounded overflow-hidden">
             <div className="flex-1 bg-dark-bg" />
             <div className="flex-1 bg-dark-bg/20" />
             <div className="flex-1 bg-dark-bg/20" />
          </div>
          
          <button 
            onClick={handleResumeClick}
            className="flex items-center gap-2 font-bold px-4 py-3 bg-white text-dark-bg rounded-xl text-xs group-hover:scale-105 transition-all w-full justify-center shadow-lg shadow-black/5"
          >
            {currentMission ? 'Resume Study' : 'Browse Library'} <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>

      {/* Live Activity Ticker */}
      <div className="mb-8 flex items-center gap-3 overflow-hidden bg-white/[0.02] border border-white/5 py-2 px-4 rounded-full">
         <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              isOffline ? "bg-white/20" : "bg-green-500 animate-pulse"
            )} />
            <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{isOffline ? 'Sync Paused' : 'Live Now'}</span>
         </div>
         <div className="w-px h-3 bg-white/10 shrink-0" />
         <div className="flex-1 overflow-hidden">
            <motion.div 
               animate={{ x: isOffline ? 0 : [200, -600] }}
               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
               className="whitespace-nowrap text-[9px] font-bold text-white/60 uppercase tracking-widest"
            >
               {isOffline ? 'You are currently offline. Local data will sync once connected.' : 'Dr. Thorne updated "Fluid Dynamics" notes • 1.2k students competing in "Compiler Siege" • Sarah Chen achieved "Logic Master" badge • New quiz available: "Quantum Field Theory"'}
            </motion.div>
         </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <ActionButton icon={<Play size={18} />} label="Resume" color="bg-brand-secondary/10 text-brand-secondary" onClick={handleResumeClick} />
        <ActionButton icon={<ClipboardCheck size={18} />} label="Arena" color="bg-brand-primary/10 text-brand-primary" onClick={() => onNavigate('quizzes')} />
        <ActionButton icon={<MessageCircle size={18} />} label="Mentor" color="bg-brand-secondary/10 text-brand-secondary" onClick={() => onNavigate('ai')} />
      </div>

      {/* Study Goals Section */}
      <div className="mb-8">
        <StudyGoals compact={true} />
      </div>

      {/* Performance Summary */}
      <div className="glass-card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider opacity-60">
            Weekly Mastery
          </h4>
          <span className="text-[10px] font-bold text-brand-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">
            {Math.round(overallAccuracy)}% Accuracy
          </span>
        </div>
        <div className="h-20 flex gap-1 items-end px-2">
            {/* Generate bars based on progressHistory (last 7 entries) */}
            {(() => {
              const last7Days = progressHistory.slice(-7);
              const maxXP = Math.max(...last7Days.map(d => d.xp), 1);
              return last7Days.map((item, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 rounded-t transition-all duration-1000",
                    i === last7Days.length - 1 ? "bg-brand-primary" : "bg-white/5"
                  )} 
                  style={{ height: `${(item.xp / maxXP) * 100}%` }} 
                />
              ));
            })()}
        </div>
      </div>

      {/* Course Progress */}
      <div className="space-y-4">
        <h4 className="font-bold flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-brand-secondary" />
          Active Courses
        </h4>
        {displayCourses.length > 0 ? (
          displayCourses.map((activity) => {
            const progress = getCourseProgress(activity.courseName);
            return (
              <CourseItem 
                key={activity.courseName}
                title={activity.courseName} 
                progress={progress} 
                level={getCourseLevel(progress)} 
                onClick={() => handleResumeCourse(activity.courseName)}
              />
            );
          })
        ) : (
          <div className="p-8 glass-card border-dashed border-white/10 rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mx-auto">
              <BookOpen size={24} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">No recent courses</p>
            <p className="text-[10px] text-white/20">Interact with a lecture to see your progress here</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 ${color}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function CourseItem({ title, progress, level, onClick }: { title: string, progress: number, level: string, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="glass-card flex items-center gap-4 cursor-pointer hover:border-brand-primary/20 transition-all border border-white/5"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
        <Trophy size={16} className={progress > 80 ? "text-brand-primary" : "text-white/40"} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <div className="flex flex-col">
            <h5 className="text-xs font-bold">{title}</h5>
            <span className="text-[8px] font-black uppercase text-brand-primary/70 tracking-widest">{level}</span>
          </div>
          <span className="text-[9px] text-white/40">{progress}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-brand-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </motion.div>
  );
}
