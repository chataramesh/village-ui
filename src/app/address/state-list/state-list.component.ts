import { Component, OnInit } from '@angular/core';
import { StateService, State } from '../services/state.service';
import { CountryService, Country } from '../services/country.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-state-list',
  templateUrl: './state-list.component.html',
  styleUrls: ['./state-list.component.scss']
})
export class StateListComponent implements OnInit {
  
  // Stats
  totalStates: number = 0;
  activeStates: number = 0;
  inactiveStates: number = 0;

  // Search
  searchTerm: string = '';

  // Data
  states: State[] = [];
  filteredStates: State[] = [];
  countries: Country[] = [];

  // Modal
  showModal: boolean = false;
  isEditMode: boolean = false;
  formData: any = {
    name: '',
    country: { id: '', name: '' }
  };

  constructor(
    private stateService: StateService,
    private countryService: CountryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadStates();
  }

  loadCountries(): void {
    this.countryService.getAllCountries().subscribe({
      next: (data) => {
        this.countries = data;
      },
      error: (err) => {
        console.error('Error loading countries:', err);
      }
    });
  }

  loadStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (data) => {
        this.states = data;
        this.updateStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.states = [];
        this.updateStats();
        this.applyFilters();
      }
    });
  }

  updateStats(): void {
    this.totalStates = this.states.length;

      this.activeStates = this.states.filter(c => c.active).length;
    this.inactiveStates = this.states.filter(c => !c.active).length;
  
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.states];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(state =>
        state.name.toLowerCase().includes(search) ||
        state.country.name.toLowerCase().includes(search)
      );
    }

    this.filteredStates = filtered;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.formData = {
      name: '',
      country: { id: '', name: '' }
    };
    this.showModal = true;
  }

  openEditModal(state: State): void {
    this.isEditMode = true;
    this.formData = { ...state };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveState(): void {
    if (this.isEditMode && this.formData.id) {
      // Update existing state
      this.stateService.updateState(this.formData.id, this.formData).subscribe({
        next: () => {
          this.loadStates();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating state:', err);
          this.toast.error('Failed to update state');
        }
      });
    } else {
      // Create new state
      this.stateService.createState(this.formData).subscribe({
        next: () => {
          this.loadStates();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating state:', err);
          this.toast.error('Failed to create state');
        }
      });
    }
  }

  deleteState(stateId: string): void {
    if (confirm('Are you sure you want to delete this state?')) {
      this.stateService.deleteState(stateId).subscribe({
        next: () => {
          this.loadStates();
        },
        error: (err) => {
          console.error('Error deleting state:', err);
          this.toast.error('Failed to delete state');
        }
      });
    }
  }
}
