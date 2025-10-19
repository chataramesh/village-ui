import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketNotificationService, Notification } from '../../core/services/websocket-notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-bell-container">
      <button
        class="notification-bell"
        (click)="toggleNotifications()"
        [class.has-unread]="unreadCount > 0"
        title="Notifications">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-5 5-5-5h5V12h-5l5-5 5 5h-5v5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
          <path *ngIf="unreadCount > 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 17l.01 0M15 17h.01M12 17h.01M12 2v1m0 18v1m9-9h1M2 12h1m0-8l1 1m16-1l1 1M4.05 4.05l1.414 1.414M17.536 17.536l1.414 1.414M17.536 4.464l-1.414 1.414M4.464 17.536l-1.414 1.414"></path>
        </svg>

        <span class="notification-badge" *ngIf="unreadCount > 0">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <div class="notifications-dropdown" [class.show]="showDropdown">
        <div class="notifications-header">
          <h3>Notifications</h3>
          <div class="notifications-actions">
            <button
              class="mark-all-read-btn"
              (click)="markAllAsRead()"
              *ngIf="unreadCount > 0"
              title="Mark all as read">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </button>
            <button
              class="clear-all-btn"
              (click)="clearAllNotifications()"
              title="Clear all notifications">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="notifications-list" *ngIf="notifications.length > 0; else noNotifications">
          <div
            *ngFor="let notification of notifications.slice(0, 10)"
            class="notification-item"
            [class.unread]="!notification.isRead"
            (click)="markAsRead(notification.id)">

            <div class="notification-icon" [class]="notification.notificationType.toLowerCase()">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>

            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-meta">
                <span class="notification-entity">{{ notification.entityName }}</span>
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
            </div>

            <div class="notification-actions">
              <button
                class="mark-read-btn"
                (click)="markAsRead(notification.id); $event.stopPropagation()"
                *ngIf="!notification.isRead"
                title="Mark as read">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <ng-template #noNotifications>
          <div class="no-notifications">
            <div class="no-notifications-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-5 5-5-5h5V12h-5l5-5 5 5h-5v5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
              </svg>
            </div>
            <p>No notifications yet</p>
          </div>
        </ng-template>

        <div class="notifications-footer" *ngIf="notifications.length > 0">
          <button class="view-all-btn" (click)="viewAllNotifications()">
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-bell-container {
      position: relative;
      display: inline-block;
    }

    .notification-bell {
      position: relative;
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #6b7280;

      &:hover {
        background: #f3f4f6;
        color: #374151;
      }

      &.has-unread {
        color: #3b82f6;
        animation: pulse 2s infinite;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      line-height: 1;
    }

    .notifications-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      width: 400px;
      max-height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid #e5e7eb;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;

      &.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #111827;
      }

      .notifications-actions {
        display: flex;
        gap: 0.5rem;

        button {
          background: none;
          border: none;
          padding: 0.25rem;
          border-radius: 4px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;

          &:hover {
            background: #f3f4f6;
            color: #374151;
          }

          svg {
            width: 16px;
            height: 16px;
          }
        }
      }
    }

    .notifications-list {
      max-height: 350px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background: #f9fafb;
      }

      &.unread {
        background: #eff6ff;
        border-left: 3px solid #3b82f6;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .notification-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;

      &.update {
        background: #dbeafe;
        color: #1d4ed8;
      }

      &.info {
        background: #e0f2fe;
        color: #0369a1;
      }

      &.warning {
        background: #fef3c7;
        color: #d97706;
      }

      &.error {
        background: #fee2e2;
        color: #dc2626;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;

      .notification-title {
        font-weight: 600;
        color: #111827;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
      }

      .notification-message {
        color: #6b7280;
        font-size: 0.8125rem;
        line-height: 1.4;
        margin-bottom: 0.5rem;
      }

      .notification-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;

        .notification-entity {
          color: #3b82f6;
          font-weight: 500;
        }

        .notification-time {
          color: #9ca3af;
        }
      }
    }

    .notification-actions {
      flex-shrink: 0;
      margin-left: 0.5rem;

      .mark-read-btn {
        background: none;
        border: none;
        padding: 0.25rem;
        border-radius: 4px;
        cursor: pointer;
        color: #3b82f6;
        transition: all 0.2s ease;

        &:hover {
          background: #dbeafe;
        }

        svg {
          width: 14px;
          height: 14px;
        }
      }
    }

    .no-notifications {
      text-align: center;
      padding: 3rem 2rem;
      color: #9ca3af;

      .no-notifications-icon {
        margin-bottom: 1rem;
        color: #d1d5db;

        svg {
          width: 48px;
          height: 48px;
        }
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }

    .notifications-footer {
      padding: 1rem;
      border-top: 1px solid #e5e7eb;
      text-align: center;

      .view-all-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.8125rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
          background: #2563eb;
        }
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    @media (max-width: 768px) {
      .notifications-dropdown {
        width: 350px;
        right: -50px;
      }
    }

    @media (max-width: 480px) {
      .notifications-dropdown {
        width: calc(100vw - 2rem);
        right: -50px;
        left: 50px;
      }
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  notifications: Notification[] = [];
  unreadCount = 0;
  showDropdown = false;
  isConnected = false;

  constructor(private notificationService: WebSocketNotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    this.notificationService.isConnected()
      .pipe(takeUntil(this.destroy$))
      .subscribe(connected => {
        this.isConnected = connected;
      });

    // Request browser notification permission
    this.notificationService.requestNotificationPermission();

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-bell-container')) {
        this.showDropdown = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', () => {});
  }

  toggleNotifications(): void {
    this.showDropdown = !this.showDropdown;
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markNotificationAsRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  markAllAsRead(): void {
    this.notifications
      .filter(n => !n.isRead)
      .forEach(notification => {
        this.markAsRead(notification.id);
      });
  }

  clearAllNotifications(): void {
    this.notificationService.clearAllNotifications();
  }

  viewAllNotifications(): void {
    // TODO: Navigate to full notifications page
    console.log('View all notifications');
    this.showDropdown = false;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  }
}
