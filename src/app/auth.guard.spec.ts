import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from './service/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  const routerMock = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['checkSession']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: routerMock }
      ]
    });
    routerMock.navigate.calls.reset();
  });

  it('should return true when authenticated', () => {
    authService.checkSession.and.returnValue(of(true));

    let result: unknown;
    TestBed.runInInjectionContext(() =>
      (authGuard({} as any, {} as any) as any).subscribe((r: unknown) => (result = r))
    );

    expect(authService.checkSession).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('should redirect to / and return false when not authenticated', () => {
    authService.checkSession.and.returnValue(of(false));

    let result: unknown;
    TestBed.runInInjectionContext(() =>
      (authGuard({} as any, {} as any) as any).subscribe((r: unknown) => (result = r))
    );

    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
