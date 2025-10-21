import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { IncidentService } from '../incident.service';
import {
  Incident,
  IncidentStatus,
  IncidentPriority,
  IncidentCategory,
  LocationType,
  DashboardSummary,
  IncidentFilters
} from '../types/incident.types';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-incident-list',
  templateUrl: './incident-list.component.html',
  styleUrls: ['./incident-list.component.scss']
})
export class IncidentListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  dashboardSummary?: DashboardSummary;
  loading = true;
  error: string | null = null;

  // Filter properties
  selectedStatus: IncidentStatus | '' = '';
  selectedCategory: IncidentCategory | '' = '';
  selectedPriority: IncidentPriority | '' = '';
  selectedLocationType: LocationType | '' = '';
  searchQuery = '';

  // Enum arrays for template
  statuses = Object.values(IncidentStatus);
  categories = Object.values(IncidentCategory);
  priorities = Object.values(IncidentPriority);
  locationTypes = Object.values(LocationType);

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // User permissions
  currentUser: any = null;
  canCreateIncidents = false;
  canEditAnyIncident = false;

  constructor(
    private incidentService: IncidentService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    console.log('IncidentListComponent: Initializing...');
    this.initializeEnums();
    this.checkUserPermissions();
    this.loadDashboardSummary();
    this.loadIncidents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeEnums(): void {
    this.statuses = Object.values(IncidentStatus);
    this.categories = Object.values(IncidentCategory);
    this.priorities = Object.values(IncidentPriority);
    this.locationTypes = Object.values(LocationType);
  }

  private checkUserPermissions(): void {
    const tokenUser = this.tokenService.getCurrentUser();
    if (tokenUser) {
      this.currentUser = tokenUser;
      const userRole = tokenUser.role || '';

      // Admins can create and edit any incident
      if (userRole === 'VILLAGE_ADMIN' || userRole === 'SUPER_ADMIN') {
        this.canCreateIncidents = true;
        this.canEditAnyIncident = true;
      } else {
        // Villagers can only create incidents and edit their own
        this.canCreateIncidents = true; // Villagers can create incidents
        this.canEditAnyIncident = false; // But can only edit their own
      }
    } else {
      this.canCreateIncidents = false;
      this.canEditAnyIncident = false;
    }
  }

  loadDashboardSummary(): void {
    this.incidentService.getDashboardSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.dashboardSummary = summary;
        },
        error: (error) => {
          console.log('Error loading dashboard summary:', error);
        }
      });
  }

  loadIncidents(): void {
    this.loading = true;
    this.error = null;

    const filters: IncidentFilters = {};

    if (this.selectedStatus) filters.status = this.selectedStatus as IncidentStatus;
    if (this.selectedCategory) filters.category = this.selectedCategory as IncidentCategory;
    if (this.selectedPriority) filters.priority = this.selectedPriority as IncidentPriority;
    if (this.selectedLocationType) filters.locationType = this.selectedLocationType as LocationType;
    if (this.searchQuery.trim()) filters.search = this.searchQuery.trim();

    this.incidentService.getAllIncidents(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (incidents) => {
          this.incidents = incidents;
          this.filteredIncidents = incidents;
          this.totalItems = incidents.length;
          this.loading = false;
          this.applyPagination();
        },
        error: (error) => {
          console.log('Error loading incidents:', error);
          this.error = 'Failed to load incidents. Please try again.';
          this.loading = false;
          // Don't show white screen - show error message instead
          this.incidents = [];
          this.filteredIncidents = [];
          this.totalItems = 0;
        }
      });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadIncidents();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.selectedPriority = '';
    this.selectedLocationType = '';
    this.searchQuery = '';
    this.loadIncidents();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyPagination();
  }

  private applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredIncidents = this.incidents.slice(startIndex, endIndex);
  }

  getStatusDisplayName(status: IncidentStatus): string {
    return this.incidentService.getStatusDisplayName(status);
  }

  getPriorityDisplayName(priority: IncidentPriority): string {
    return this.incidentService.getPriorityDisplayName(priority);
  }

  getCategoryDisplayName(category: IncidentCategory): string {
    return this.incidentService.getCategoryDisplayName(category);
  }

  getPriorityColor(priority: IncidentPriority): string {
    return this.incidentService.getPriorityColor(priority);
  }

  getStatusColor(status: IncidentStatus): string {
    return this.incidentService.getStatusColor(status);
  }

  navigateToCreate(): void {
    this.router.navigate(['/incidents/create']);
  }

  navigateToEdit(incidentId: string): void {
    this.router.navigate(['/incidents/edit', incidentId]);
  }

  updateStatus(incident: Incident, newStatus: string): void {
    if (confirm(`Are you sure you want to change status to "${this.getStatusDisplayName(newStatus as IncidentStatus)}"?`)) {
      this.incidentService.updateIncidentStatus(incident.id!, newStatus as IncidentStatus)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedIncident) => {
            // Update local incident
            const index = this.incidents.findIndex(i => i.id === incident.id);
            if (index !== -1) {
              this.incidents[index] = updatedIncident;
              this.loadIncidents(); // Refresh to update filters
            }
          },
          error: (error) => {
            console.error('Error updating incident status:', error);
            alert('Failed to update incident status. Please try again.');
          }
        });
    }
  }

  deleteIncident(incident: Incident): void {
    if (confirm('Are you sure you want to delete this incident? This action cannot be undone.')) {
      this.incidentService.deleteIncident(incident.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.incidents = this.incidents.filter(i => i.id !== incident.id);
            this.loadIncidents(); // Refresh to update counts
            alert('Incident deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting incident:', error);
            alert('Failed to delete incident. Please try again.');
          }
        });
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  isCurrentUserOwner(incident: Incident): boolean {
    return this.currentUser?.userId === incident.reportedBy;
  }

  canEditIncident(incident: Incident): boolean {
    // Admins can edit any incident, villagers can only edit their own
    return this.canEditAnyIncident || this.isCurrentUserOwner(incident);
  }

  canDeleteIncident(incident: Incident): boolean {
    // Admins can delete any incident, villagers can only delete their own
    return this.canEditAnyIncident || this.isCurrentUserOwner(incident);
  }

  getPagesArray(): number[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.currentPage;
    const pages: number[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, 6, totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, totalPages);
      }
    }

    return pages;
  }
}
