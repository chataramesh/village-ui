import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, Role } from 'src/app/users/users.service';

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
export class ProfileModalComponent implements OnInit {
  @Input() isVisible = false;
  @Input() userProfile: UserProfile | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() updateProfile = new EventEmitter<UserProfile>();
  @Output() deleteProfile = new EventEmitter<string>();

  isEditing = false;
  editedProfile: UserProfile | null = null;

  // Available roles from API
  availableRoles: { value: string; label: string }[] = [];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadAvailableRoles();
  }

  ngOnChanges(): void {
    if (this.userProfile && this.isVisible) {
      this.editedProfile = { ...this.userProfile };
      this.isEditing = false;
    }
  }

  loadAvailableRoles(): void {
    // Load roles from the Role enum
    this.availableRoles = [
      { value: 'VILLAGER', label: 'VILLAGER' },
      { value: 'VILLAGE_ADMIN', label: 'VILLAGE_ADMIN' },
      { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN' },
    ];
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
      this.updateProfile.emit(this.editedProfile);
      this.isEditing = false;
      this.userProfile = { ...this.editedProfile };
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
