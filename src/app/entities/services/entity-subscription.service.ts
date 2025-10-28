import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SubscriptionResponse {
  id: string;
  entityId: string;
  entityName: string;
  entityType: string;
  subscriptionType: string;
  subscribedAt: string;
  active: boolean;
}
export interface SubscribedEntity {
  id: string;
  entity: any;
  subscriptionType: string;
  subscribedAt: string;
  active: boolean;
}
export interface NotificationResponse {
  id: string;
  entityId: string;
  entityName: string;
  title: string;
  message: string;
  notificationType: string;
  priority: string;
  createdAt: string;
  scheduledFor: string;
  isRead: boolean;
  isActive: boolean;
}

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

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // Subscribe to Entity
  subscribeToEntity(entityId: string, userId: string, subscriptionType: string = 'GENERAL'): Observable<SubscriptionResponse> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('subscriptionType', subscriptionType);

    console.log('Making subscribe request to:', `${this.apiUrl}/subscriptions/${entityId}/subscribe`);
    console.log('With params:', params.toString());

    return this.http.post<SubscriptionResponse>(`${this.apiUrl}/subscriptions/${entityId}/subscribe`, {}, { params });
  }

  // Unsubscribe from Entity
  unsubscribeFromEntity(entityId: string, userId: string): Observable<string> {
    const params = new HttpParams().set('userId', userId);

    console.log('Making unsubscribe request to:', `${this.apiUrl}/subscriptions/${entityId}/unsubscribe`);
    console.log('With params:', params.toString());

    // Backend returns plain text like "Successfully unsubscribed from entity"; ensure we treat it as text
    return this.http.delete<string>(`${this.apiUrl}/subscriptions/${entityId}/unsubscribe`, {
      params,
      responseType: 'text' as 'json'
    });
  }

  // Get User Subscriptions
  getUserSubscriptions(userId: string): Observable<any[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<SubscriptionResponse[]>(`${this.apiUrl}/subscriptions/my-subscriptions`, { params });
  }

  // Check Subscription Status
  checkSubscriptionStatus(entityId: string, userId: string): Observable<boolean> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<boolean>(`${this.apiUrl}/subscriptions/${entityId}/is-subscribed`, { params });
  }

  // Get User Notifications
  getUserNotifications(userId: string, page: number = 0, size: number = 20): Observable<NotificationResponse[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/notifications/my-notifications`, { params });
  }

  // Get Unread Notification Count
  getUnreadNotificationCount(userId: string): Observable<number> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<number>(`${this.apiUrl}/notifications/unread-count`, { params });
  }

  // Mark Notification as Read
  markNotificationAsRead(notificationId: string): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  // Broadcast to Entity Subscribers (Admin only)
  broadcastToEntitySubscribers(
    entityId: string,
    title: string,
    message: string,
    notificationType: string = 'GENERAL',
    priority: string = 'NORMAL'
  ): Observable<string> {
    const body = {
      title,
      message,
      notificationType,
      priority
    };
    return this.http.post<string>(`${this.apiUrl}/notifications/entity/${entityId}/broadcast`, body);
  }

  // Legacy methods (keeping for backward compatibility)
  getAllSubscriptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subscriptions/all`);
  }

  getSubscriptionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/subscriptions/${id}`);
  }

  getSubscriptionsByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subscriptions/user/${userId}`);
  }

  getSubscriptionsByEntity(entityId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subscriptions/entity/${entityId}`);
  }

  createSubscription(subscription: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/subscriptions/create`, subscription);
  }

  updateSubscription(id: string, subscription: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/subscriptions/${id}`, subscription);
  }

  deleteSubscription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subscriptions/${id}`);
  }

  toggleSubscriptionStatus(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/subscriptions/${id}/toggle-status`, {});
  }

  updateSubscriptionType(id: string, subscriptionType: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/subscriptions/${id}/type`, { subscriptionType });
  }

  getSubscriptionStats(): Observable<SubscriptionStats> {
    return this.http.get<SubscriptionStats>(`${this.apiUrl}/subscriptions/stats`);
  }

  isUserSubscribedToEntity(userId: string, entityId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/subscriptions/check-subscription/${userId}/${entityId}`);
  }
}
