import { AuthStorage, AuthTokens, User } from './types';

/**
 * Local Storage Implementation for Authentication
 * 
 * Implements Single Responsibility Principle by focusing solely on storage operations.
 * Implements Dependency Inversion Principle by implementing the AuthStorage interface.
 */
export class LocalAuthStorage implements AuthStorage {
  private readonly TOKENS_KEY = 'auth_tokens';
  private readonly USER_KEY = 'auth_user';

  getTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem(this.TOKENS_KEY);
      if (!tokens) return null;
      
      const parsed = JSON.parse(tokens) as AuthTokens;
      
      // Check if tokens are expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.removeTokens();
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Error getting tokens from storage:', error);
      this.removeTokens();
      return null;
    }
  }

  setTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error setting tokens in storage:', error);
    }
  }

  removeTokens(): void {
    try {
      localStorage.removeItem(this.TOKENS_KEY);
    } catch (error) {
      console.error('Error removing tokens from storage:', error);
    }
  }

  getUser(): User | null {
    try {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      this.removeUser();
      return null;
    }
  }

  setUser(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user in storage:', error);
    }
  }

  removeUser(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error removing user from storage:', error);
    }
  }

  clear(): void {
    this.removeTokens();
    this.removeUser();
  }
}

/**
 * Session Storage Implementation for Authentication
 * 
 * Alternative implementation for session-based storage.
 * Demonstrates Open/Closed Principle - we can extend functionality
 * without modifying existing code.
 */
export class SessionAuthStorage implements AuthStorage {
  private readonly TOKENS_KEY = 'auth_tokens';
  private readonly USER_KEY = 'auth_user';

  getTokens(): AuthTokens | null {
    try {
      const tokens = sessionStorage.getItem(this.TOKENS_KEY);
      if (!tokens) return null;
      
      const parsed = JSON.parse(tokens) as AuthTokens;
      
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.removeTokens();
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Error getting tokens from session storage:', error);
      this.removeTokens();
      return null;
    }
  }

  setTokens(tokens: AuthTokens): void {
    try {
      sessionStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error setting tokens in session storage:', error);
    }
  }

  removeTokens(): void {
    try {
      sessionStorage.removeItem(this.TOKENS_KEY);
    } catch (error) {
      console.error('Error removing tokens from session storage:', error);
    }
  }

  getUser(): User | null {
    try {
      const user = sessionStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user from session storage:', error);
      this.removeUser();
      return null;
    }
  }

  setUser(user: User): void {
    try {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user in session storage:', error);
    }
  }

  removeUser(): void {
    try {
      sessionStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error removing user from session storage:', error);
    }
  }
}

/**
 * Factory for creating storage instances
 * 
 * Implements Factory Pattern for creating appropriate storage instances.
 */
export class AuthStorageFactory {
  static create(type: 'local' | 'session' = 'local'): AuthStorage {
    switch (type) {
      case 'session':
        return new SessionAuthStorage();
      case 'local':
      default:
        return new LocalAuthStorage();
    }
  }
}
