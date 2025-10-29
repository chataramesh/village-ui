import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { VehicleService } from '../services/vehicle.service';
import { TokenService } from 'src/app/core/services/token.service';
import { Vehicle, VehicleType, WheelerType, VehicleFilters } from '../models/vehicle.model';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss']
})
export class VehicleListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  loading = true;
  error = '';

  // Filter options
  selectedVehicleType = '';
  selectedWheelerType = '';
  showActiveOnly = true;
  searchQuery = '';

  // Dropdown options
  vehicleTypes = Object.values(VehicleType);
  wheelerTypes = Object.values(WheelerType);

  // User permissions
  currentUser: any = null;
  canCreateVehicles = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private tokenService: TokenService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadVehicles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCurrentUser(): void {
    const tokenUser = this.tokenService.getCurrentUser();
    if (tokenUser) {
      this.currentUser = tokenUser;
      // For now, allow all authenticated users to create vehicles
      // In a real app, you might want to restrict this to certain roles
      this.canCreateVehicles = true;
    }
  }

  loadVehicles(): void {
    this.loading = true;
    this.error = '';

    const filters: VehicleFilters = {
      active: this.showActiveOnly
    };

    if (this.selectedVehicleType) {
      filters.vehicleType = this.selectedVehicleType as VehicleType;
    }

    if (this.selectedWheelerType) {
      filters.wheelerType = this.selectedWheelerType as WheelerType;
    }

    if (this.searchQuery.trim()) {
      filters.search = this.searchQuery.trim();
    }

    this.vehicleService.getAllVehicles(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (vehicles) => {
          this.vehicles = vehicles;
          this.filteredVehicles = vehicles;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading vehicles:', error);
          this.error = 'Failed to load vehicles. Please try again later.';
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredVehicles = this.vehicles.filter(vehicle => {
      const matchesType = !this.selectedVehicleType || vehicle.vehicleType === this.selectedVehicleType;
      const matchesWheeler = !this.selectedWheelerType || vehicle.wheelerType === this.selectedWheelerType;
      const matchesActive = !this.showActiveOnly || vehicle.active;
      const matchesSearch = !this.searchQuery || 
        vehicle.vehicleNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        vehicle.vehicleDescription?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        vehicle.owner?.name?.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesType && matchesWheeler && matchesActive && matchesSearch;
    });
    this.currentPage = 1;
  }

  onVehicleTypeChange(): void {
    this.applyFilters();
  }

  onWheelerTypeChange(): void {
    this.applyFilters();
  }

  onActiveFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedVehicleType = '';
    this.selectedWheelerType = '';
    this.showActiveOnly = true;
    this.searchQuery = '';
    this.applyFilters();
  }

  navigateToCreate(): void {
    this.router.navigate(['/vehicles/create']);
  }

  editVehicle(vehicle: Vehicle): void {
    this.router.navigate(['/vehicles/edit', vehicle.id]);
  }

  bookVehicle(vehicle: Vehicle): void {
    this.toast.info(`Booking flow for ${vehicle.vehicleNumber} will be implemented soon`);
    // Future implementation could navigate to: this.router.navigate(['/vehicles/book', vehicle.id]);
  }

  viewVehicleDetails(vehicle: Vehicle): void {
    // this.router.navigate(['/vehicles', vehicle.id]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/villager']);
  }

  refresh(): void {
    this.loadVehicles();
  }

  getVehicleTypeIcon(vehicleType: VehicleType): string {
    const icons: { [key: string]: string } = {
      'CAR': '🚗',
      'MOTORCYCLE': '🏍️',
      'SCOOTER': '🛵',
      'TRUCK': '🚛',
      'BUS': '🚌',
      'AUTO_RICKSHAW': '🛺',
      'TRACTOR': '🚜',
      'VAN': '🚐',
      'SUV': '🚙',
      'AMBULANCE': '🚑',
      'FIRE_TRUCK': '🚒',
      'POLICE_VEHICLE': '🚓',
      'TAXI': '🚕',
      'SCHOOL_BUS': '🚌'
    };
    return icons[vehicleType] || '🚗';
  }

  getWheelerTypeLabel(wheelerType: WheelerType): string {
    return wheelerType.replace('_', ' ').toLowerCase();
  }

  isCurrentUserOwner(vehicle: Vehicle): boolean {
    return this.currentUser?.userId === vehicle.owner?.id;
  }

  canEditDelete(vehicle: Vehicle): boolean {
    const role = this.currentUser?.role;
    if (role === 'SUPER_ADMIN') return true;
    // Owner can edit/delete their own vehicles
    if (this.isCurrentUserOwner(vehicle)) return true;
    if (role === 'VILLAGE_ADMIN') {
      const userVillageId = this.currentUser?.village?.id;
      const vehicleVillageId = vehicle?.village?.id || (vehicle as any)?.villageId || null;
      return !!userVillageId && userVillageId === vehicleVillageId;
    }
    return false;
  }

  deleteVehicle(vehicle: Vehicle): void {
    if (!this.canEditDelete(vehicle)) return;
    if (!confirm(`Are you sure you want to delete ${vehicle.vehicleNumber}?`)) return;

    this.vehicleService.deleteVehicle(vehicle.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Vehicle deleted successfully');
          this.loadVehicles();
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
          this.toast.error('Failed to delete vehicle');
        }
      });
  }

  get paginatedVehicles(): Vehicle[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredVehicles.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVehicles.length / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  getPagesArray(): number[] {
    const totalPages = this.totalPages;
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
