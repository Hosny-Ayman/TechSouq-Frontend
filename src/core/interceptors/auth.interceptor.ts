import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // 1. السطر ده بيخلي المتصفح يبعت الـ HttpOnly Cookie أوتوماتيك مع كل ريكويست
  const clonedReq = req.clone({
    withCredentials: true,
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 2. لو التوكن خلص (401)، نعمل Refresh
      if (error.status === 401 && !req.url.includes('/Auth/Login')) {
        return authService.RefreshToken().pipe(
          switchMap(() => {
            // الباك إند هيرجع Cookie جديدة أوتوماتيك
            const retryReq = req.clone({ withCredentials: true });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            // 👇 لو الريفريش فشل (يعني الجلسة انتهت تماماً)
            // نعمل logout إجباري نمسح بيه الـ LocalStorage ونرميه بره
            authService.currentUser.next(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('userData');
              window.location.href = '/Login';
            }
            window.location.href = '/Login'; // أو تستخدم Router.navigate
            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
