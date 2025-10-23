import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EntityService } from 'src/app/entities/services/entity.service';
import { EntitySubscriptionService } from 'src/app/entities/services/entity-subscription.service';
import { WebSocketNotificationService } from 'src/app/core/services/websocket-notification.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UsersService } from 'src/app/users/users.service';
import { Subject, takeUntil } from 'rxjs';

interface Entity {
  id: string;
  name: string;
  type: string;
  villageId: string;
  ownerName: string;
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  availableSlots: number;
  isSubscribed?: boolean;
}

@Component({
  selector: 'app-villager-entity-list',
  templateUrl: './villager-entity-list.component.html',
  styleUrls: ['./villager-entity-list.component.scss']
})
export class VillagerEntityListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  entities: Entity[] = [];
  filteredEntities: Entity[] = [];
  loading = true;
  error = '';

  // Search functionality
  searchQuery = '';

  // Filter options
  selectedVillage = '';
  selectedEntityType = '';
  showSubscribedOnly = false;

  // Villages for filter dropdown
  villages = [
    { id: 'v1', name: 'Green Valley Village' },
    { id: 'v2', name: 'Riverside Village' },
    { id: 'v3', name: 'Mountain View Village' }
  ];

  // Entity types for filter dropdown
  entityTypes = [
    'Healthcare',
    'Education',
    'Essential Services',
    'Public Facility',
    'Transportation',
    'Recreation',
    'Religious',
    'Government'
  ];

  // Subscription tracking
  userSubscriptions: { [entityId: string]: boolean } = {};
  subscriptionLoading: { [entityId: string]: boolean } = {};
  currentUser: any = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private entityService: EntityService,
    private subscriptionService: EntitySubscriptionService,
    private notificationService: WebSocketNotificationService,
    private tokenService: TokenService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadEntities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCurrentUser(): void {
    // Try to get current user from token or API
    const tokenUser = this.tokenService.getCurrentUser();
    console.log('Token user data:', tokenUser);

    if (tokenUser && tokenUser.userId) {
      console.log('Loading user details for ID:', tokenUser.userId);
      this.usersService.getUserById(tokenUser.userId).subscribe({
        next: (user) => {
          console.log('Successfully loaded current user:', user);
          this.currentUser = user;
          // Load user subscriptions after current user is loaded
          this.loadUserSubscriptions();
        },
        error: (error) => {
          console.error('Error loading current user:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
        }
      });
    } else {
      console.warn('No token user found - user not logged in');
    }
  }

  loadEntities() {
    this.loading = true;
    this.error = '';

    // Try to load from API first
    this.entityService.getAllEntities().subscribe({
      next: (data: any) => {
        console.log('Entities loaded successfully from API:', data);
        this.processEntitiesData(data);
      },
      error: (error) => {
        console.error('Error loading entities from API:', error);
        console.log('Loading mock data for testing...');
        // Load mock data for testing when API is not available
      }
    });
  }

  private processEntitiesData(data: any) {
    console.log('Processing entities data:', data);

    if (data && data.length > 0) {
      this.entities = data.map((entity: any) => ({
        ...entity,
        isSubscribed: false, // Initialize as not subscribed
        isOpen: entity.status === 'OPEN' || entity.isActive,
        ownerName: entity.owner?.name || 'Unknown Owner'
      }));
    } else {
      // No data from API, load mock data
      console.log('No data from API, loading mock data...');
      return;
    }

    console.log('Mapped entities:', this.entities);
    this.filteredEntities = [...this.entities];
    this.loading = false;

    // Subscribe to updates for all loaded entities
    this.entities.forEach(entity => {
      this.notificationService.subscribeToEntityUpdates(entity.id);
    });

    // Load user subscriptions after entities are loaded (only if current user is loaded)
    if (this.currentUser?.id) {
      this.loadUserSubscriptions();
    }
  }

  // Search functionality
  onSearchChange() {
    console.log('Search changed:', this.searchQuery);
    console.log('Current entities count:', this.entities.length);
    this.applyFilters();
  }

  clearSearch() {
    console.log('Clearing search');
    this.searchQuery = '';
    this.applyFilters();
  }

  // Enhanced filter application with search
  applyFilters() {
    console.log('Applying filters...');
    console.log('Search query:', this.searchQuery);
    console.log('Before filter - entities count:', this.entities.length);

    this.filteredEntities = this.entities.filter(entity => {
      // Search filter
      const matchesSearch = !this.searchQuery ||
        entity.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        entity.ownerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        entity.type.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesVillage = !this.selectedVillage || entity.villageId === this.selectedVillage;
      const matchesType = !this.selectedEntityType || entity.type === this.selectedEntityType;
      const matchesSubscription = !this.showSubscribedOnly || entity.isSubscribed;

      const result = matchesSearch && matchesVillage && matchesType && matchesSubscription;
      if (!matchesSearch && this.searchQuery) {
        console.log('Entity filtered out by search:', entity.name, 'Query:', this.searchQuery);
      }

      return result;
    });

    console.log('After filter - filtered entities count:', this.filteredEntities.length);
    console.log('Active filters:', {
      searchQuery: this.searchQuery,
      selectedVillage: this.selectedVillage,
      selectedEntityType: this.selectedEntityType,
      showSubscribedOnly: this.showSubscribedOnly
    });
  }

  onVillageFilterChange() {
    this.applyFilters();
  }

  onTypeFilterChange() {
    this.applyFilters();
  }

  onSubscriptionFilterChange() {
    this.applyFilters();
  }

  goBack() {
    this.router.navigate(['/dashboard/villager']);
  }

  clearFilters() {
    console.log('Clearing all filters...');
    console.log('Before clear - active filters:', {
      searchQuery: this.searchQuery,
      selectedVillage: this.selectedVillage,
      selectedEntityType: this.selectedEntityType,
      showSubscribedOnly: this.showSubscribedOnly,
      hasActiveFilters: this.hasActiveFilters
    });

    this.selectedVillage = '';
    this.selectedEntityType = '';
    this.showSubscribedOnly = false;
    this.searchQuery = '';
    this.applyFilters();

    console.log('After clear - active filters:', {
      searchQuery: this.searchQuery,
      selectedVillage: this.selectedVillage,
      selectedEntityType: this.selectedEntityType,
      showSubscribedOnly: this.showSubscribedOnly,
      hasActiveFilters: this.hasActiveFilters
    });
  }

  viewEntityDetails(entity: Entity) {
    // TODO: Implement entity details modal or navigation
    console.log('Viewing entity details:', entity.name);
  }

  getVillageName(villageId: string): string {
    const village = this.villages.find(v => v.id === villageId);
    return village ? village.name : 'Unknown Village';
  }

  refresh() {
    this.loadEntities();
  }

  // Check if current user is the owner of the entity
  isCurrentUserOwner(entity: Entity): boolean {
    if (!this.currentUser?.id) return false;

    // Check if entity has owner object with ID
    if (entity.owner?.id) {
      return entity.owner.id === this.currentUser.id;
    }

    // Check if entity has ownerId field
    if (entity.ownerId) {
      return entity.ownerId === this.currentUser.id;
    }

    return false;
  }

  // Navigate to edit entity page
  editEntity(entity: Entity): void {
    this.router.navigate(['/entities/edit', entity.id], { replaceUrl: true });
  }

  // Subscription Methods
  subscribeToEntity(entity: Entity): void {
    if (!this.currentUser?.id) {
      alert('Please log in to subscribe to entities');
      console.error('Cannot subscribe - no current user');
      return;
    }

    console.log('Attempting to subscribe to entity:', entity.id, 'for user:', this.currentUser.id);
    this.subscriptionLoading[entity.id] = true;

    this.subscriptionService.subscribeToEntity(entity.id, this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subscription) => {
          console.log('Subscription successful:', subscription);
          this.userSubscriptions[entity.id] = true;
          entity.isSubscribed = true;
          this.subscriptionLoading[entity.id] = false;
          alert(`Successfully subscribed to ${entity.name}!`);
          this.applyFilters(); // Refresh filtered entities
        },
        error: (error) => {
          console.error('Error subscribing to entity:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          this.subscriptionLoading[entity.id] = false;

          // Provide more specific error messages
          if (error.status === 401) {
            alert('Authentication failed. Please log in again.');
          } else if (error.status === 404) {
            alert('Entity not found. Please refresh and try again.');
          } else if (error.status === 400) {
            alert('Already subscribed or invalid request. Please try again.');
          } else {
            alert('Failed to subscribe. Please check your connection and try again.');
          }
        }
      });
  }

  unsubscribeFromEntity(entity: Entity): void {
    if (!this.currentUser?.id) {
      alert('Please log in to unsubscribe from entities');
      console.error('Cannot unsubscribe - no current user');
      return;
    }

    if (!confirm(`Are you sure you want to unsubscribe from ${entity.name}?`)) {
      return;
    }

    console.log('Attempting to unsubscribe from entity:', entity.id, 'for user:', this.currentUser.id);
    this.subscriptionLoading[entity.id] = true;

    this.subscriptionService.unsubscribeFromEntity(entity.id, this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          console.log('Unsubscription successful:', message);
          this.userSubscriptions[entity.id] = false;
          entity.isSubscribed = false;
          this.subscriptionLoading[entity.id] = false;
          alert(message);
          this.applyFilters(); // Refresh filtered entities
        },
        error: (error) => {
          console.error('Error unsubscribing from entity:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          this.subscriptionLoading[entity.id] = false;

          // Provide more specific error messages
          if (error.status === 401) {
            alert('Authentication failed. Please log in again.');
          } else if (error.status === 404) {
            alert('Subscription not found. Please refresh and try again.');
          } else {
            alert('Failed to unsubscribe. Please check your connection and try again.');
          }
        }
      });
  }

  isUserSubscribed(entity: Entity): boolean {
    return this.userSubscriptions[entity.id] || false;
  }

  isSubscriptionLoading(entity: Entity): boolean {
    return this.subscriptionLoading[entity.id] || false;
  }

  loadUserSubscriptions(): void {
    if (!this.currentUser?.id) {
      console.log('Cannot load user subscriptions - no current user');
      return;
    }

    console.log('Loading user subscriptions for user:', this.currentUser.id);

    this.subscriptionService.getUserSubscriptions(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subscriptions) => {
          console.log('Loaded user subscriptions:', subscriptions.length, subscriptions);

          // Initialize subscription status for all entities
          this.entities.forEach(entity => {
            this.userSubscriptions[entity.id] = false;
            entity.isSubscribed = false;
          });

          // Set subscription status for subscribed entities
          subscriptions.forEach(sub => {
            this.userSubscriptions[sub.entityId] = sub.isActive;
            const entity = this.entities.find(e => e.id === sub.entityId);
            if (entity) {
              entity.isSubscribed = sub.isActive;
            }
          });

          console.log('Updated userSubscriptions:', this.userSubscriptions);
          this.applyFilters(); // Refresh filtered entities to show updated subscription status
        },
        error: (error) => {
          console.error('Error loading user subscriptions:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
        }
      });
  }

  // Helper methods for enhanced UI
  get hasActiveFilters(): boolean {
    const active = !!(this.searchQuery || this.selectedVillage || this.selectedEntityType || this.showSubscribedOnly);
    console.log('hasActiveFilters check:', {
      searchQuery: this.searchQuery,
      selectedVillage: this.selectedVillage,
      selectedEntityType: this.selectedEntityType,
      showSubscribedOnly: this.showSubscribedOnly,
      result: active
    });
    return active;
  }

  getOpenEntitiesCount(): number {
    return this.filteredEntities.filter(entity => entity.isOpen).length;
  }

  getSubscribedCount(): number {
    return this.filteredEntities.filter(entity => entity.isSubscribed).length;
  }

  isDesktopView(): boolean {
    return window.innerWidth >= 1024;
  }

  getEmptyStateMessage(): string {
    if (this.hasActiveFilters) {
      return 'No services match your current filters. Try adjusting your search or filters to find what you\'re looking for.';
    }
    return 'No services are available right now. Check back later or try searching in a different village.';
  }

  getEmptyStateTitle(): string {
    if (this.hasActiveFilters) {
      return 'No Services Found';
    }
    return 'No Services Available';
  }

  showFilterTips(): void {
    alert('💡 Filter Tips:\n\n• Use the search bar to find services by name\n• Filter by village to see local services\n• Filter by service type (Healthcare, Education, etc.)\n• Subscribe to services for updates\n• Clear filters to see all available services');
  }
}
