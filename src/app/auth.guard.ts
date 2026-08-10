import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map(authenticated => {

      if (authenticated) {
        return true;
      }

      router.navigate(['/']);
      return false;
    })
  );
};