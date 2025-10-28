import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SchoolService } from '../services/school.service';
import { SchoolResponse, SchoolRequest, SchoolType } from '../models/school.model';
import { TokenService } from 'src/app/core/services/token.service';
import { UsersService } from 'src/app/users/users.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-school-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
  templateUrl: './school-list.component.html',
  styleUrls: ['./school-list.component.scss']
})
export class SchoolListComponent implements OnInit, OnDestroy {
  schools: SchoolResponse[] = [];
  filteredSchools: SchoolResponse[] = [];
  isLoading = false;
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedSchool: SchoolResponse | null = null;
  searchQuery = '';
  selectedType: string = 'all';
  currentUser: any = null;
  isAdmin = true; // computed from user role

  schoolForm!: FormGroup;
  private destroy$ = new Subject<void>();

  schoolTypes = [
    { value: SchoolType.SCHOOL, label: 'School' },
    { value: SchoolType.COLLEGE, label: 'College' },
    { value: SchoolType.UNIVERSITY, label: 'University' },
    { value: SchoolType.INSTITUTE, label: 'Institute' },
    { value: SchoolType.ACADEMY, label: 'Academy' },
    { value: SchoolType.TRAINING_CENTER, label: 'Training Center' }
  ];

  constructor(
    private schoolService: SchoolService,
    private fb: FormBuilder,
    private userService: UsersService,
    private tokenService: TokenService,
    private toast: ToastService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    const tokenUser = this.tokenService.getCurrentUser();
    this.userService.getUserById(tokenUser?.userId!).subscribe({
      next: (user: any) => {
        this.currentUser = user;
        this.isAdmin = ['SUPER_ADMIN','VILLAGE_ADMIN'].includes(this.currentUser?.role);
        console.log('Current user loaded:', user);
        console.log('Village ID:', this.currentUser?.village?.id);
        this.loadSchools();
      },
      error: (error: any) => {
        console.error('Error loading user:', error);
        // Load with demo village ID as fallback
        this.currentUser = { village: { id: 'demo-village-id' }, role: 'VILLAGER' };
        this.isAdmin = false;
        this.loadSchools();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.schoolForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      type: [SchoolType.SCHOOL, Validators.required],
      villageId: ['', Validators.required], // Required - set from current user
      ownerId: ['', Validators.required], // Required - set from current user
      address: ['', [Validators.required, Validators.minLength(10)]],
      phone: [''],
      email: ['', [Validators.email]],
      website: [''],
      studentCapacity: [''],
      principalName: [''],
      affiliation: [''],
      registrationNumber: ['']
    });
  }

  private loadSchools(): void {
    // Check if village ID is available
    const villageId = this.currentUser?.village?.id;
    if (!villageId) {
      console.error('Village ID not available');
      return;
    }

    console.log('Loading schools for village:', villageId);
    this.isLoading = true;
    this.schoolService.getSchoolsByVillage(villageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schools: SchoolResponse[]) => {
          console.log('Schools loaded:', schools.length);
          this.schools = schools;
          this.filteredSchools = schools;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading schools:', error);
          this.schools = [];
          this.filteredSchools = [];
          this.isLoading = false;
        }
      });
  }

  private loadMockSchools(): void {
    this.schools = [
      {
        id: '1',
        name: 'Village Primary School',
        description: 'A premier educational institution serving the local community',
        type: SchoolType.SCHOOL,
        villageName: 'Demo Village',
        ownerName: 'Village Admin',
        address: 'Main Street, Village Center',
        phone: '+1-234-567-8900',
        email: 'info@villageprimary.edu',
        website: 'https://villageprimary.edu',
        studentCapacity: 300,
        currentStudents: 250,
        principalName: 'Mrs. Smith',
        affiliation: 'State Board',
        registrationNumber: 'REG001',
        isActive: true,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      },
      {
        id: '2',
        name: 'Village College',
        description: 'Higher education institution offering undergraduate programs',
        type: SchoolType.COLLEGE,
        villageName: 'Demo Village',
        ownerName: 'Village Admin',
        address: 'College Road, Village',
        phone: '+1-234-567-8901',
        email: 'admissions@villagecollege.edu',
        website: 'https://villagecollege.edu',
        studentCapacity: 1000,
        currentStudents: 800,
        principalName: 'Dr. Johnson',
        affiliation: 'University Board',
        registrationNumber: 'REG002',
        isActive: true,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      }
    ];
    this.filteredSchools = this.schools;
  }

  // Role-based method to check if user can create
  canCreate(): boolean {
    return this.isAdmin; // Only admins can create
  }

  filterSchools(): void {
    let filtered = this.schools;

    if (this.searchQuery.trim()) {
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        school.address!.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        school.principalName!.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.selectedType !== 'all') {
      filtered = filtered.filter(school => school.type === this.selectedType);
    }

    this.filteredSchools = filtered;
  }

  openAddModal(): void {
    this.schoolForm.reset({
      type: SchoolType.SCHOOL,
      villageId: this.currentUser?.village?.id || '',
      ownerId: this.currentUser?.id || ''
    });
    this.showAddModal = true;
  }

  openEditModal(school: SchoolResponse): void {
    this.selectedSchool = school;
    this.schoolForm.patchValue({
      name: school.name,
      description: school.description || '',
      type: school.type,
      villageId: this.currentUser?.village?.id || '',
      ownerId: this.currentUser?.id || '',
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      website: school.website || '',
      studentCapacity: school.studentCapacity || '',
      principalName: school.principalName || '',
      affiliation: school.affiliation || '',
      registrationNumber: school.registrationNumber || ''
    });
    this.showEditModal = true;
  }

  openDeleteModal(school: SchoolResponse): void {
    this.selectedSchool = school;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedSchool = null;
    this.schoolForm.reset();
  }

  onSubmit(): void {
    if (this.schoolForm.valid) {
      const formValue = this.schoolForm.value;

      // Additional validation: ensure village and owner are set
      if (!formValue.villageId || !formValue.ownerId) {
        this.toast.error('Village and owner must be set. Please refresh and try again.');
        return;
      }

      const schoolRequest: SchoolRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        type: formValue.type,
        villageId: formValue.villageId,
        ownerId: formValue.ownerId,
        address: formValue.address || undefined,
        phone: formValue.phone || undefined,
        email: formValue.email || undefined,
        website: formValue.website || undefined,
        studentCapacity: formValue.studentCapacity || undefined,
        principalName: formValue.principalName || undefined,
        affiliation: formValue.affiliation || undefined,
        registrationNumber: formValue.registrationNumber || undefined
      };

      if (this.showEditModal && this.selectedSchool?.id) {
        this.updateSchool(this.selectedSchool.id, schoolRequest);
      } else {
        this.createSchool(schoolRequest);
      }
    } else {
      Object.keys(this.schoolForm.controls).forEach(key => {
        this.schoolForm.get(key)?.markAsTouched();
      });
    }
  }

  private createSchool(schoolRequest: SchoolRequest): void {
    this.schoolService.createSchool(schoolRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newSchool: SchoolResponse) => {
          // Reload the schools list to get the updated data
          this.loadSchools();
          this.closeModals();
          this.toast.success('School created successfully');
        },
        error: (error: any) => {
          console.error('Error creating school:', error);
          this.toast.error('Failed to create school');
        }
      });
  }

  private updateSchool(id: string, schoolRequest: SchoolRequest): void {
    this.schoolService.updateSchool(id, schoolRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedSchool: SchoolResponse) => {
          // Reload the schools list to get the updated data
          this.loadSchools();
          this.closeModals();
          this.toast.success('School updated successfully');
        },
        error: (error: any) => {
          console.error('Error updating school:', error);
          this.toast.error('Failed to update school');
        }
      });
  }

  confirmDelete(): void {
    if (this.selectedSchool?.id) {
      console.log('Deleting school:', this.selectedSchool.name, 'ID:', this.selectedSchool.id);

      this.schoolService.deleteSchool(this.selectedSchool.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            console.log('Delete response:', response);
            // Remove the school from the local array immediately for better UX
            this.schools = this.schools.filter(s => s.id !== this.selectedSchool?.id);
            this.filteredSchools = this.filteredSchools.filter(s => s.id !== this.selectedSchool?.id);
            this.closeModals();
            this.toast.success('School deleted successfully');
          },
          error: (error: any) => {
            console.error('Error deleting school:', error);
            console.error('Error details:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              url: error.url
            });
            this.toast.error('Failed to delete school. Please try again.');
          }
        });
    }
  }

  getTypeIcon(type: SchoolType): string {
    const icons: { [key: string]: string } = {
      [SchoolType.SCHOOL]: '🏫',
      [SchoolType.COLLEGE]: '🎓',
      [SchoolType.UNIVERSITY]: '🏛️',
      [SchoolType.INSTITUTE]: '🏢',
      [SchoolType.ACADEMY]: '📚',
      [SchoolType.TRAINING_CENTER]: '🎯'
    };
    return icons[type] || '📚';
  }

  getTypeClass(type: SchoolType): string {
    const classes: { [key: string]: string } = {
      [SchoolType.SCHOOL]: 'type-school',
      [SchoolType.COLLEGE]: 'type-college',
      [SchoolType.UNIVERSITY]: 'type-university',
      [SchoolType.INSTITUTE]: 'type-institute',
      [SchoolType.ACADEMY]: 'type-academy',
      [SchoolType.TRAINING_CENTER]: 'type-training-center'
    };
    return classes[type] || 'type-default';
  }

  trackBySchoolId(index: number, school: SchoolResponse): string {
    return school.id || index.toString();
  }
}
