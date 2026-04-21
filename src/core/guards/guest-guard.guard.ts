import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  const router = inject(Router);

  if (authService.currentUser.value !== null) {
    if (state.url.includes('/Login') || state.url.includes('Register')) {
      router.navigate(['/User/Home']);
    } else {
      router.navigateByUrl('/User' + state.url);
    }

    return false;
  }

  return true;
};
