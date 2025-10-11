import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UsersService, Role, User } from '../users.service';
import { VillagesService } from 'src/app/villages/services/villages.service';
import { CountryService, Country } from 'src/app/villages/services/country.service';
import { StateService, State } from 'src/app/villages/services/state.service';
import { DistrictService, District } from 'src/app/villages/services/district.service';
import { MandalService, Mandal } from 'src/app/villages/services/mandal.service';

interface Village {
  id?: string;
  name: string;
}

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})
export class UserCreateComponent implements OnInit {

  user: any = {
    name: '',
    email: '',
    phone: '',
    passwordHash: '',
    role: '',
    village: '',
    isActive: true
  };

  // Dropdown options for cascading selection
  countries: Country[] = [];
  states: State[] = [];
  districts: District[] = [];
  mandals: Mandal[] = [];

  // Selected values for cascading dropdowns
  selectedCountryId: string = '';
  selectedStateId: string = '';
  selectedDistrictId: string = '';
  selectedMandalId: string = '';
  selectedVillageId: string = '';

  // Villages for the final dropdown
  availableVillages: any[] = [];

  availableRoles: Role[] = [];
  contextRole: Role | null = null;
  showVillageDropdown: boolean = false;
  showPassword: boolean = false;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  userId: string | null = null;

  // Expose Role enum to template
  Role = Role;

  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private usersService: UsersService,
    private villagesService: VillagesService,
    private countryService: CountryService,
    private stateService: StateService,
    private districtService: DistrictService,
    private mandalService: MandalService
  ) {}

  ngOnInit(): void {
    // Check for role context from query params
    this.route.queryParams.subscribe(params => {
      const roleParam = params['role'];
      if (roleParam) {
        this.contextRole = roleParam as Role;
        this.user.role = this.contextRole; // Pre-select role
      }
      this.setAvailableRoles();
    });

    // Check if we're in edit mode
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
    }

    // Load villages for dropdown (fallback when no mandal is selected)
    this.loadAllVillages();

    // Load countries for cascading dropdown
    this.loadCountries();
  }

  setAvailableRoles(): void {
    if (this.contextRole === Role.VILLAGE_ADMIN) {
      this.availableRoles = [Role.VILLAGE_ADMIN];
    } else if (this.contextRole === Role.VILLAGER) {
      this.availableRoles = [Role.VILLAGER];
    } else {
      // Show all roles if no context
      this.availableRoles = [Role.SUPER_ADMIN, Role.VILLAGE_ADMIN, Role.VILLAGER];
    }
  }

  getPageTitle(): string {
    if (this.isEditMode) {
      if (this.contextRole === Role.VILLAGE_ADMIN) {
        return 'Edit Village Admin';
      } else if (this.contextRole === Role.VILLAGER) {
        return 'Edit Villager';
      }
      return 'Edit User';
    } else {
      if (this.contextRole === Role.VILLAGE_ADMIN) {
        return 'Create New Village Admin';
      } else if (this.contextRole === Role.VILLAGER) {
        return 'Create New Villager';
      }
      return 'Create New User';
    }
  }

  getCreateButtonText(): string {
    if (this.contextRole === Role.VILLAGE_ADMIN) {
      return 'Create Admin';
    } else if (this.contextRole === Role.VILLAGER) {
      return 'Create Villager';
    }
    return 'Create User';
  }

  loadUser(userId: string): void {
    this.http.get<User>(`${this.apiUrl}/users/${userId}`).subscribe({
      next: (data) => {
        this.user = { ...data };
        this.onRoleChange(); // Update village dropdown visibility
      },
      error: (error) => {
        console.error('Error loading user:', error);
      }
    });
  }

  loadCountries(): void {
    this.countryService.getAllCountries().subscribe({
      next: (data) => {
        this.countries = data;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
      }
    });
  }

  loadStates(countryId: string): void {
    this.stateService.getStatesByCountry(countryId).subscribe({
      next: (data) => {
        this.states = data;
        // Clear dependent fields
        this.districts = [];
        this.mandals = [];
        this.availableVillages = [];
        this.selectedStateId = '';
        this.selectedDistrictId = '';
        this.selectedMandalId = '';
        this.selectedVillageId = '';
      },
      error: (error) => {
        console.error('Error loading states:', error);
      }
    });
  }

  loadDistricts(stateId: string): void {
    this.districtService.getDistrictsByState(stateId).subscribe({
      next: (data) => {
        this.districts = data;
        // Clear dependent fields
        this.mandals = [];
        this.availableVillages = [];
        this.selectedDistrictId = '';
        this.selectedMandalId = '';
        this.selectedVillageId = '';
      },
      error: (error) => {
        console.error('Error loading districts:', error);
      }
    });
  }

  loadMandals(districtId: string): void {
    this.mandalService.getMandalsByDistrict(districtId).subscribe({
      next: (data) => {
        this.mandals = data;
        // Clear dependent fields
        this.availableVillages = [];
        this.selectedMandalId = '';
        this.selectedVillageId = '';
      },
      error: (error) => {
        console.error('Error loading mandals:', error);
      }
    });
  }

  loadVillagesByMandal(mandalId: string): void {
    // Filter villages by mandal - this would need a service method
    // For now, we'll use a simple filter if we have all villages loaded
    this.villagesService.getAllVillages().subscribe({
      next: (data) => {
        this.availableVillages = data.filter((village: any) =>
          village.mandal && village.mandal.id === mandalId
        );
        this.selectedVillageId = '';
      },
      error: (error) => {
        console.error('Error loading villages:', error);
      }
    });
  }

  loadAllVillages(): void {
    // Replace with actual API call
    this.villagesService.getAllVillages().subscribe({
      next: (data) => {
        this.availableVillages = data;
      },
      error: (error) => {
        console.error('Error loading villages:', error);
        // Fallback to mock data
        this.availableVillages = [
          { id: '1', name: 'Village 1' },
          { id: '2', name: 'Village 2' },
          { id: '3', name: 'Village 3' }
        ];
      }
    });
  }

  onRoleChange(): void {
    // Show village dropdown only for VILLAGER and VILLAGE_ADMIN roles
    this.showVillageDropdown =
      this.user.role === 'VILLAGER' || this.user.role === 'VILLAGE_ADMIN';

    // Clear village if not needed
    if (!this.showVillageDropdown) {
      this.user.village = '';
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    if (this.isEditMode) {
      this.usersService.updateUser(this.userId!, this.user).subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          alert('User updated successfully!');
          this.isSubmitting = false;
          if (this.contextRole) {
            this.router.navigate(['/users'], {
              queryParams: { role: this.contextRole },
              replaceUrl: true
            });
          } else {
            this.router.navigate(['/users'], { replaceUrl: true });
          }
        },
        error: (error) => {
          console.error('Error updating user:', error);
          alert('Failed to update user');
          this.isSubmitting = false;
        }
      });

    } else {
      this.usersService.createUser(this.user).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          alert('User created successfully!');
          this.isSubmitting = false;
          if (this.contextRole) {
            this.router.navigate(['/users'], {
              queryParams: { role: this.contextRole },
              replaceUrl: true
            });
          } else {
            this.router.navigate(['/users'], { replaceUrl: true });
          }
        },
        error: (error) => {
          console.error('Error creating user:', error);
          alert('Failed to create user. Please try again.');
          this.isSubmitting = false;
        }
      });
    }

    // Mock success for testing (remove when API is ready)
    // setTimeout(() => {
    //   console.log('User data:', this.user);
    //   alert(this.isEditMode ? 'User updated successfully!' : 'User created successfully!');
    //   this.router.navigate(['/users']);
    // }, 1000);
  }

  onReset(): void {
    if (confirm('Are you sure you want to reset the form?')) {
      if (this.isEditMode && this.userId) {
        this.loadUser(this.userId);
      } else {
        this.user = {
          name: '',
          email: '',
          phone: '',
          passwordHash: '',
          role: '',
          village: '',
          isActive: true
        };
        this.showVillageDropdown = false;

        // Reset cascading dropdown selections
        this.selectedCountryId = '';
        this.selectedStateId = '';
        this.selectedDistrictId = '';
        this.selectedMandalId = '';
        this.selectedVillageId = '';

        // Clear dropdown options
        this.states = [];
        this.districts = [];
        this.mandals = [];
        this.availableVillages = [];
      }
    }
  }

  goBack(): void {
    if (this.contextRole) {
      this.router.navigate(['/users'], {
        queryParams: { role: this.contextRole },
        replaceUrl: true
      });
    } else {
      this.router.navigate(['/users'], { replaceUrl: true });
    }
  }
}
