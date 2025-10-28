import { Component, OnInit } from '@angular/core';
import { MandalService, Mandal } from '../services/mandal.service';
import { DistrictService, District } from '../services/district.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-mandal-list',
  templateUrl: './mandal-list.component.html',
  styleUrls: ['./mandal-list.component.scss']
})
export class MandalListComponent implements OnInit {
  
  // Stats
  totalMandals: number = 0;
  activeMandals: number = 0;
  inactiveMandals: number = 0;

  // Search
  searchTerm: string = '';

  // Data
  mandals: Mandal[] = [];
  filteredMandals: Mandal[] = [];
  districts: District[] = [];

  // Modal
  showModal: boolean = false;
  isEditMode: boolean = false;
  formData: any = {
    name: '',
    district: { id: '', name: '' }
  };

  constructor(
    private mandalService: MandalService,
    private districtService: DistrictService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadDistricts();
    this.loadMandals();
  }

  loadDistricts(): void {
    this.districtService.getAllDistricts().subscribe({
      next: (data) => {
        this.districts = data;
      },
      error: (err) => {
        console.error('Error loading districts:', err);
      }
    });
  }

  loadMandals(): void {
    this.mandalService.getAllMandals().subscribe({
      next: (data) => {
        this.mandals = data;
        this.updateStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading mandals:', err);
        this.mandals = [];
        this.updateStats();
        this.applyFilters();
      }
    });
  }

  updateStats(): void {
    this.totalMandals = this.mandals.length;
    this.activeMandals = this.mandals.filter(mandal => mandal.active).length;
    this.inactiveMandals = this.mandals.filter(mandal => !mandal.active).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.mandals];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(mandal =>
        mandal.name.toLowerCase().includes(search) ||
        mandal.district.name.toLowerCase().includes(search)
      );
    }

    this.filteredMandals = filtered;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.formData = {
      name: '',
      district: { id: '', name: '' }
    };
    this.showModal = true;
  }

  openEditModal(mandal: Mandal): void {
    this.isEditMode = true;
    this.formData = { ...mandal };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMandal(): void {
    if (this.isEditMode && this.formData.id) {
      // Update existing mandal
      this.mandalService.updateMandal(this.formData.id, this.formData).subscribe({
        next: () => {
          this.loadMandals();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating mandal:', err);
          this.toast.error('Failed to update mandal');
        }
      });
    } else {
      // Create new mandal
      this.mandalService.createMandal(this.formData).subscribe({
        next: () => {
          this.loadMandals();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating mandal:', err);
          this.toast.error('Failed to create mandal');
        }
      });
    }
  }

  deleteMandal(mandalId: string): void {
    if (confirm('Are you sure you want to delete this mandal?')) {
      this.mandalService.deleteMandal(mandalId).subscribe({
        next: () => {
          this.loadMandals();
        },
        error: (err) => {
          console.error('Error deleting mandal:', err);
          this.toast.error('Failed to delete mandal');
        }
      });
    }
  }
}
