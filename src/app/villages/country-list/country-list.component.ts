import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CountryService, Country } from '../services/country.service';

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
    name: ''
  };

  constructor(
    private router: Router,
    private countryService: CountryService
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
    this.activeCountries = this.countries.length; // All countries are considered active
    this.inactiveCountries = 0;
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
      name: ''
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
          alert('Failed to update country');
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
          alert('Failed to create country');
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

  deleteCountry(countryId: string): void {
    if (confirm('Are you sure you want to delete this country?')) {
      this.countryService.deleteCountry(countryId).subscribe({
        next: () => {
          this.loadCountries();
        },
        error: (err) => {
          console.error('Error deleting country:', err);
          alert('Failed to delete country');
        }
      });
    }
  }
}
