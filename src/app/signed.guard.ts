import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { EngagementService } from './service/engagement.service';
import { map } from 'rxjs';

export const signedGuard: CanActivateFn = (route, state) => {
  const engag = inject(EngagementService);
  const router = inject(Router);


  const userType = localStorage.getItem('type');
 

  if (userType === 'guest') {
    return true;
  }

  
  if (localStorage.getItem('sign') !== 'signed') {
    return true;
  }else{

        router.navigate(['/']);
        return false;
      }

  
};