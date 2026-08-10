import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { engagementImpGuard } from './engagement-imp.guard';
import { AuthService } from './service/auth.service';

describe('engagementImpGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  const routerMock = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['checkrole']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: routerMock }
      ]
    });
    routerMock.navigate.calls.reset();
  });

  it('should allow access when role is LABO', () => {
    authService.checkrole.and.returnValue(of({ authorities: [{ authority: 'LABO' }] }));

    let result: unknown;
    TestBed.runInInjectionContext(() =>
      (engagementImpGuard({} as any, {} as any) as any).subscribe((r: unknown) => (result = r))
    );

    expect(result).toBeTrue();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to / and deny access for other roles', () => {
    authService.checkrole.and.returnValue(of({ authorities: [{ authority: 'USER' }] }));

    let result: unknown;
    TestBed.runInInjectionContext(() =>
      (engagementImpGuard({} as any, {} as any) as any).subscribe((r: unknown) => (result = r))
    );

    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
