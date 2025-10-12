import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  VILLAGE_ADMIN = 'VILLAGE_ADMIN',
  VILLAGER = 'VILLAGER'
}

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

export interface UserStats {
  totalUsers: number;
  inactiveUsers: number;
  villagers: number;
  villageAdmins: number;
}
export interface UserCountResponse {
  totalVillageAdmins: number;
  activeVillageAdmins: number;
  inactiveVillageAdmins: number;

  totalVillagers: number;
  activeVillagers: number;
  inactiveVillagers: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  // Get user by ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Create new user
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/create`, user);
  }

  // Update existing user
  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // Delete user
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get user statistics
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`);
  }

  // Get users by role
  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
  }

  // Get users by village
  getUsersByVillage(villageId: string, role:string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/village/${villageId}/${role}`);
  }

  // Get active users
  getActiveUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/active`);
  }

  // Toggle user status
  toggleUserStatus(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
  getUsersCount(): Observable<UserCountResponse> {
    return this.http.get<UserCountResponse>(`${this.apiUrl}/count`);
  }
}
