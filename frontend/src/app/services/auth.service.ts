import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface UserSession {
  usuario?: string;
  email?: string;
  nome: string;
  cargo: string;
  perfil: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_AUTH_KEY = 'WALDO_API_AUTH';
  private readonly USER_SESSION_KEY = 'WALDO_USER_SESSION';
  private readonly DEMO_KEY = 'WALDO_PRESENTATION_DEMO';

  get isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return !!sessionStorage.getItem(this.API_AUTH_KEY) || sessionStorage.getItem(this.DEMO_KEY) === '1';
  }

  isDemoMode(): boolean {
    if (!this.isBrowser) return false;
    return sessionStorage.getItem(this.DEMO_KEY) === '1';
  }

  getAuthHeader(): string | null {
    if (!this.isBrowser) return null;
    return sessionStorage.getItem(this.API_AUTH_KEY);
  }

  getUser(): UserSession | null {
    if (!this.isBrowser) return null;
    const raw = sessionStorage.getItem(this.USER_SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async login(email: string, password: string): Promise<UserSession> {
    const credentials = btoa(`${email}:${password}`);
    const headers = new HttpHeaders({
      Authorization: `Basic ${credentials}`
    });

    try {
      const user = await firstValueFrom(
        this.http.get<any>('/api/auth/me', { headers })
      );

      const session: UserSession = {
        usuario: user.email || email,
        email: user.email || email,
        nome: user.nome || 'Usuário',
        cargo: user.cargo || 'Equipe Contábil',
        perfil: user.perfil || 'Colaborador'
      };

      if (this.isBrowser) {
        sessionStorage.setItem(this.API_AUTH_KEY, credentials);
        sessionStorage.setItem(this.USER_SESSION_KEY, JSON.stringify(session));
        sessionStorage.removeItem(this.DEMO_KEY);
      }

      return session;
    } catch (error) {
      throw error;
    }
  }

  loginDemo(): UserSession {
    const session: UserSession = {
      usuario: 'waldo@waldocontabilidade.com.br',
      email: 'waldo@waldocontabilidade.com.br',
      nome: 'Waldo Ferreira',
      cargo: 'Modo de apresentação',
      perfil: 'DEMONSTRAÇÃO'
    };

    if (this.isBrowser) {
      sessionStorage.setItem(this.DEMO_KEY, '1');
      sessionStorage.setItem(this.USER_SESSION_KEY, JSON.stringify(session));
      sessionStorage.removeItem(this.API_AUTH_KEY);
    }

    return session;
  }

  logout() {
    if (this.isBrowser) {
      sessionStorage.removeItem(this.API_AUTH_KEY);
      sessionStorage.removeItem(this.USER_SESSION_KEY);
      sessionStorage.removeItem(this.DEMO_KEY);
    }
    this.router.navigate(['/login']);
  }
}
