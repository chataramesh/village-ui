import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface UserFromToken {
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
  village?: {
    id?: string;
    name?: string;
  };
  exp?: number;
  iat?: number;
}

@Injectable({ providedIn: 'root' })
export class TokenService {


  constructor(private router: Router) {}

  getToken(): string | null {
    const token = localStorage.getItem('access_token');
    return token;
  }



  getUserRole(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = jwtDecode<{ role: string }>(token);
      return payload.role || '';
    } catch {
      return '';
    }
  }

  // Get full user object from JWT token
  getCurrentUser(): UserFromToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = jwtDecode<UserFromToken>(token);
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserVillageId(): string | null {
    const user = this.getCurrentUser();
    return user?.village?.id || null;
  }

  getUserVillageName(): string | null {
    const user = this.getCurrentUser();
    return user?.village?.name || null;
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {

    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}
