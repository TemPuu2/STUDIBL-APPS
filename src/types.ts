export enum UserIntentMode {
  SOCIAL = 'Social',
  DIRECTIONAL = 'Directional',
  DEEP = 'Deep',
  CONFUSED = 'Confused',
  SHORTCUT = 'Shortcut-seeking'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachedFiles?: AttachedFile[];
  explanation?: {
    explanation: string;
    intent?: UserIntentMode;
    suggestedFollowUp?: string;
  };
  quiz?: QuizQuestion[];
  analysis?: {
    summary: string;
    studyPlan: string;
  };
  feedback?: {
    rating: number;
    comment?: string;
  };
}

export interface AttachedFile {
  id: string;
  name: string;
  file?: File;
  content?: string;
  isPinned?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
  attachedFiles?: AttachedFile[];
  lastUpdate: number;
  draftInput?: string;
  scrollPosition?: number;
}

export interface Mission {
  id: string;
  title: string;
  duration: string;
  status: 'completed' | 'current' | 'pending';
  type?: 'lecture' | 'quiz' | 'exam' | 'review' | 'ai-breakdown' | 'video' | 'voice' | 'reading';
  courseId?: string;
  topic?: string;
  updatedAt: number;
    metadata?: {
      lectureId?: string;
      quizId?: string;
      sessionId?: string;
      lastPosition?: number;
      lastQuestionIndex?: number;
      activeTab?: string;
      pdfPage?: number;
      writtenAnswers?: Record<string, string>;
      quizAnswers?: Record<string, number>;
      fillBlankAnswers?: Record<string, string[]>;
      [key: string]: any;
    };
}

export interface StudyPlan {
  id: string;
  title: string;
  missions: Mission[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'alert' | 'info';
  read: boolean;
}

export interface StudyGoal {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
  completed: boolean;
}

export interface SavedAIContent {
  id: string;
  messageId: string;
  title: string;
  content: string;
  type: 'explanation' | 'analysis' | 'quiz' | 'general';
  timestamp: string;
  sessionTitle?: string;
  metadata?: any;
}
