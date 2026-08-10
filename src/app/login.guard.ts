import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service/auth.service';
import { map } from 'rxjs';

export const loginGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map(authenticated => {

      if (authenticated) {
        router.navigate(['/Dashboard']);
        return false;
      }

      return true;
    })
  );
};