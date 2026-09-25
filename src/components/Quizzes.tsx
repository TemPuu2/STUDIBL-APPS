import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Timer, Swords, TrendingUp, ChevronLeft, ChevronRight, Check, X, Medal, Users, History, Calendar, Brain, ArrowRight, Sparkles, GraduationCap, Clock, AlertCircle, Share2, ClipboardList, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MissionDetailBottomSheet from './MissionDetailBottomSheet';
import { useStats, SubjectCategory } from '../lib/StatsContext';
import Markdown from 'react-markdown';
import { aiService } from '../services/aiService';
import { cn } from '../lib/utils';
import { MOCK_LECTURES } from '../constants';
import { useMissions } from '../lib/MissionsContext';

interface QuizHistoryItem {
  id: string;
  title: string;
  score: number;
  total: number;
  date: string;
  isExam?: boolean;
}

interface ExamConfig {
  course: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number; // in minutes
  questionCount: number;
}

const mockQuizData = [
  { id: '1', title: 'Network Security', items: 12, difficulty: 'Elite', time: '10m' },
  { id: '2', title: 'Compiler Construction', items: 8, difficulty: 'Master', time: '15m' },
  { id: '3', title: 'Machine Learning Basics', items: 20, difficulty: 'Specialist', time: '20m' },
];

const leaderboard = [
  { rank: 1, name: 'CyberWolf', score: 12450, avatar: 'wolf' },
  { rank: 2, name: 'SudoMaster', score: 11980, avatar: 'sudo' },
  { rank: 3, name: 'QuantGeek', score: 11500, avatar: 'geek' },
  { rank: 4, name: 'You', score: 9840, avatar: 'alex', isUser: true },
];

export default function Quizzes({ 
  resumeMission, 
  onClearResume 
}: { 
  resumeMission?: any | null, 
  onClearResume?: () => void 
}) {
  const { addResult, missionLogs } = useStats();
  const { currentMission, trackActivity, updateMissionMetadata } = useMissions();
  const [inQuiz, setInQuiz] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [initialStep, setInitialStep] = useState(0);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [aiQuiz, setAiQuiz] = useState<any>(null);

  const [inExamSetup, setInExamSetup] = useState(false);
  const [inExam, setInExam] = useState(false);
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [generatedExam, setGeneratedExam] = useState<any>(null);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);

  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Resume logic
  useEffect(() => {
    if (resumeMission && resumeMission.metadata) {
      const { type, quizId, examConfig: savedConfig, lastQuestionIndex, userAnswers } = resumeMission.metadata;
      
      if (type === 'quiz' || type === 'exam') {
        if (lastQuestionIndex !== undefined) {
          setInitialStep(lastQuestionIndex);
        }
        
        if (type === 'quiz') {
          // If it's a mock quiz or AI quiz
          setInQuiz(true);
          // Metadata should ideally have the quiz data
          if (resumeMission.metadata.quizData) {
            setSelectedQuiz(resumeMission.metadata.quizData);
          }
        } else if (type === 'exam') {
          setInExam(true);
          if (savedConfig) setExamConfig(savedConfig);
          if (resumeMission.metadata.examData) {
            setGeneratedExam(resumeMission.metadata.examData);
          }
        }
      }
      
      // Clear after handling
      if (onClearResume) onClearResume();
    }
  }, [resumeMission, onClearResume]);

  useEffect(() => {
    const savedAIQuiz = localStorage.getItem('studibl_latest_ai_quiz');
    if (savedAIQuiz) {
      try {
        setAiQuiz(JSON.parse(savedAIQuiz));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const lastStepSync = useRef<string>('');
  const handleStepChange = useCallback((step: number) => {
    if (currentMission) {
      const metadata = currentMission.metadata || {};
      const isCorrectMission = (metadata.quizId && metadata.quizId === selectedQuiz?.id) || (metadata.examData && currentMission.type === 'exam');
      
      if (isCorrectMission) {
        const syncKey = `${currentMission.id}_${step}`;
        if (lastStepSync.current !== syncKey) {
          lastStepSync.current = syncKey;
          updateMissionMetadata(currentMission.id, { lastQuestionIndex: step });
        }
      }
    }
  }, [currentMission, selectedQuiz?.id, updateMissionMetadata]);

  if (inQuiz) {
    return (
      <QuizArena 
        quiz={selectedQuiz || mockQuizData[0]} 
        onExit={() => { setInQuiz(false); setSelectedQuiz(null); setInitialStep(0); }} 
        initialStep={initialStep}
        onStepChange={handleStepChange}
        onComplete={async (score, total, results, timeSpentSeconds) => {
          // Determine subject based on quiz title
          let subject: SubjectCategory = 'Theory';
          const title = (selectedQuiz?.title || "Compiler Siege").toLowerCase();
          if (title.includes('security')) subject = 'Security';
          else if (title.includes('compiler') || title.includes('code')) subject = 'Code';
          else if (title.includes('math') || title.includes('physics')) subject = 'Math';
          else if (title.includes('logic')) subject = 'Logic';
          else if (title.includes('hardware')) subject = 'Hardware';

          addResult({
            title: selectedQuiz?.title || "Compiler Siege",
            type: 'Quiz',
            score,
            total,
            timeSpentSeconds,
            subject
          });
          
          setIsAnalyzing(true);
          try {
            const analysis = await aiService.analyzeQuizResults(selectedQuiz?.title || "Compiler Siege", results);
            setAnalysisResults({ ...analysis, score, total });
          } catch (e) {
            console.error(e);
            setInQuiz(false);
          } finally {
            setIsAnalyzing(false);
          }
        }}
      />
    );
  }

  if (inExamSetup) {
    return (
      <ExamSetup 
        onExit={() => setInExamSetup(false)} 
        onStart={async (config) => {
          setExamConfig(config);
          setIsGeneratingExam(true);
          trackActivity({
            title: `Final Exam: ${config.course}`,
            duration: `${config.duration}m`,
            type: 'exam',
            topic: config.course
          });
          try {
            const exam = await aiService.generateExam(config.course, config.difficulty, config.questionCount);
            setGeneratedExam(exam);
            setInExam(true);
            setInExamSetup(false);
          } catch (e) {
            console.error(e);
          } finally {
            setIsGeneratingExam(false);
          }
        }} 
        isLoading={isGeneratingExam}
      />
    );
  }

  if (inExam && generatedExam) {
    return (
      <ExamArena 
        exam={generatedExam}
        config={examConfig!}
        initialStep={initialStep}
        onStepChange={handleStepChange}
        onExit={() => {
          setInExam(false);
          setGeneratedExam(null);
          setInitialStep(0);
        }}
        onComplete={async (results, avgTime, totalTimeSeconds) => {
          setInExam(false);
          setIsAnalyzing(true);
          try {
            const analysis = await aiService.analyzePerformance(generatedExam.examTitle, results);
            const score = results.filter(r => r.isCorrect).length;
            
            // Determine subject
            let subject: SubjectCategory = 'Theory';
            const course = (examConfig?.course || "").toLowerCase();
            if (course.includes('security')) subject = 'Security';
            else if (course.includes('compiler') || course.includes('code') || course.includes('cs')) subject = 'Code';
            else if (course.includes('mech') || course.includes('math')) subject = 'Math';
            
            addResult({
              title: generatedExam.examTitle,
              type: 'Exam',
              score,
              total: results.length,
              timeSpentSeconds: totalTimeSeconds,
              isExam: true,
              subject
            });

            setAnalysisResults({ ...analysis, score, total: results.length, isExam: true, results, avgTime });
          } catch (e) {
            console.error(e);
          } finally {
            setIsAnalyzing(false);
          }
        }}
      />
    );
  }

  if (isAnalyzing || analysisResults) {
    return (
      <div className="fixed inset-0 z-50 bg-dark-bg flex flex-col p-6 animate-in fade-in duration-500 overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto w-full space-y-8 pt-8 pb-12">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-brand-primary/10 border-t-brand-primary animate-spin" />
                <Brain className="absolute inset-0 m-auto text-brand-primary" size={32} />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Analyzing Performance</h2>
                <p className="text-sm text-white/40">Our AI is identifying your logic gaps...</p>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black italic uppercase text-white">Mission Debrief</h1>
                <button 
                  onClick={() => {
                    setAnalysisResults(null);
                    setInQuiz(false);
                  }}
                  className="p-2 glass rounded-xl text-white/40"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Score recap & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 glass p-8 rounded-[40px] border-white/5 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy size={100} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-2">Academic Mastery Rating</p>
                  <h2 className="text-7xl font-black italic text-white leading-none">
                    {analysisResults.total > 0 ? Math.round((analysisResults.score / analysisResults.total) * 100) : 0}<span className="text-2xl text-white/20 font-light">%</span>
                  </h2>
                  <div className="markdown-body prose prose-invert prose-sm max-w-md mt-4 text-white/60">
                    <Markdown>{analysisResults.summary || 'Summary not available.'}</Markdown>
                  </div>
                </div>

                <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
                    <Target size={32} />
                  </div>
                  <div className="text-3xl font-black text-white">{analysisResults.score}/{analysisResults.total}</div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Net Productivity</p>
                </div>

                {analysisResults.avgTime && (
                  <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-secondary/10 flex items-center justify-center text-brand-secondary mb-4">
                      <Clock size={32} />
                    </div>
                    <div className="text-3xl font-black text-white">{analysisResults.avgTime}s</div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Avg Speed / Q</p>
                  </div>
                )}
              </div>

              {/* Topic Breakdown Chart (Simple Visual) */}
              {analysisResults.topicBreakdown && (
                <div className="glass p-8 rounded-[40px] border-white/5 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <ClipboardList size={14} /> Course Knowledge Map
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(analysisResults.topicBreakdown).map(([topic, score]: [string, any]) => (
                      <div key={topic} className="space-y-2">
                        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight">
                          <span className="text-white/60">{topic}</span>
                          <span className={cn(
                            score >= 80 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400"
                          )}>{score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            className={cn(
                              "h-full rounded-full",
                              score >= 80 ? "bg-green-400" : score >= 50 ? "bg-yellow-400" : "bg-red-400"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Peer Comparison */}
              <div className="glass p-6 rounded-[32px] border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Peer Comparison</h4>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">You performed better than 84% of students</p>
                  </div>
                </div>
                <div className="text-2xl font-black italic text-brand-primary">+12%</div>
              </div>

              {/* Study Plan & Actions */}
              <div className="glass p-8 rounded-[40px] border-brand-primary/20 bg-brand-primary/5 space-y-6">
                <div className="flex items-center gap-3 text-brand-primary">
                  <GraduationCap size={20} />
                  <h3 className="text-sm font-black uppercase tracking-widest">AI Strategic Study Plan</h3>
                </div>
                <div className="space-y-4">
                   <div className="markdown-body prose prose-invert prose-sm max-w-none text-xs leading-relaxed text-white/80">
                     <Markdown>{analysisResults.studyPlan || 'Review your lectures to strengthen your understanding.'}</Markdown>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  <button 
                    className="flex items-center justify-center gap-2 py-4 glass border-white/10 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] hover:bg-white/5 transition-all"
                  >
                    <Share2 size={16} /> Post to Feed
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl text-[10px] hover:scale-[1.02] shadow-xl transition-all"
                  >
                    <Sparkles size={16} /> Deeper AI Review
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setAnalysisResults(null);
                    setInQuiz(false);
                    setInExam(false);
                  }}
                  className="w-full py-4 bg-brand-primary text-dark-bg font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full px-6 pt-3 pb-6 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Battle Arena</h1>
          <p className="text-sm text-white/40">Test your mastery against the best.</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
          <Swords size={20} />
        </div>
      </div>

      {/* Exam Mode Toggle */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setInExamSetup(true)}
        className="relative p-6 rounded-[32px] bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary bg-[length:200%_200%] animate-gradient-slow cursor-pointer mb-8 overflow-hidden group shadow-2xl shadow-brand-primary/20"
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
        <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-700">
          <Zap size={160} strokeWidth={1} className="text-white" />
        </div>
        
        <div className="relative z-20 flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-black/40 text-white text-[8px] font-black uppercase tracking-widest border border-white/20">AI Engine active</span>
              <Sparkles size={12} className="text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Enter Exam Mode</h2>
            <p className="text-white/80 text-xs font-medium max-w-[200px]">Simulate real university exams with AI-powered proctoring.</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all">
            <GraduationCap size={28} />
          </div>
        </div>
      </motion.div>

      {/* Featured Arena */}
      <div className="relative rounded-[32px] overflow-hidden mb-8 group cursor-pointer" onClick={() => {
        const quiz = { title: 'Compiler Siege 2026', items: 12 };
        setSelectedQuiz(quiz);
        setInQuiz(true);
        trackActivity({
          title: `Battle: ${quiz.title}`,
          duration: '15m',
          type: 'exam', // Tournaments are like exams
          topic: 'Compiler Construction',
          metadata: { type: 'exam', quizId: 'siege_2026', quizData: quiz }
        });
      }}>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent z-10" />
        <img src="https://picsum.photos/seed/cyber/600/400" alt="Arena" className="w-full h-48 object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-widest border border-red-500/20">Live Tournament</span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-white/50 uppercase"><Users size={10} /> 4.2k active</span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight uppercase italic tracking-tighter">Compiler Siege 2026</h2>
          <p className="text-white/60 text-xs mb-4">Win an exclusive "Kernel Master" badge & 500 XP.</p>
          <button className="w-full py-3 bg-brand-secondary text-white font-black uppercase tracking-widest rounded-xl text-xs hover:neon-glow transition-all">
            Enter Arena
          </button>
        </div>
      </div>

      {/* Quick Quizzes */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
          <TrendingUp size={14} /> Training Missions
        </h3>

        {aiQuiz && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              const quizData = aiQuiz;
              setSelectedQuiz(quizData);
              setInQuiz(true);
              trackActivity({
                title: `Challenge: ${quizData.title}`,
                duration: '10m',
                type: 'quiz',
                topic: quizData.topic || 'General AI Quiz',
                metadata: { type: 'quiz', quizId: quizData.id, quizData: quizData }
              });
            }}
            className="group relative overflow-hidden p-0.5 rounded-2xl bg-gradient-to-r from-brand-primary/40 to-brand-secondary/40 animate-pulse-slow cursor-pointer"
          >
            <div className="bg-dark-bg rounded-[14px] p-4 flex items-center justify-between group-hover:bg-dark-bg/80 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Brain size={18} />
                </div>
                <div>
                   <div className="flex items-center gap-2">
                     <h4 className="text-sm font-bold text-white">Dynamic AI Challenge</h4>
                     <span className="text-[8px] bg-brand-primary text-black px-1.5 py-0.5 rounded font-black uppercase">Tailored</span>
                   </div>
                   <p className="text-[10px] text-white/40 truncate max-w-[180px]">{aiQuiz.title}</p>
                </div>
              </div>
              <div className="text-brand-primary">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>
        )}

        {mockQuizData.map(quiz => (
           <div 
             key={quiz.id} 
             onClick={() => {
               setSelectedQuiz(quiz);
               setInQuiz(true);
               trackActivity({
                 title: `Quiz: ${quiz.title}`,
                 duration: quiz.time,
                 type: 'quiz',
                 topic: quiz.title,
                 metadata: { type: 'quiz', quizId: quiz.id, quizData: quiz }
               });
             }}
             className="glass-card flex items-center justify-between group hover:border-brand-secondary/30 transition-all cursor-pointer border-transparent"
           >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-brand-secondary transition-colors">
                  <Trophy size={18} />
                </div>
                <div>
                   <h4 className="text-sm font-bold">{quiz.title}</h4>
                   <div className="flex items-center gap-3 text-[10px] text-white/30">
                      <span>{quiz.items} Qs</span>
                      <span className="w-1 h-1 bg-white/10 rounded-full" />
                      <span>{quiz.time} Limit</span>
                   </div>
                </div>
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded-lg">
                {quiz.difficulty}
              </div>
           </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="glass-card border-t-brand-secondary/30 mb-8">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-6">
          <Medal size={16} className="text-brand-secondary" /> Global Ranking
        </h3>
        <div className="space-y-4">
          {leaderboard.map(u => (
             <div key={u.rank} className={`flex items-center justify-between p-2 rounded-xl border transition-all ${u.isUser ? 'bg-brand-secondary/10 border-brand-secondary/20' : 'border-transparent'}`}>
                <div className="flex items-center gap-4">
                   <span className={`text-[10px] font-black w-4 ${u.rank <= 3 ? 'text-brand-secondary' : 'text-white/20'}`}>#0{u.rank}</span>
                   <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10">
                      <img src={`https://picsum.photos/seed/${u.avatar}/40/40`} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   </div>
                   <span className={`text-xs font-bold ${u.isUser ? 'text-white' : 'text-white/60'}`}>{u.name}</span>
                </div>
                <span className="text-[10px] font-mono text-white/40">{u.score.toLocaleString()} XP</span>
             </div>
          ))}
        </div>
      </div>

      {/* Quiz History (Mission Log) */}
      <div className="glass-card mb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
              <History size={14} /> Mission Log
            </h3>
            <p className="text-[9px] text-white/10 font-bold uppercase mt-1 tracking-tighter">Combat record synced from Stats Engine</p>
          </div>
          {showAllHistory && missionLogs.length > ITEMS_PER_PAGE && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                disabled={historyPage === 1}
                className="p-1.5 glass rounded-lg text-white/40 disabled:opacity-20 transition-all hover:text-brand-secondary"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-mono font-bold text-white/40">
                {historyPage} / {Math.ceil(missionLogs.length / ITEMS_PER_PAGE)}
              </span>
              <button 
                onClick={() => setHistoryPage(prev => Math.min(Math.ceil(missionLogs.length / ITEMS_PER_PAGE), prev + 1))}
                disabled={historyPage === Math.ceil(missionLogs.length / ITEMS_PER_PAGE)}
                className="p-1.5 glass rounded-lg text-white/40 disabled:opacity-20 transition-all hover:text-brand-secondary"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
        
        {missionLogs.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {missionLogs
                .slice(
                  showAllHistory ? (historyPage - 1) * ITEMS_PER_PAGE : 0, 
                  showAllHistory ? (historyPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE : 5
                )
                .map((item, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={item.id} 
                    onClick={() => {
                      setSelectedHistoryItem(item);
                      setIsHistorySheetOpen(true);
                    }}
                    className="flex items-center justify-between group border-b border-white/5 pb-4 last:border-0 last:pb-0 cursor-pointer hover:bg-white/[0.02] -mx-2 px-3 py-2 rounded-2xl transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        item.type === 'Exam' ? "bg-brand-secondary/10 text-brand-secondary" : "bg-brand-primary/10 text-brand-primary"
                      )}>
                        {item.type === 'Exam' ? <Medal size={18} /> : <Zap size={18} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-white/30 font-medium">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {item.date}</span>
                          <span className="w-1 h-1 bg-white/10 rounded-full" />
                          <span className="uppercase text-brand-secondary">{item.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-black italic text-white uppercase tracking-tight">
                        {item.score}<span className="text-white/30">/</span>{item.total}
                      </div>
                      <div className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        item.accuracy >= 80 ? "text-emerald-400" : item.accuracy >= 50 ? "text-orange-400" : "text-red-400"
                      )}>
                        {Math.round(item.accuracy)}% 
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {(missionLogs.length > 5 || showAllHistory) && (
              <button 
                onClick={() => {
                  setShowAllHistory(!showAllHistory);
                  setHistoryPage(1);
                }}
                className="w-full mt-4 py-4 border border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-brand-secondary hover:border-brand-secondary/30 transition-all group active:scale-95 shadow-inner"
              >
                <span>{showAllHistory ? 'Show Less' : `See ${missionLogs.length - 5} More Missions`}</span>
                <motion.div
                  animate={{ rotate: showAllHistory ? 180 : 0 }}
                >
                  <ChevronRight size={14} className="rotate-90 group-hover:text-brand-secondary" />
                </motion.div>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/10 ring-1 ring-white/5 shadow-inner">
              <History size={28} />
            </div>
            <p className="text-[11px] text-white/20 font-black uppercase tracking-[0.2em]">No Combat Records Synced</p>
          </div>
        )}
      </div>

      <MissionDetailBottomSheet 
        item={selectedHistoryItem}
        isOpen={isHistorySheetOpen}
        onClose={() => setIsHistorySheetOpen(false)}
      />
    </div>
  );
}

function QuizArena({ 
  quiz, 
  onExit, 
  onComplete,
  initialStep = 0,
  onStepChange
}: { 
  quiz: any, 
  onExit: () => void, 
  onComplete: (score: number, total: number, results: any[], timeSpentSeconds: number) => void,
  initialStep?: number,
  onStepChange?: (step: number) => void
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [step, setStep] = useState(initialStep);
  const [score, setScore] = useState(0);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (onStepChange) onStepChange(step);
  }, [step, onStepChange]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isAIQuiz = !!quiz.questions;
  const currentQuestions = isAIQuiz ? quiz.questions : [
    {
      question: "Which component of a compiler transforms source code into an intermediate representation?",
      options: ["Source Code Analysis", "Semantic Analysis Engine", "Abstract Syntax Parser", "Code Optimization Unit"],
      answerIndex: 1,
      explanation: "Semantic analysis ensures the program makes sense and generates an IR."
    },
    {
      question: "What is the primary role of a Lexical Analyzer?",
      options: ["Token Generation", "Parsing Tree Construction", "Error Correction", "Code Generation"],
      answerIndex: 0,
       explanation: "Lexical analysis reads stream of characters and produces tokens."
    },
    {
      question: "In dynamic programming, what is the purpose of memoization?",
      options: ["Reduce Memory Usage", "Store Computed Results", "Iterative Loops", "Recursion Removal"],
      answerIndex: 1,
      explanation: "Memoization avoids redundant calculations by storing previous results."
    }
  ];

  const totalQuestions = isAIQuiz ? currentQuestions.length : 12;

  const handleNext = () => {
    if (selected === null) return;
    
    const isCorrect = selected === currentQuestions[step].answerIndex;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);
    
    const result = {
      question: currentQuestions[step].question,
      isCorrect,
      explanation: currentQuestions[step].explanation || "No detailed explanation available."
    };
    
    const updatedResults = [...userResults, result];
    setUserResults(updatedResults);
    
    if (step + 1 < currentQuestions.length) {
      setStep(step + 1);
      setSelected(null);
    } else {
      onComplete(newScore, totalQuestions, updatedResults, timeSpent);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg flex flex-col p-6 animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <button onClick={onExit} className="p-2 glass rounded-xl text-white/40 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
          <Timer size={14} className="text-brand-secondary" />
          <span className="text-sm font-mono font-bold tracking-tighter">{formatTime(timeSpent)}</span>
        </div>
        <div className="w-10 h-1 rounded-full bg-white/10" />
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
        <div className="flex flex-col min-h-full">
          <span className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-2">Question 0{step + 1} / {totalQuestions}</span>
          <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-8 sm:mb-12">
            {currentQuestions[step].question}
          </h2>
          
          <div className="space-y-3 sm:space-y-4 mb-8">
            {currentQuestions[step].options.map((option: string, idx: number) => (
              <QuizOption 
                key={idx}
                index={idx} 
                label={option} 
                selected={selected === idx} 
                onClick={() => setSelected(idx)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Fixed */}
      <div className="pt-4 pb-20 sm:pb-8 shrink-0">
        <button 
          onClick={handleNext}
          disabled={selected === null}
          className="w-full py-4 bg-brand-primary text-dark-bg font-black uppercase tracking-widest rounded-2xl disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-95"
        >
          {step + 1 < currentQuestions.length ? 'Submit Answer' : 'Finish Quiz'}
        </button>
      </div>
    </div>
  );
}

function QuizOption({ index, label, selected, onClick }: { index: number, label: string, selected: boolean, onClick: () => void, key?: React.Key }) {
  const letters = ['A', 'B', 'C', 'D'];
  return (
    <button 
      onClick={onClick}
      className={`w-full p-5 rounded-2xl text-left flex items-center gap-4 border transition-all ${selected ? 'border-brand-secondary bg-brand-secondary/10 shadow-lg shadow-brand-secondary/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all ${selected ? 'bg-brand-secondary text-white' : 'bg-white/5 text-white/30'}`}>
        {letters[index]}
      </div>
      <span className={`text-sm font-bold ${selected ? 'text-white' : 'text-white/60'}`}>{label}</span>
      {selected && <Check size={16} className="ml-auto text-brand-secondary" />}
    </button>
  );
}

function ExamSetup({ onExit, onStart, isLoading }: { onExit: () => void, onStart: (config: ExamConfig) => void, isLoading: boolean }) {
  const [course, setCourse] = useState('MECH 402');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [duration, setDuration] = useState(30);
  const [qCount, setQCount] = useState(15);

  const courses = Array.from(new Set(MOCK_LECTURES.map(l => l.course)));

  return (
    <div className="fixed inset-0 z-[100] bg-dark-bg animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-y-auto scrollbar-hide">
      <div className="max-w-xl mx-auto w-full px-6 pt-12 pb-40 space-y-8 sm:space-y-10 min-h-full flex flex-col">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="p-2 glass rounded-xl text-white/40 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-2">
              <Zap size={20} className="sm:size-24" />
            </div>
            <h1 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter">Exam Protocol</h1>
          </div>
          <div className="w-10" />
        </div>

        <div className="space-y-6 sm:space-y-8 flex-grow">
          {/* Course Selection */}
          <div className="space-y-3 sm:space-y-4">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Assigned Course</label>
            <div className="grid grid-cols-1 gap-2">
              {courses.map(c => (
                <button 
                  key={c}
                  onClick={() => setCourse(c)}
                  className={cn(
                    "p-4 sm:p-5 rounded-2xl border transition-all text-left flex justify-between items-center",
                    course === c ? "bg-brand-primary/10 border-brand-primary text-white" : "glass border-white/5 text-white/40"
                  )}
                >
                  <span className="text-sm font-bold">{c}</span>
                  {course === c && <Check size={16} className="text-brand-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3 sm:space-y-4">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Cognitive Depth (Difficulty)</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                <button 
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "p-3 sm:p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                    difficulty === d ? "bg-brand-secondary/10 border-brand-secondary text-white" : "glass border-white/5 text-white/40"
                  )}
                >
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{d}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 sm:space-y-4">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Duration (Min)</label>
              <div className="glass p-1 rounded-2xl flex items-center border-white/5">
                <input 
                  type="number" 
                  min={15} 
                  max={120} 
                  value={isNaN(duration) ? '' : duration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setDuration(isNaN(val) ? 0 : val);
                  }}
                  className="w-full bg-transparent p-3 sm:p-4 text-center text-sm font-black text-white focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Questions</label>
              <div className="glass p-1 rounded-2xl flex items-center border-white/5">
                <input 
                  type="number" 
                  min={5} 
                  max={50} 
                  value={isNaN(qCount) ? '' : qCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setQCount(isNaN(val) ? 0 : val);
                  }}
                  className="w-full bg-transparent p-3 sm:p-4 text-center text-sm font-black text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button 
            onClick={() => onStart({ course, difficulty, duration, questionCount: qCount })}
            disabled={isLoading}
            className={cn(
              "w-full py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center justify-center gap-3 transition-all",
              isLoading ? "bg-white/5 text-white/20" : "bg-white text-black hover:scale-[1.02] active:scale-95 shadow-2xl shadow-white/10"
            )}
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl border-4 border-brand-primary/20 border-t-brand-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="text-brand-primary animate-pulse" size={32} />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-white italic tracking-tight">Initializing AI Engine...</h3>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Optimizing analytical pathways</p>
                </div>
              </div>
            ) : (
              <>
                Initialize Exam <Zap size={18} fill="currentColor" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExamArena({ exam, config, onExit, onComplete, initialStep = 0, onStepChange }: { exam: any, config: ExamConfig, onExit: () => void, onComplete: (results: any[], avgTime: number, totalTimeSeconds: number) => void, initialStep?: number, onStepChange?: (step: number) => void }) {
  const [step, setStep] = useState(initialStep);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (onStepChange) onStepChange(step);
  }, [step, onStepChange]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = exam.questions[step];

  const handleOptionSelect = (idx: number) => {
    setAnswers(prev => ({ ...prev, [step]: idx }));
  };

  const handleShortAnswerChange = (val: string) => {
    setAnswers(prev => ({ ...prev, [step]: val }));
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const timeSpent = config.duration * 60 - timeLeft;
    const avgTimePerQuestion = Math.round(timeSpent / exam.questions.length);
    
    // Grade exam
    const results = exam.questions.map((q: any, idx: number) => {
      const userAnswer = answers[idx];
      let isCorrect = false;
      
      if (q.type === 'MCQ' || q.type === 'TF') {
        isCorrect = userAnswer === q.answerIndex;
      } else {
        isCorrect = true; // Placeholder for SA
      }
      
      return {
        question: q.question,
        topic: q.topic,
        userAnswer,
        correctAnswer: q.answerKey || q.options[q.answerIndex],
        isCorrect,
        explanation: q.explanation,
        type: q.type
      };
    });

    onComplete(results, avgTimePerQuestion, timeSpent);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-dark-bg flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* HUD Header */}
      <div className="px-4 py-4 sm:px-6 sm:py-6 border-b border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={onExit} className="p-2 glass rounded-lg text-white/20 hover:text-white transition-all">
               <ChevronLeft size={18} />
             </button>
             <div className="h-6 w-px bg-white/10 hidden sm:block" />
             <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-black uppercase text-brand-primary tracking-widest truncate">{config.course}</div>
                <div className="text-[11px] sm:text-xs font-bold text-white/60 truncate max-w-[120px] sm:max-w-[200px]">{exam.examTitle}</div>
             </div>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <div className={cn(
              "px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 border transition-all",
              timeLeft < 300 ? "border-red-500/50 bg-red-500/10 text-red-400" : "glass border-white/10 text-white"
            )}>
              <Clock size={14} className={cn("sm:size-4", timeLeft < 300 && "animate-pulse")} />
              <span className="text-sm sm:text-lg font-black font-mono tracking-tighter">{formatTime(timeLeft)}</span>
            </div>

            <button 
              onClick={handleSubmit}
              className="px-4 py-1.5 sm:px-6 sm:py-2 bg-brand-primary text-black text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/10"
            >
              Finalize
            </button>
          </div>
        </div>
      </div>

      {/* Main Examination Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto p-6 sm:p-12 space-y-10 min-h-full flex flex-col">
          <div className="flex-grow space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">Question {step + 1} of {exam.questions.length}</span>
                <span className="px-3 py-1 rounded-full bg-brand-secondary/10 text-[9px] font-black uppercase tracking-widest text-brand-secondary">{currentQuestion.type}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-4">
              {(currentQuestion.type === 'MCQ' || currentQuestion.type === 'TF') ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={cn(
                        "group p-5 sm:p-6 rounded-[24px] sm:rounded-3xl border transition-all text-left flex items-center justify-between",
                        answers[step] === idx 
                          ? "bg-brand-primary/10 border-brand-primary text-white" 
                          : "glass border-white/5 text-white/40 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                         <div className={cn(
                           "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                           answers[step] === idx ? "bg-brand-primary text-black" : "bg-white/5 text-white/20"
                         )}>
                           {String.fromCharCode(65 + idx)}
                         </div>
                         <span className="font-bold text-sm sm:text-base leading-tight">{option}</span>
                      </div>
                      {answers[step] === idx && <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-primary flex items-center justify-center shrink-0"><Check size={12} className="text-black" /></div>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea 
                    value={answers[step] || ''}
                    onChange={(e) => handleShortAnswerChange(e.target.value)}
                    placeholder="Enter your detailed response here..."
                    className="w-full h-48 sm:h-64 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm focus:outline-none focus:border-brand-primary/30 transition-all font-medium leading-relaxed"
                  />
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center">AI will analyze the logic of your text response</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Footer - Now inside scroll area */}
          <div className="pt-10 pb-20 sm:pb-10 mt-auto border-t border-white/5 flex flex-wrap gap-4 justify-between items-center">
            <button 
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white disabled:opacity-0 transition-all"
            >
              <ChevronLeft size={16} /> Back
            </button>
            
            <div className="flex gap-1 overflow-x-auto scrollbar-hide max-w-full sm:max-w-[200px] order-3 sm:order-2 w-full sm:w-auto justify-center">
              {exam.questions.map((_: any, idx: number) => (
                 <button 
                  key={idx}
                  onClick={() => setStep(idx)}
                  className={cn(
                    "w-6 h-1 sm:w-8 rounded-full transition-all",
                    step === idx ? "bg-brand-primary w-10 sm:w-12" : answers[idx] !== undefined ? "bg-white/40" : "bg-white/10"
                  )}
                 />
              ))}
            </div>

            <button 
              onClick={() => {
                if (step < exam.questions.length - 1) {
                  setStep(step + 1);
                  // Scroll to top of question on next
                  document.querySelector('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
                }
                else handleSubmit();
              }}
              className="px-6 py-3 sm:px-8 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all order-2 sm:order-3"
            >
              {step === exam.questions.length - 1 ? 'Finish Exam' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
