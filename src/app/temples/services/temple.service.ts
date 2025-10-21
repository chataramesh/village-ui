import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Temple, TempleRequest, TempleResponse, TempleType } from '../models/temple.model';

@Injectable({
  providedIn: 'root'
})
export class TempleService {
  private apiUrl = `${environment.apiUrl}/temples`;
  private templesSubject = new BehaviorSubject<TempleResponse[]>([]);
  public temples$ = this.templesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Create temple
  createTemple(templeRequest: TempleRequest): Observable<TempleResponse> {
    return this.http.post<TempleResponse>(`${this.apiUrl}/create`, templeRequest);
  }

  // Update temple
  updateTemple(templeId: string, templeRequest: Partial<TempleRequest>): Observable<TempleResponse> {
    return this.http.put<TempleResponse>(`${this.apiUrl}/${templeId}`, templeRequest);
  }

  // Get temple by ID
  getTempleById(templeId: string): Observable<TempleResponse> {
    return this.http.get<TempleResponse>(`${this.apiUrl}/${templeId}`);
  }

  // Get all temples
  getAllTemples(): Observable<TempleResponse[]> {
    return this.http.get<TempleResponse[]>(`${this.apiUrl}/all`);
  }

  // Location-based filtering
  getTemplesByVillage(villageId: string): Observable<TempleResponse[]> {
    return this.http.get<TempleResponse[]>(`${this.apiUrl}/village/${villageId}`);
  }

  getTemplesByMandal(mandalId: string): Observable<TempleResponse[]> {
    return this.http.get<TempleResponse[]>(`${this.apiUrl}/mandal/${mandalId}`);
  }

  getTemplesByDistrict(districtId: string): Observable<TempleResponse[]> {
    return this.http.get<TempleResponse[]>(`${this.apiUrl}/district/${districtId}`);
  }

  getTemplesByState(stateId: string): Observable<TempleResponse[]> {
    return this.http.get<TempleResponse[]>(`${this.apiUrl}/state/${stateId}`);
  }

  // Additional filtering
  getTemplesByOwner(ownerId: string): Observable<TempleResponse[]> {
    return this.http.get<TempleResponse[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  getTemplesByType(templeType: TempleType): Observable<TempleResponse[]> {
    return this.http.get<TempleResponse[]>(`${this.apiUrl}/type/${templeType}`);
  }

  // Analytics
  getActiveTemplesCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/active`);
  }

  getTemplesCountByType(type: TempleType): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/type/${type}`);
  }

  // Delete temple (soft delete)
  deleteTemple(templeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${templeId}`, { responseType: 'text' });
  }

  // Helper method to update the temples subject
  updateTemples(temples: TempleResponse[]) {
    this.templesSubject.next(temples);
  }
}
