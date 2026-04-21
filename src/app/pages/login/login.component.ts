import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MenubarModule } from 'primeng/menubar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { MessagesService } from '../../../core/services/messages.service';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { ILogin } from '../../../core/Interfaces/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    PasswordModule,
    DividerModule,
    MenubarModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    MessagesModule,
    MessageModule,
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  userData!: FormGroup;
  value!: string;

  platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);

  messages: Message[] = [];

  ngOnInit() {
    this.messages = [{ severity: 'info', detail: 'Message Content' }];
  }

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _ShowSpinner: NgxSpinnerService,
    private _MyMessage: MessagesService,
    private _ngxSpinnerService: NgxSpinnerService,
    private _formBuilder: FormBuilder,
  ) {
    this.userData = _formBuilder.group({
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
      Object.keys(this.userData.controls).forEach((control) =>
        this.userData.controls[control].markAsDirty(),
      );
    }
  }

  signUp(formData: ILogin): void {
    const finalDataToSedn = {
      email: formData.email,
      password: formData.password,
    };

    this._authService.login(formData).subscribe({
      next: (respons: any) => {
        console.log('Register Successfuly', respons);
        this._MyMessage.showSuccess('Register Successfuly');
        this._ShowSpinner.hide();
        this._router.navigate(['/User']);
      },
      error: (err) => {
        console.log('Login Failed', err);

        this._MyMessage.showError('Unexpected Error Try Again Later');
        this._ShowSpinner.hide();
      },
    });
  }
}
