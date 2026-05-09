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

export function passwordMatchValidator(control: AbstractControl) {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (!newPassword || !confirmPassword) return null;

  if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
    return null;
  }

  if (newPassword.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    confirmPassword.setErrors(null);
    return null;
  }
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
      { validators: passwordMatchValidator },
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

      const payload: IUserData = {
        id: this.user.id,
        roleId: this.user.roleId,
        firstName: formValues.FirstName,
        secondName: formValues.SecondName,
        email: formValues.email,
        oldPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      };

      if (this.user.id != 0) {
        this._user.updateUser(payload).subscribe({
          next: (req: any) => {
            console.log('User Update Successfully', req);
            this._message.showSuccess('Profile updated successfully!');

            this.userData.reset({
              ...this.userData.value,
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
          },
          error: (err: any) => {
            console.log('User Update Failed', err);
            this._message.showError(
              'Failed to update profile. Please try again.',
            );
          },
        });
      }
    }
  }
}
