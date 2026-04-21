import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // ضفنا الـ Inject والـ PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // ضفنا دي عشان تفرق بين السيرفر والمتصفح
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';
import { ILogin, Iregister } from '../Interfaces/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = new BehaviorSubject<any>(null);

  constructor(
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
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('userData', JSON.stringify(res.data));
            }
            this.currentUser.next(res.data);
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
}
