import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EntitySubscription } from './entity.service';

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  subscriptionsByType: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class EntitySubscriptionService {

  private apiUrl = `${environment.apiUrl}/entity-subscriptions`;

  constructor(private http: HttpClient) { }

  // Get all subscriptions
  getAllSubscriptions(): Observable<EntitySubscription[]> {
    return this.http.get<EntitySubscription[]>(`${this.apiUrl}/all`);
  }

  // Get subscription by ID
  getSubscriptionById(id: string): Observable<EntitySubscription> {
    return this.http.get<EntitySubscription>(`${this.apiUrl}/${id}`);
  }

  // Get subscriptions by user
  getSubscriptionsByUser(userId: string): Observable<EntitySubscription[]> {
    return this.http.get<EntitySubscription[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Get subscriptions by entity
  getSubscriptionsByEntity(entityId: string): Observable<EntitySubscription[]> {
    return this.http.get<EntitySubscription[]>(`${this.apiUrl}/entity/${entityId}`);
  }

  // Get subscriptions by type
  getSubscriptionsByType(type: string): Observable<EntitySubscription[]> {
    return this.http.get<EntitySubscription[]>(`${this.apiUrl}/type/${type}`);
  }

  // Create new subscription
  createSubscription(subscription: Omit<EntitySubscription, 'id' | 'subscribedAt'>): Observable<EntitySubscription> {
    return this.http.post<EntitySubscription>(`${this.apiUrl}/create`, subscription);
  }

  // Update subscription
  updateSubscription(id: string, subscription: Partial<EntitySubscription>): Observable<EntitySubscription> {
    return this.http.put<EntitySubscription>(`${this.apiUrl}/${id}`, subscription);
  }

  // Delete subscription
  deleteSubscription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Toggle subscription status
  toggleSubscriptionStatus(id: string): Observable<EntitySubscription> {
    return this.http.patch<EntitySubscription>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Update subscription type
  updateSubscriptionType(id: string, subscriptionType: string): Observable<EntitySubscription> {
    return this.http.patch<EntitySubscription>(`${this.apiUrl}/${id}/type`, { subscriptionType });
  }

  // Get subscription statistics
  getSubscriptionStats(): Observable<SubscriptionStats> {
    return this.http.get<SubscriptionStats>(`${this.apiUrl}/stats`);
  }

  // Check if user is subscribed to entity
  isUserSubscribedToEntity(userId: string, entityId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-subscription/${userId}/${entityId}`);
  }
}
