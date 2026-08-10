import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './service/auth.service';

export const engagementGuard: CanActivateFn = (route, state) => {
  const authserv = inject(AuthService);
  const router = inject(Router);

  if (localStorage.getItem('type') === 'guest') {
    return true;
  }

  return authserv.checkrole().pipe(
    map((data: any) => {
      const role = data?.authorities?.[0]?.authority;

      if (role !== 'LABO') {
        return true;
      }

      return router.createUrlTree(['/Dashboard']);
    })
  );
};