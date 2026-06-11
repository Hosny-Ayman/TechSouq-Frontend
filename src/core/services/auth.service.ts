import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  Inject,
  PLATFORM_ID,
  Injector,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  BehaviorSubject,
  Observable,
  tap,
  map,
  switchMap,
  of,
  catchError,
} from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';
import { ILogin, Iregister, IResetPassword } from '../Interfaces/http';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { MessagesModule } from 'primeng/messages';
import { MessagesService } from './messages.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = new BehaviorSubject<any>(null);

  private injected = inject(Injector);

  constructor(
    private _socialAuthService: SocialAuthService,
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
        switchMap((res: any) => {
          if (res.isSuccess && res.data) {
            this.currentUser.next(res.data);

            if (isPlatformBrowser(this.platformId)) {
              const { id, ...UserWithOutId } = res.data;
              localStorage.setItem('userData', JSON.stringify(UserWithOutId));

              const cart = this.injected.get(CartService);

              return cart.AddCartItemsAfterLoginAndCLearLocalStorage().pipe(
                catchError((err) => {
                  console.log('Cart Merge Failed', err);

                  return of(null);
                }),

                map(() => res),
              );
            }
          }

          return of(res);
        }),
      );
  }
  logout(): Observable<any> {
    return this._http
      .post(`${baseUrl}Auth/Logout`, null, { withCredentials: true })
      .pipe(
        tap(async () => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('userData');
            const cart = this.injected.get(CartService);
            cart.removeItemsFormlocalStorage();
          }
          this.currentUser.next(null);

          try {
            await this._socialAuthService.signOut(true);
          } catch (e) {
            console.log('Google already signed out');
          }

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

  ForgotPassword(payload: any): Observable<any> {
    return this._http.post(`${baseUrl}Auth/ForgotPassword`, payload);
  }

  ResetPassword(data: IResetPassword): Observable<any> {
    return this._http.post(`${baseUrl}Auth/ResetPassword`, data);
  }

  GoogleLogin(idToken: any): Observable<any> {
    return this._http.post(`${baseUrl}Auth/GoogleLogin`, idToken).pipe(
      switchMap((res: any) => {
        if (res.isSuccess && res.data) {
          this.currentUser.next(res.data);

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('userData', JSON.stringify(res.data));

            const cart = this.injected.get(CartService);
            return cart.AddCartItemsAfterLoginAndCLearLocalStorage().pipe(
              catchError((err) => {
                console.log('Cart Merge Failed', err);
                return of(null);
              }),
              map(() => res),
            );
          }
        }
        return of(res);
      }),
    );
  }
}
