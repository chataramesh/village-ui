import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EntityType, EntityStatus } from '../models/entity.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-entity-create',
  templateUrl: './entity-create.component.html',
  styleUrls: ['./entity-create.component.scss']
})
export class EntityCreateComponent implements OnInit {
  entityForm: FormGroup;
  isEditMode = false;
  entityId: string | null = null;
  loading = false;
  submitting = false;

  entityTypes = Object.values(EntityType);
  entityStatuses = Object.values(EntityStatus);

  private apiUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.entityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      type: ['', Validators.required],
      status: [EntityStatus.OPEN, Validators.required],
      address: [''],
      contactNumber: [''],
      email: ['', [Validators.email]],
      openingTime: [''],
      closingTime: [''],
      capacity: [0],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.entityId = params['id'];
        this.loadEntity(params['id']);
      }
    });
  }

  loadEntity(id: string): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/entities/${id}`).subscribe({
      next: (entity) => {
        this.entityForm.patchValue({
          name: entity.name,
          description: entity.description,
          type: entity.type,
          status: entity.status,
          address: entity.address,
          contactNumber: entity.contactNumber,
          email: entity.email,
          openingTime: entity.openingTime,
          closingTime: entity.closingTime,
          capacity: entity.capacity,
          isActive: entity.isActive
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading entity:', error);
        alert('Failed to load entity data');
        this.loading = false;
        this.router.navigate(['/entities']);
      }
    });
  }

  onSubmit(): void {
    if (this.entityForm.invalid || this.submitting) return;

    this.submitting = true;
    const formData = this.entityForm.value;

    if (this.isEditMode && this.entityId) {
      // Update existing entity
      this.http.put(`${this.apiUrl}/entities/${this.entityId}`, formData).subscribe({
        next: (response) => {
          alert('Entity updated successfully!');
          this.router.navigate(['/entities']);
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error updating entity:', error);
          alert('Failed to update entity');
          this.submitting = false;
        }
      });
    } else {
      // Create new entity
      this.http.post(`${this.apiUrl}/entities`, formData).subscribe({
        next: (response) => {
          alert('Entity created successfully!');
          this.router.navigate(['/entities']);
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating entity:', error);
          alert('Failed to create entity');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/entities']);
  }
}
