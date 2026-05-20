import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../../../core/services/auth.service';
import { MessagesService } from '../../../core/services/messages.service';
import { ILogin } from '../../../core/Interfaces/http';
import {
  SocialAuthService,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgxSpinnerModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    PasswordModule,
    DividerModule,
    GoogleSigninButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  userData!: FormGroup;
  platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private _authService: AuthService,
    private _MyMessage: MessagesService,
    private _ShowSpinner: NgxSpinnerService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _socialAuthService: SocialAuthService,
  ) {
    this.userData = _formBuilder.group({
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
      password: [
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
    });
  }

  ngOnInit() {
    if (this.isBrowser) {
      this._socialAuthService.authState.subscribe();
      this._socialAuthService.authState.subscribe((user) => {
        if (user) {
          this._ShowSpinner.show();
          this._authService.GoogleLogin({ idToken: user.idToken }).subscribe({
            next: () => {
              this._ShowSpinner.hide();
              this._MyMessage.showSuccess('Registered successfully!');
              this._router.navigate(['/User']);
            },
            error: () => {
              this._ShowSpinner.hide();
              this._MyMessage.showError('Google Registration failed.');
            },
          });
        }
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
  get password() {
    return this.userData.get('password');
  }

  submit() {
    if (this.userData.valid) {
      this._ShowSpinner.show();
      this.signUp(this.userData.value);
    } else {
      this.userData.markAllAsTouched();
    }
  }

  signUp(formData: any): void {
    const finalDataToSend = {
      firstname: formData.FirstName,
      secondname: formData.SecondName,
      email: formData.email,
      password: formData.password,
      roleId: 2,
    };

    this._authService.register(finalDataToSend).subscribe({
      next: () => {
        this._authService.signUp({
          email: finalDataToSend.email,
          password: finalDataToSend.password,
        });
      },
      error: () => {
        this._MyMessage.showError('Unexpected Error Try Again Later');
        this._ShowSpinner.hide();
      },
    });
  }
}
