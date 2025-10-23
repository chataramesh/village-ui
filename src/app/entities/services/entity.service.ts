import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export enum EntityStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED',
  PERMANENTLY_CLOSED = 'PERMANENTLY_CLOSED'
}

export enum EntityType {
  GOVT_HOSPITAL = 'GOVT_HOSPITAL',
  SHOP = 'SHOP',
  MRO_OFFICE = 'MRO_OFFICE',
  POLICE_STATION = 'POLICE_STATION',
  POST_OFFICE = 'POST_OFFICE',
  SCHOOL = 'SCHOOL',
  BANK = 'BANK',
  PHARMACY = 'PHARMACY',
  COMMUNITY_CENTER = 'COMMUNITY_CENTER',
  OTHER = 'OTHER'
}

export interface Entity {
  id?: string;
  name: string;
  description?: string;
  type: EntityType | string;
  owner?: {
    id?: string;
    name?: string;
    email?: string;
  };
  openingTime?: string;
  closingTime?: string;
  status: EntityStatus;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  latitude?: number;
  longitude?: number;
  address?: string;
  contactNumber?: string;
  email?: string;
  capacity?: number;
  availableSlots?: number;
  subscriptionCount?: number;
  villageId?: string;
  villageName?: string;
}

export interface EntitySubscription {
  id?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  entity?: {
    id?: string;
    name?: string;
    type?: string;
  };
  isActive: boolean;
  subscribedAt?: Date;
  subscriptionType: 'GENERAL' | 'EMERGENCY' | 'UPDATES';
}

export interface EntityStats {
  totalEntities: number;
  activeEntities: number;
  inactiveEntities: number;
  entitiesByType: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class EntityService {


  private apiUrl = `${environment.apiUrl}/entities`;

  constructor(private http: HttpClient) { }

  // Get all entities
  getAllEntities(): Observable<Entity[]> {
    return this.http.get<Entity[]>(`${this.apiUrl}/all`);
  }

  // Get entity by ID
  getEntityById(id: string): Observable<Entity> {
    return this.http.get<Entity>(`${this.apiUrl}/${id}`);
  }

  // Get entities by type
  getEntitiesByType(type: string): Observable<Entity[]> {
    return this.http.get<Entity[]>(`${this.apiUrl}/type/${type}`);
  }

  // Get entities by owner
  getEntitiesByOwner(ownerId: string): Observable<Entity[]> {
    return this.http.get<Entity[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  // Get entities by village
  getEntitiesByVillage(villageId: string): Observable<Entity[]> {
    return this.http.get<Entity[]>(`${this.apiUrl}/village/${villageId}`);
  }

  // Get entities by status
  getEntitiesByStatus(status: EntityStatus): Observable<Entity[]> {
    return this.http.get<Entity[]>(`${this.apiUrl}/status/${status}`);
  }

  // Create new entity
  createEntity(entity: Entity): Observable<Entity> {
    return this.http.post<Entity>(`${this.apiUrl}/create`, entity);
  }

  // Update existing entity
  updateEntity(id: string, entity: Entity): Observable<Entity> {
    return this.http.put<Entity>(`${this.apiUrl}/${id}`, entity);
  }
  updateEntityByOwner(entityId: string,ownerId: string, entity: Entity) {
    return this.http.put<Entity>(`${this.apiUrl}/${entityId}/${ownerId}`, entity);
  }

  // Delete entity
  deleteEntity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Toggle entity status
  toggleEntityStatus(id: string): Observable<Entity> {
    return this.http.patch<Entity>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Update entity status
  updateEntityStatus(id: string, status: EntityStatus): Observable<Entity> {
    return this.http.patch<Entity>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Get entity statistics
  getEntityStats(): Observable<EntityStats> {
    return this.http.get<EntityStats>(`${this.apiUrl}/stats`);
  }

  // Search entities
  searchEntities(query: string): Observable<Entity[]> {
    return this.http.get<Entity[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }
}
