import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { TokenService } from '../core/services/token.service';

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
}
