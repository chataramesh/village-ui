import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { School, SchoolRequest, SchoolResponse, SchoolType } from '../models/school.model';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private apiUrl = `${environment.apiUrl}/schools`;
  private schoolsSubject = new BehaviorSubject<SchoolResponse[]>([]);
  public schools$ = this.schoolsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Create school
  createSchool(schoolRequest: SchoolRequest): Observable<SchoolResponse> {
    return this.http.post<SchoolResponse>(`${this.apiUrl}/create`, schoolRequest);
  }

  // Update school
  updateSchool(schoolId: string, schoolRequest: Partial<SchoolRequest>): Observable<SchoolResponse> {
    return this.http.put<SchoolResponse>(`${this.apiUrl}/${schoolId}`, schoolRequest);
  }

  // Get school by ID
  getSchoolById(schoolId: string): Observable<SchoolResponse> {
    return this.http.get<SchoolResponse>(`${this.apiUrl}/${schoolId}`);
  }

  // Get all schools
  getAllSchools(): Observable<SchoolResponse[]> {
    return this.http.get<SchoolResponse[]>(`${this.apiUrl}/all`);
  }

  // Location-based filtering
  getSchoolsByVillage(villageId: string): Observable<SchoolResponse[]> {
    return this.http.get<SchoolResponse[]>(`${this.apiUrl}/village/${villageId}`);
  }

  getSchoolsByMandal(mandalId: string): Observable<SchoolResponse[]> {
    return this.http.get<SchoolResponse[]>(`${this.apiUrl}/mandal/${mandalId}`);
  }

  getSchoolsByDistrict(districtId: string): Observable<SchoolResponse[]> {
    return this.http.get<SchoolResponse[]>(`${this.apiUrl}/district/${districtId}`);
  }

  getSchoolsByState(stateId: string): Observable<SchoolResponse[]> {
    return this.http.get<SchoolResponse[]>(`${this.apiUrl}/state/${stateId}`);
  }

  // Additional filtering
  getSchoolsByOwner(ownerId: string): Observable<SchoolResponse[]> {
    return this.http.get<SchoolResponse[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  getSchoolsByType(schoolType: SchoolType): Observable<SchoolResponse[]> {
    return this.http.get<SchoolResponse[]>(`${this.apiUrl}/type/${schoolType}`);
  }

  // Analytics
  getActiveSchoolsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/active`);
  }

  getSchoolsCountByType(type: SchoolType): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/type/${type}`);
  }

  // Delete school (soft delete)
  deleteSchool(schoolId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${schoolId}`, { responseType: 'text' });
  }

  // Helper method to update the schools subject
  updateSchools(schools: SchoolResponse[]) {
    this.schoolsSubject.next(schools);
  }
}
