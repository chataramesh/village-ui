import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: string;
  village: string;
  isActive: boolean;
}

interface Village {
  id: string;
  name: string;
}

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})
export class UserCreateComponent implements OnInit {
  
  user: User = {
    name: '',
    email: '',
    phone: '',
    passwordHash: '',
    role: '',
    village: '',
    isActive: true
  };

  villages: Village[] = [];
  showVillageDropdown: boolean = false;
  showPassword: boolean = false;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  userId: string | null = null;

  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
    }

    // Load villages for dropdown
    this.loadVillages();
  }

  loadUser(userId: string): void {
    // Replace with actual API call
    this.http.get<User>(`${this.apiUrl}/users/${userId}`).subscribe({
      next: (data) => {
        this.user = { ...data };
        this.onRoleChange(); // Update village dropdown visibility
      },
      error: (error) => {
        console.error('Error loading user:', error);
        alert('Failed to load user data');
      }
    });

    // Mock data for testing
    // setTimeout(() => {
    //   this.user = {
    //     id: userId,
    //     name: 'John Doe',
    //     email: 'john@example.com',
    //     phone: '+91 98765 43210',
    //     passwordHash: '',
    //     role: 'VILLAGER',
    //     village: 'Greenfield Village',
    //     isActive: true
    //   };
    //   this.onRoleChange();
    // }, 500);
  }

  loadVillages(): void {
    // Replace with actual API call
    this.http.get<Village[]>(`${this.apiUrl}/villages/all`).subscribe({
      next: (data) => {
        this.villages = data;
      },
      error: (error) => {
        console.error('Error loading villages:', error);
        // Fallback to mock data
        this.villages = [
          { id: '1', name: 'Greenfield Village' },
          { id: '2', name: 'Riverside Village' },
          { id: '3', name: 'Hillside Village' },
          { id: '4', name: 'Lakeside Village' },
          { id: '5', name: 'Mountain View Village' }
        ];
      }
    });

    // Mock data for testing
    this.villages = [
      { id: '1', name: 'Greenfield Village' },
      { id: '2', name: 'Riverside Village' },
      { id: '3', name: 'Hillside Village' },
      { id: '4', name: 'Lakeside Village' },
      { id: '5', name: 'Mountain View Village' }
    ];
  }

  onRoleChange(): void {
    // Show village dropdown only for VILLAGER and VILLAGE_ADMIN roles
    this.showVillageDropdown = 
      this.user.role === 'VILLAGER' || this.user.role === 'VILLAGE_ADMIN';
    
    // Clear village if not needed
    if (!this.showVillageDropdown) {
      this.user.village = '';
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    if (this.isEditMode) {
      // Update existing user
      this.http.put(`${this.apiUrl}/users/${this.userId}`, this.user).subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          alert('User updated successfully!');
          this.router.navigate(['/users']);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          alert('Failed to update user. Please try again.');
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new user
      this.http.post(`${this.apiUrl}/users`, this.user).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          alert('User created successfully!');
          this.router.navigate(['/users']);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          alert('Failed to create user. Please try again.');
          this.isSubmitting = false;
        }
      });
    }

    // Mock success for testing (remove when API is ready)
    // setTimeout(() => {
    //   console.log('User data:', this.user);
    //   alert(this.isEditMode ? 'User updated successfully!' : 'User created successfully!');
    //   this.router.navigate(['/users']);
    // }, 1000);
  }

  onReset(): void {
    if (confirm('Are you sure you want to reset the form?')) {
      if (this.isEditMode && this.userId) {
        this.loadUser(this.userId);
      } else {
        this.user = {
          name: '',
          email: '',
          phone: '',
          passwordHash: '',
          role: '',
          village: '',
          isActive: true
        };
        this.showVillageDropdown = false;
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
