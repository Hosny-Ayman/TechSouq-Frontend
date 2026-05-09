import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  Inject,
  PLATFORM_ID,
  Injector,
  inject,
} from '@angular/core'; // ضفنا الـ Inject والـ PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // ضفنا دي عشان تفرق بين السيرفر والمتصفح
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';
import { ILogin, Iregister } from '../Interfaces/http';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { MessagesModule } from 'primeng/messages';
import { MessagesService } from './messages.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = new BehaviorSubject<any>(null);

  private injected = inject(Injector);

  constructor(
    private _MyMessage: MessagesService,
    private _ShowSpinner: NgxSpinnerService,
    private _http: HttpClient,
    private _router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('userData');
      if (savedUser) {
        this.currentUser.next(JSON.parse(savedUser));
      }
    }
  }

  register(userData: Iregister): Observable<any> {
    return this._http.post(`${baseUrl}Auth/Register`, userData);
  }

  login(userData: ILogin): Observable<any> {
    return this._http
      .post(`${baseUrl}Auth/Login`, userData, {
        withCredentials: true,
      })
      .pipe(
        tap((res: any) => {
          if (res.isSuccess && res.data) {
            this.currentUser.next(res.data);
            if (isPlatformBrowser(this.platformId)) {
              const cart = this.injected.get(CartService);
              cart.AddCartItemsAfterLoginAndCLearLocalStorage();
              localStorage.setItem('userData', JSON.stringify(res.data));
            }
          }
        }),
      );
  }

  logout(): Observable<any> {
    return this._http
      .post(`${baseUrl}Auth/Logout`, null, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('userData');
            const cart = this.injected.get(CartService);
            cart.removeItemsFormlocalStorage();
          }
          this.currentUser.next(null);
          this._router.navigate(['/Login']);
        }),
      );
  }

  RefreshToken(): Observable<any> {
    return this._http.post(
      `${baseUrl}Auth/RefreshToken`,
      {},
      { withCredentials: true },
    );
  }

  signUp(formData: ILogin): void {
    const finalDataToSedn = {
      email: formData.email,
      password: formData.password,
    };

    this.login(formData).subscribe({
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
