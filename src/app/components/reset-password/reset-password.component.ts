import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MessagesService } from '../../../core/services/messages.service';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  private _fb = inject(FormBuilder);
  private _auth = inject(AuthService);
  private _message = inject(MessagesService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  resetForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  token: string = '';
  email: string = '';

  ngOnInit(): void {
    this.token = this._route.snapshot.queryParamMap.get('token') || '';
    this.email = this._route.snapshot.queryParamMap.get('email') || '';

    this.initForm();
  }

  initForm() {
    this.resetForm = this._fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(30),
            Validators.pattern(
              /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload = {
      email: this.email,
      token: this.token,
      newPassword: this.resetForm.value.newPassword,
    };

    this._auth.ResetPassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this._message.showSuccess('Your password has been reset successfully!');
        this._router.navigate(['/Login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this._message.showError(
          err.error?.message ||
            'Failed to reset password. Link might be expired.',
        );
      },
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
