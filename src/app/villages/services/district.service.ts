import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface District {
  id?: string;
  name: string;
  state: {
    id: string;
    name: string;
  };
}

export interface DistrictStats {
  totalDistricts: number;
  activeDistricts: number;
  inactiveDistricts: number;
}

@Injectable({
  providedIn: 'root'
})
export class DistrictService {
  private apiUrl = `${environment.villageUrl}/district`;

  constructor(private http: HttpClient) { }

  // Get all districts
  getAllDistricts(): Observable<District[]> {
    return this.http.get<District[]>(`${this.apiUrl}/all`);
  }

  // Get districts by state
  getDistrictsByState(stateId: string): Observable<District[]> {
    return this.http.get<District[]>(`${this.apiUrl}/district-by-state/${stateId}`);
  }

  // Get district by ID
  getDistrictById(id: string): Observable<District> {
    return this.http.get<District>(`${this.apiUrl}/${id}`);
  }

  // Create new district
  createDistrict(district: District): Observable<District> {
    return this.http.post<District>(`${this.apiUrl}/create`, district);
  }

  // Update existing district
  updateDistrict(id: string, district: District): Observable<District> {
    return this.http.put<District>(`${this.apiUrl}/${id}`, district);
  }

  // Delete district
  deleteDistrict(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get district statistics
  getDistrictStats(): Observable<DistrictStats> {
    return this.http.get<DistrictStats>(`${this.apiUrl}/stats`);
  }
}
