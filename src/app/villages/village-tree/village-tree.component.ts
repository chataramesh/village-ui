import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Village {
  id: string;
  name: string;
  mandal: string;
  district: string;
  state: string;
  country: string;
  isActive: boolean;
  createdDate: Date;
}

@Component({
  selector: 'app-village-tree',
  templateUrl: './village-tree.component.html',
  styleUrls: ['./village-tree.component.scss']
})
export class VillageTreeComponent implements OnInit {
  
  // Stats
  totalVillages: number = 0;
  activeVillages: number = 0;
  totalDistricts: number = 0;

  // Search and Filter
  searchTerm: string = '';
  stateFilter: string = 'all';
  districtFilter: string = 'all';

  // Villages Data
  villages: Village[] = [];
  filteredVillages: Village[] = [];

  // Filter Options
  states: string[] = [];
  districts: string[] = [];

  // Expanded Row
  expandedVillageId: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadVillages();
  }

  loadVillages(): void {
    // Mock data - Replace with actual API call
    this.villages = [
      {
        id: 'VIL001',
        name: 'Greenfield Village',
        mandal: 'Greenfield Mandal',
        district: 'Central District',
        state: 'Telangana',
        country: 'India',
        isActive: true,
        createdDate: new Date('2024-01-15')
      },
      {
        id: 'VIL002',
        name: 'Riverside Village',
        mandal: 'Riverside Mandal',
        district: 'East District',
        state: 'Telangana',
        country: 'India',
        isActive: true,
        createdDate: new Date('2024-02-20')
      },
      {
        id: 'VIL003',
        name: 'Hillside Village',
        mandal: 'Hillside Mandal',
        district: 'West District',
        state: 'Andhra Pradesh',
        country: 'India',
        isActive: true,
        createdDate: new Date('2024-03-10')
      },
      {
        id: 'VIL004',
        name: 'Lakeside Village',
        mandal: 'Lakeside Mandal',
        district: 'North District',
        state: 'Karnataka',
        country: 'India',
        isActive: false,
        createdDate: new Date('2024-04-05')
      },
      {
        id: 'VIL005',
        name: 'Mountain View Village',
        mandal: 'Mountain Mandal',
        district: 'Central District',
        state: 'Telangana',
        country: 'India',
        isActive: true,
        createdDate: new Date('2024-05-12')
      },
      {
        id: 'VIL006',
        name: 'Sunset Village',
        mandal: 'Sunset Mandal',
        district: 'South District',
        state: 'Andhra Pradesh',
        country: 'India',
        isActive: true,
        createdDate: new Date('2024-06-18')
      }
    ];

    this.updateStats();
    this.extractFilterOptions();
    this.applyFilters();
  }

  updateStats(): void {
    this.totalVillages = this.villages.length;
    this.activeVillages = this.villages.filter(v => v.isActive).length;
    
    // Count unique districts
    const uniqueDistricts = new Set(this.villages.map(v => v.district));
    this.totalDistricts = uniqueDistricts.size;
  }

  extractFilterOptions(): void {
    // Extract unique states
    this.states = [...new Set(this.villages.map(v => v.state))].sort();
    
    // Extract unique districts
    this.districts = [...new Set(this.villages.map(v => v.district))].sort();
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
        village.name.toLowerCase().includes(search) ||
        village.mandal.toLowerCase().includes(search) ||
        village.district.toLowerCase().includes(search)
      );
    }

    // Apply state filter
    if (this.stateFilter !== 'all') {
      filtered = filtered.filter(village => village.state === this.stateFilter);
    }

    // Apply district filter
    if (this.districtFilter !== 'all') {
      filtered = filtered.filter(village => village.district === this.districtFilter);
    }

    this.filteredVillages = filtered;
  }

  toggleVillageDetails(villageId: string): void {
    this.expandedVillageId = this.expandedVillageId === villageId ? null : villageId;
  }

  navigateToCreate(): void {
    this.router.navigate(['/villages/create']);
  }

  editVillage(villageId: string): void {
    console.log('Edit village:', villageId);
    this.router.navigate(['/villages/edit', villageId]);
  }

  deleteVillage(villageId: string): void {
    console.log('Delete village:', villageId);
    if (confirm('Are you sure you want to delete this village?')) {
      this.villages = this.villages.filter(v => v.id !== villageId);
      this.updateStats();
      this.extractFilterOptions();
      this.applyFilters();
    }
  }
}
