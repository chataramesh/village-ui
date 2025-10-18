import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EntityService } from 'src/app/entities/services/entity.service';

interface Entity {
  id: string;
  name: string;
  type: string;
  villageId: string;
  ownerName: string;
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
export class VillagerEntityListComponent implements OnInit {

  entities: Entity[] = [];
  filteredEntities: Entity[] = [];
  loading = true;
  error = '';

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

  constructor(private router: Router, private http: HttpClient, private entityService: EntityService) {}

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities() {
    this.loading = true;
    this.error = '';

    this.entityService.getAllEntities().subscribe({
      next: (data:any) => {
        this.entities = data.map((entity:any) => ({
          ...entity,
          isSubscribed: Math.random() > 0.5 // Mock subscription status
        }));
        this.filteredEntities = [...this.entities];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading entities:', error);
        this.error = 'Failed to load entities. Please try again later.';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredEntities = this.entities.filter(entity => {
      const matchesVillage = !this.selectedVillage || entity.villageId === this.selectedVillage;
      const matchesType = !this.selectedEntityType || entity.type === this.selectedEntityType;
      const matchesSubscription = !this.showSubscribedOnly || entity.isSubscribed;

      return matchesVillage && matchesType && matchesSubscription;
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

  subscribeToEntity(entity: Entity) {
    entity.isSubscribed = true;
    this.applyFilters();
    // TODO: Call API to subscribe
    console.log('Subscribing to entity:', entity.name);
  }

  unsubscribeFromEntity(entity: Entity) {
    entity.isSubscribed = false;
    this.applyFilters();
    // TODO: Call API to unsubscribe
    console.log('Unsubscribing from entity:', entity.name);
  }

  goBack() {
    this.router.navigate(['/dashboard/villager']);
  }

  clearFilters() {
    this.selectedVillage = '';
    this.selectedEntityType = '';
    this.showSubscribedOnly = false;
    this.applyFilters();
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
}
