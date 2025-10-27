import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { VillagesService } from '../../villages/services/villages.service';
import { UsersService, Role } from '../../users/users.service';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent  implements OnInit {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  showPassword = false;
  rememberMe = false;
  isLoading = false;
  showForgetPasswordModal = false;
  showContactAdminModal = false;

  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    villageId: ['', [Validators.required]],
    reason: ['', [Validators.required, Validators.minLength(10)]]
  });

  villageOptions: Array<{ id: string; name: string }> = [];
  contactResultEmails: string[] = [];
  contactLoading = false;
  contactSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private villagesService: VillagesService,
    private usersService: UsersService
  ) {}
  
  ngOnInit() {
    // Check if user is already logged in
    // You can add auto-redirect logic here if needed
    this.villagesService.getAllVillages().subscribe({
      next: (villages) => {
        this.villageOptions = (villages || []).map((v: any) => ({ id: v.id, name: v.name }));
      },
      error: () => {
        this.villageOptions = [];
      }
    });

  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  openForgetPasswordModal(): void {
    this.showForgetPasswordModal = true;
  }

  closeForgetPasswordModal(): void {
    this.showForgetPasswordModal = false;
  }

  openContactAdminModal(): void {
    this.showContactAdminModal = true;
    this.contactSubmitted = false;
    this.contactResultEmails = [];
  }

  closeContactAdminModal(): void {
    this.showContactAdminModal = false;
    this.contactForm.reset();
    this.contactSubmitted = false;
    this.contactResultEmails = [];
  }

  submitContactAdmin(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    const { villageId } = this.contactForm.value as { name: string; villageId: string; reason: string };
    this.contactLoading = true;
    this.usersService.getUsersByVillage(villageId, Role.VILLAGE_ADMIN).subscribe({
      next: (users) => {
        this.contactResultEmails = (users || []).map((u: any) => u.email).filter(Boolean);
        this.contactSubmitted = true;
        this.contactLoading = false;
      },
      error: () => {
        this.contactResultEmails = [];
        this.contactSubmitted = true;
        this.contactLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    
    this.auth.login(this.loginForm.value as { email: string; password: string }).subscribe({
      next: () => {
        console.log('Login successful');
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoading = false;
      this.isLoading = false;

      let message = 'Something went wrong. Please try again later.';

      if (err.status === 0) {
        // Server unreachable or network issue
        message = 'Unable to connect to the server. Please check your internet connection or try again later.';
      } else if (err.status === 400) {
        message = err.error?.message || 'Bad request. Please check your input.';
      } else if (err.status === 401) {
        message = 'Invalid email or password. Please try again.';
      } else if (err.status === 403) {
        message = 'Access denied. You are not authorized to log in.';
      } else if (err.status === 404) {
        message = 'Login service not found. Please contact support.';
      } else if (err.status === 500) {
        message = 'Server error. Please try again later.';
      }

      alert(message);
      }
    });
  }
}


