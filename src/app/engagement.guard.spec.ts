import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { UrlTree } from '@angular/router';
import { engagementGuard } from './engagement.guard';
import { AuthService } from './service/auth.service';

describe('engagementGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  const routerMock = { navigate: jasmine.createSpy('navigate'), createUrlTree: jasmine.createSpy('createUrlTree') };

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['checkrole']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: routerMock }
      ]
    });
    routerMock.navigate.calls.reset();
    routerMock.createUrlTree.calls.reset();
    localStorage.clear();
  });

  it('should allow guests without calling the service', () => {
    localStorage.setItem('type', 'guest');

    const result = TestBed.runInInjectionContext(() =>
      engagementGuard({} as any, {} as any) as any
    );

    expect(result).toBeTrue();
    expect(authService.checkrole).not.toHaveBeenCalled();
  });

  it('should allow access when role is not LABO', () => {
    authService.checkrole.and.returnValue(of({ authorities: [{ authority: 'USER' }] }));

    let result: unknown;
    TestBed.runInInjectionContext(() =>
      (engagementGuard({} as any, {} as any) as any).subscribe((r: unknown) => (result = r))
    );

    expect(result).toBeTrue();
  });

  it('should redirect to Dashboard when role is LABO', () => {
    authService.checkrole.and.returnValue(of({ authorities: [{ authority: 'LABO' }] }));
    const tree = new UrlTree();
    routerMock.createUrlTree.and.returnValue(tree);

    let result: unknown;
    TestBed.runInInjectionContext(() =>
      (engagementGuard({} as any, {} as any) as any).subscribe((r: unknown) => (result = r))
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/Dashboard']);
    expect(result).toBe(tree);
  });
});
