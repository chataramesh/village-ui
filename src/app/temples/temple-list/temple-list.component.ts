import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TempleService } from '../services/temple.service';
import { TempleResponse, TempleRequest, TempleType } from '../models/temple.model';
import { UsersService, User, Role } from '../../users/users.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-temple-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './temple-list.component.html',
  styleUrls: ['./temple-list.component.scss']
})
export class TempleListComponent implements OnInit, OnDestroy {
  temples: TempleResponse[] = [];
  filteredTemples: TempleResponse[] = [];
  isLoading = false;
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedTemple: TempleResponse | null = null;
  searchQuery = '';
  selectedType: string = 'all';
  currentUser: any = null;
  isAdmin = true; // For demo purposes - set to true to show admin features


  // Users for priest dropdown
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedVillageId: any = '';

  templeForm!: FormGroup;
  private destroy$ = new Subject<void>();

  templeTypes = [
    { value: TempleType.HINDU, label: 'Hindu Temple' },
    { value: TempleType.MUSLIM, label: 'Mosque' },
    { value: TempleType.CHRISTIAN, label: 'Church' },
    { value: TempleType.SIKH, label: 'Sikh Temple' },
    { value: TempleType.BUDDHIST, label: 'Buddhist Temple' },
    { value: TempleType.JAIN, label: 'Jain Temple' },
    { value: TempleType.OTHER, label: 'Other' }
  ];

  constructor(
    private templeService: TempleService,
    private usersService: UsersService,
    private fb: FormBuilder,
    private tokenService: TokenService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    var token= this.tokenService.getCurrentUser();
    this.usersService.getUserById(token?.userId!)
    .subscribe({
      next: (user: any) => {
        this.currentUser = user;
        this.selectedVillageId = this.currentUser.village?.id;
        // Load users and temples after setting the village ID
        this.loadUsers();
        this.loadTemples();
      },
      error: (error: any) => {
        console.error('Error loading user:', error);
        // Load with demo village ID as fallback
        this.selectedVillageId = 'demo-village-id';
        this.loadUsers();
        this.loadTemples();
      }
    });
  }

  

  private initializeForm(): void {
    this.templeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      type: [TempleType.HINDU, Validators.required],
      villageId: ['', Validators.required], // Required - set by priest selection
      ownerId: ['', Validators.required], // Required - set by priest selection
      address: ['', [Validators.required, Validators.minLength(10)]],
      phone: [''],
      email: ['', [Validators.email]],
      priestName: ['', Validators.required], // Required - selected from dropdown
      caretakerName: [''],
      deity: [''],
      establishedYear: [''],
      registrationNumber: [''],
      timings: [''],
      specialDays: ['']
    });
  }

  private loadTemples(): void {
    // Load temples for current user's village
    if (!this.selectedVillageId) {
      console.error('Village ID not available');
      return;
    }

    this.isLoading = true;
    this.templeService.getTemplesByVillage(this.selectedVillageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (temples: TempleResponse[]) => {
          this.temples = temples;
          this.filteredTemples = temples;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading temples:', error);
          this.temples = [];
          this.filteredTemples = [];
          this.isLoading = false;
        }
      });
  }

  private loadUsers(): void {
    if (!this.selectedVillageId) {
      console.error('Village ID not available for loading users');
      return;
    }

    this.usersService.getUsersByVillage(this.selectedVillageId, Role.VILLAGER)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users: User[]) => {
          this.users = users;
          this.filteredUsers = users;
        },
        error: (error: any) => {
          console.error('Error loading users:', error);
          this.users = [];
          this.filteredUsers = [];
        }
      });
  }

  // Role-based method to check if user can create
  canCreate(): boolean {
    return this.isAdmin; // Only admins can create
  }

  filterTemples(): void {
    let filtered = this.temples;

    if (this.searchQuery.trim()) {
      filtered = filtered.filter(temple =>
        temple.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        temple.address!.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        temple.deity!.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        temple.priestName!.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.selectedType !== 'all') {
      filtered = filtered.filter(temple => temple.type === this.selectedType);
    }

    this.filteredTemples = filtered;
  }


  openAddModal(): void {
    this.templeForm.reset({
      type: TempleType.HINDU,
      villageId: '', // Will be set when priest is selected
      ownerId: '', // Will be set when priest is selected
      priestName: '' // Will be set when priest is selected
    });
    this.loadUsers(); // Load users when opening the modal
    this.showAddModal = true;
  }

  onPriestSelectionChange(selectedPriestId: string): void {
    const selectedPriest = this.users.find(user => user.id === selectedPriestId);
    if (selectedPriest && selectedPriest.village?.id && selectedPriest.id) {
      this.templeForm.patchValue({
        villageId: selectedPriest.village.id,
        ownerId: selectedPriest.id,
        priestName: selectedPriest.id  // Set to ID to match option value for proper display
      });
    }
  }

  openEditModal(temple: TempleResponse): void {
    this.selectedTemple = temple;
    this.loadUsers(); // Load users when opening edit modal

    // Try to find the matching user based on priest name to get villageId and ownerId
    const matchingUser = this.users.find(user =>
      user.name.toLowerCase() === temple.priestName?.toLowerCase()
    );

    this.templeForm.patchValue({
      name: temple.name,
      description: temple.description || '',
      type: temple.type,
      villageId: matchingUser?.village?.id || '',
      ownerId: matchingUser?.id || '',
      address: temple.address || '',
      phone: temple.phone || '',
      email: temple.email || '',
      priestName: matchingUser?.id || '', // Set to ID for proper dropdown display
      caretakerName: temple.caretakerName || '',
      deity: temple.deity || '',
      establishedYear: temple.establishedYear || '',
      registrationNumber: temple.registrationNumber || '',
      timings: temple.timings || '',
      specialDays: temple.specialDays || ''
    });
    this.showEditModal = true;
  }

  openDeleteModal(temple: TempleResponse): void {
    console.log('Opening delete modal for temple:', temple.name);
    this.selectedTemple = temple;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedTemple = null;
    this.templeForm.reset();
  }
  onSubmit(): void {
    if (this.templeForm.valid) {
      const formValue = this.templeForm.value;

      // Additional validation: ensure priest is selected and village/owner are set
      if (!formValue.priestName || !formValue.villageId || !formValue.ownerId) {
        alert('Please select a priest from the dropdown. Village and owner information will be set automatically.');
        return;
      }

      // Get the selected priest to retrieve the name for API call
      const selectedPriest = this.users.find(user => user.id === formValue.priestName);

      const templeRequest: TempleRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        type: formValue.type,
        villageId: formValue.villageId,
        ownerId: formValue.ownerId,
        address: formValue.address || undefined,
        phone: formValue.phone || undefined,
        email: formValue.email || undefined,
        priestName: selectedPriest?.name || formValue.priestName || undefined, // Use priest name for API
        caretakerName: formValue.caretakerName || undefined,
        deity: formValue.deity || undefined,
        establishedYear: formValue.establishedYear || undefined,
        registrationNumber: formValue.registrationNumber || undefined,
        timings: formValue.timings || undefined,
        specialDays: formValue.specialDays || undefined
      };

      if (this.showEditModal && this.selectedTemple?.id) {
        this.updateTemple(this.selectedTemple.id, templeRequest);
      } else {
        this.createTemple(templeRequest);
      }
    } else {
      Object.keys(this.templeForm.controls).forEach(key => {
        this.templeForm.get(key)?.markAsTouched();
      });
    }
  }

  private createTemple(templeRequest: TempleRequest): void {
    this.templeService.createTemple(templeRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newTemple: TempleResponse) => {
          // Reload the temples list to get the updated data
          this.loadTemples();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error creating temple:', error);
          // Handle error - could show a toast notification
        }
      });
  }

  private updateTemple(id: string, templeRequest: TempleRequest): void {
    this.templeService.updateTemple(id, templeRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTemple: TempleResponse) => {
          // Reload the temples list to get the updated data
          this.loadTemples();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error updating temple:', error);
          // Handle error - could show a toast notification
        }
      });
  }

  confirmDelete(): void {
    if (this.selectedTemple?.id) {
      console.log('Deleting temple:', this.selectedTemple.name, 'ID:', this.selectedTemple.id);

      this.templeService.deleteTemple(this.selectedTemple.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            console.log('Delete response:', response);
            // Remove the temple from the local array immediately for better UX
            this.temples = this.temples.filter(t => t.id !== this.selectedTemple?.id);
            this.filteredTemples = this.filteredTemples.filter(t => t.id !== this.selectedTemple?.id);
            this.closeModals();
            console.log('Temple deleted successfully');
          },
          error: (error: any) => {
            console.error('Error deleting temple:', error);
            console.error('Error details:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              url: error.url
            });
            alert(`Failed to delete temple: ${error.message || 'Unknown error'}. Please try again.`);
          }
        });
    }
  }

  getTypeIcon(type: TempleType): string {
    const icons: { [key: string]: string } = {
      [TempleType.HINDU]: '🕉️',
      [TempleType.BUDDHIST]: '☸️',
      [TempleType.JAIN]: '🕊️',
      [TempleType.SIKH]: 'ੴ',
      [TempleType.CHRISTIAN]: '✝️',
      [TempleType.MUSLIM]: '☪️',
      [TempleType.OTHER]: '⛪'
    };
    return icons[type] || '🕌';
  }

  getTypeLabel(type: TempleType): string {
    const labels: { [key: string]: string } = {
      [TempleType.HINDU]: 'Hindu Temple',
      [TempleType.BUDDHIST]: 'Buddhist Temple',
      [TempleType.JAIN]: 'Jain Temple',
      [TempleType.SIKH]: 'Sikh Temple',
      [TempleType.CHRISTIAN]: 'Church',
      [TempleType.MUSLIM]: 'Mosque',
      [TempleType.OTHER]: 'Temple'
    };
    return labels[type] || 'Temple';
  }

  trackByTempleId(index: number, temple: TempleResponse): string {
    return temple.id || index.toString();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
