import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, Role, User } from 'src/app/users/users.service';
import { TokenService } from 'src/app/core/services/token.service';
import { GeolocationService } from 'src/app/shared/services/geolocation.service';
import { ToastService } from '../../services/toast.service';

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
  latitude: any;
  longitude: any;
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

  // Geolocation state
  isLocating = false;
  coords: { lat: number; lng: number } | null = null;
  locationError: string | null = null;

  currentUser:any;
  // Available roles from API
  availableRoles: { value: string; label: string }[] = [];

  constructor(private usersService: UsersService,private tokenService:TokenService,private toast: ToastService, private geo: GeolocationService) {}

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
        active: true, // Default to active, you might want to add this field to the form
        village: this.currentUser.village,
        latitude: this.editedProfile.latitude,
        longitude: this.editedProfile.longitude
      };

      // Decide whether to call update based on changes
      const orig = this.currentUser || {};
      const latChanged = Number(userData.latitude ?? 0) !== Number(orig.latitude ?? 0);
      const lngChanged = Number(userData.longitude ?? 0) !== Number(orig.longitude ?? 0);
      const otherChanged = (
        userData.name !== orig.name ||
        userData.email !== orig.email ||
        userData.phone !== orig.phone ||
        (userData.village?.id || userData.village) !== (orig.village?.id || orig.village) ||
        this.editedProfile.address !== (this.userProfile?.address)
      );

      if (!(latChanged || lngChanged || otherChanged)) {
        // Nothing changed; do not call API
        this.isEditing = false;
        this.closeModal.emit();
        return;
      }

      // Call the API to update user only if something changed (esp. coords)
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
          this.toast.error('Failed to update profile. Please try again.');
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

  // Fetch current location and reverse-geocode to full address
  async onGetMapLocation(): Promise<void> {
    this.locationError = null;
    this.isLocating = true;
    try {
      const { lat, lng } = await this.geo.getCurrentCoordinates();

      this.coords = { lat, lng };

      // Reverse geocode using OpenStreetMap Nominatim (no API key)
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          // Some services suggest a referer or email; browsers restrict custom UA headers
        }
      });
      if (!res.ok) {
        throw new Error(`Reverse geocoding failed (${res.status})`);
      }
      const data: any = await res.json();

      const display = data?.display_name as string | undefined;
      const addressObj = data?.address || {};

      const fallback = [
        addressObj.road,
        addressObj.neighbourhood,
        addressObj.suburb,
        addressObj.village || addressObj.town || addressObj.city,
        addressObj.state,
        addressObj.postcode,
        addressObj.country
      ].filter(Boolean).join(', ');

      const fullAddress = display || fallback || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      if (!this.editedProfile && this.userProfile) {
        this.editedProfile = { ...this.userProfile };
      }
      if (this.editedProfile) {
        this.editedProfile.address = fullAddress;
        this.editedProfile.latitude = lat;
        this.editedProfile.longitude = lng;
      }
    } catch (err: any) {
      const code = err?.code as number | undefined;
      if (code === 1) this.locationError = 'Permission denied. Please allow location access.'; // PERMISSION_DENIED
      else if (code === 2) this.locationError = 'Position unavailable. Try again later.'; // POSITION_UNAVAILABLE
      else if (code === 3) this.locationError = 'Location request timed out.'; // TIMEOUT
      else this.locationError = err?.message || 'Failed to fetch location.';
    } finally {
      this.isLocating = false;
    }
  }
}
