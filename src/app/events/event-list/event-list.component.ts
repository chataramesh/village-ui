import { Component, OnInit } from '@angular/core';
import { EventService, Event } from '../event.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UsersService, User } from 'src/app/users/users.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {

  // Stats
  totalEvents: number = 0;
  activeEvents: number = 0;
  upcomingEvents: number = 0;
  pastEvents: number = 0;

  // Search
  searchTerm: string = '';

  // Data
  events: Event[] = [];
  filteredEvents: Event[] = [];

  // Modal
  showModal: boolean = false;
  isEditMode: boolean = false;
  formData: any = {
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    place: '',
    active: true,
    villageId: '',
    villageName: '',
    village: null
  };

  // Current user
  currentUser: User | null = null;

  constructor(
    private eventService: EventService,
    private toast: ToastService,
    private tokenService: TokenService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    const tokenUser = this.tokenService.getCurrentUser();
    if (tokenUser?.userId) {
      this.usersService.getUserById(tokenUser.userId).subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: () => {
          this.currentUser = null;
        }
      });
    }
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.updateStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.events = [];
        this.updateStats();
        this.applyFilters();
      }
    });
  }

  updateStats(): void {
    this.totalEvents = this.events.length;
    this.activeEvents = this.events.filter(event => event.active).length;

    const now = new Date();
    this.upcomingEvents = this.events.filter(event =>
      new Date(event.startTime) > now && event.active
    ).length;

    this.pastEvents = this.events.filter(event =>
      new Date(event.endTime) < now
    ).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.events];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search) ||
        event.place.toLowerCase().includes(search)
      );
    }

    this.filteredEvents = filtered;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.formData = {
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      place: '',
      active: true,
      villageId: this.currentUser?.village?.id || '',
      villageName: this.currentUser?.village?.name || ''
    };
    this.showModal = true;
  }

  openEditModal(event: Event): void {
    this.isEditMode = true;
    this.formData = { ...event };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveEvent(): void {
    if (this.isEditMode && this.formData.id) {
      // Update existing event
      this.eventService.updateEvent(this.formData.id, this.formData).subscribe({
        next: () => {
          this.loadEvents();
          this.closeModal();
          this.toast.success('Event updated successfully');
        },
        error: (err) => {
          console.error('Error updating event:', err);
          this.toast.error('Failed to update event');
        }
      });
    } else {
      // Create new event
      // Ensure village details are attached
      if (!this.formData.villageId && this.currentUser?.village?.id) {
        this.formData.villageId = this.currentUser.village.id;
        this.formData.villageName = this.currentUser.village.name;
      }
      this.formData.village = this.currentUser?.village;
      this.eventService.createEvent(this.formData).subscribe({
        next: () => {
          this.loadEvents();
          this.closeModal();
          this.toast.success('Event created successfully');
        },
        error: (err) => {
          console.error('Error creating event:', err);
          this.toast.error('Failed to create event');
        }
      });
    }
  }

  deleteEvent(eventId: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          this.loadEvents();
          this.toast.success('Event deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting event:', err);
          this.toast.error('Failed to delete event');
        }
      });
    }
  }

  toggleEventStatus(event: Event): void {
    this.eventService.toggleEventStatus(event.id!).subscribe({
      next: () => {
        this.loadEvents();
        this.toast.success(`Event ${event.active ? 'deactivated' : 'activated'} successfully`);
      },
      error: (err) => {
        console.error('Error toggling event status:', err);
        this.toast.error('Failed to update event status');
      }
    });
  }

  getStatusBadgeClass(event: Event): string {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    if (!event.active) {
      return 'status-badge inactive';
    } else if (startTime > now) {
      return 'status-badge upcoming';
    } else if (endTime < now) {
      return 'status-badge past';
    } else {
      return 'status-badge active';
    }
  }

  getStatusText(event: Event): string {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    if (!event.active) {
      return 'Inactive';
    } else if (startTime > now) {
      return 'Upcoming';
    } else if (endTime < now) {
      return 'Past';
    } else {
      return 'Ongoing';
    }
  }

  formatDateTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleString();
  }

  // RBAC: SUPER_ADMIN can edit/delete all; VILLAGE_ADMIN only within own village
  canEditDelete(event: Event): boolean {
    const role = this.currentUser?.role;
    if (role === 'SUPER_ADMIN') return true;
    if (role === 'VILLAGE_ADMIN') {
      const userVillageId = this.currentUser?.village?.id;
      const eventVillageId = (event as any)?.village?.id || (event as any)?.villageId || null;
      return !!userVillageId && userVillageId === eventVillageId;
    }
    return false;
  }
}
