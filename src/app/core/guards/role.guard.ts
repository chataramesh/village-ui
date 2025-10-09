import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] || [route.data['role']];
    const userRole = this.tokenService.getUserRole();
    
    // Check if user role matches any of the expected roles
    if (expectedRoles.includes(userRole)) {
      return true;
    }
    
    this.router.navigate(['/dashboard']);
    return false;
  }
}
