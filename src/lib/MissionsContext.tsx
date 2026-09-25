import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Mission } from '../types';

interface MissionsContextType {
  missions: Mission[];
  currentMission: Mission | null;
  addMission: (mission: Omit<Mission, 'id' | 'updatedAt'>) => void;
  updateMissionStatus: (id: string, status: 'completed' | 'current' | 'pending') => void;
  removeMission: (id: string) => void;
  trackActivity: (activity: { id?: string; title: string; type: Mission['type']; duration?: string; topic?: string; courseId?: string; metadata?: Mission['metadata'] }) => void;
  updateMissionMetadata: (id: string, metadata: Partial<NonNullable<Mission['metadata']>>) => void;
}

const MissionsContext = createContext<MissionsContextType | undefined>(undefined);

const STORAGE_KEY = 'studibl_user_missions';

export function MissionsProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading missions:", e);
        return [];
      }
    }
    // Default initial missions if none exist
    return [
      { id: '1', title: 'Read: Complexity Analysis', duration: '15m', status: 'completed', type: 'lecture', updatedAt: Date.now() - 1000 * 60 * 60 * 24 },
      { id: '2', title: 'AI Breakdown of Big O', duration: '10m', status: 'pending', type: 'ai-breakdown', updatedAt: Date.now() - 1000 * 60 * 60 },
      { id: '3', title: 'Scenario-based Quiz', duration: '5m', status: 'pending', type: 'quiz', updatedAt: Date.now() - 1000 * 60 * 30 },
      { id: '4', title: 'Review Weak Areas', duration: '10m', status: 'pending', type: 'review', updatedAt: Date.now() - 1000 * 60 * 10 },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
  }, [missions]);

  const addMission = React.useCallback((missionInput: Omit<Mission, 'id' | 'updatedAt'>) => {
    const newMission: Mission = {
      ...missionInput,
      id: Math.random().toString(36).substr(2, 9),
      updatedAt: Date.now()
    };
    setMissions(prev => [newMission, ...prev]);
  }, []);

  const updateMissionStatus = React.useCallback((id: string, status: 'completed' | 'current' | 'pending') => {
    setMissions(prev => prev.map(m => 
      m.id === id ? { ...m, status, updatedAt: Date.now() } : m
    ));
  }, []);

  const removeMission = React.useCallback((id: string) => {
    setMissions(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateMissionMetadata = React.useCallback((id: string, metadata: Partial<NonNullable<Mission['metadata']>>) => {
    setMissions(prev => prev.map(m => 
      m.id === id ? { ...m, metadata: { ...m.metadata, ...metadata }, updatedAt: Date.now() } : m
    ));
  }, []);

  const trackActivity = React.useCallback((activity: { id?: string; title: string; type: Mission['type']; duration?: string; topic?: string; courseId?: string; metadata?: Mission['metadata'] }) => {
    setMissions(prev => {
      // Match by title and type, or by lectureId if available in metadata
      const existingIdx = prev.findIndex(m => {
        if (activity.metadata?.lectureId && m.metadata?.lectureId === activity.metadata.lectureId) return true;
        if (activity.metadata?.quizId && m.metadata?.quizId === activity.metadata.quizId) return true;
        return m.title === activity.title && m.type === activity.type;
      });
      
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          updatedAt: Date.now(),
          status: updated[existingIdx].status === 'completed' ? 'pending' : updated[existingIdx].status,
          metadata: { ...updated[existingIdx].metadata, ...activity.metadata }
        };
        // Move to front
        const item = updated.splice(existingIdx, 1)[0];
        return [item, ...updated];
      }

      const newMission: Mission = {
        id: Math.random().toString(36).substr(2, 9),
        title: activity.title,
        status: 'pending',
        type: activity.type,
        duration: activity.duration || '5m',
        topic: activity.topic,
        courseId: activity.courseId,
        updatedAt: Date.now(),
        metadata: activity.metadata
      };
      return [newMission, ...prev];
    });
  }, []);

  // Derived current mission: Most recent unfinished educational activity
  const currentMission = useMemo(() => {
    // Sort unfinished missions by updatedAt desc
    const unfinished = missions
      .filter(m => m.status !== 'completed')
      .sort((a, b) => b.updatedAt - a.updatedAt);
    
    return unfinished.length > 0 ? unfinished[0] : null;
  }, [missions]);

  return (
    <MissionsContext.Provider value={{ 
      missions, 
      currentMission, 
      addMission, 
      updateMissionStatus, 
      removeMission, 
      trackActivity,
      updateMissionMetadata
    }}>
      {children}
    </MissionsContext.Provider>
  );
}

export function useMissions() {
  const context = useContext(MissionsContext);
  if (context === undefined) {
    throw new Error('useMissions must be used within a MissionsProvider');
  }
  return context;
}
