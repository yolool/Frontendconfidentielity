import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, LoginDTO } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const routerMock = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerMock.navigate.calls.reset();
    service.isAuthenticated.set(false);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login posts credentials and sets isAuthenticated to true', () => {
    const credentials: LoginDTO = { idPersonnel: '123', dep: 'LABO' };
    const response = { ok: true };

    service.login(credentials).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    expect(req.request.withCredentials).toBeTrue();
    req.flush(response);

    expect(service.isAuthenticated()).toBeTrue();
  });

  it('logout posts, sets isAuthenticated to false and navigates home', () => {
    service.logout().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/logout');
    expect(req.request.method).toBe('POST');
    req.flush({});

    expect(service.isAuthenticated()).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('checkSession returns true and authenticates on success', () => {
    let result = false;
    service.checkSession().subscribe((r) => (result = r));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/me');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({});

    expect(result).toBeTrue();
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('checkSession returns false and does not authenticate on error', () => {
    let result: boolean | undefined;
    service.checkSession().subscribe((r) => (result = r));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/me');
    req.flush('error', { status: 401, statusText: 'Unauthorized' });

    expect(result).toBeFalse();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('checkrole GETs /me and returns the payload', () => {
    const data = { authorities: [{ authority: 'LABO' }] };
    let result: any;
    service.checkrole().subscribe((r) => (result = r));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush(data);

    expect(result).toEqual(data);
  });
});
