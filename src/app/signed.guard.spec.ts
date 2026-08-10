import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signedGuard } from './signed.guard';
import { EngagementService } from './service/engagement.service';

describe('signedGuard', () => {
  const routerMock = { navigate: jasmine.createSpy('navigate') };
  const engagementService = { getStatut: jasmine.createSpy('getStatut') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: EngagementService, useValue: engagementService },
        { provide: Router, useValue: routerMock }
      ]
    });
    routerMock.navigate.calls.reset();
    localStorage.clear();
  });

  it('should allow guests', () => {
    localStorage.setItem('type', 'guest');

    const result = TestBed.runInInjectionContext(() =>
      signedGuard({} as any, {} as any) as any
    );

    expect(result).toBeTrue();
  });

  it('should allow access when sign is not signed', () => {
    localStorage.setItem('sign', 'pending');

    const result = TestBed.runInInjectionContext(() =>
      signedGuard({} as any, {} as any) as any
    );

    expect(result).toBeTrue();
  });

  it('should redirect to / and deny when already signed', () => {
    localStorage.setItem('sign', 'signed');

    const result = TestBed.runInInjectionContext(() =>
      signedGuard({} as any, {} as any) as any
    );

    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
