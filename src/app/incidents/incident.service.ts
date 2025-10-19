import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  Incident,
  IncidentStatus,
  IncidentPriority,
  IncidentCategory,
  LocationType,
  DashboardSummary,
  IncidentFilters
} from './types/incident.types';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private incidentsSubject = new BehaviorSubject<Incident[]>([]);
  public incidents$ = this.incidentsSubject.asObservable();

  private baseUrl = `${environment.apiUrl}/incidents`;

  constructor(private http: HttpClient) {}

  // CRUD Operations
  createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Observable<Incident> {
    return this.http.post<Incident>(`${this.baseUrl}/create`, incident);
  }

  getAllIncidents(filters?: IncidentFilters): Observable<Incident[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.location) params = params.set('location', filters.location);
      if (filters.locationType) params = params.set('locationType', filters.locationType);
      if (filters.search) params = params.set('query', filters.search);
    }

    return this.http.get<Incident[]>(`${this.baseUrl}/all`, { params });
  }

  getIncidentById(id: string): Observable<Incident> {
    return this.http.get<Incident>(`${this.baseUrl}/${id}`);
  }

  updateIncident(id: string, updates: Partial<Incident>): Observable<Incident> {
    return this.http.put<Incident>(`${this.baseUrl}/${id}`, updates);
  }

  deleteIncident(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Status Management
  updateIncidentStatus(id: string, status: IncidentStatus, updatedBy?: string): Observable<Incident> {
    let params = new HttpParams();
    if (updatedBy) {
      params = params.set('updatedBy', updatedBy);
    }
    return this.http.put<Incident>(`${this.baseUrl}/${id}/status/${status}`, {}, { params });
  }

  assignIncident(id: string, assignedTo: string): Observable<Incident> {
    return this.http.put<Incident>(`${this.baseUrl}/${id}/assign?assignedTo=${assignedTo}`, {});
  }

  escalateIncident(id: string, escalatedTo: string, escalationLevel: string): Observable<Incident> {
    return this.http.put<Incident>(`${this.baseUrl}/${id}/escalate?escalatedTo=${escalatedTo}&escalationLevel=${escalationLevel}`, {});
  }

  resolveIncident(id: string, resolution: string): Observable<Incident> {
    return this.http.put<Incident>(`${this.baseUrl}/${id}/resolve?resolution=${encodeURIComponent(resolution)}`, {});
  }

  // Filtering Methods
  getIncidentsByStatus(status: IncidentStatus): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/status/${status}`);
  }

  getIncidentsByCategory(category: IncidentCategory): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/category/${category}`);
  }

  getIncidentsByPriority(priority: IncidentPriority): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/priority/${priority}`);
  }

  getIncidentsByLocation(location: string): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/location/${encodeURIComponent(location)}`);
  }

  getIncidentsByLocationType(locationType: LocationType): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/location-type/${locationType}`);
  }

  searchIncidents(query: string): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
  }

  getPendingIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/pending`);
  }

  // Dashboard & Statistics
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }

  getStatsByCategory(category: IncidentCategory): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats/category/${category}`);
  }

  // Utility methods
  refreshIncidents(): void {
    this.getAllIncidents().subscribe({
      next: (incidents) => this.incidentsSubject.next(incidents),
      error: (error) => console.error('Error refreshing incidents:', error)
    });
  }

  getStatusDisplayName(status: IncidentStatus): string {
    const statusMap: { [key in IncidentStatus]: string } = {
      [IncidentStatus.OPEN]: 'Open',
      [IncidentStatus.IN_PROGRESS]: 'In Progress',
      [IncidentStatus.RESOLVED]: 'Resolved',
      [IncidentStatus.ESCALATED]: 'Escalated',
      [IncidentStatus.CLOSED]: 'Closed'
    };
    return statusMap[status] || status;
  }

  getPriorityDisplayName(priority: IncidentPriority): string {
    const priorityMap: { [key in IncidentPriority]: string } = {
      [IncidentPriority.LOW]: 'Low',
      [IncidentPriority.MEDIUM]: 'Medium',
      [IncidentPriority.HIGH]: 'High',
      [IncidentPriority.CRITICAL]: 'Critical'
    };
    return priorityMap[priority] || priority;
  }

  getCategoryDisplayName(category: IncidentCategory): string {
    const categoryMap: { [key in IncidentCategory]: string } = {
      [IncidentCategory.INFRASTRUCTURE]: 'Infrastructure',
      [IncidentCategory.HEALTH]: 'Health',
      [IncidentCategory.EDUCATION]: 'Education',
      [IncidentCategory.SECURITY]: 'Security',
      [IncidentCategory.BANKING]: 'Banking',
      [IncidentCategory.AGRICULTURE]: 'Agriculture',
      [IncidentCategory.TRANSPORT]: 'Transport',
      [IncidentCategory.WATER_SUPPLY]: 'Water Supply',
      [IncidentCategory.ELECTRICITY]: 'Electricity',
      [IncidentCategory.SANITATION]: 'Sanitation',
      [IncidentCategory.ENVIRONMENT]: 'Environment',
      [IncidentCategory.SOCIAL]: 'Social',
      [IncidentCategory.OTHER]: 'Other'
    };
    return categoryMap[category] || category;
  }

  getPriorityColor(priority: IncidentPriority): string {
    const colorMap: { [key in IncidentPriority]: string } = {
      [IncidentPriority.LOW]: '#10b981',
      [IncidentPriority.MEDIUM]: '#f59e0b',
      [IncidentPriority.HIGH]: '#ef4444',
      [IncidentPriority.CRITICAL]: '#dc2626'
    };
    return colorMap[priority] || '#6b7280';
  }

  getStatusColor(status: IncidentStatus): string {
    const colorMap: { [key in IncidentStatus]: string } = {
      [IncidentStatus.OPEN]: '#3b82f6',
      [IncidentStatus.IN_PROGRESS]: '#f59e0b',
      [IncidentStatus.RESOLVED]: '#10b981',
      [IncidentStatus.ESCALATED]: '#ef4444',
      [IncidentStatus.CLOSED]: '#6b7280'
    };
    return colorMap[status] || '#6b7280';
  }
}
