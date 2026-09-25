import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, ChatSession, AttachedFile, SavedAIContent } from '../types';

interface ChatContextType {
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeSession: ChatSession | null;
  setActiveSessionId: (id: string | null) => void;
  updateSession: (id: string, updates: Partial<ChatSession> | ((prev: ChatSession) => Partial<ChatSession>)) => void;
  createNewSession: () => string;
  deleteSession: (id: string) => void;
  deleteMultipleSessions: (ids: string[]) => void;
  savedItems: SavedAIContent[];
  saveItem: (item: SavedAIContent) => void;
  removeItem: (messageId: string) => void;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'studibl_ai_history';
const ACTIVE_SESSION_STORAGE_KEY = 'studibl_current_session_id';
const SAVED_ITEMS_KEY = 'studibl_saved_ai';

const WELCOME_MESSAGE: Message = {
  id: 'welcome-message',
  role: 'assistant',
  content: "Hello! I'm your Studibl AI Tutor. Upload your lecture notes or ask me anything about your current courses. How can I help you excel today?\n\nIf you want, I can start by analyzing your latest lecture slides to identify the highest-probability exam topics for you."
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<SavedAIContent[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    const savedActiveId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    const savedAiItems = localStorage.getItem(SAVED_ITEMS_KEY);

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
      } catch (e) {
        console.error('Failed to load sessions', e);
      }
    }

    if (savedActiveId) {
      setActiveSessionId(savedActiveId);
    }

    if (savedAiItems) {
      try {
        setSavedItems(JSON.parse(savedAiItems));
      } catch (e) {
        console.error('Failed to load saved AI items', e);
      }
    }

    setIsInitializing(false);
  }, []);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, isInitializing]);

  // Save savedItems to localStorage
  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(savedItems));
    }
  }, [savedItems, isInitializing]);

  // Save active session ID
  useEffect(() => {
    if (!isInitializing && activeSessionId) {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, activeSessionId);
    }
  }, [activeSessionId, isInitializing]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const createNewSession = React.useCallback(() => {
    const newId = generateId();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Session',
      date: new Date().toISOString(),
      messages: [WELCOME_MESSAGE],
      attachedFiles: [],
      lastUpdate: Date.now(),
      draftInput: '',
      scrollPosition: 0
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    return newId;
  }, []);

  const updateSession = React.useCallback((id: string, updates: Partial<ChatSession> | ((prev: ChatSession) => Partial<ChatSession>)) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const actualUpdates = typeof updates === 'function' ? updates(s) : updates;
        
        // If updating messages, also update title if it was default
        let newTitle = s.title;
        if (actualUpdates.messages && actualUpdates.messages.length > 1 && (s.title === 'New Session' || s.title.includes('...'))) {
          const firstUserMsg = actualUpdates.messages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
          }
        }

        return { 
          ...s, 
          ...actualUpdates, 
          title: actualUpdates.title || newTitle,
          lastUpdate: Date.now() 
        };
      }
      return s;
    }));
  }, []);

  const deleteSession = React.useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setActiveSessionId(current => current === id ? null : current);
  }, []);

  const deleteMultipleSessions = React.useCallback((ids: string[]) => {
    setSessions(prev => prev.filter(s => !ids.includes(s.id)));
    setActiveSessionId(current => (current && ids.includes(current)) ? null : current);
  }, []);

  const saveItem = React.useCallback((item: SavedAIContent) => {
    setSavedItems(prev => {
      // Prevent duplicates
      if (prev.some(i => i.messageId === item.messageId)) return prev;
      return [item, ...prev];
    });
  }, []);

  const removeItem = React.useCallback((messageId: string) => {
    setSavedItems(prev => prev.filter(i => i.messageId !== messageId));
  }, []);

  return (
    <ChatContext.Provider value={{
      sessions,
      activeSessionId,
      activeSession,
      setActiveSessionId,
      updateSession,
      createNewSession,
      deleteSession,
      deleteMultipleSessions,
      savedItems,
      saveItem,
      removeItem,
      isLoading: isInitializing
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
