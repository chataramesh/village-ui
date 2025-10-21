import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TokenService } from 'src/app/core/services/token.service';
import { UsersService } from 'src/app/users/users.service';
import { VehicleService } from '../services/vehicle.service';
import { Vehicle, VehicleType, WheelerType } from '../models/vehicle.model';

@Component({
  selector: 'app-vehicle-create',
  templateUrl: './vehicle-create.component.html',
  styleUrls: ['./vehicle-create.component.scss']
})
export class VehicleCreateComponent implements OnInit {
  vehicleForm: FormGroup;
  isEditMode = false;
  vehicleId: string | null = null;
  loading = false;
  submitting = false;

  vehicleTypes = Object.values(VehicleType);
  wheelerTypes = Object.values(WheelerType);

  // User and village data
  currentUser: any = null;
  villages: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private tokenService: TokenService,
    private usersService: UsersService
  ) {
    this.vehicleForm = this.fb.group({
      vehicleNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/)]],
      vehicleType: ['', Validators.required],
      wheelerType: ['', Validators.required],
      vehicleDescription: [''],
      seatingCapacity: [0, [Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadVillages();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.vehicleId = params['id'];
        this.loadVehicle(params['id']);
      }
    });
  }

  loadCurrentUser(): void {
    const tokenUser = this.tokenService.getCurrentUser();
    if (tokenUser) {
      this.currentUser = tokenUser;
      this.usersService.getUserById(tokenUser.userId!).subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (error) => {
          console.error('Error loading current user:', error);
        }
      });
    }
  }

  loadVillages(): void {
    // For now, use static villages - in real app, you'd fetch from API
    this.villages = [
      { id: 'v1', name: 'Green Valley Village' },
      { id: 'v2', name: 'Riverside Village' },
      { id: 'v3', name: 'Mountain View Village' }
    ];
  }

  loadVehicle(id: string): void {
    this.loading = true;
    this.vehicleService.getVehicleById(id).subscribe({
      next: (vehicle) => {
        this.vehicleForm.patchValue({
          vehicleNumber: vehicle.vehicleNumber,
          vehicleType: vehicle.vehicleType,
          wheelerType: vehicle.wheelerType,
          vehicleDescription: vehicle.vehicleDescription,
          seatingCapacity: vehicle.seatingCapacity,
          isActive: vehicle.isActive
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading vehicle:', error);
        alert('Failed to load vehicle data');
        this.loading = false;
        this.router.navigate(['/vehicles']);
      }
    });
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid || this.submitting) return;

    this.submitting = true;
    const formData = this.vehicleForm.value;

    // Add owner and village information
    const vehicleData = {
      ...formData,
      owner: {
        id: this.currentUser?.id
      },
      village: {
        id: this.currentUser?.village?.id || 'v1'
      }
    };

    if (this.isEditMode && this.vehicleId) {
      // Update existing vehicle
      this.vehicleService.updateVehicle(this.vehicleId, vehicleData).subscribe({
        next: (response) => {
          alert('Vehicle updated successfully!');
          this.router.navigate(['/vehicles']);
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error updating vehicle:', error);
          alert('Failed to update vehicle');
          this.submitting = false;
        }
      });
    } else {
      // Create new vehicle
      this.vehicleService.createVehicle(vehicleData).subscribe({
        next: (response) => {
          alert('Vehicle registered successfully!');
          this.router.navigate(['/vehicles']);
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating vehicle:', error);
          alert('Failed to register vehicle');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/vehicles']);
  }

  // Helper method to format vehicle number for display
  formatVehicleNumber(): string {
    const number = this.vehicleForm.get('vehicleNumber')?.value || '';
    if (number.length >= 10) {
      return `${number.substring(0, 2)}-${number.substring(2, 4)}-${number.substring(4, 6)}-${number.substring(6, 10)}`;
    }
    return number;
  }
}
