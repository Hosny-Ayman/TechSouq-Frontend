import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { MessageModule } from 'primeng/message';
import { MessagesService } from '../../../core/services/messages.service';
import { IUserData } from '../../../core/Interfaces/IUser';

function clearError(control: AbstractControl | null, errorName: string) {
  if (control && control.hasError(errorName)) {
    const errs = { ...control.errors };
    delete errs[errorName];
    control.setErrors(Object.keys(errs).length ? errs : null);
  }
}

export function passwordGroupValidator(group: AbstractControl) {
  const currentPassword = group.get('currentPassword');
  const newPassword = group.get('newPassword');
  const confirmPassword = group.get('confirmPassword');

  if (!currentPassword || !newPassword || !confirmPassword) return null;

  const isChangingPassword =
    currentPassword.value || newPassword.value || confirmPassword.value;

  if (isChangingPassword) {
    if (!currentPassword.value)
      currentPassword.setErrors({ ...currentPassword.errors, required: true });
    else clearError(currentPassword, 'required');

    if (!newPassword.value)
      newPassword.setErrors({ ...newPassword.errors, required: true });
    else clearError(newPassword, 'required');

    if (!confirmPassword.value)
      confirmPassword.setErrors({ ...confirmPassword.errors, required: true });
    else clearError(confirmPassword, 'required');

    if (
      newPassword.value &&
      confirmPassword.value &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({
        ...confirmPassword.errors,
        passwordMismatch: true,
      });
    } else {
      clearError(confirmPassword, 'passwordMismatch');
    }
  } else {
    clearError(currentPassword, 'required');
    clearError(newPassword, 'required');
    clearError(confirmPassword, 'required');
    clearError(confirmPassword, 'passwordMismatch');
  }
  return null;
}

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MessageModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css',
})
export class MyProfileComponent implements OnInit {
  user!: IUserData;
  userData!: FormGroup;

  showPassword = {
    current: false,
    new: false,
    confirm: false,
  };

  constructor(
    private _message: MessagesService,
    private _user: UserService,
    private _formBuilder: FormBuilder,
  ) {
    this.userData = this._formBuilder.group(
      {
        FirstName: [
          '',
          [
            Validators.minLength(3),
            Validators.maxLength(30),
            Validators.required,
          ],
        ],
        SecondName: [
          '',
          [
            Validators.minLength(3),
            Validators.maxLength(30),
            Validators.required,
          ],
        ],
        email: ['', [Validators.email, Validators.required]],
        currentPassword: [''],
        newPassword: [
          '',
          [
            Validators.minLength(8),
            Validators.maxLength(30),
            Validators.pattern(
              /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/,
            ),
          ],
        ],
        confirmPassword: [''],
      },
      { validators: passwordGroupValidator },
    );
  }

  ngOnInit(): void {
    this.user = this._user.loadCurrentUser();

    if (this.user) {
      this.userData.patchValue({
        FirstName: this.user.firstName,
        SecondName: this.user.secondName,
        email: this.user.email,
      });
    }
  }

  get FirstName() {
    return this.userData.get('FirstName');
  }
  get SecondName() {
    return this.userData.get('SecondName');
  }
  get email() {
    return this.userData.get('email');
  }
  get currentPassword() {
    return this.userData.get('currentPassword');
  }
  get newPassword() {
    return this.userData.get('newPassword');
  }
  get confirmPassword() {
    return this.userData.get('confirmPassword');
  }

  togglePassword(field: 'current' | 'new' | 'confirm') {
    this.showPassword[field] = !this.showPassword[field];
  }

  saveProfile() {
    if (this.userData.valid && this.userData.dirty) {
      const formValues = this.userData.value;

      const payload: any = {
        id: this.user.id,
        roleId: this.user.roleId,
        firstName: formValues.FirstName,
        secondName: formValues.SecondName,
        email: formValues.email,
      };

      if (formValues.newPassword) {
        payload.oldPassword = formValues.currentPassword;
        payload.newPassword = formValues.newPassword;
      }

      if (this.user.id != 0) {
        this._user.updateUser(payload).subscribe({
          next: (req: any) => {
            this._message.showSuccess('Profile updated successfully!');

            this.userData.reset({
              ...this.userData.value,
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
          },
          error: (err: any) => {
            this._message.showError(
              'Failed to update profile. Please try again.',
            );
          },
        });
      }
    }
  }
}
