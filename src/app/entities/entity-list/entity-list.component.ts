import { Component, OnInit } from '@angular/core';
import { EntityService, Entity, EntityStatus, EntityType } from '../services/entity.service';
import { EntitySubscriptionService } from '../services/entity-subscription.service';
import { UsersService, User } from 'src/app/users/users.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.scss']
})
export class EntityListComponent implements OnInit {

  // Stats
  totalEntities: number = 0;
  activeEntities: number = 0;
  inactiveEntities: number = 0;
  entitiesByStatus: { [key: string]: number } = {};

  // Search and Filter
  searchTerm: string = '';
  typeFilter: string = 'all';
  statusFilter: string = 'all';

  // Data
  entities: Entity[] = [];
  filteredEntities: Entity[] = [];
  entityTypes = Object.values(EntityType);
  entityStatuses = Object.values(EntityStatus);
  users: User[] = [];

  // Modal
  showModal: boolean = false;
  isEditMode: boolean = false;
  formData: any = {
    name: '',
    description: '',
    type: '',
    openingTime: '',
    closingTime: '',
    status: EntityStatus.OPEN,
    address: '',
    contactNumber: '',
    email: '',
    capacity: null,
    owner: null
  };

  // Current user for ownership
  currentUser: User | null = null;

  constructor(
    private entityService: EntityService,
    private subscriptionService: EntitySubscriptionService,
    private usersService: UsersService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUsers();
    this.loadEntities();
  }

  loadUsers(): void {
    const tokenUser = this.tokenService.getCurrentUser();
    console.log(JSON.stringify(tokenUser));

    if (tokenUser && tokenUser.userId) {
      // First get the full user details to access village information
      this.usersService.getUserById(tokenUser.userId).subscribe({
        next: (userDetails) => {
          console.log('User details:', userDetails);
          if (userDetails.village?.id) {
            // Now fetch users by village using the user's village ID
            this.usersService.getUsersByVillage(userDetails.village.id, 'VILLAGER').subscribe({
              next: (users) => {
                this.users = users;
                console.log('Loaded users:', users.length);
              },
              error: (error) => {
                console.error('Error loading users by village:', error);
                this.users = [];
              }
            });
          } else {
            console.warn('User has no village information');
            this.users = [];
          }
        },
        error: (error) => {
          console.error('Error loading user details:', error);
          this.users = [];
        }
      });
    }
  }

  loadCurrentUser(): void {
    // Try to get current user from token or API
    // For now, we'll assume we can get it from the users service
    const tokenUser = this.tokenService.getCurrentUser();
    if (tokenUser && tokenUser.userId) {
      this.usersService.getUserById(tokenUser.userId).subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (error) => {
          console.error('Error loading current user:', error);
        }
      });
    }
  }

  loadEntities(): void {
    this.entityService.getAllEntities().subscribe({
      next: (data) => {
        this.entities = data;
        this.updateStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading entities:', err);
        this.entities = [];
        this.updateStats();
        this.applyFilters();
      }
    });
  }

  updateStats(): void {
    this.totalEntities = this.entities.length;
    this.activeEntities = this.entities.filter(e => e.isActive).length;
    this.inactiveEntities = this.entities.filter(e => !e.isActive).length;

    // Count by status
    this.entitiesByStatus = {};
    this.entityStatuses.forEach(status => {
      this.entitiesByStatus[status] = this.entities.filter(e => e.status === status).length;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.entities];

    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(entity =>
        entity.name.toLowerCase().includes(search) ||
        (entity.description && entity.description.toLowerCase().includes(search)) ||
        entity.type.toLowerCase().includes(search) ||
        (entity.owner?.name && entity.owner.name.toLowerCase().includes(search)) ||
        (entity.villageName && entity.villageName.toLowerCase().includes(search))
      );
    }

    // Apply type filter
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(entity => entity.type === this.typeFilter);
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(entity => entity.status === this.statusFilter);
    }

    this.filteredEntities = filtered;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.formData = {
      name: '',
      description: '',
      type: '',
      openingTime: '',
      closingTime: '',
      status: EntityStatus.OPEN,
      address: '',
      contactNumber: '',
      email: '',
      capacity: null,
      isActive: true,
      owner: null
    };
    this.showModal = true;
  }

  openEditModal(entity: Entity): void {
    this.isEditMode = true;
    this.formData = {
      ...entity,
      openingTime: entity.openingTime ? new Date(`1970-01-01T${entity.openingTime}`).toTimeString().slice(0, 5) : '',
      closingTime: entity.closingTime ? new Date(`1970-01-01T${entity.closingTime}`).toTimeString().slice(0, 5) : '',
      // Ensure owner is set correctly for editing
      owner: entity.owner?.id || entity.owner || null
    };
    console.log('Edit modal opened with form data:', this.formData);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveEntity(): void {
    console.log('Form data before submission:', this.formData);
    console.log('Owner value:', this.formData.owner);
    console.log('Owner type:', typeof this.formData.owner);
    console.log('Users array length:', this.users.length);

    if (!this.formData.owner || this.formData.owner === '') {
      alert('Please select an owner for the entity');
      console.log('Owner validation failed - no owner selected');
      return;
    }

    // Try different owner formats for backend compatibility
    const entityData1 = {
      ...this.formData,
      owner: { id: this.formData.owner }
    };

    const entityData2 = {
      ...this.formData,
      owner: this.formData.owner  // Just the ID as string
    };

    const entityData3 = {
      ...this.formData,
      ownerId: this.formData.owner  // Maybe backend expects ownerId field
    };
    // Try format 1 first (object with id)
    this.tryCreateEntity(entityData1);
  }

  tryCreateEntity(entityData: any): void {
    if (this.isEditMode && this.formData.id) {
      // Update existing entity
      this.entityService.updateEntity(this.formData.id, entityData).subscribe({
        next: () => {
          this.loadEntities();
          this.closeModal();
          alert('Entity updated successfully!');
        },
        error: (err) => {
          console.error('Error with current format, trying alternative format:', err);
          // If this fails, try a different format
          if (err.error?.message?.includes('owner')) {
            this.tryAlternativeFormat(entityData);
          } else {
            alert('Failed to update entity: ' + (err.error?.message || err.message));
          }
        }
      });
    } else {
      // Create new entity
      this.entityService.createEntity(entityData).subscribe({
        next: () => {
          this.loadEntities();
          this.closeModal();
          alert('Entity created successfully!');
        },
        error: (err) => {
          console.error('Error with current format, trying alternative format:', err);
          // If this fails, try a different format
          if (err.error?.message?.includes('owner')) {
            this.tryAlternativeFormat(entityData);
          } else {
            alert('Failed to create entity: ' + (err.error?.message || err.message));
          }
        }
      });
    }
  }

  tryAlternativeFormat(originalData: any): void {
    // Try with just the owner ID as string
    const alternativeData = {
      ...originalData,
      owner: originalData.owner.id || originalData.owner
    };

    console.log('Trying alternative format:', JSON.stringify(alternativeData, null, 2));

    if (this.isEditMode && this.formData.id) {
      this.entityService.updateEntity(this.formData.id, alternativeData).subscribe({
        next: () => {
          this.loadEntities();
          this.closeModal();
          alert('Entity updated successfully!');
        },
        error: (err) => {
          console.error('Alternative format also failed:', err);
          alert('Failed to save entity. Please check the console for details.');
        }
      });
    } else {
      this.entityService.createEntity(alternativeData).subscribe({
        next: () => {
          this.loadEntities();
          this.closeModal();
          alert('Entity created successfully!');
        },
        error: (err) => {
          console.error('Alternative format also failed:', err);
          alert('Failed to save entity. Please check the console for details.');
        }
      });
    }
  }


  deleteEntity(entityId: string): void {
    if (confirm('Are you sure you want to delete this entity?')) {
      this.entityService.deleteEntity(entityId).subscribe({
        next: () => {
          this.loadEntities();
          alert('Entity deleted successfully!');
        },
        error: (err) => {
          console.error('Error deleting entity:', err);
          alert('Failed to delete entity');
        }
      });
    }
  }

  toggleEntityStatus(entity: Entity): void {
    const newStatus = entity.isActive ? EntityStatus.CLOSED : EntityStatus.OPEN;
    this.entityService.updateEntityStatus(entity.id!, newStatus).subscribe({
      next: () => {
        this.loadEntities();
        alert(`Entity ${entity.isActive ? 'deactivated' : 'activated'} successfully!`);
      },
      error: (err) => {
        console.error('Error toggling entity status:', err);
        alert('Failed to update entity status');
      }
    });
  }

  getStatusBadgeClass(status: EntityStatus): string {
    switch (status) {
      case EntityStatus.OPEN:
        return 'status-badge active';
      case EntityStatus.CLOSED:
        return 'status-badge inactive';
      case EntityStatus.UNDER_MAINTENANCE:
        return 'status-badge warning';
      case EntityStatus.TEMPORARILY_CLOSED:
        return 'status-badge warning';
      case EntityStatus.PERMANENTLY_CLOSED:
        return 'status-badge danger';
      default:
        return 'status-badge';
    }
  }

  getStatusText(status: EntityStatus): string {
    return status.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case EntityType.GOVT_HOSPITAL:
        return '🏥';
      case EntityType.SHOP:
        return '🏪';
      case EntityType.MRO_OFFICE:
        return '🏛️';
      case EntityType.POLICE_STATION:
        return '🚓';
      case EntityType.POST_OFFICE:
        return '📮';
      case EntityType.SCHOOL:
        return '🏫';
      case EntityType.BANK:
        return '🏦';
      case EntityType.PHARMACY:
        return '💊';
      case EntityType.COMMUNITY_CENTER:
        return '🏘️';
      default:
        return '🏢';
    }
  }

  getSubscriptionCount(entity: Entity): number {
    return entity.subscriptionCount || 0;
  }

  formatEntityType(type: string): string {
    return type.replace(/_/g, ' ');
  }
}