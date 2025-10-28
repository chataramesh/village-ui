import { Component, OnInit } from '@angular/core';
import { DistrictService, District } from '../services/district.service';
import { StateService, State } from '../services/state.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-district-list',
  templateUrl: './district-list.component.html',
  styleUrls: ['./district-list.component.scss']
})
export class DistrictListComponent implements OnInit {
  
  // Stats
  totalDistricts: number = 0;
  activeDistricts: number = 0;
  inactiveDistricts: number = 0;

  // Search
  searchTerm: string = '';

  // Data
  districts: District[] = [];
  filteredDistricts: District[] = [];
  states: State[] = [];

  // Modal
  showModal: boolean = false;
  isEditMode: boolean = false;
  formData: any = {
    name: '',
    state: { id: '', name: '' }
  };

  constructor(
    private districtService: DistrictService,
    private stateService: StateService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadStates();
    this.loadDistricts();
  }

  loadStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (data) => {
        this.states = data;
      },
      error: (err) => {
        console.error('Error loading states:', err);
      }
    });
  }

  loadDistricts(): void {
    this.districtService.getAllDistricts().subscribe({
      next: (data) => {
        this.districts = data;
        this.updateStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading districts:', err);
        this.districts = [];
        this.updateStats();
        this.applyFilters();
      }
    });
  }

  updateStats(): void {
    this.totalDistricts = this.districts.length;
    this.activeDistricts = this.districts.filter(district => district.active).length;
    this.inactiveDistricts = this.districts.filter(district => !district.active).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.districts];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(district =>
        district.name.toLowerCase().includes(search) ||
        district.state.name.toLowerCase().includes(search)
      );
    }

    this.filteredDistricts = filtered;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.formData = {
      name: '',
      state: { id: '', name: '' }
    };
    this.showModal = true;
  }

  openEditModal(district: District): void {
    this.isEditMode = true;
    this.formData = { ...district };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveDistrict(): void {
    if (this.isEditMode && this.formData.id) {
      // Update existing district
      this.districtService.updateDistrict(this.formData.id, this.formData).subscribe({
        next: () => {
          this.loadDistricts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating district:', err);
          this.toast.error('Failed to update district');
        }
      });
    } else {
      // Create new district
      this.districtService.createDistrict(this.formData).subscribe({
        next: () => {
          this.loadDistricts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating district:', err);
          this.toast.error('Failed to create district');
        }
      });
    }
  }

  deleteDistrict(districtId: string): void {
    if (confirm('Are you sure you want to delete this district?')) {
      this.districtService.deleteDistrict(districtId).subscribe({
        next: () => {
          this.loadDistricts();
        },
        error: (err) => {
          console.error('Error deleting district:', err);
          this.toast.error('Failed to delete district');
        }
      });
    }
  }
}
