import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserCountResponse } from '../../users/users.service';
import { HttpClient } from '@angular/common/http';
import { Village } from '../village-create/village-create.component';

export interface VillageCountResponse {
  totalVillages: number;
  activeVillages: number;
  inactiveVillages: number;
}
@Injectable({
  providedIn: 'root'
})
export class VillagesService {
  
 
  private apiUrl = `${environment.villageUrl}/village`;
  constructor(private http: HttpClient) { }
  
  // Get all villages
  getAllVillages(): Observable<Village[]> {
    return this.http.get<Village[]>(`${this.apiUrl}/all`);
  }

  // Get village by ID
  getVillageById(id: string): Observable<Village> {
    return this.http.get<Village>(`${this.apiUrl}/${id}`);
  }

  // Get villages count
  getVillagesCount(): Observable<VillageCountResponse> {
    return this.http.get<VillageCountResponse>(`${this.apiUrl}/count`);
  }

  // Create village
  createVillage(village: any): Observable<Village> {
    return this.http.post<Village>(`${this.apiUrl}/create`, village);
  }

  // Update village
  updateVillage(id: string, village: any): Observable<Village> {
    return this.http.put<Village>(`${this.apiUrl}/${id}`, village);
  }

  // Delete village
  deleteVillage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get countries
  getCoutries(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/country/all`);
  }

  // Get states by country
  getStatesByCountry(countryid: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/states-by-country/${countryid}`);
  }

  // Get districts by state
  getDistrictsByState(stateid: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/district-by-state/${stateid}`);
  }

  // Get mandals by district
  getMandalsByDistrict(districtid: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mandals-by-district/${districtid}`);
  }
}
