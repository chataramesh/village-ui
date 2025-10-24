import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../auth.service';
import { UsersService } from '../../users/users.service';

@Component({
  selector: 'app-user-info-modal',
  templateUrl: './user-info-modal.component.html',
  styleUrls: ['./user-info-modal.component.scss']
})
export class UserInfoModalComponent {
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() passwordUpdated = new EventEmitter<boolean>();

  updatePasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService
  ) {
    this.updatePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.updatePasswordForm.invalid || !this.user?.id) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { newPassword } = this.updatePasswordForm.value;
    const updatedUser: any = {
      ...this.user,
      passwordHash: newPassword // In real implementation, this would be hashed
    };

    this.usersService.updateUser(this.user.id, updatedUser).subscribe({
      next: (updatedUserResponse) => {
        this.isLoading = false;
        this.successMessage = 'Password updated successfully! You can now sign in with your new password.';
        this.passwordUpdated.emit(true);

        setTimeout(() => {
          this.close.emit();
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating password:', error);
        this.errorMessage = 'Failed to update password. Please try again.';
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.updatePasswordForm.controls).forEach(key => {
      const control = this.updatePasswordForm.get(key);
      control?.markAsTouched();
    });
  }
}
