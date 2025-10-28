import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CountryService, Country } from '../services/country.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss']
})
export class CountryListComponent implements OnInit {
  
  // Stats
  totalCountries: number = 0;
  activeCountries: number = 0;
  inactiveCountries: number = 0;

  // Search
  searchTerm: string = '';

  // Data
  countries: Country[] = [];
  filteredCountries: Country[] = [];

  // Modal
  showModal: boolean = false;
  isEditMode: boolean = false;
  formData: Country = {
    name: '',
    active: true
  };

  // Delete confirm modal state
  showDeleteConfirm: boolean = false;
  countryPendingDelete: Country | null = null;

  constructor(
    private router: Router,
    private countryService: CountryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.countryService.getAllCountries().subscribe({
      next: (data) => {
        this.countries = data;
        this.updateStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading countries:', err);
        // Fallback to empty array
        this.countries = [];
        this.updateStats();
        this.applyFilters();
      }
    });
  }

  updateStats(): void {
    this.totalCountries = this.countries.length;
    this.activeCountries = this.countries.filter(c => c.active).length;
    this.inactiveCountries = this.countries.filter(c => !c.active).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.countries];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(country =>
        country.name.toLowerCase().includes(search)
      );
    }

    this.filteredCountries = filtered;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.formData = {
      name: '',
      active: true
    };
    this.showModal = true;
  }

  openEditModal(country: Country): void {
    this.isEditMode = true;
    this.formData = { ...country };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCountry(): void {
    if (this.isEditMode && this.formData.id) {
      // Update existing country
      this.countryService.updateCountry(this.formData.id, this.formData).subscribe({
        next: () => {
          this.loadCountries();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating country:', err);
          this.toast.error('Failed to update country');
        }
      });
    } else {
      // Create new country
      this.countryService.createCountry(this.formData).subscribe({
        next: () => {
          this.loadCountries();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating country:', err);
          this.toast.error('Failed to create country');
        }
      });
    }
  }

  editCountry(countryId: string): void {
    const country = this.countries.find(c => c.id === countryId);
    if (country) {
      this.openEditModal(country);
    }
  }

  openDeleteConfirm(country: Country): void {
    this.countryPendingDelete = country;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.countryPendingDelete = null;
  }

  confirmDelete(): void {
    if (!this.countryPendingDelete?.id) {
      this.cancelDelete();
      return;
    }
    const id = this.countryPendingDelete.id;
    this.countryService.deleteCountry(id).subscribe({
      next: () => {
        this.toast.success('Country deleted successfully');
        this.showDeleteConfirm = false;
        this.countryPendingDelete = null;
        this.loadCountries();
      },
      error: (err) => {
        console.error('Error deleting country:', err);
        this.toast.error('Failed to delete country');
        this.showDeleteConfirm = false;
        this.countryPendingDelete = null;
      }
    });
  }
}
