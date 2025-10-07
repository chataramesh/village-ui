import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

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
  
  

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}
