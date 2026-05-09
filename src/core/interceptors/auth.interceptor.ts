import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

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
        return authService.RefreshToken().pipe(
          switchMap(() => {
            const retryReq = req.clone({ withCredentials: true });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('userData');
              window.location.href = '/Login';
            }

            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
