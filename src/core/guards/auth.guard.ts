import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID); // 👈 عشان نعرف إحنا فين

  // 1. لو إحنا على السيرفر (SSR)، عدي الموقف عشان السيرفر أعمى مبيشوفش اللوكال ستوريدج
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // 2. إحنا دلوقتي في المتصفح، نقدر نأخد القرار الصح
  if (authService.currentUser.value !== null) {
    return true;
  } else {
    // 3. الطريقة الأصح والأسرع للتحويل جوه الجارد (بتمنع التعليق واللوب)
    return router.createUrlTree(['/Login']);
  }
};
