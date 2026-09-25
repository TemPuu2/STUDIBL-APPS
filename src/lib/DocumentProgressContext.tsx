import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type ProgressUnit = {
  id: string; // Document ID
  percentage: number;
  lastUnitId: string;
  consumedUnitIds: string[]; // Serialized Set
  maxTotalUnits: number;
};

interface DocumentProgressContextType {
  getProgress: (docId: string) => number;
  getLastPosition: (docId: string) => string;
  updateProgress: (docId: string, unitId: string, totalUnits: number) => void;
  resetProgress: (docId: string) => void;
}

const DocumentProgressContext = createContext<DocumentProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'studibl_doc_progress';

export function DocumentProgressProvider({ children }: { children: React.ReactNode }) {
  const [progressMap, setProgressMap] = useState<Record<string, ProgressUnit>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
  }, [progressMap]);

  const getProgress = useCallback((docId: string) => {
    return progressMap[docId]?.percentage || 0;
  }, [progressMap]);

  const getLastPosition = useCallback((docId: string) => {
    return progressMap[docId]?.lastUnitId || '';
  }, [progressMap]);

  const updateProgress = useCallback((docId: string, unitId: string, totalUnits: number) => {
    if (totalUnits <= 0) return;

    setProgressMap(prev => {
      const existing = prev[docId] || {
        id: docId,
        percentage: 0,
        lastUnitId: '',
        consumedUnitIds: [],
        maxTotalUnits: 0
      };

      const consumedSet = new Set(existing.consumedUnitIds);
      consumedSet.add(unitId);

      const effectiveTotalUnits = Math.max(existing.maxTotalUnits, totalUnits);

      // Percentage is calculated based on cumulative consumed units across all categories
      const newPercentage = Math.round((consumedSet.size / effectiveTotalUnits) * 100);
      
      // Never decrease progress unless explicitly reset
      const finalPercentage = Math.min(100, Math.max(existing.percentage, newPercentage));

      // Only update if something actually changed
      if (
        existing.percentage === finalPercentage && 
        existing.lastUnitId === unitId &&
        existing.consumedUnitIds.length === consumedSet.size &&
        existing.maxTotalUnits === effectiveTotalUnits
      ) {
        return prev;
      }

      return {
        ...prev,
        [docId]: {
          id: docId,
          percentage: finalPercentage,
          lastUnitId: unitId,
          consumedUnitIds: Array.from(consumedSet),
          maxTotalUnits: effectiveTotalUnits
        }
      };
    });
  }, []);

  const resetProgress = useCallback((docId: string) => {
    setProgressMap(prev => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  }, []);

  return (
    <DocumentProgressContext.Provider value={{ getProgress, getLastPosition, updateProgress, resetProgress }}>
      {children}
    </DocumentProgressContext.Provider>
  );
}

export function useDocumentProgress() {
  const context = useContext(DocumentProgressContext);
  if (context === undefined) {
    throw new Error('useDocumentProgress must be used within a DocumentProgressProvider');
  }
  return context;
}
