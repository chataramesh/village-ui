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
export interface CountryCountResponse {

  totalCountries: number;
  activeCountries: number;
  inactiveCountries: number;
}
export interface StateCountResponse {
  totalStates: number;
  activeStates: number;
  inactiveStates: number;
}
export interface DistrictCountResponse {
  totalDistricts: number;
  activeDistricts: number;
  inactiveDistricts: number;
}
export interface MandalCountResponse {
  totalMandals: number;
  activeMandals: number;
  inactiveMandals: number;
}
export interface VillageCountResponse {
  totalVillages: number;
  activeVillages: number;
  inactiveVillages: number;
}
export interface VillagerCountResponse {
  totalVillagers: number;
  activeVillagers: number;
  inactiveVillagers: number;
}
export interface EntityCountResponse {
  totalEntities: number;
  activeEntities: number;
  inactiveEntities: number;
}
export interface EventCountResponse {
  totalEvents: number;
  activeEvents: number;
  inactiveEvents: number;
}
export interface IncidentCountResponse {
  totalIncidents: number;
  activeIncidents: number;
  inactiveIncidents: number;
}
export interface TempleCountResponse {
  totalTemples: number;
  activeTemples: number;
  inactiveTemples: number;
}
export interface SchoolCountResponse {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
}
export interface VehicleCountResponse {
  totalVehicles: number;
  activeVehicles: number;
  inactiveVehicles: number;
}
export interface ImageCountResponse {
  totalImages: number;
  activeImages: number;
  inactiveImages: number;
}
export interface VillageDashboardCountResponse {
  userCounts: UserCountResponse;
  villageCounts: VillageCountResponse;
  mandalCounts: MandalCountResponse;
  districtCounts: DistrictCountResponse;
  stateCounts: StateCountResponse;
  countryCounts: CountryCountResponse;
  entities: EntityCountResponse;
  villagers: VillagerCountResponse;
  events: EventCountResponse;
  incidents: IncidentCountResponse;
  temples: TempleCountResponse;
  schools: SchoolCountResponse;
  vehicles: VehicleCountResponse;
  images: ImageCountResponse;
}

export interface ComprehensiveCountResponse {
  userCounts:UserCountResponse;
  villageCounts:VillageCountResponse;
  mandalCounts:MandalCountResponse;
  districtCounts:DistrictCountResponse;
  stateCounts: StateCountResponse ;
  countryCounts: CountryCountResponse ;
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
getAllRoles() {
    return this.http.get<any>(`${this.apiUrl}/all/roles`);
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

  getDashboardCount(): Observable<ComprehensiveCountResponse> {
    return this.http.get<ComprehensiveCountResponse>(`${environment.apiUrl}/statistics/comprehensive`);

  }

  // Get village-specific dashboard counts for village-admin
  getVillageDashboardCount(villageId: string): Observable<VillageDashboardCountResponse> {
    return this.http.get<VillageDashboardCountResponse>(`${environment.apiUrl}/statistics/village/${villageId}`);
  }
}
