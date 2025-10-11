import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface State {
  id?: string;
  name: string;
  country: {
    id: string;
    name: string;
  };
}

export interface StateStats {
  totalStates: number;
  activeStates: number;
  inactiveStates: number;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private apiUrl = `${environment.villageUrl}/state`;

  constructor(private http: HttpClient) { }

  // Get all states
  getAllStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiUrl}/all`);
  }

  // Get states by country
  getStatesByCountry(countryId: string): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiUrl}/states-by-country/${countryId}`);
  }

  // Get state by ID
  getStateById(id: string): Observable<State> {
    return this.http.get<State>(`${this.apiUrl}/${id}`);
  }

  // Create new state
  createState(state: State): Observable<State> {
    return this.http.post<State>(`${this.apiUrl}/create`, state);
  }

  // Update existing state
  updateState(id: string, state: State): Observable<State> {
    return this.http.put<State>(`${this.apiUrl}/${id}`, state);
  }

  // Delete state
  deleteState(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get state statistics
  getStateStats(): Observable<StateStats> {
    return this.http.get<StateStats>(`${this.apiUrl}/stats`);
  }
}
