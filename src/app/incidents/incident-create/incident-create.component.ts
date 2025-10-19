import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IncidentService } from '../incident.service';
import {
  IncidentCategory,
  IncidentPriority,
  LocationType,
  Incident
} from '../types/incident.types';

@Component({
  selector: 'app-incident-create',
  templateUrl: './incident-create.component.html',
  styleUrls: ['./incident-create.component.scss']
})
export class IncidentCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  createForm: FormGroup;
  loading = false;
  error: string | null = null;

  categories = Object.values(IncidentCategory);
  priorities = Object.values(IncidentPriority);
  locationTypes = Object.values(LocationType);

  constructor(
    private fb: FormBuilder,
    private incidentService: IncidentService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      category: [IncidentCategory.OTHER, Validators.required],
      priority: [IncidentPriority.MEDIUM, Validators.required],
      location: ['', [Validators.required, Validators.maxLength(200)]],
      locationType: [LocationType.OTHER, Validators.required],
      contactInfo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      urgencyReason: ['', Validators.maxLength(500)],
      requiresFollowUp: [false]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      this.loading = true;
      this.error = null;

      const formValue = this.createForm.value;

      const incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        priority: formValue.priority,
        location: formValue.location,
        locationType: formValue.locationType,
        reportedBy: 'current_user', // This should come from auth service
        contactInfo: formValue.contactInfo,
        urgencyReason: formValue.urgencyReason || undefined,
        requiresFollowUp: formValue.requiresFollowUp,
        status: undefined // Will be set by backend to OPEN
      };

      this.incidentService.createIncident(incidentData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdIncident) => {
            this.loading = false;
            this.router.navigate(['/incidents'], { replaceUrl: true });
          },
          error: (error) => {
            this.loading = false;
            console.error('Error creating incident:', error);
            this.error = 'Failed to create incident. Please try again.';
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createForm.controls).forEach(key => {
      const control = this.createForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.createForm.get(fieldName);

    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'contactInfo') {
          return 'Please enter a valid 10-digit mobile number';
        }
      }
    }

    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      title: 'Title',
      description: 'Description',
      category: 'Category',
      priority: 'Priority',
      location: 'Location',
      locationType: 'Location Type',
      contactInfo: 'Contact Information',
      urgencyReason: 'Urgency Reason'
    };

    return displayNames[fieldName] || fieldName;
  }

  getCategoryDisplayName(category: IncidentCategory): string {
    return this.incidentService.getCategoryDisplayName(category);
  }

  getPriorityDisplayName(priority: IncidentPriority): string {
    return this.incidentService.getPriorityDisplayName(priority);
  }

  onCancel(): void {
    this.router.navigate(['/incidents'], { replaceUrl: true });
  }
}
