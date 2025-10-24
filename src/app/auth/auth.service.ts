import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { TokenService } from '../core/services/token.service';
import { Role } from '../users/users.service';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  role: Role;
  isActive: boolean;
  createdDate?: Date;
  lastLogin?: Date;
  village?: {
    id?: string;
    name?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService, private tokenService: TokenService) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.api.post('auth/login', credentials).pipe(
      tap((res:any) => {
        localStorage.setItem('access_token', res.token);
        localStorage.setItem('refresh_token', res.refreshToken);
      })
    );
  }

  logout(): void {
    this.tokenService.logout();
  }

  // Verify user credentials for password reset
  verifyUser(username: string, oldPassword: string): Observable<User | null> {
    return this.api.post('auth/verifyuser', { username, oldPassword });
  }
}
