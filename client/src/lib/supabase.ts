// Note: We're using direct Drizzle connection instead of Supabase client
// as per the blueprint guidelines

export const API_BASE_URL = '/api';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
  city?: string;
  state?: string;
}

export interface Session {
  user: User;
  sessionId: string;
}

export class AuthService {
  private static instance: AuthService;
  private session: Session | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getSession(): Session | null {
    return this.session;
  }

  async login(email: string, password: string): Promise<Session> {
    console.log('Attempting login for:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Login error response:', errorData);
      throw new AuthError(errorData.error || 'Login failed');
    }

    const data = await response.json();
    console.log('Login successful, session created');
    this.session = data;
    localStorage.setItem('sessionId', data.sessionId);
    return data;
  }

  async logout(): Promise<void> {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionId}` },
      });
    }
    
    this.session = null;
    localStorage.removeItem('sessionId');
  }

  async getCurrentUser(): Promise<User | null> {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${sessionId}` },
      });

      if (!response.ok) {
        localStorage.removeItem('sessionId');
        return null;
      }

      const data = await response.json();
      this.session = { user: data.user, sessionId };
      return data.user;
    } catch {
      localStorage.removeItem('sessionId');
      return null;
    }
  }

  getAuthHeaders(): HeadersInit {
    const sessionId = localStorage.getItem('sessionId');
    return sessionId ? { 'Authorization': `Bearer ${sessionId}` } : {};
  }
}

export const authService = AuthService.getInstance();
