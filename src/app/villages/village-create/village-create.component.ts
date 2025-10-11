import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { VillagesService } from '../services/villages.service';

export interface Village {
  id?: string;
  name: string;
  mandal: {
    id: string;
    name: string;
    district?: {
      id: string;
      name: string;
      state?: {
        id: string;
        name: string;
        country?: {
          id: string;
          name: string;
        };
      };
    };
  };
  isActive: boolean;  // Changed back to match backend
}

// For form submission
export interface VillageCreateRequest {
  name: string;
  mandalId: string;
  isActive: boolean;  // Changed back to match backend
}

export  interface Mandal {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

@Component({
  selector: 'app-village-create',
  templateUrl: './village-create.component.html',
  styleUrls: ['./village-create.component.scss']
})
export class VillageCreateComponent implements OnInit {
  
  
  // Dropdown options
  countries: Country[] = [];
  states: State[] = [];
  districts: District[] = [];
  mandals: Mandal[] = [];

  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  villageId: string | null = null;

  private apiUrl = environment.villageUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private villageService: VillagesService
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode
    this.villageId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.villageId;

    // Load countries on init
    this.loadCountries();

    if (this.isEditMode && this.villageId) {
      this.loadVillage(this.villageId);
    }
  }

  loadCountries(): void {
    this.villageService.getCoutries().subscribe({
      next: (data) => {
        this.countries = data;
      },
      error: (err) => {
        console.error('Error loading countries:', err);
      }
    });
  }

  loadVillage(villageId: string): void {
    
  }

  loadStates(countryId: string): void {
    this.villageService.getStatesByCountry(countryId).subscribe({
      next: (data) => {
        this.states = data;
      },
      error: (err) => {
        console.error('Error loading states:', err);
      }
    });
  }

  loadDistricts(stateId: string): void {
    this.villageService.getDistrictsByState(stateId).subscribe({
      next: (data) => {
        this.districts = data;
      },
      error: (err) => {
        console.error('Error loading districts:', err);
      }
    });
  }

  loadMandals(districtId: string): void {
    this.villageService.getMandalsByDistrict(districtId).subscribe({
      next: (data) => {
        this.mandals = data;
      },
      error: (err) => {
        console.error('Error loading mandals:', err);
      }
    });
  }

  onCountryChange(): void {
    // Reset dependent fields
   
   
  }

  onStateChange(): void {
    // Reset dependent fields
   
  }

  onDistrictChange(): void {
    // Reset dependent fields
   
  }

  onSubmit(): void {
  }
}