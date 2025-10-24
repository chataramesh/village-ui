import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

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

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}
  
  ngOnInit() {
    // Check if user is already logged in
    // You can add auto-redirect logic here if needed
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
        alert('Invalid credentials. Please try again.');
      }
    });
  }
}
