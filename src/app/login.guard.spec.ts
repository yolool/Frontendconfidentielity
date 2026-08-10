import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { loginGuard } from './login.guard';
import { AuthService } from './service/auth.service';

describe('loginGuard', () => {
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

  it('should redirect to Dashboard and return false when already authenticated', () => {
    authService.checkSession.and.returnValue(of(true));

    let result: unknown;
    TestBed.runInInjectionContext(() =>
      (loginGuard({} as any, {} as any) as any).subscribe((r: unknown) => (result = r))
    );

    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/Dashboard']);
  });

  it('should return true when not authenticated', () => {
    authService.checkSession.and.returnValue(of(false));

    let result: unknown;
    TestBed.runInInjectionContext(() =>
      (loginGuard({} as any, {} as any) as any).subscribe((r: unknown) => (result = r))
    );

    expect(result).toBeTrue();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
