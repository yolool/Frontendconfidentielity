import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { HeaderComponent } from './header.component';
import { AuthService } from '../service/auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: any;

  beforeEach(async () => {
    authService = {
      isAuthenticated: signal(false),
      logout: jasmine.createSpy('logout').and.returnValue(of({}))
    };
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the authentication signal', () => {
    expect(component.login()).toBeFalse();
  });

  it('Logout clears storage and calls the auth service', () => {
    localStorage.setItem('foo', 'bar');

    component.Logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(localStorage.getItem('foo')).toBeNull();
  });
});
