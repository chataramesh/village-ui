import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UsersService, Role, User } from '../users.service';
import { VillagesService } from 'src/app/villages/services/villages.service';

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
    village: { id: '', name: '' },
    isActive: true
  };

  villages: Village[] = [];
  availableRoles: Role[] = [];
  contextRole: Role | null = null;
  showVillageDropdown: boolean = false;
  showPassword: boolean = false;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  userId: string | null = null;

  // Hierarchical location data
  countries: any[] = [];
  states: any[] = [];
  districts: any[] = [];
  mandals: any[] = [];

  // Selected location IDs
  selectedCountryId: string = '';
  selectedStateId: string = '';
  selectedDistrictId: string = '';
  selectedMandalId: string = '';
  selectedVillageId: string = '';

  // Expose Role enum to template
  Role = Role;

  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private usersService: UsersService,
    private villagesService: VillagesService
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

  getCreateButtonText(): string {
    if (this.contextRole === Role.VILLAGE_ADMIN) {
      return 'Create Village Admin';
    } else if (this.contextRole === Role.VILLAGER) {
      return 'Create Villager';
    }
    return 'Create User';
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
        return 'Create Village Admin';
      } else if (this.contextRole === Role.VILLAGER) {
        return 'Create Villager';
      }
      return 'Create User';
    }
  }

  loadUser(userId: string): void {
    this.http.get<User>(`${this.apiUrl}/users/${userId}`).subscribe({
      next: (data) => {
        this.user = { ...data };
        console.log("data==> "+JSON.stringify(data));
        console.log('User loaded:', data);
        console.log('User role:', this.user.role);

        // Trigger role change logic after loading user
        this.onRoleChange();

        // If user has village data in edit mode, populate location hierarchy and set selections
        if (this.isEditMode && this.user.village && this.user.village.id && this.showVillageDropdown) {
          console.log('Edit mode: Loading location hierarchy and setting selections');
          this.loadCountriesForEdit();
        }

        console.log('showVillageDropdown after load:', this.showVillageDropdown);
      },
      error: (error) => {
        console.error('Error loading user:', error);
        alert('Failed to load user data');
      }
    });
  }

  // Enhanced method to load countries and set selections for edit mode
  loadCountriesForEdit(): void {
    this.villagesService.getCoutries().subscribe({
      next: (data) => {
        this.countries = data;
        console.log('Countries loaded for edit:', this.countries);

        // Set the user's country selection
        if (this.user.village?.mandal?.district?.state?.country?.id) {
          this.selectedCountryId = this.user.village.mandal.district.state.country.id;
          console.log('Set country selection:', this.selectedCountryId);

          // Load states for the selected country
          setTimeout(() => {
            this.loadStatesForEdit();
          }, 100);
        }
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        // Even with error, try to continue with mock data
        this.countries = [
          { id: '1', name: 'India' }
        ];
        console.log('Using fallback countries');

        // Try to set country selection even with fallback data
        if (this.user.village?.mandal?.district?.state?.country?.id) {
          this.selectedCountryId = this.user.village.mandal.district.state.country.id;
          setTimeout(() => {
            this.loadStatesForEdit();
          }, 100);
        }
      }
    });
  }

  // Enhanced method to load states and set selections for edit mode
  loadStatesForEdit(): void {
    if (this.selectedCountryId) {
      this.villagesService.getStatesByCountry(this.selectedCountryId).subscribe({
        next: (data) => {
          this.states = data;
          console.log('States loaded for edit:', this.states);

          // Set the user's state selection
          if (this.user.village?.mandal?.district?.state?.id) {
            this.selectedStateId = this.user.village.mandal.district.state.id;
            console.log('Set state selection:', this.selectedStateId);

            // Load districts for the selected state
            setTimeout(() => {
              this.loadDistrictsForEdit();
            }, 100);
          }
        },
        error: (error) => {
          console.error('Error loading states:', error);
          this.states = [
            { id: '1', name: 'Telangana', country: { id: '1', name: 'India' } }
          ];

          if (this.user.village?.mandal?.district?.state?.id) {
            this.selectedStateId = this.user.village.mandal.district.state.id;
            setTimeout(() => {
              this.loadDistrictsForEdit();
            }, 100);
          }
        }
      });
    }
  }

  // Enhanced method to load districts and set selections for edit mode
  loadDistrictsForEdit(): void {
    if (this.selectedStateId) {
      this.villagesService.getDistrictsByState(this.selectedStateId).subscribe({
        next: (data) => {
          this.districts = data;
          console.log('Districts loaded for edit:', this.districts);

          // Set the user's district selection
          if (this.user.village?.mandal?.district?.id) {
            this.selectedDistrictId = this.user.village.mandal.district.id;
            console.log('Set district selection:', this.selectedDistrictId);

            // Load mandals for the selected district
            setTimeout(() => {
              this.loadMandalsForEdit();
            }, 100);
          }
        },
        error: (error) => {
          console.error('Error loading districts:', error);
          this.districts = [
            { id: '1', name: 'Hyderabad', state: { id: '1', name: 'Telangana' } }
          ];

          if (this.user.village?.mandal?.district?.id) {
            this.selectedDistrictId = this.user.village.mandal.district.id;
            setTimeout(() => {
              this.loadMandalsForEdit();
            }, 100);
          }
        }
      });
    }
  }

  // Enhanced method to load mandals and set selections for edit mode
  loadMandalsForEdit(): void {
    if (this.selectedDistrictId) {
      this.villagesService.getMandalsByDistrict(this.selectedDistrictId).subscribe({
        next: (data) => {
          this.mandals = data;
          console.log('Mandals loaded for edit:', this.mandals);

          // Set the user's mandal selection
          if (this.user.village?.mandal?.id) {
            this.selectedMandalId = this.user.village.mandal.id;
            console.log('Set mandal selection:', this.selectedMandalId);

            // Load villages for the selected mandal
            setTimeout(() => {
              this.loadVillagesForEdit();
            }, 100);
          }
        },
        error: (error) => {
          console.error('Error loading mandals:', error);
          this.mandals = [
            { id: '1', name: 'Mandal 1', district: { id: '1', name: 'Hyderabad' } }
          ];

          if (this.user.village?.mandal?.id) {
            this.selectedMandalId = this.user.village.mandal.id;
            setTimeout(() => {
              this.loadVillagesForEdit();
            }, 100);
          }
        }
      });
    }
  }

  // Enhanced method to load villages and set selections for edit mode
  loadVillagesForEdit(): void {
    if (this.selectedMandalId) {
      this.villagesService.getVillagesByMandal(this.selectedMandalId).subscribe({
        next: (data) => {
          this.villages = data;
          console.log('Villages loaded for edit:', this.villages);

          // Set the user's village selection
          if (this.user.village?.id) {
            this.selectedVillageId = this.user.village.id;
            console.log('Set village selection:', this.selectedVillageId);
          }
        },
        error: (error) => {
          console.error('Error loading villages:', error);
          this.villages = [
            { id: '1', name: 'Village 1' },
            { id: '2', name: 'Village 2' }
          ];

          if (this.user.village?.id) {
            this.selectedVillageId = this.user.village.id;
          }
        }
      });
    }
  }

  loadCountries(): void {
    this.villagesService.getCoutries().subscribe({
      next: (data) => {
        this.countries = data;
        console.log('Countries loaded:', this.countries);
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        // Fallback to mock data for testing
        console.log('Using fallback countries:', this.countries);
      }
    });
  }

  // Helper method for edit mode state loading
  loadStatesForEditMode(): void {
    if (this.selectedCountryId) {
      this.loadStates(this.selectedCountryId);
    }
  }

  loadStates(countryId: string): void {
    console.log('Loading states for country ID:', countryId);
    this.villagesService.getStatesByCountry(countryId).subscribe({
      next: (data) => {
        this.states = data;
        this.districts = []; // Reset dependent fields
        this.mandals = [];
        this.villages = [];
        this.selectedStateId = '';
        this.selectedDistrictId = '';
        this.selectedMandalId = '';
        this.selectedVillageId = '';

        console.log('States loaded:', this.states);
      },
      error: (error) => {
        console.error('Error loading states:', error);
        // Fallback to mock data
        this.states = [
          { id: '1', name: 'Telangana', country: { id: '1', name: 'India' } },
          { id: '2', name: 'Andhra Pradesh', country: { id: '1', name: 'India' } }
        ];
      }
    });
  }

  // Helper method for edit mode district loading (legacy - not used in new implementation)
  loadDistrictsForEditMode(): void {
    if (this.selectedStateId) {
      this.loadDistricts(this.selectedStateId);
    }
  }

  loadDistricts(stateId: string): void {
    this.villagesService.getDistrictsByState(stateId).subscribe({
      next: (data) => {
        this.districts = data;
        this.mandals = []; // Reset dependent fields
        this.villages = [];
        this.selectedDistrictId = '';
        this.selectedMandalId = '';
        this.selectedVillageId = '';

        console.log('Districts loaded:', this.districts);
      },
      error: (error) => {
        console.error('Error loading districts:', error);
        // Fallback to mock data
        this.districts = [
          { id: '1', name: 'Hyderabad', state: { id: '1', name: 'Telangana' } },
          { id: '2', name: 'Warangal', state: { id: '1', name: 'Telangana' } }
        ];
      }
    });
  }

  loadMandals(districtId: string): void {
    this.villagesService.getMandalsByDistrict(districtId).subscribe({
      next: (data) => {
        this.mandals = data;
        this.villages = []; // Reset dependent fields
        this.selectedMandalId = '';
        this.selectedVillageId = '';

        console.log('Mandals loaded:', this.mandals);
      },
      error: (error) => {
        console.error('Error loading mandals:', error);
        // Fallback to mock data
        this.mandals = [
          { id: '1', name: 'Mandal 1', district: { id: '1', name: 'Hyderabad' } },
          { id: '2', name: 'Mandal 2', district: { id: '1', name: 'Hyderabad' } }
        ];
      }
    });
  }

  // Helper method for edit mode village loading
  loadVillagesForEditMode(): void {
    if (this.selectedMandalId) {
      this.loadVillagesByMandal(this.selectedMandalId);
    }
  }

  loadVillagesByMandal(mandalId: string): void {
    this.villagesService.getVillagesByMandal(mandalId).subscribe({
      next: (data) => {
        this.villages = data;
        this.selectedVillageId = '';
      },
      error: (error) => {
        console.error('Error loading villages:', error);
        // Fallback to mock data
        this.villages = [
          { id: '1', name: 'Village 1' },
          { id: '2', name: 'Village 2' },
          { id: '3', name: 'Village 3' }
        ];
      }
    });
  }

  onRoleChange(): void {
    console.log('Role changed to:', this.user.role);
    this.showVillageDropdown =
      this.user.role === Role.VILLAGER || this.user.role === Role.VILLAGE_ADMIN;

    console.log('showVillageDropdown:', this.showVillageDropdown);

    if (!this.showVillageDropdown) {
      this.user.village = { id: '', name: '' };
      // Reset all location selections
      this.selectedCountryId = '';
      this.selectedStateId = '';
      this.selectedDistrictId = '';
      this.selectedMandalId = '';
      this.selectedVillageId = '';
      this.countries = [];
      this.states = [];
      this.districts = [];
      this.mandals = [];
      this.villages = [];
    } else {
      // Load countries when village dropdown should be shown
      this.loadCountries();
    }
  }


  // Hierarchical location change handlers
  onCountryChange(): void {
    console.log('Country changed - selectedCountryId:', this.selectedCountryId);
    console.log('Available countries:', this.countries);
    console.log('Selected country object:', this.countries.find(c => c.id === this.selectedCountryId));

    if (this.selectedCountryId) {
      this.loadStates(this.selectedCountryId);
    } else {
      this.states = [];
      this.districts = [];
      this.mandals = [];
      this.selectedStateId = '';
      this.selectedDistrictId = '';
      this.selectedMandalId = '';
    }
  }

  onStateChange(): void {
    if (this.selectedStateId) {
      this.loadDistricts(this.selectedStateId);
    } else {
      this.districts = [];
      this.mandals = [];
      this.selectedDistrictId = '';
      this.selectedMandalId = '';
    }
  }

  onDistrictChange(): void {
    if (this.selectedDistrictId) {
      this.loadMandals(this.selectedDistrictId);
    } else {
      this.mandals = [];
      this.villages = [];
      this.selectedMandalId = '';
      this.selectedVillageId = '';
    }
  }

  onMandalChange(): void {
    if (this.selectedMandalId) {
      this.loadVillagesByMandal(this.selectedMandalId);
      // Note: Don't set user.village here - only set it when actual village is selected
    } else {
      this.villages = [];
      this.selectedVillageId = '';
      this.user.village = { id: '', name: '' };
    }
  }

  onVillageChange(): void {
    if (this.selectedVillageId) {
      // Find the selected village to update the user.village object
      const selectedVillage = this.villages.find(v => v.id === this.selectedVillageId);
      if (selectedVillage) {
        this.user.village = { id: selectedVillage.id, name: selectedVillage.name };
      }
    } else {
      this.user.village = { id: '', name: '' };
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
          village: { id: '', name: '' },
          isActive: true
        };
        this.showVillageDropdown = false;
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
