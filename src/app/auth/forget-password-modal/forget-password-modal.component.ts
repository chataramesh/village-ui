import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../auth.service';
import { UsersService } from '../../users/users.service';

@Component({
  selector: 'app-forget-password-modal',
  templateUrl: './forget-password-modal.component.html',
  styleUrls: ['./forget-password-modal.component.scss']
})
export class ForgetPasswordModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() passwordUpdated = new EventEmitter<boolean>();

  forgetPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showUserInfoModal = false;
  verifiedUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usersService: UsersService
  ) {
    this.forgetPasswordForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      oldPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.forgetPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, oldPassword } = this.forgetPasswordForm.value;

    this.authService.verifyUser(username, oldPassword).subscribe({
      next: (user: User | null) => {
        this.isLoading = false;

        if (user) {
          this.verifiedUser = user;
          this.showUserInfoModal = true;
        } else {
          this.errorMessage = 'Invalid username or password. Please check your credentials.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error verifying user:', error);
        this.errorMessage = 'Failed to verify credentials. Please try again.';
      }
    });
  }

  onClose(): void {
    this.forgetPasswordForm.reset();
    this.errorMessage = '';
    this.verifiedUser = null;
    this.showUserInfoModal = false;
    this.closeModal.emit();
  }

  onPasswordUpdated(success: boolean): void {
    if (success) {
      this.closeModal.emit();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgetPasswordForm.controls).forEach(key => {
      const control = this.forgetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }
}
