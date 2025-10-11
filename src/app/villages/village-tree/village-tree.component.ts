import { Component, OnInit } from '@angular/core';
import { MandalService, Mandal } from '../services/mandal.service';
import { VillagesService } from '../services/villages.service';
import { Village } from '../village-create/village-create.component';

@Component({
  selector: 'app-village-tree',
  templateUrl: './village-tree.component.html',
  styleUrls: ['./village-tree.component.scss']
})
export class VillageTreeComponent implements OnInit {
  
  // Stats
  totalVillages: number = 0;
  activeVillages: number = 0;
  inactiveVillages: number = 0;

  // Search and Filter
  searchTerm: string = '';
  stateFilter: string = 'all';
  districtFilter: string = 'all';

  // Villages Data
  villages: Village[] = [];
  filteredVillages: Village[] = [];
  mandals: Mandal[] = [];

  // Filter Options
  states: string[] = [];
  districts: string[] = [];

  // Expanded Row
  expandedVillageId: string | null = null;

  // Modal
  showModal: boolean = false;
  isEditMode: boolean = false;
  formData: any = {
    name: '',
    mandalId: '',
    isActive: true
  };

  constructor(
    private mandalService: MandalService,
    private villagesService: VillagesService
  ) {}

  ngOnInit(): void {
    this.loadMandals();
    this.loadVillages();
  }

  loadMandals(): void {
    this.mandalService.getAllMandals().subscribe({
      next: (data) => {
        this.mandals = data;
      },
      error: (err) => {
        console.error('Error loading mandals:', err);
      }
    });
  }

  loadVillages(): void {
    this.villagesService.getAllVillages().subscribe({
      next: (data) => {
        this.villages = data;
        this.updateStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading villages:', err);
        this.villages = [];
        this.updateStats();
        this.applyFilters();
      }
    });
  }

  updateStats(): void {
    this.totalVillages = this.villages.length;
    this.activeVillages = this.villages.filter(v => v.isActive).length;
    this.inactiveVillages = this.villages.filter(v => !v.isActive).length;
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
    let filtered = [...this.villages];

    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(village =>
        village.name.toLowerCase().includes(search)
      );
    }

    this.filteredVillages = filtered;
  }

  toggleVillageDetails(villageId: string): void {
    this.expandedVillageId = this.expandedVillageId === villageId ? null : villageId;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.formData = {
      name: '',
      mandalId: '',
      isActive: true
    };
    this.showModal = true;
  }

  openEditModal(village: Village): void {
    this.isEditMode = true;
    this.formData = {
      id: village.id,
      name: village.name,
      mandalId: village.mandal.id,
      isActive: village.isActive
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveVillage(): void {
    // Prepare payload with nested mandal object
    const payload = {
      name: this.formData.name,
      mandal: {
        id: this.formData.mandalId
      },
      isActive: this.formData.isActive
    };

    if (this.isEditMode && this.formData.id) {
      // Update existing village
      this.villagesService.updateVillage(this.formData.id, payload).subscribe({
        next: () => {
          this.loadVillages();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating village:', err);
          alert('Failed to update village');
        }
      });
    } else {
      // Create new village
      this.villagesService.createVillage(payload).subscribe({
        next: () => {
          this.loadVillages();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating village:', err);
          alert('Failed to create village');
        }
      });
    }
  }

  editVillage(village: Village): void {
    this.openEditModal(village);
  }

  deleteVillage(villageId: string): void {
    if (confirm('Are you sure you want to delete this village?')) {
      this.villagesService.deleteVillage(villageId).subscribe({
        next: () => {
          this.loadVillages();
        },
        error: (err) => {
          console.error('Error deleting village:', err);
          alert('Failed to delete village');
        }
      });
    }
  }

  toggleStatus(village: Village): void {
    village.isActive = !village.isActive;
    if (village.id) {
      const updateData = {
        name: village.name,
        mandal: {
          id: village.mandal.id
        },
        isActive: village.isActive
      };
      this.villagesService.updateVillage(village.id, updateData).subscribe({
        next: () => {
          this.updateStats();
        },
        error: (err) => {
          console.error('Error updating village status:', err);
          village.isActive = !village.isActive; // Revert on error
        }
      });
    }
  }

  // Helper method to get mandal name from village
  getMandalName(village: Village): string {
    return village.mandal?.name || 'N/A';
  }
}
