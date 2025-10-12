import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Country {
  id?: string;
  name: string;
}

export interface CountryStats {
  totalCountries: number;
  activeCountries: number;
  inactiveCountries: number;
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private apiUrl = `${environment.apiUrl}/country`;

  constructor(private http: HttpClient) { }

  // Get all countries
  getAllCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/all`);
  }

  // Get country by ID
  getCountryById(id: string): Observable<Country> {
    return this.http.get<Country>(`${this.apiUrl}/${id}`);
  }

  // Create new country
  createCountry(country: Country): Observable<Country> {
    return this.http.post<Country>(`${this.apiUrl}/create`, country);
  }

  // Update existing country
  updateCountry(id: string, country: Country): Observable<Country> {
    return this.http.put<Country>(`${this.apiUrl}/${id}`, country);
  }

  // Delete country
  deleteCountry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get country statistics
  getCountryStats(): Observable<CountryStats> {
    return this.http.get<CountryStats>(`${this.apiUrl}/stats`);
  }
}
