import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle, VehicleFilters } from '../models/vehicle.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  getAllVehicles(filters?: VehicleFilters): Observable<Vehicle[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.vehicleType) params = params.set('vehicleType', filters.vehicleType);
      if (filters.wheelerType) params = params.set('wheelerType', filters.wheelerType);
      //if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<Vehicle[]>(`${this.apiUrl}/all`, { params });
  }

  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiUrl}/create`, vehicle);
  }

  updateVehicle(id: string, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, vehicle);
  }
}
