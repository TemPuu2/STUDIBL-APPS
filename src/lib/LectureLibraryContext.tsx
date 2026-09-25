import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { LectureContent, MOCK_LECTURES } from '../constants';
import { SavedAIContent } from '../types';
import { useChat } from './ChatContext';
import { generateAIBookmarkTitle } from './utils';

export interface UnifiedLecture extends LectureContent {
  isFromAI?: boolean;
  aiData?: SavedAIContent;
}

interface ActivityEntry {
  courseName: string;
  lastActive: number;
}

interface LectureLibraryContextType {
  userLectures: LectureContent[];
  unifiedLectures: UnifiedLecture[];
  addLecture: (lecture: LectureContent) => void;
  updateLecture: (id: string, updates: Partial<LectureContent>) => void;
  removeLecture: (id: string, permanent?: boolean) => void;
  restoreLecture: (id: string) => void;
  removedFromLibrary: string[];
  recentCourses: ActivityEntry[];
  trackActivity: (courseName: string) => void;
}

const LectureLibraryContext = createContext<LectureLibraryContextType | undefined>(undefined);

const USER_LECTURES_KEY = 'studibl_user_lectures';
const LECTURE_OVERRIDES_KEY = 'studibl_lecture_overrides';
const REMOVED_LECTURES_KEY = 'studibl_removed_lectures';
const RECENT_COURSES_KEY = 'studibl_recent_courses';

export function LectureLibraryProvider({ children }: { children: ReactNode }) {
  const { savedItems } = useChat();
  
  const [userLectures, setUserLectures] = useState<LectureContent[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(USER_LECTURES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading user lectures:", e);
        return [];
      }
    }
    return [];
  });

  const [lectureOverrides, setLectureOverrides] = useState<Record<string, Partial<LectureContent>>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(LECTURE_OVERRIDES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading lecture overrides:", e);
        return {};
      }
    }
    return {};
  });

  const [removedFromLibrary, setRemovedFromLibrary] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(REMOVED_LECTURES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading removed IDs:", e);
        return [];
      }
    }
    return [];
  });

  const [recentCourses, setRecentCourses] = useState<ActivityEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(RECENT_COURSES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading recent courses:", e);
        return [];
      }
    }
    return [];
  });

  // Save to persistence
  useEffect(() => {
    localStorage.setItem(USER_LECTURES_KEY, JSON.stringify(userLectures));
  }, [userLectures]);

  useEffect(() => {
    localStorage.setItem(LECTURE_OVERRIDES_KEY, JSON.stringify(lectureOverrides));
  }, [lectureOverrides]);

  useEffect(() => {
    localStorage.setItem(REMOVED_LECTURES_KEY, JSON.stringify(removedFromLibrary));
  }, [removedFromLibrary]);

  useEffect(() => {
    localStorage.setItem(RECENT_COURSES_KEY, JSON.stringify(recentCourses));
  }, [recentCourses]);

  const trackActivity = React.useCallback((courseName: string) => {
    if (!courseName) return;
    setRecentCourses(prev => {
      const filtered = prev.filter(c => c.courseName !== courseName);
      return [{ courseName, lastActive: Date.now() }, ...filtered].slice(0, 10);
    });
  }, []);

  const addLecture = React.useCallback((lecture: LectureContent) => {
    setUserLectures(prev => {
      // Prevent duplicates in user uploads by ID
      if (prev.some(l => l.id === lecture.id)) return prev;
      return [lecture, ...prev];
    });
  }, []);

  const updateLecture = React.useCallback((id: string, updates: Partial<LectureContent>) => {
    setLectureOverrides(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...updates }
    }));
  }, []);

  const removeLecture = React.useCallback((id: string, permanent: boolean = false) => {
    if (permanent) {
      setUserLectures(prev => prev.filter(l => l.id !== id));
      setRemovedFromLibrary(prev => prev.filter(rid => rid !== id));
      setLectureOverrides(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setRemovedFromLibrary(prev => [...new Set([...prev, id])]);
    }
  }, []);

  const restoreLecture = React.useCallback((id: string) => {
    setRemovedFromLibrary(prev => prev.filter(rid => rid !== id));
  }, []);

  const unifiedLectures = useMemo(() => {
    // 1. Build the core set from Mock + User Uploads
    // Use a Map for O(n) deduplication by ID
    const lectureMap = new Map<string, UnifiedLecture>();
    
    // Add MOCK items first
    MOCK_LECTURES.forEach(l => lectureMap.set(l.id, { ...l, ...lectureOverrides[l.id] }));
    
    // Add/Overwrite with User items (user items with same ID take precedence if any)
    userLectures.forEach(l => lectureMap.set(l.id, { ...l, ...lectureOverrides[l.id] }));

    // 2. Add AI Saved Items
    savedItems.forEach(item => {
      // AI items have their own ID, map them to UnifiedLecture
      const baseAI: UnifiedLecture = {
        id: item.id,
        type: 'explanation' as const,
        title: generateAIBookmarkTitle(item),
        course: 'AI',
        date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        size: 'AI Logic',
        isMine: true,
        isFromAI: true,
        aiData: item
      };
      
      lectureMap.set(item.id, { ...baseAI, ...lectureOverrides[item.id] });
    });

    // 3. Return as array
    return Array.from(lectureMap.values());
  }, [userLectures, savedItems, lectureOverrides]);

  return (
    <LectureLibraryContext.Provider value={{
      userLectures,
      unifiedLectures,
      addLecture,
      updateLecture,
      removeLecture,
      restoreLecture,
      removedFromLibrary,
      recentCourses,
      trackActivity
    }}>
      {children}
    </LectureLibraryContext.Provider>
  );
}

export function useLectureLibrary() {
  const context = useContext(LectureLibraryContext);
  if (context === undefined) {
    throw new Error('useLectureLibrary must be used within a LectureLibraryProvider');
  }
  return context;
}
