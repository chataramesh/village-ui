import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, Role, User } from 'src/app/users/users.service';
import { TokenService } from 'src/app/core/services/token.service';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  village: string;
  joinDate: string;
  profileImage?: string;
  address: string;
  emergencyContact: string;
}

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProfileModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() userProfile: UserProfile | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() updateProfile = new EventEmitter<UserProfile>();
  @Output() deleteProfile = new EventEmitter<string>();

  isEditing = false;
  editedProfile: UserProfile | null = null;

  currentUser:any;
  // Available roles from API
  availableRoles: { value: string; label: string }[] = [];

  constructor(private usersService: UsersService,private tokenService:TokenService) {}

  ngOnInit(): void {

    this.loadAvailableRoles();
   const tokenUser= this.tokenService.getCurrentUser();
   this.usersService.getUserById(tokenUser!.userId!).subscribe((user) => {
     this.currentUser = user;
   });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userProfile && this.isVisible) {
      this.editedProfile = { ...this.userProfile };
      this.isEditing = false;
    }
  }

  loadAvailableRoles(): void {
    // Load roles from the Role enum

    this.usersService.getAllRoles().subscribe((roles) => {
      this.availableRoles = roles.map((role: any) => ({ value: role, label: role }));
    });
    // this.availableRoles = [
    //   { value: 'VILLAGER', label: 'VILLAGER' },
    //   { value: 'VILLAGE_ADMIN', label: 'VILLAGE_ADMIN' },
    //   { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN' },
    // ];
  }

  onClose(): void {
    this.closeModal.emit();
    this.isEditing = false;
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onCancel(): void {
    this.isEditing = false;
    if (this.userProfile) {
      this.editedProfile = { ...this.userProfile };
    }
  }

  onSave(): void {
    if (this.editedProfile) {
      // Convert UserProfile to User format for API
      const userData: User = {
        id: this.editedProfile.id,
        name: this.editedProfile.name,
        email: this.editedProfile.email,
        phone: this.editedProfile.phone,
        role:  this.currentUser.role, 
        isActive: true, // Default to active, you might want to add this field to the form
        village: this.currentUser.village
      };

      // Call the API to update user
      this.usersService.updateUser(this.editedProfile.id, userData).subscribe({
        next: (updatedUser) => {
          console.log('User updated successfully:', updatedUser);
          // Update local state
          this.userProfile = this.editedProfile ? { ...this.editedProfile } : null;
          this.isEditing = false;
          // Emit the updated profile to parent component
          if (this.editedProfile) {
            this.updateProfile.emit(this.editedProfile);
          }
          // Close the modal
          this.closeModal.emit();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          // You might want to show an error message to the user
          alert('Failed to update profile. Please try again.');
        }
      });
    }
  }

  onDelete(): void {
    if (this.userProfile && confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      this.deleteProfile.emit(this.userProfile.id);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  getRoleDisplayName(role: string | undefined): string {
    if (!role) return 'N/A';

    const roleMap: { [key: string]: string } = {
      'VILLAGER': 'VILLAGER',
      'VILLAGE_ADMIN': 'VILLAGE_ADMIN',
      'SUPER_ADMIN': 'SUPER_ADMIN'
    };

    return roleMap[role] || role;
  }
}
