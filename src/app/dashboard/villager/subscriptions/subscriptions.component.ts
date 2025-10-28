import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TokenService } from 'src/app/core/services/token.service';
import { EntitySubscriptionService, SubscribedEntity } from 'src/app/entities/services/entity-subscription.service';

interface Entity {
  id: string;
  name: string;
  description: string;
  type: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  openingTime: string;
  closingTime: string;
  status: string;
  address: string;
  contactNumber: string;
  email: string;
  capacity: number;
  availableSlots: number;
  active: boolean;
  subscriptionCount: number;
  villageId: string;
  villageName: string;
}

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SubscriptionsComponent implements OnInit {

  userSubscriptions: SubscribedEntity[] = [];
  subscribedEntities: any[] = [];
  showUnsubscribeConfirm = false;
  subscriptionToUnsubscribe: SubscribedEntity | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService,
    private subscriptionService: EntitySubscriptionService
  ) {}

  ngOnInit(): void {
    this.loadUserSubscriptions();
  }

  loadUserSubscriptions(): void {
    this.isLoading = true;
    this.error = null;

    const currentUser = this.tokenService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      this.error = 'User not authenticated. Please log in again.';
      this.isLoading = false;
      return;
    }

    this.subscriptionService.getUserSubscriptions(currentUser.userId).subscribe({
      next: (subscriptions) => {
        console.log('User subscriptions:', JSON.stringify(subscriptions));
        this.userSubscriptions = subscriptions;
        this.subscribedEntities = subscriptions.map(sub => ({
          id: sub.entityId,
          name: sub.entityName,
          type: sub.entityType,
          subscriptionType: sub.subscriptionType,
          subscribedAt: sub.subscribedAt,
          active: sub.active
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user subscriptions:', error);
        this.error = 'Failed to load your subscriptions. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  toggleSubscription(subscription: SubscribedEntity): void {
    if (subscription.active) {
      // Show confirmation dialog for unsubscribe
      this.subscriptionToUnsubscribe = subscription;
      this.showUnsubscribeConfirm = true;
    } else {
      // Subscribe to entity
      this.subscribeToEntity(subscription.entity.id!, subscription.entity.name!);
    }
  }

  subscribeToEntity(entityId: string, entityName: string): void {
    const currentUser = this.tokenService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      this.error = 'User not authenticated. Please log in again.';
      return;
    }

    this.subscriptionService.subscribeToEntity(entityId, currentUser.userId).subscribe({
      next: (subscription) => {
        console.log(`Subscribed to ${entityName}`);
        this.loadUserSubscriptions(); // Reload subscriptions
      },
      error: (error) => {
        console.error('Error subscribing to entity:', error);
        this.error = 'Failed to subscribe. Please try again later.';
      }
    });
  }

  confirmUnsubscribe(): void {
    if (this.subscriptionToUnsubscribe) {
      const currentUser = this.tokenService.getCurrentUser();
      if (!currentUser || !currentUser.userId) {
        this.error = 'User not authenticated. Please log in again.';
        return;
      }

      this.subscriptionService.unsubscribeFromEntity(
        this.subscriptionToUnsubscribe.entity.id!,
        currentUser.userId
      ).subscribe({
        next: () => {
          console.log(`Unsubscribed from ${this.subscriptionToUnsubscribe!.entity.name}`);
          this.loadUserSubscriptions(); // Reload subscriptions
          this.closeUnsubscribeConfirm();
        },
        error: (error) => {
          console.error('Error unsubscribing from entity:', error);
          this.error = 'Failed to unsubscribe. Please try again later.';
        }
      });
    }
  }

  closeUnsubscribeConfirm(): void {
    this.showUnsubscribeConfirm = false;
    this.subscriptionToUnsubscribe = null;
  }

  getStatusBadgeClass(subscription: SubscribedEntity): string {
    return subscription.active ? 'status-active' : 'status-inactive';
  }

  getStatusText(subscription: SubscribedEntity): string {
    return subscription.active ? 'Active' : 'Inactive';
  }

  gotoEntities(): void {
    //this.router.navigate(['/dashboard/villager']);
    this.router.navigate(['/entities']);
  }
   goBack(): void {
    this.router.navigate(['/dashboard']);
    
  }

  getEntityTypes(): string[] {
    const types = [...new Set(this.userSubscriptions.map(sub => sub.entity.type))];
    return types;
  }

  getSubscriptionsByType(type: string): SubscribedEntity[] {
    return this.userSubscriptions.filter(sub => sub.entity.type === type);
  }

  getTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'MRO_OFFICE': '🏛️',
      'HEALTHCARE': '🏥',
      'EDUCATION': '🎓',
      'SERVICES': '🔧',
      'PUBLIC': '🏛️',
      'COMMERCIAL': '🏪',
      'RELIGIOUS': '⛪',
      'GOVERNMENT': '🏛️'
    };
    return iconMap[type] || '🏢';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }
}
