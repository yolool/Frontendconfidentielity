import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service/auth.service';
import { map } from 'rxjs';

export const engagementImpGuard: CanActivateFn = (route, state) => {
  const authserv = inject(AuthService)
  const router = inject(Router)
  
     
  return authserv.checkrole().pipe(
    map((data: any) => {
      const userRole = data?.authorities?.[0]?.authority;

      if (userRole === 'LABO') {
        return true; 
      } else {
        router.navigate(['/']);
        return false; 
      }
    }))
 
  
};
