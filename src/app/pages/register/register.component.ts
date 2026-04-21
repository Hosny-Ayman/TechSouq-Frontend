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

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  userData!: FormGroup;
  value!: string;

  messages: Message[] = [];

  ngOnInit() {
    this.messages = [{ severity: 'info', detail: 'Message Content' }];
  }

  constructor(
    private _authService: AuthService,
    private _MyMessage: MessagesService,
    private _ShowSpinner: NgxSpinnerService,
    private _formBuilder: FormBuilder,
  ) {
    this.userData = _formBuilder.group({
      name: [
        '',
        [
          Validators.minLength(8),
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

  get name() {
    return this.userData.get('name');
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

  signUp(formData: any): void {
    const finalDataToSedn = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      roleId: 2,
    };

    this._authService.register(finalDataToSedn).subscribe({
      next: (respons: any) => {
        console.log('Register Successfuly', respons);
        this._MyMessage.showSuccess('Register Successfuly');
        this._ShowSpinner.hide();
      },
      error: (err) => {
        console.log('Login Failed', err);

        this._MyMessage.showError('Unexpected Error Try Again Later');
        this._ShowSpinner.hide();
      },
    });
  }
}
