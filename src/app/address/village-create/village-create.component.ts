import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { VillagesService } from '../services/villages.service';
import { MandalService, Mandal } from '../services/mandal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

export interface Village {
  id?: string;
  name: string;
  mandal: {
    id: string;
    name: string;
  };
  active: boolean;
}

@Component({
  selector: 'app-village-create',
  templateUrl: './village-create.component.html',
  styleUrls: ['./village-create.component.scss']
})
export class VillageCreateComponent implements OnInit {

  village: Village = {
    name: '',
    mandal: {
      id: '',
      name: ''
    },
    active: true
  };

  mandals: Mandal[] = [];
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  villageId: string | null = null;

  //private apiUrl = environment.villageUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private villageService: VillagesService,
    private mandalService: MandalService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode
    this.villageId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.villageId;

    // Load mandals for dropdown
    this.loadMandals();

    // if (this.isEditMode && this.villageId) {
    //   this.loadVillage(this.villageId);
    // }
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

  // loadVillage(villageId: string): void {
  //   this.http.get<Village>(`${this.apiUrl}/village/${villageId}`).subscribe({
  //     next: (data) => {
  //       this.village = data;
  //     },
  //     error: (err) => {
  //       console.error('Error loading village:', err);
  //       this.toast.error('Failed to load village data');
  //     }
  //   });
  // }

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    if (this.isEditMode && this.villageId) {
      // Update existing village
      this.villageService.updateVillage(this.villageId, this.village).subscribe({
        next: (response) => {
          console.log('Village updated successfully:', response);
          alert('Village updated successfully!');
          this.isSubmitting = false;
          this.router.navigate(['/villages']);
        },
        error: (error) => {
          console.error('Error updating village:', error);
          this.toast.error('Failed to update village');
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new village
      this.villageService.createVillage(this.village).subscribe({
        next: (response) => {
          console.log('Village created successfully:', response);
          alert('Village created successfully!');
          this.isSubmitting = false;
          this.router.navigate(['/villages']);
        },
        error: (error) => {
          console.error('Error creating village:', error);
          this.toast.error('Failed to create village. Please try again.');
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/villages']);
  }
}