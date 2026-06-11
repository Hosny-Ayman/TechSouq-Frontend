import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  OnDestroy, // 👈 متنساش دي
} from '@angular/core';
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
import { CartService } from '../../../core/services/cart.service';
import { ILogin } from '../../../core/Interfaces/http';

import {
  SocialAuthService,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  userData!: FormGroup;
  platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  private _authSubscription!: Subscription;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _socialAuthService: SocialAuthService,
    private _ShowSpinner: NgxSpinnerService,
    private _MyMessage: MessagesService,
    private _formBuilder: FormBuilder,
    private _cart: CartService,
  ) {
    this.userData = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
    if (this.isBrowser) {
      this._authSubscription = this._socialAuthService.authState.subscribe(
        (user) => {
          if (user) {
            this._ShowSpinner.show();
            this._authService.GoogleLogin({ idToken: user.idToken }).subscribe({
              next: (res: any) => {
                this._ShowSpinner.hide();
                this._MyMessage.showSuccess(
                  'Logged in successfully via Google!',
                );
                this._router.navigate(['/User']);
              },
              error: (err: any) => {
                this._ShowSpinner.hide();
                this._MyMessage.showError('Google Login failed.');
              },
            });
          }
        },
      );
    }
  }

  ngOnDestroy() {
    if (this._authSubscription) {
      this._authSubscription.unsubscribe();
    }
  }

  get email() {
    return this.userData.get('email');
  }
  get password() {
    return this.userData.get('password');
  }

  submit() {
    if (this.userData.invalid) {
      this.userData.markAllAsTouched();
      return;
    }
    this._ShowSpinner.show();
    this._authService.signUp(this.userData.value as ILogin);
  }
}
