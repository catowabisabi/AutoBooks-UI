'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Chat History Persistence Hook
 * 對話歷史持久化 - 使用 localStorage 保存對話
 */

type WidgetType = 'text' | 'bar' | 'area' | 'pie' | 'line' | 'scatter' | 'table';
type MessageRole = 'user' | 'assistant';

export interface PersistedMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  chart?: {
    type: WidgetType;
    title: string;
    description: string;
    data?: any[];
    xKey?: string;
    yKey?: string;
    labelKey?: string;
    valueKey?: string;
  };
}

export interface ChatSession {
  id: string;
  name: string;
  messages: PersistedMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'analyst-chat-history';
const MAX_SESSIONS = 20; // Maximum number of sessions to keep
const MAX_MESSAGES_PER_SESSION = 100; // Maximum messages per session

/**
 * Load chat sessions from localStorage
 */
export function loadChatSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const sessions = JSON.parse(stored) as ChatSession[];
    // Sort by updatedAt descending
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('[ChatHistory] Failed to load sessions:', error);
    return [];
  }
}

/**
 * Save chat sessions to localStorage
 */
export function saveChatSessions(sessions: ChatSession[]): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Limit number of sessions
    const limitedSessions = sessions
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_SESSIONS);
    
    // Limit messages per session
    const trimmedSessions = limitedSessions.map(session => ({
      ...session,
      messages: session.messages.slice(-MAX_MESSAGES_PER_SESSION)
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedSessions));
    return true;
  } catch (error) {
    console.error('[ChatHistory] Failed to save sessions:', error);
    // If quota exceeded, try to clear old sessions
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        const oldSessions = sessions.slice(0, Math.floor(sessions.length / 2));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(oldSessions));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

/**
 * Get or create current session
 */
export function getCurrentSession(): ChatSession {
  const sessions = loadChatSessions();
  
  // Check if there's a recent session (within 30 minutes)
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  const recentSession = sessions.find(s => s.updatedAt > thirtyMinutesAgo);
  
  if (recentSession) {
    return recentSession;
  }
  
  // Create new session
  const newSession: ChatSession = {
    id: `session-${Date.now()}`,
    name: `對話 ${new Date().toLocaleString('zh-TW')}`,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  return newSession;
}

/**
 * Save message to current session
 */
export function saveMessageToSession(
  message: PersistedMessage,
  sessionId?: string
): ChatSession {
  const sessions = loadChatSessions();
  let session: ChatSession;
  
  if (sessionId) {
    session = sessions.find(s => s.id === sessionId) || getCurrentSession();
  } else {
    session = getCurrentSession();
  }
  
  // Add message
  session.messages.push(message);
  session.updatedAt = Date.now();
  
  // Update or add session
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }
  
  saveChatSessions(sessions);
  return session;
}

/**
 * Delete a session
 */
export function deleteSession(sessionId: string): boolean {
  const sessions = loadChatSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  return saveChatSessions(filtered);
}

/**
 * Clear all sessions
 */
export function clearAllSessions(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('[ChatHistory] Failed to clear sessions:', error);
    return false;
  }
}

/**
 * React hook for chat history persistence
 */
export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load sessions on mount
  useEffect(() => {
    const loaded = loadChatSessions();
    setSessions(loaded);
    
    // Set current session
    const current = getCurrentSession();
    setCurrentSessionId(current.id);
    
    // If it's a new session, add it to the list
    if (!loaded.find(s => s.id === current.id)) {
      setSessions(prev => [current, ...prev]);
    }
    
    setIsLoaded(true);
  }, []);
  
  // Get current session messages
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];
  
  // Add message to current session
  const addMessage = useCallback((message: Omit<PersistedMessage, 'timestamp'>) => {
    const fullMessage: PersistedMessage = {
      ...message,
      timestamp: Date.now()
    };
    
    setSessions(prev => {
      const updated = [...prev];
      const sessionIndex = updated.findIndex(s => s.id === currentSessionId);
      
      if (sessionIndex >= 0) {
        updated[sessionIndex] = {
          ...updated[sessionIndex],
          messages: [...updated[sessionIndex].messages, fullMessage],
          updatedAt: Date.now()
        };
      } else {
        // Create new session
        const newSession: ChatSession = {
          id: currentSessionId || `session-${Date.now()}`,
          name: `對話 ${new Date().toLocaleString('zh-TW')}`,
          messages: [fullMessage],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        updated.unshift(newSession);
        setCurrentSessionId(newSession.id);
      }
      
      // Save to localStorage
      saveChatSessions(updated);
      return updated;
    });
    
    return fullMessage;
  }, [currentSessionId]);
  
  // Start a new session
  const startNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      name: `對話 ${new Date().toLocaleString('zh-TW')}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setSessions(prev => {
      const updated = [newSession, ...prev];
      saveChatSessions(updated);
      return updated;
    });
    
    setCurrentSessionId(newSession.id);
    return newSession;
  }, []);
  
  // Switch to a different session
  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);
  
  // Delete current session
  const deleteCurrentSession = useCallback(() => {
    if (!currentSessionId) return;
    
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== currentSessionId);
      saveChatSessions(filtered);
      
      // Switch to the next session or create new one
      if (filtered.length > 0) {
        setCurrentSessionId(filtered[0].id);
      } else {
        const newSession: ChatSession = {
          id: `session-${Date.now()}`,
          name: `對話 ${new Date().toLocaleString('zh-TW')}`,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setCurrentSessionId(newSession.id);
        return [newSession];
      }
      
      return filtered;
    });
  }, [currentSessionId]);
  
  // Clear all history
  const clearHistory = useCallback(() => {
    clearAllSessions();
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      name: `對話 ${new Date().toLocaleString('zh-TW')}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSessions([newSession]);
    setCurrentSessionId(newSession.id);
  }, []);
  
  return {
    sessions,
    currentSessionId,
    currentSession,
    messages,
    isLoaded,
    addMessage,
    startNewSession,
    switchSession,
    deleteCurrentSession,
    clearHistory
  };
}

/**
 * Format timestamp for display
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  
  // Less than 1 minute
  if (diff < 60000) {
    return '剛剛';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} 分鐘前`;
  }
  
  // Same day
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
  }
  
  // Different year
  return date.toLocaleDateString('zh-TW');
}
