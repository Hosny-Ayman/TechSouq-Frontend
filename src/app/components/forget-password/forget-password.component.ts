import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MessagesService } from '../../../core/services/messages.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  private _fb = inject(FormBuilder);
  private _auth = inject(AuthService);
  private _message = inject(MessagesService);

  forgetForm: FormGroup = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading: boolean = false;

  cooldownTime: number = 0;
  timerInterval: any;

  onSubmit() {
    if (this.forgetForm.invalid) {
      this.forgetForm.markAllAsTouched();
      return;
    }

    if (this.cooldownTime > 0) return;

    this.isLoading = true;

    const payload = {
      email: this.forgetForm.value.email,
    };

    this._auth.ForgotPassword(payload).subscribe({
      next: (req: any) => {
        this.isLoading = false;
        this._message.showSuccess('Password reset link sent to your email.');
        this.startCooldown();
      },
      error: (err: any) => {
        this.isLoading = false;
        this._message.showError('Failed to send reset link. Please try again.');
      },
    });
  }

  startCooldown() {
    this.cooldownTime = 60;
    this.timerInterval = setInterval(() => {
      this.cooldownTime--;
      if (this.cooldownTime <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
