import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { TokenService } from './token.service';

export interface Notification {
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

@Injectable({
  providedIn: 'root'
})
export class WebSocketNotificationService implements OnDestroy {
  private stompClient: Client | null = null;
  private connected = new BehaviorSubject<boolean>(false);
  private notifications = new BehaviorSubject<Notification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);
  private entitySubscriptions = new Set<string>();
  private destroy$ = new Subject<void>();

  constructor(private tokenService: TokenService) {
    this.initializeWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }

  private initializeWebSocket(): void {
    const token = this.tokenService.getToken();
    if (!token) {
      console.warn('No authentication token found for WebSocket connection');
      return;
    }

    const socket = new (SockJS as any)(`${environment.apiUrl}/ws`);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('WebSocket Connected:', frame);
      this.connected.next(true);
      this.subscribeToPersonalNotifications();
      this.subscribeToAllEntityUpdates();
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
      console.error('Error details:', frame.body);
      this.connected.next(false);
    };

    this.stompClient.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      this.connected.next(false);
    };

    this.stompClient.onDisconnect = () => {
      console.log('WebSocket disconnected');
      this.connected.next(false);
    };

    this.stompClient.activate();
  }

  private subscribeToPersonalNotifications(): void {
    if (!this.stompClient?.connected) return;

    this.stompClient.subscribe('/user/queue/notifications', (message) => {
      try {
        const notification: Notification = JSON.parse(message.body);
        console.log('Received personal notification:', notification);
        this.addNotification(notification);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });
  }

  private subscribeToAllEntityUpdates(): void {
    if (!this.stompClient?.connected) return;

    // Subscribe to all entity updates
    this.stompClient.subscribe('/topic/entity-updates', (message) => {
      try {
        const notification: Notification = JSON.parse(message.body);
        console.log('Received entity update notification:', notification);
        this.addNotification(notification);
      } catch (error) {
        console.error('Error parsing entity update notification:', error);
      }
    });
  }

  public subscribeToEntityUpdates(entityId: string): void {
    if (!this.stompClient?.connected) {
      console.warn('WebSocket not connected, cannot subscribe to entity updates');
      return;
    }

    if (this.entitySubscriptions.has(entityId)) {
      console.log(`Already subscribed to entity ${entityId} updates`);
      return;
    }

    this.stompClient.subscribe(`/topic/entity/${entityId}/notifications`, (message) => {
      try {
        const notification: Notification = JSON.parse(message.body);
        console.log(`Received entity ${entityId} notification:`, notification);
        this.addNotification(notification);
      } catch (error) {
        console.error('Error parsing entity notification:', error);
      }
    });

    this.entitySubscriptions.add(entityId);
    console.log(`Subscribed to entity ${entityId} updates`);
  }

  public unsubscribeFromEntityUpdates(entityId: string): void {
    if (!this.stompClient?.connected) return;

    // Note: STOMP doesn't have a direct unsubscribe method for specific subscriptions
    // In a real implementation, you'd need to track subscription IDs
    this.entitySubscriptions.delete(entityId);
    console.log(`Unsubscribed from entity ${entityId} updates`);
  }

  private addNotification(notification: Notification): void {
    const currentNotifications = this.notifications.value;

    // Check if notification already exists to avoid duplicates
    const existingIndex = currentNotifications.findIndex(n => n.id === notification.id);

    if (existingIndex >= 0) {
      // Update existing notification
      currentNotifications[existingIndex] = notification;
    } else {
      // Add new notification to the beginning
      currentNotifications.unshift(notification);

      // Keep only the latest 50 notifications
      if (currentNotifications.length > 50) {
        currentNotifications.pop();
      }

      // Update unread count if notification is unread
      if (!notification.isRead) {
        this.unreadCount.next(this.unreadCount.value + 1);
      }
    }

    this.notifications.next([...currentNotifications]);
  }

  public markNotificationAsRead(notificationId: string): Observable<any> {
    // In a real implementation, you'd make an API call here
    // For now, we'll just update the local state
    const currentNotifications = this.notifications.value;
    const notificationIndex = currentNotifications.findIndex(n => n.id === notificationId);

    if (notificationIndex >= 0 && !currentNotifications[notificationIndex].isRead) {
      currentNotifications[notificationIndex].isRead = true;
      this.notifications.next([...currentNotifications]);
      this.unreadCount.next(Math.max(0, this.unreadCount.value - 1));
    }

    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  public clearAllNotifications(): void {
    this.notifications.next([]);
    this.unreadCount.next(0);
  }

  public getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  public getUnreadCount(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  public isConnected(): Observable<boolean> {
    return this.connected.asObservable();
  }

  public disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.deactivate();
    }
    this.connected.next(false);
    this.entitySubscriptions.clear();
  }

  public reconnect(): void {
    this.disconnect();
    setTimeout(() => {
      this.initializeWebSocket();
    }, 1000);
  }

  // Request browser notification permission
  public requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied');
  }

  // Show browser notification
  public showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/notification-icon.png',
        badge: '/assets/notification-badge.png',
        tag: notification.id, // Prevents duplicate notifications
        requireInteraction: notification.priority === 'HIGH',
        silent: notification.priority === 'LOW'
      });

      browserNotification.onclick = () => {
        // Handle notification click - could navigate to entity page
        window.focus();
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-high priority notifications
      if (notification.priority !== 'HIGH') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }
}
