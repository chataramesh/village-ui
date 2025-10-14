import { Component, OnInit } from '@angular/core';
import { EventService, Event } from '../event.service';

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
    isActive: true
  };

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
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
    this.activeEvents = this.events.filter(event => event.isActive).length;

    const now = new Date();
    this.upcomingEvents = this.events.filter(event =>
      new Date(event.startTime) > now && event.isActive
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
      isActive: true
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
          alert('Event updated successfully!');
        },
        error: (err) => {
          console.error('Error updating event:', err);
          alert('Failed to update event: ' + (err.error?.message || err.message));
        }
      });
    } else {
      // Create new event
      this.eventService.createEvent(this.formData).subscribe({
        next: () => {
          this.loadEvents();
          this.closeModal();
          alert('Event created successfully!');
        },
        error: (err) => {
          console.error('Error creating event:', err);
          alert('Failed to create event: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  deleteEvent(eventId: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          this.loadEvents();
          alert('Event deleted successfully!');
        },
        error: (err) => {
          console.error('Error deleting event:', err);
          alert('Failed to delete event');
        }
      });
    }
  }

  toggleEventStatus(event: Event): void {
    this.eventService.toggleEventStatus(event.id!).subscribe({
      next: () => {
        this.loadEvents();
        alert(`Event ${event.isActive ? 'deactivated' : 'activated'} successfully!`);
      },
      error: (err) => {
        console.error('Error toggling event status:', err);
        alert('Failed to update event status');
      }
    });
  }

  getStatusBadgeClass(event: Event): string {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    if (!event.isActive) {
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

    if (!event.isActive) {
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
}
