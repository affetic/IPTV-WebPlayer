// Utilities for managing session storage in localStorage

export interface StoredSession {
  sessionId: string;
  userInfo: any;
  serverInfo: any;
  timestamp: number;
  expiresAt: number; // timestamp when session expires (7 days from login)
}

const STORAGE_KEY = 'iptv_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const sessionStorage = {
  // Store session data in localStorage
  saveSession(sessionId: string, userInfo: any, serverInfo: any): void {
    const now = Date.now();
    const sessionData: StoredSession = {
      sessionId,
      userInfo,
      serverInfo,
      timestamp: now,
      expiresAt: now + SESSION_DURATION,
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Failed to save session to localStorage:', error);
    }
  },

  // Retrieve session data from localStorage
  getSession(): StoredSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const sessionData: StoredSession = JSON.parse(stored);
      
      // Check if session has expired
      if (Date.now() > sessionData.expiresAt) {
        this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.warn('Failed to retrieve session from localStorage:', error);
      this.clearSession();
      return null;
    }
  },

  // Check if a valid session exists
  hasValidSession(): boolean {
    return this.getSession() !== null;
  },

  // Clear stored session data
  clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear session from localStorage:', error);
    }
  },

  // Update session expiration (extend by 7 days)
  refreshSession(): void {
    const session = this.getSession();
    if (session) {
      session.expiresAt = Date.now() + SESSION_DURATION;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch (error) {
        console.warn('Failed to refresh session in localStorage:', error);
      }
    }
  }
};