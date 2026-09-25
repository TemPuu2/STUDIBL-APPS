import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StreakContextType {
  streak: number;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const STREAK_KEY = 'studibl_login_streak';
const LAST_LOGIN_KEY = 'studibl_last_login_date';

export function StreakProvider({ children }: { children: ReactNode }) {
  const [streak, setStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem(STREAK_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    const updateStreak = () => {
      const now = new Date();
      // Use local date string YYYY-MM-DD to handle calendar day boundaries in user's timezone
      const today = now.toLocaleDateString('en-CA'); // en-CA format is YYYY-MM-DD
      
      const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
      const savedStreak = localStorage.getItem(STREAK_KEY);
      let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;

      if (!lastLogin) {
        // First time initialization
        currentStreak = 1;
      } else {
        if (lastLogin === today) {
          // Already logged in today, do nothing (idempotent)
          return;
        }

        const lastDate = new Date(lastLogin);
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');

        if (lastLogin === yesterdayStr) {
          // Consecutive day login
          currentStreak += 1;
        } else {
          // Missed at least one full day, reset to 1 (starting today's streak)
          currentStreak = 1;
        }
      }

      setStreak(currentStreak);
      localStorage.setItem(STREAK_KEY, currentStreak.toString());
      localStorage.setItem(LAST_LOGIN_KEY, today);
    };

    updateStreak();
    
    // Also handle case where app stays open across midnight
    // We could poll or listen for visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateStreak();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <StreakContext.Provider value={{ streak }}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
}
