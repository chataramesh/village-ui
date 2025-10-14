import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Event, EventStats } from './event.model';

export { Event, EventStats } from './event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) { }

  // Get all events
  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/all`);
  }

  // Get event by ID
  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  // Get active events
  getActiveEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/active`);
  }

  // Get upcoming events
  getUpcomingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/upcoming`);
  }

  // Get events by place
  getEventsByPlace(place: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/place/${place}`);
  }

  // Create new event
  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/create`, event);
  }

  // Update existing event
  updateEvent(id: string, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  // Delete event
  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Toggle event status
  toggleEventStatus(id: string): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Get event statistics
  getEventStats(): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.apiUrl}/stats`);
  }

  // Search events
  searchEvents(query: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }
}
