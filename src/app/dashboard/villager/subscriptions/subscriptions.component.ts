import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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

  allEntities: Entity[] = [];
  entitiesByType: { [key: string]: Entity[] } = {};
  subscribedEntities: Entity[] = [];
  showUnsubscribeConfirm = false;
  entityToUnsubscribe: Entity | null = null;
  isLoading = false;
  error: string | null = null;
  expandedEntities: Set<string> = new Set();

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities(): void {
    this.isLoading = true;
    this.error = null;

    this.http.get<Entity[]>('http://192.168.1.4:8081/auth-service/api/entities/all').subscribe({
      next: (entities) => {
        this.allEntities = entities.filter(entity => entity.active);
        this.groupEntitiesByType();
        this.loadSubscribedEntities();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading entities:', error);
        this.error = 'Failed to load entities. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  groupEntitiesByType(): void {
    this.entitiesByType = {};

    this.allEntities.forEach(entity => {
      if (!this.entitiesByType[entity.type]) {
        this.entitiesByType[entity.type] = [];
      }
      this.entitiesByType[entity.type].push(entity);
    });
  }

  loadSubscribedEntities(): void {
    // For now, assume all entities are subscribed (you can modify this logic)
    // In a real app, you'd check subscription status from an API
    this.subscribedEntities = this.allEntities.filter(entity => entity.subscriptionCount > 0);
  }

  toggleSubscription(entity: Entity): void {
    if (entity.subscriptionCount > 0) {
      // Show confirmation dialog for unsubscribe
      this.entityToUnsubscribe = entity;
      this.showUnsubscribeConfirm = true;
    } else {
      // Subscribe to entity
      this.subscribeToEntity(entity);
    }
  }

  subscribeToEntity(entity: Entity): void {
    // Here you would call an API to subscribe
    console.log(`Subscribing to ${entity.name}`);
    entity.subscriptionCount += 1;
    this.loadSubscribedEntities();
  }

  confirmUnsubscribe(): void {
    if (this.entityToUnsubscribe) {
      // Here you would call an API to unsubscribe
      console.log(`Unsubscribing from ${this.entityToUnsubscribe.name}`);
      this.entityToUnsubscribe.subscriptionCount -= 1;
      this.loadSubscribedEntities();
      this.closeUnsubscribeConfirm();
    }
  }

  closeUnsubscribeConfirm(): void {
    this.showUnsubscribeConfirm = false;
    this.entityToUnsubscribe = null;
  }

  getStatusBadgeClass(entity: Entity): string {
    if (entity.status === 'OPEN' && (entity.availableSlots || 0) > 0) {
      return 'status-available';
    } else if (entity.status === 'OPEN' && (entity.availableSlots || 0) === 0) {
      return 'status-full';
    } else {
      return 'status-closed';
    }
  }

  getStatusText(entity: Entity): string {
    if (entity.status === 'OPEN' && (entity.availableSlots || 0) > 0) {
      return `Available (${entity.availableSlots} slots)`;
    } else if (entity.status === 'OPEN' && (entity.availableSlots || 0) === 0) {
      return 'Full';
    } else {
      return 'Closed';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/villager']);
  }

  getEntityTypes(): string[] {
    return Object.keys(this.entitiesByType);
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

  formatTime(time: string): string {
    if (!time) return 'N/A';
    try {
      // Assuming time is in HH:mm:ss format
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const min = minutes || '00';
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${min} ${period}`;
    } catch (error) {
      return time;
    }
  }

  toggleEntityExpansion(entity: Entity): void {
    const entityId = entity.id;
    if (this.expandedEntities.has(entityId)) {
      this.expandedEntities.delete(entityId);
    } else {
      this.expandedEntities.add(entityId);
    }
  }

  isEntityExpanded(entity: Entity): boolean {
    return this.expandedEntities.has(entity.id);
  }

  getExpandIconClass(entity: Entity): string {
    return this.isEntityExpanded(entity) ? 'expanded' : 'collapsed';
  }
}
