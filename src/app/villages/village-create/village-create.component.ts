import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Village {
  id?: string;
  name: string;
  mandal: string;
  district: string;
  state: string;
  country: string;
  isActive: boolean;
}

@Component({
  selector: 'app-village-create',
  templateUrl: './village-create.component.html',
  styleUrls: ['./village-create.component.scss']
})
export class VillageCreateComponent implements OnInit {
  
  village: Village = {
    name: '',
    mandal: '',
    district: '',
    state: '',
    country: '',
    isActive: true
  };

  // Dropdown options
  countries: string[] = ['India', 'USA', 'UK', 'Australia'];
  states: string[] = [];
  districts: string[] = [];
  mandals: string[] = [];

  // Hierarchical data structure
  private locationData: any = {
    'India': {
      'Telangana': {
        'Central District': ['Greenfield Mandal', 'Mountain Mandal'],
        'East District': ['Riverside Mandal'],
        'West District': ['Hillside Mandal'],
        'North District': ['Lakeside Mandal']
      },
      'Andhra Pradesh': {
        'West District': ['Hillside Mandal'],
        'South District': ['Sunset Mandal']
      },
      'Karnataka': {
        'North District': ['Lakeside Mandal'],
        'Bangalore District': ['Whitefield Mandal', 'Electronic City Mandal']
      }
    },
    'USA': {
      'California': {
        'Los Angeles County': ['Downtown Mandal', 'Hollywood Mandal'],
        'San Francisco County': ['Bay Area Mandal']
      },
      'Texas': {
        'Harris County': ['Houston Mandal'],
        'Dallas County': ['Dallas Mandal']
      }
    }
  };

  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  villageId: string | null = null;

  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode
    this.villageId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.villageId;

    if (this.isEditMode && this.villageId) {
      this.loadVillage(this.villageId);
    }
  }

  loadVillage(villageId: string): void {
    // Replace with actual API call
    this.http.get<Village>(`${this.apiUrl}/villages/${villageId}`).subscribe({
      next: (data) => {
        this.village = { ...data };
        // Load dependent dropdowns
        this.onCountryChange();
        this.onStateChange();
        this.onDistrictChange();
      },
      error: (error) => {
        console.error('Error loading village:', error);
        alert('Failed to load village data');
      }
    });

    // Mock data for testing
    // setTimeout(() => {
    //   this.village = {
    //     id: villageId,
    //     name: 'Greenfield Village',
    //     mandal: 'Greenfield Mandal',
    //     district: 'Central District',
    //     state: 'Telangana',
    //     country: 'India',
    //     isActive: true
    //   };
    //   this.onCountryChange();
    //   this.onStateChange();
    //   this.onDistrictChange();
    // }, 500);
  }

  onCountryChange(): void {
    // Reset dependent fields
    this.village.state = '';
    this.village.district = '';
    this.village.mandal = '';
    this.states = [];
    this.districts = [];
    this.mandals = [];

    // Load states for selected country
    if (this.village.country && this.locationData[this.village.country]) {
      this.states = Object.keys(this.locationData[this.village.country]).sort();
    }
  }

  onStateChange(): void {
    // Reset dependent fields
    this.village.district = '';
    this.village.mandal = '';
    this.districts = [];
    this.mandals = [];

    // Load districts for selected state
    if (this.village.country && this.village.state && 
        this.locationData[this.village.country][this.village.state]) {
      this.districts = Object.keys(this.locationData[this.village.country][this.village.state]).sort();
    }
  }

  onDistrictChange(): void {
    // Reset dependent fields
    this.village.mandal = '';
    this.mandals = [];

    // Load mandals for selected district
    if (this.village.country && this.village.state && this.village.district &&
        this.locationData[this.village.country][this.village.state][this.village.district]) {
      this.mandals = this.locationData[this.village.country][this.village.state][this.village.district].sort();
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    if (this.isEditMode) {
      // Update existing village
      this.http.put(`${this.apiUrl}/villages/${this.villageId}`, this.village).subscribe({
        next: (response) => {
          console.log('Village updated successfully:', response);
          alert('Village updated successfully!');
          this.router.navigate(['/villages']);
        },
        error: (error) => {
          console.error('Error updating village:', error);
          alert('Failed to update village. Please try again.');
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new village
      this.http.post(`${this.apiUrl}/villages`, this.village).subscribe({
        next: (response) => {
          console.log('Village created successfully:', response);
          alert('Village created successfully!');
          this.router.navigate(['/villages']);
        },
        error: (error) => {
          console.error('Error creating village:', error);
          alert('Failed to create village. Please try again.');
          this.isSubmitting = false;
        }
      });
    }

    // Mock success for testing (remove when API is ready)
    // setTimeout(() => {
    //   console.log('Village data:', this.village);
    //   alert(this.isEditMode ? 'Village updated successfully!' : 'Village created successfully!');
    //   this.router.navigate(['/villages']);
    // }, 1000);
  }

  onReset(): void {
    if (confirm('Are you sure you want to reset the form?')) {
      if (this.isEditMode && this.villageId) {
        this.loadVillage(this.villageId);
      } else {
        this.village = {
          name: '',
          mandal: '',
          district: '',
          state: '',
          country: '',
          isActive: true
        };
        this.states = [];
        this.districts = [];
        this.mandals = [];
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/villages']);
  }
}
