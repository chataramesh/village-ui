import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/core/services/token.service';
import { UsersService } from 'src/app/users/users.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface UserProfileData {
  userName: string;
  userRole: string;
  userImage: string;
  userId: string;
}

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
  selector: 'app-user-profile-dropdown',
  templateUrl: './user-profile-dropdown.component.html',
  styleUrls: ['./user-profile-dropdown.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('dropdownAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-10px) scale(0.95)',
        transformOrigin: 'top right'
      })),
      transition(':enter', [
        animate('150ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 1,
          transform: 'translateY(0) scale(1)'
        }))
      ]),
      transition(':leave', [
        animate('100ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'translateY(-5px) scale(0.98)'
        }))
      ])
    ])
  ]
})
export class UserProfileDropdownComponent implements OnChanges {

  @Input() userData!: UserProfileData;
  @Input() showSubscriptions: boolean = true;

  @Output() profileModalOpened = new EventEmitter<UserProfile>();
  @Output() subscriptionsNavigated = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  showUserMenu = false;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private usersService: UsersService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Handle updates to userData input
    if (changes['userData'] && this.userData) {
      console.log('User profile data updated:', this.userData);
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-wrapper')) {
      this.closeUserMenu();
    }
  }

  viewProfile() {
    console.log('Viewing profile...');
    this.closeUserMenu();

    // Call API to get user profile data
    if (this.userData.userId) {
      this.usersService.getUserById(this.userData.userId).subscribe({
        next: (userData) => {
          const userProfile: UserProfile = {
            id: userData.id || this.userData.userId,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            village: userData.village?.name || '',
            joinDate: userData.createdDate?.toISOString() || new Date().toISOString(),
            address: '', // User interface doesn't have address field
            emergencyContact: '' // User interface doesn't have emergencyContact field
          };
          this.profileModalOpened.emit(userProfile);
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          // Fallback to basic user data if API fails
          const userProfile: UserProfile = {
            id: this.userData.userId,
            name: this.userData.userName,
            email: `${this.userData.userName.toLowerCase().replace(' ', '.')}@village.local`,
            phone: '+91-9876543210',
            role: this.userData.userRole,
            village: 'Village Name',
            joinDate: new Date().toISOString(),
            address: 'Village Address, District',
            emergencyContact: '+91-9876543211'
          };
          this.profileModalOpened.emit(userProfile);
        }
      });
    }
  }

  viewSubscriptions() {
    console.log('Viewing subscriptions...');
    this.closeUserMenu();
    this.subscriptionsNavigated.emit();
  }

  getRoleDisplayName(role: string): string {
    if (!role) return 'User';

    const roleMap: { [key: string]: string } = {
      'VILLAGER': 'VILLAGER',
      'VILLAGE_ADMIN': 'VILLAGE_ADMIN',
      'SUPER_ADMIN': 'SUPER_ADMIN',
    };
    return roleMap[role];
  }

  handleLogout() {
    console.log('Logging out...');
    this.logoutClicked.emit();
  }
}
