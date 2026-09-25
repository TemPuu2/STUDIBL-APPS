import React, { useState, useEffect } from 'react';
import { 
  Target, CheckCircle2, ChevronRight, Zap, Flame, 
  Calendar, Map, MoreHorizontal, Sparkles, Clock, 
  BookOpen, Trash2, Plus, X, MapPin, Brain 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import StudyGoals from './StudyGoals';
import { aiService } from '../services/aiService';
import { Mission, StudyPlan } from '../types';
import { MOCK_LECTURES } from '../constants';
import { useStreak } from '../lib/StreakContext';
import { useMissions } from '../lib/MissionsContext';

// Define a structured Academic Event
interface AcademicEvent {
  id: string;
  course: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  venue: string;
  type: 'exam' | 'lecture' | 'deadline';
}

// Helper to get date string relative to today
const getRelativeDateString = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const MOCK_ACADEMIC_EVENTS: AcademicEvent[] = [
  { id: '1', course: 'PHY 108', title: 'General Physics Practical', date: getRelativeDateString(-5), time: '09:00 AM', venue: 'Lecture Hall A', type: 'exam' },
  { id: '2', course: 'FMNT 102', title: 'Communication Techniques', date: getRelativeDateString(-7), time: '11:59 PM', venue: 'Online Portal', type: 'deadline' },
  { id: '3', course: 'PHY 102', title: 'General Physics 2', date: getRelativeDateString(-6), time: '02:00 PM', venue: 'Lab 302', type: 'lecture' },
  { id: '4', course: 'FCSC 108', title: 'Laboratory Practical 2 (PYTHON)', date: getRelativeDateString(-1), time: '10:30 AM', venue: 'Tech Wing B', type: 'lecture' },
  { id: '5', course: 'COS 102', title: 'Problem Solving', date: getRelativeDateString(5), time: '11:00 AM', venue: 'Hall C', type: 'lecture' },
  { id: '6', course: 'FCSC 106', title: 'Computational Thinking', date: getRelativeDateString(0), time: '04:00 PM', venue: 'Online', type: 'lecture' },
];

export default function Missions({ onAddNotification, onResume }: { onAddNotification: (n: any) => void, onResume: (mission: any) => void }) {
  const { streak } = useStreak();
  const { missions, currentMission, addMission, updateMissionStatus, removeMission } = useMissions();

  const handleResumeClick = (mission: any) => {
    onResume(mission);
  };

  const [showAllMissions, setShowAllMissions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [examInput, setExamInput] = useState({ title: '', date: '', courses: [] as string[] });
  const [availability, setAvailability] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date()); 
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'library' | 'uploads' | null>('library');
  
  const [academicViewDate, setAcademicViewDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAcademicMonthPicker, setShowAcademicMonthPicker] = useState(false);

  const [availableCourses, setAvailableCourses] = useState<{ library: string[], uploads: string[] }>({
    library: [],
    uploads: []
  });
  
  const refreshCourses = () => {
    // Library courses from Mock data
    const libraryCourses = Array.from(new Set(MOCK_LECTURES.filter((l: any) => !l.isMine).map((l: any) => l.course))) as string[];
    
    // User Uploads from Local Storage
    const saved = localStorage.getItem('studibl_user_lectures');
    let uploadsCourses: string[] = [];
    if (saved) {
      try {
        const lectures = JSON.parse(saved);
        if (Array.isArray(lectures)) {
          uploadsCourses = Array.from(new Set(lectures.map((l: any) => l.course))) as string[];
        }
      } catch (e) {
        console.error("Error parsing user lectures", e);
      }
    }
    
    setAvailableCourses({
      library: libraryCourses,
      uploads: uploadsCourses
    });
  };

  useEffect(() => {
    refreshCourses();
  }, []);

  const openGenerator = () => {
    refreshCourses();
    setShowGenerator(true);
  };

  const handleGeneratePlan = async () => {
    if (!availability.trim() || examInput.courses.length === 0) {
      onAddNotification({
        title: 'Missing Info',
        message: 'Please provide your availability and select at least one course.',
        type: 'alert'
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const exams = examInput.title ? [{ 
        title: examInput.title, 
        date: examInput.date, 
        course: examInput.courses[0] // Use first course as primary for the exam if needed
      }] : [];
      const plan = await aiService.generateStudyPlan(examInput.courses, exams, availability);
      
      if (plan.missions && plan.missions.length > 0) {
        // Add missions to context in reverse to maintain order if needed, or just handle it in context
        // We'll add them one by one. The context will handle the id and updatedAt.
        plan.missions.forEach((m: any) => {
          addMission({
            title: m.title,
            duration: m.duration,
            status: 'pending', // Generator makes them all pending for now
            type: m.type,
            topic: m.topic
          });
        });
        
        setShowGenerator(false);
        setExamInput({ title: '', date: '', courses: [] });
        
        onAddNotification({
          title: 'Study Plan Ready! 🚀',
          message: `Generated "${plan.title}" with ${plan.missions.length} new missions focused on your goals.`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error(error);
      onAddNotification({
        title: 'Generation Failed',
        message: 'Could not generate plan. Please check your connection.',
        type: 'alert'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMission = (id: string) => {
    const mission = missions.find(m => m.id === id);
    if (!mission) return;
    updateMissionStatus(id, mission.status === 'completed' ? 'pending' : 'completed');
  };


  const filteredMissions = missions
    .filter(m => m.status !== 'completed' && (!currentMission || m.id !== currentMission.id))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return (
    <div className="h-full px-6 pt-3 pb-24 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Missions</h1>
          <p className="text-sm text-white/40">Master your curriculum day-by-day.</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-brand-primary font-bold">
            <Flame size={20} fill="currentColor" />
            <span className="text-xl">{streak}</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Day Streak</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={openGenerator}
          className="flex-1 glass-card !p-4 border-brand-primary/20 flex items-center gap-3 active:scale-95 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Pathfinder</h3>
            <p className="text-[10px] text-white/40 font-bold">Generate AI Study Plan</p>
          </div>
        </button>
      </div>

      {/* Plan Generator Bottom Sheet */}
      <AnimatePresence>
        {showGenerator && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGenerator(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[60] bg-dark-bg rounded-t-[40px] border-t border-white/10 p-6 pt-4 max-w-xl mx-auto overflow-y-auto max-h-[92vh] pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />
              
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-inner">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Pathfinder</h2>
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Personalized AI Roadmap</p>
                  </div>
                </div>
                <button onClick={() => setShowGenerator(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Available Time Section */}
                <section>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary block mb-4">Availability & Constraints</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-primary transition-colors">
                      <Clock size={18} />
                    </div>
                      <input 
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        placeholder="e.g. 2 hours daily after 6 PM, weekends active"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:border-brand-primary/30 focus:bg-white/10 transition-all placeholder:text-white/10"
                      />
                  </div>
                </section>

                {/* Course Selection Section */}
                <section>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary block mb-6">Associated Courses</label>
                  
                  <div className="space-y-4">
                    {/* Lecture Library Section */}
                    <div className="flex flex-col">
                      <button 
                        onClick={() => setExpandedSection(expandedSection === 'library' ? null : 'library')}
                        className={cn(
                          "w-full px-6 py-4 rounded-[20px] transition-all flex items-center justify-between border",
                          expandedSection === 'library' 
                            ? "bg-brand-secondary/10 border-brand-secondary/30 text-brand-secondary" 
                            : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen size={18} />
                          <span className="text-[11px] font-black uppercase tracking-widest">University Library</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold opacity-40 uppercase">{availableCourses.library.length} Courses</span>
                          <motion.div
                            animate={{ rotate: expandedSection === 'library' ? 90 : 0 }}
                            transition={{ type: "spring", damping: 20 }}
                          >
                            <ChevronRight size={16} />
                          </motion.div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedSection === 'library' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide -mx-2 px-2 mt-2">
                              {availableCourses.library.map(course => {
                                const isActive = examInput.courses.includes(course);
                                return (
                                  <button
                                    key={course}
                                    onClick={() => {
                                      setExamInput(prev => ({
                                        ...prev,
                                        courses: isActive
                                          ? prev.courses.filter(c => c !== course)
                                          : [...prev.courses, course]
                                      }));
                                    }}
                                    className={cn(
                                      "shrink-0 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap",
                                      isActive
                                        ? "bg-brand-secondary text-white border-brand-secondary shadow-lg shadow-brand-secondary/20 scale-[1.02]"
                                        : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                                    )}
                                  >
                                    {course}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Your Uploads Section */}
                    <div className="flex flex-col">
                      <button 
                        onClick={() => setExpandedSection(expandedSection === 'uploads' ? null : 'uploads')}
                        className={cn(
                          "w-full px-6 py-4 rounded-[20px] transition-all flex items-center justify-between border",
                          expandedSection === 'uploads' 
                            ? "bg-brand-secondary/10 border-brand-secondary/30 text-brand-secondary" 
                            : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Map size={18} />
                          <span className="text-[11px] font-black uppercase tracking-widest">Your Knowledge Base</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold opacity-40 uppercase">{availableCourses.uploads.length} Uploads</span>
                          <motion.div
                            animate={{ rotate: expandedSection === 'uploads' ? 90 : 0 }}
                            transition={{ type: "spring", damping: 20 }}
                          >
                            <ChevronRight size={16} />
                          </motion.div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedSection === 'uploads' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide -mx-2 px-2 mt-2">
                              {availableCourses.uploads.map(course => {
                                const isActive = examInput.courses.includes(course);
                                return (
                                  <button
                                    key={course}
                                    onClick={() => {
                                      setExamInput(prev => ({
                                        ...prev,
                                        courses: isActive
                                          ? prev.courses.filter(c => c !== course)
                                          : [...prev.courses, course]
                                      }));
                                    }}
                                    className={cn(
                                      "shrink-0 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap",
                                      isActive
                                        ? "bg-brand-secondary text-white border-brand-secondary shadow-lg shadow-brand-secondary/20 scale-[1.02]"
                                        : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                                    )}
                                  >
                                    {course}
                                  </button>
                                );
                              })}
                              {availableCourses.uploads.length === 0 && (
                                <div className="px-6 py-4 border border-dashed border-white/5 rounded-2xl flex items-center justify-center min-w-[200px] bg-white/2">
                                  <span className="text-[10px] font-bold text-white/20 uppercase italic">No personal uploads found</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </section>

                {/* Optional Exam Section */}
                <section className="bg-white/5 rounded-[32px] p-6 border border-white/5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary block mb-4">Upcoming Exam (Optional)</label>
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-secondary transition-colors">
                        <Target size={18} />
                      </div>
                      <input 
                        value={examInput.title}
                        onChange={(e) => setExamInput({...examInput, title: e.target.value})}
                        placeholder="Set Goal Title (e.g. PHY 108 Finals)"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-brand-secondary/30 transition-all placeholder:text-white/10"
                      />
                    </div>

                    <button 
                      onClick={() => setShowCalendar(true)}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3.5 text-sm font-medium flex items-center justify-between text-white/60 hover:border-brand-secondary/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-white/20" />
                        <span>{examInput.date ? new Date(examInput.date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Set Exam Date'}</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </section>

                <div className="flex justify-center pb-4">
                  <button 
                    onClick={handleGeneratePlan}
                    disabled={isGenerating || !availability || examInput.courses.length === 0}
                    className="px-8 py-3 bg-brand-primary text-dark-bg font-black uppercase tracking-[0.2em] rounded-[18px] flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(204,255,0,0.2)] disabled:shadow-none hover:shadow-[0_15px_40px_rgba(204,255,0,0.3)] text-[10px]"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-brand-primary animate-pulse" />
                        <span className="animate-pulse">Designing Path...</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generate Path
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Custom Calendar Modal */}
            <AnimatePresence>
              {showCalendar && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowCalendar(false)}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-sm glass-card !bg-dark-bg border-brand-secondary/20 p-8 rounded-[40px] shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                          className="p-2 hover:bg-white/5 rounded-lg text-white/40"
                        >
                          <ChevronRight className="rotate-180" size={18} />
                        </button>
                        <button 
                          onClick={() => setShowMonthPicker(!showMonthPicker)}
                          className="text-sm font-black text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          {calendarViewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </button>
                        <button 
                          onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                          className="p-2 hover:bg-white/5 rounded-lg text-white/40"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                      <button onClick={() => { setShowCalendar(false); setShowMonthPicker(false); }} className="text-white/40 p-2">
                        <X size={20} />
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {showMonthPicker ? (
                        <motion.div 
                          key="month-picker"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="grid grid-cols-3 gap-2 mb-6"
                        >
                          {Array.from({ length: 12 }).map((_, i) => {
                            const examDate = examInput.date ? new Date(examInput.date) : null;
                            const isMonthWithExam = examDate && examDate.getFullYear() === calendarViewDate.getFullYear() && examDate.getMonth() === i;
                            const isViewingMonth = calendarViewDate.getMonth() === i;

                            return (
                              <button
                                key={`month-${i}`}
                                onClick={() => {
                                  setCalendarViewDate(new Date(calendarViewDate.getFullYear(), i, 1));
                                  setShowMonthPicker(false);
                                }}
                                className={cn(
                                  "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative",
                                  isViewingMonth ? "bg-brand-secondary text-dark-bg" : "bg-white/5 text-white/40 hover:bg-white/10"
                                )}
                              >
                                {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                {isMonthWithExam && !isViewingMonth && (
                                  <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="calendar-grid"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className="grid grid-cols-7 gap-1 text-center mb-6">
                            {['S','M','T','W','T','F','S'].map((d, i) => (
                              <span key={`header-${i}`} className="text-[10px] font-black text-white/20 uppercase py-2">{d}</span>
                            ))}
                            {/* Dynamic Month Calendar */}
                            {(() => {
                              const year = calendarViewDate.getFullYear();
                              const month = calendarViewDate.getMonth();
                              const firstDayOfMonth = new Date(year, month, 1).getDay();
                              const daysInMonth = new Date(year, month + 1, 0).getDate();
                              
                              return [
                                ...Array(firstDayOfMonth).fill(null).map((_, i) => ({ type: 'empty' as const, id: i })),
                                ...Array.from({ length: daysInMonth }, (_, i) => ({ type: 'day' as const, id: i + 1 }))
                              ].map((item, i) => {
                                if (item.type === 'empty') return <div key={`empty-${item.id}`} className="aspect-square" />;
                                
                                const day = item.id;
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isSelected = examInput.date === dateStr;
                                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                                return (
                                  <button
                                    key={`day-${day}`}
                                    onClick={() => {
                                      setExamInput(prev => ({ ...prev, date: dateStr }));
                                      setShowCalendar(false);
                                    }}
                                    className={cn(
                                      "aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-bold transition-all relative",
                                      isSelected 
                                        ? "bg-brand-secondary text-dark-bg shadow-lg shadow-brand-secondary/20 scale-105 z-10" 
                                        : "text-white/40 hover:bg-white/5 hover:text-white"
                                    )}
                                  >
                                    {day}
                                    {isToday && !isSelected && (
                                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-primary" />
                                    )}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-white/20 uppercase tracking-widest">
                       <span>{calendarViewDate.getFullYear()}</span>
                       <button 
                        onClick={() => {
                          setCalendarViewDate(new Date());
                          setShowMonthPicker(false);
                        }}
                        className="hover:text-brand-secondary transition-colors"
                       >
                        Jump to Today
                       </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      {/* Current Focus */}
      {currentMission && (
        <div className="glass-card relative overflow-hidden mb-8 !bg-white/5 border-none">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/10 blur-2xl rounded-full" />
          <span className="pill-tag mb-3 inline-block">Active Mission</span>
          <h2 className="text-lg font-bold mb-1 truncate text-white">{currentMission.title}</h2>
          <p className="text-xs text-brand-primary font-black uppercase tracking-widest mb-4">
            {currentMission.type?.replace('-', ' ')} • {currentMission.duration}
          </p>
          
          <div className="flex gap-2 mb-6">
            <div className="w-full h-1 bg-brand-primary rounded" />
            <div className="w-full h-1 bg-brand-primary/20 rounded" />
            <div className="w-full h-1 bg-brand-primary/20 rounded" />
          </div>
          
          <button 
            onClick={() => handleResumeClick(currentMission)}
            className="w-full py-3 bg-white text-dark-bg text-sm font-bold rounded-xl active:scale-95 transition-transform"
          >
            {currentMission.status === 'completed' ? 'Restart Study' : 'Resume Mission'}
          </button>
        </div>
      )}

      {/* Mission List */}
      <motion.div layout className="mb-12">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-4">Today's Missions</label>
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {filteredMissions.slice(0, showAllMissions ? undefined : 5).map((step, idx) => (
              <motion.div 
                key={step.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: 1, 
                  height: 'auto',
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 }
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  height: 0,
                  transition: {
                    height: { duration: 0.3 },
                    opacity: { duration: 0.2 }
                  }
                }}
                className={`flex items-center gap-4 p-4 rounded-2xl border group overflow-hidden ${step.status === 'current' ? 'bg-white/5 border-brand-primary/30 shadow-lg shadow-brand-primary/5' : 'border-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-4 w-full">
                  <button 
                    onClick={() => toggleMission(step.id)}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${step.status === 'completed' ? 'bg-brand-primary text-dark-bg' : 'border-2 border-white/10 text-white/40 hover:border-brand-primary/50 hover:text-brand-primary'}`}
                  >
                    {step.status === 'completed' ? <CheckCircle2 size={18} /> : (
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "text-sm font-black truncate transition-all",
                      step.status === 'completed' ? 'text-white/20 line-through' : 'text-white'
                    )}>
                      {step.title}
                    </h4>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{step.duration}</span>
                       {step.type && (
                         <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary/60">{step.type.replace('-', ' ')}</span>
                       )}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeMission(step.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredMissions.length > 5 && (
          <button 
            onClick={() => setShowAllMissions(!showAllMissions)}
            className="w-full mt-4 py-4 border border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-brand-primary hover:border-brand-primary/30 transition-all group"
          >
            <span>{showAllMissions ? 'Show Less' : `See ${filteredMissions.length - 5} More Missions`}</span>
            <motion.div
              animate={{ rotate: showAllMissions ? 180 : 0 }}
            >
              <ChevronRight size={14} className="rotate-90 group-hover:text-brand-primary" />
            </motion.div>
          </button>
        )}

        {missions.length === 0 && !isGenerating && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="text-sm font-bold text-white/40 mb-2">No active missions</h3>
            <button 
              onClick={openGenerator}
              className="text-xs text-brand-primary font-black uppercase tracking-widest"
            >
              Generate your path
            </button>
          </div>
        )}
      </motion.div>

      {/* Strategic Goals & Academic Calendar (Original content kept) */}
      <motion.div layout className="mb-12">
        <StudyGoals />
      </motion.div>

      {/* Academic Calendar Section */}
      <motion.div layout className="glass-card mb-12 !bg-white/5 border-none">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setAcademicViewDate(new Date(academicViewDate.getFullYear(), academicViewDate.getMonth() - 1, 1))}
                className="p-1 hover:bg-white/10 rounded-lg text-white/40"
              >
                <ChevronRight className="rotate-180" size={16} />
              </button>
              <button 
                onClick={() => setShowAcademicMonthPicker(!showAcademicMonthPicker)}
                className="text-xs font-black uppercase tracking-widest text-brand-secondary px-2 py-1 rounded-lg hover:bg-white/10 transition-all font-mono"
              >
                {academicViewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </button>
              <button 
                onClick={() => setAcademicViewDate(new Date(academicViewDate.getFullYear(), academicViewDate.getMonth() + 1, 1))}
                className="p-1 hover:bg-white/10 rounded-lg text-white/40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-brand-secondary" />
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Academic Year {new Date().getFullYear()}</span>
            </div>
        </div>
        
        <AnimatePresence mode="wait">
          {showAcademicMonthPicker ? (
            <motion.div 
              key="ac-month-picker"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-3 gap-2 mb-6"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAcademicViewDate(new Date(academicViewDate.getFullYear(), i, 1));
                    setShowAcademicMonthPicker(false);
                  }}
                  className={cn(
                    "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    academicViewDate.getMonth() === i ? "bg-brand-secondary text-white" : "bg-white/5 text-white/40 hover:bg-brand-secondary/20"
                  )}
                >
                  {new Date(0, i).toLocaleString('default', { month: 'short' })}
                </button>
              ))}
            </motion.div>
          ) : (
            <>
              <div className="flex justify-between mb-4 border-b border-white/5 pb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div key={`ac-header-${i}`} className="w-9 text-center">
                          <span className="text-[9px] font-black text-white/20 uppercase">{d}</span>
                      </div>
                  ))}
              </div>
              <div className="grid grid-cols-7 gap-1 mb-8">
                  {(() => {
                    const year = academicViewDate.getFullYear();
                    const month = academicViewDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const days = new Date(year, month + 1, 0).getDate();
                    
                    return [
                      ...Array(firstDay).fill(null).map((_, i) => ({ type: 'empty' as const, id: i })),
                      ...Array.from({ length: days }, (_, i) => ({ type: 'day' as const, id: i + 1 }))
                    ].map((item, i) => {
                      if (item.type === 'empty') return <div key={`ac-empty-${item.id}`} className="w-9 h-9" />;
                      
                      const day = item.id;
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = selectedCalendarDate === dateStr;
                      const hasEvent = MOCK_ACADEMIC_EVENTS.some(e => e.date === dateStr);

                      return (
                        <button
                          key={`ac-day-${day}`}
                          onClick={() => setSelectedCalendarDate(dateStr)}
                          className={cn(
                              "w-9 h-9 rounded-xl flex flex-col items-center justify-center text-[11px] font-black transition-all relative",
                              isSelected ? "bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20 scale-110 z-10" : "text-white/40 hover:bg-white/5",
                              hasEvent && !isSelected && "text-brand-secondary"
                          )}
                        >
                          {day}
                          {hasEvent && (
                            <div className={cn(
                              "absolute bottom-1.5 w-1 h-1 rounded-full",
                              isSelected ? "bg-white" : "bg-brand-secondary"
                            )} />
                          )}
                        </button>
                      );
                    });
                  })()}
              </div>

              <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Events for {new Date(selectedCalendarDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </h3>
                  </div>
                  
                  {MOCK_ACADEMIC_EVENTS.filter(e => e.date === selectedCalendarDate).length > 0 ? (
                    (() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isPast = new Date(selectedCalendarDate) < today;
                      
                      return MOCK_ACADEMIC_EVENTS.filter(e => e.date === selectedCalendarDate).map(event => (
                        <CalendarEventCard key={event.id} event={event} isPast={isPast} />
                      ));
                    })()
                  ) : (
                    <div className="py-8 bg-black/20 rounded-[24px] border border-dashed border-white/5 flex flex-col items-center justify-center gap-2">
                       <Calendar size={20} className="text-white/10" />
                       <p className="text-[10px] font-bold text-white/20 uppercase italic">No academic events scheduled</p>
                    </div>
                  )}
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function CalendarEventCard({ event, isPast }: { event: AcademicEvent, isPast?: boolean }) {
  return (
    <div className={cn(
        "flex flex-col gap-3 p-4 rounded-[24px] transition-all border group",
        isPast 
          ? "bg-white/[0.01] border-white/5 opacity-60 grayscale-[0.3]" 
          : "bg-white/2 border-white/5 hover:bg-white/5"
    )}>
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <span className="text-[10px] font-black uppercase text-brand-secondary block tracking-widest leading-none">{event.course}</span>
                <h4 className="text-sm font-black text-white group-hover:text-brand-secondary transition-colors leading-tight mt-1">{event.title}</h4>
            </div>
            <div className={cn(
              "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter",
              event.type === 'exam' ? "bg-red-500/20 text-red-400" : 
              event.type === 'deadline' ? "bg-brand-secondary/20 text-brand-secondary" : 
              "bg-brand-secondary/10 text-white/40"
            )}>
              {event.type}
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 text-brand-secondary">
                  <Calendar size={12} />
                </div>
                <div>
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Date</p>
                   <p className="text-[10px] font-bold text-white/50">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30">
                  <Clock size={12} />
                </div>
                <div>
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Time</p>
                   <p className="text-[10px] font-bold text-white/50">{event.time}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 col-span-2">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 text-brand-secondary">
                  <MapPin size={12} />
                </div>
                <div>
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Venue</p>
                   <p className="text-[10px] font-bold text-white/50">{event.venue}</p>
                </div>
            </div>
        </div>
    </div>
  );
}
