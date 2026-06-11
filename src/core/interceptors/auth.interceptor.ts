import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
} from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
  null,
);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const clonedReq = req.clone({
    withCredentials: true,
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !req.url.includes('/Auth/Login') &&
        !req.url.includes('/Auth/RefreshToken')
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.RefreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              refreshTokenSubject.next(true);

              const retryReq = req.clone({ withCredentials: true });
              return next(retryReq);
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              if (typeof window !== 'undefined') {
                localStorage.removeItem('userData');
                window.location.href = '/Login';
              }
              return throwError(() => refreshErr);
            }),
          );
        } else {
          return refreshTokenSubject.pipe(
            filter((result) => result !== null),
            take(1),
            switchMap(() => {
              const retryReq = req.clone({ withCredentials: true });
              return next(retryReq);
            }),
          );
        }
      }

      return throwError(() => error);
    }),
  );
};
