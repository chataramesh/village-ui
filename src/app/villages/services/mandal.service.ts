import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Mandal {
  id?: string;
  name: string;
  district: {
    id: string;
    name: string;
  };
}

export interface MandalStats {
  totalMandals: number;
  activeMandals: number;
  inactiveMandals: number;
}

@Injectable({
  providedIn: 'root'
})
export class MandalService {
  private apiUrl = `${environment.villageUrl}/mandal`;

  constructor(private http: HttpClient) { }

  // Get all mandals
  getAllMandals(): Observable<Mandal[]> {
    return this.http.get<Mandal[]>(`${this.apiUrl}/all`);
  }

  // Get mandals by district
  getMandalsByDistrict(districtId: string): Observable<Mandal[]> {
    return this.http.get<Mandal[]>(`${this.apiUrl}/mandals-by-district/${districtId}`);
  }

  // Get mandal by ID
  getMandalById(id: string): Observable<Mandal> {
    return this.http.get<Mandal>(`${this.apiUrl}/${id}`);
  }

  // Create new mandal
  createMandal(mandal: Mandal): Observable<Mandal> {
    return this.http.post<Mandal>(`${this.apiUrl}/create`, mandal);
  }

  // Update existing mandal
  updateMandal(id: string, mandal: Mandal): Observable<Mandal> {
    return this.http.put<Mandal>(`${this.apiUrl}/${id}`, mandal);
  }

  // Delete mandal
  deleteMandal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get mandal statistics
  getMandalStats(): Observable<MandalStats> {
    return this.http.get<MandalStats>(`${this.apiUrl}/stats`);
  }
}
