import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Subject categories for the radar map
 */
export type SubjectCategory = 'Logic' | 'Code' | 'Math' | 'Theory' | 'Security' | 'Hardware' | 'Linguistics';

export interface SubjectMastery {
  Logic: number;
  Code: number;
  Math: number;
  Theory: number;
  Security: number;
  Hardware: number;
  Linguistics: number;
}

export interface MissionLogItem {
  id: string;
  title: string;
  type: 'Quiz' | 'Exam' | 'Flashcards' | 'Written' | 'FillBlank';
  score: number;
  total: number;
  accuracy: number;
  timeSpentSeconds: number;
  xpGained: number;
  date: string;
  isExam?: boolean;
  isPerfect: boolean;
  isHighScore: boolean;
  isFastest: boolean;
}

export interface ProgressHistoryItem {
  date: string;
  xp: number;
  accuracy: number;
  studyMinutes: number;
}

interface StatsContextType {
  totalXP: number;
  level: number;
  rankTitle: string;
  overallAccuracy: number;
  studyVelocity: number; 
  subjects: SubjectMastery;
  progressHistory: ProgressHistoryItem[];
  missionLogs: MissionLogItem[];
  totalQuestionsAnswered: number;
  correctAnswersValue: number;
  quizCount: number;
  examCount: number;
  totalStudyMinutes: number;
  addResult: (params: {
    title: string;
    type: MissionLogItem['type'];
    score: number;
    total: number;
    timeSpentSeconds: number;
    subject?: SubjectCategory;
    isExam?: boolean;
  }) => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

const STATS_STORAGE_KEY = 'studibl_global_stats_v2';

const RANK_TITLES = [
  'Novice', 'Apprentice', 'Scholar', 'Adept', 'Master', 'Sentinel', 'Titan', 'Exarch'
];

const getRankFromXP = (xp: number) => {
  if (xp < 1000) return { level: 1, title: RANK_TITLES[0] };
  if (xp < 2500) return { level: 2, title: RANK_TITLES[1] };
  if (xp < 5000) return { level: 3, title: RANK_TITLES[2] };
  if (xp < 10000) return { level: 4, title: RANK_TITLES[3] };
  if (xp < 25000) return { level: 5, title: RANK_TITLES[4] };
  if (xp < 50000) return { level: 6, title: RANK_TITLES[5] };
  if (xp < 100000) return { level: 7, title: RANK_TITLES[6] };
  return { level: 8, title: RANK_TITLES[7] };
};

const DEFAULT_STATS = {
  totalXP: 15600,
  totalQuestionsAnswered: 520,
  correctAnswersValue: 460,
  quizCount: 18,
  examCount: 3,
  subjects: {
    Logic: 82,
    Code: 94,
    Math: 72,
    Theory: 88,
    Security: 68,
    Hardware: 54,
    Linguistics: 75,
  } as SubjectMastery,
  progressHistory: [
    { date: '2026-05-04', xp: 2000, accuracy: 82, studyMinutes: 45 },
    { date: '2026-05-05', xp: 2500, accuracy: 88, studyMinutes: 60 },
    { date: '2026-05-06', xp: 1200, accuracy: 85, studyMinutes: 30 },
    { date: '2026-05-07', xp: 3600, accuracy: 92, studyMinutes: 120 },
    { date: '2026-05-08', xp: 1400, accuracy: 78, studyMinutes: 40 },
    { date: '2026-05-09', xp: 4300, accuracy: 94, studyMinutes: 150 },
    { date: '2026-05-10', xp: 600, accuracy: 100, studyMinutes: 15 },
  ] as ProgressHistoryItem[],
  missionLogs: [
    {
      id: 'mock-1',
      title: 'Compiler Architecture Quiz',
      type: 'Quiz' as const,
      score: 9,
      total: 10,
      accuracy: 90,
      timeSpentSeconds: 420,
      xpGained: 900,
      date: '2026-05-10',
      isPerfect: false,
      isHighScore: true,
      isFastest: false
    },
    {
      id: 'mock-2',
      title: 'MECH 402 Final Logic Protocol',
      type: 'Exam' as const,
      score: 45,
      total: 50,
      accuracy: 90,
      timeSpentSeconds: 2700,
      xpGained: 5000,
      date: '2026-05-09',
      isPerfect: false,
      isHighScore: true,
      isFastest: true
    }
  ] as MissionLogItem[],
  totalStudyMinutes: 1540,
};

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_STATS;
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  useEffect(() => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const addResult = React.useCallback(({ title, type, score, total, timeSpentSeconds, subject, isExam }: {
    title: string;
    type: MissionLogItem['type'];
    score: number;
    total: number;
    timeSpentSeconds: number;
    subject?: SubjectCategory;
    isExam?: boolean;
  }) => {
    setStats((prev: any) => {
      const accuracy = (score / total) * 100;
      const gainedXP = (score * 100) + (isExam ? 500 : 0) + (accuracy === 100 ? 200 : 0);
      
      // Determine achievements
      const isPerfect = accuracy === 100;
      const isHighScore = prev.missionLogs.every((m: any) => m.title !== title || score >= m.score);
      const isFastest = prev.missionLogs.every((m: any) => m.title !== title || timeSpentSeconds <= m.timeSpentSeconds);

      const newMissionEntry: MissionLogItem = {
        id: `mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        type,
        score,
        total,
        accuracy,
        timeSpentSeconds,
        xpGained: gainedXP,
        date: new Date().toISOString().split('T')[0],
        isExam,
        isPerfect,
        isHighScore,
        isFastest
      };

      // Update subject mastery
      const newSubjects = { ...prev.subjects };
      if (subject && newSubjects[subject] !== undefined) {
        newSubjects[subject] = Math.round((newSubjects[subject] * 0.7) + (accuracy * 0.3));
      }

      // Update progress history
      const today = new Date().toISOString().split('T')[0];
      const newHistory = [...prev.progressHistory];
      const todayIndex = newHistory.findIndex(item => item.date === today);
      const studyMinutes = timeSpentSeconds / 60;
      
      if (todayIndex >= 0) {
        const existing = newHistory[todayIndex];
        newHistory[todayIndex] = {
          ...existing,
          xp: existing.xp + gainedXP,
          accuracy: (existing.accuracy + accuracy) / 2, // simplified running average for today
          studyMinutes: existing.studyMinutes + studyMinutes
        };
      } else {
        newHistory.push({ date: today, xp: gainedXP, accuracy, studyMinutes });
        if (newHistory.length > 30) newHistory.shift(); // Keep 30 days
      }

      return {
        ...prev,
        totalXP: prev.totalXP + gainedXP,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + total,
        correctAnswersValue: prev.correctAnswersValue + score,
        quizCount: type === 'Quiz' ? prev.quizCount + 1 : prev.quizCount,
        examCount: type === 'Exam' ? prev.examCount + 1 : prev.examCount,
        totalStudyMinutes: prev.totalStudyMinutes + studyMinutes,
        subjects: newSubjects,
        progressHistory: newHistory,
        missionLogs: [newMissionEntry, ...prev.missionLogs].slice(0, 50) // Keep last 50 missions
      };
    });
  }, []);

  const overallAccuracy = stats.totalQuestionsAnswered > 0 
    ? (stats.correctAnswersValue / stats.totalQuestionsAnswered) * 100 
    : 0;

  const studyVelocity = stats.totalStudyMinutes / (stats.progressHistory.length || 1) / 60;
  
  const rankInfo = getRankFromXP(stats.totalXP);

  return (
    <StatsContext.Provider value={{
      totalXP: stats.totalXP,
      level: rankInfo.level,
      rankTitle: rankInfo.title,
      overallAccuracy,
      studyVelocity,
      subjects: stats.subjects,
      progressHistory: stats.progressHistory,
      missionLogs: stats.missionLogs,
      totalQuestionsAnswered: stats.totalQuestionsAnswered,
      correctAnswersValue: stats.correctAnswersValue,
      quizCount: stats.quizCount,
      examCount: stats.examCount,
      totalStudyMinutes: stats.totalStudyMinutes,
      addResult,
    }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}
