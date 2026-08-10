import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthformComponent } from './authform.component';
import { AuthService } from '../service/auth.service';
import { PersonnelService } from '../service/personnel.service';

describe('AuthformComponent', () => {
  let component: AuthformComponent;
  let fixture: ComponentFixture<AuthformComponent>;
  let authService: any;
  let personnelService: any;
  const routerMock = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    authService = { login: jasmine.createSpy('login').and.returnValue(of({})) };
    personnelService = {
      getdeps: jasmine.createSpy('getdeps').and.returnValue(of([{ dep: 'LABO' }]))
    };
    localStorage.clear();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [AuthformComponent],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authService },
        { provide: PersonnelService, useValue: personnelService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthformComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes a form with idPersonnel and dep controls', () => {
    expect(component.form.get('idPersonnel')).toBeTruthy();
    expect(component.form.get('dep')).toBeTruthy();
  });

  it('shows the department field for AutrePersonelTE', () => {
    localStorage.setItem('as', 'AutrePersonelTE');
    component.ngOnInit();

    expect(component.showdep).toBeTrue();
    expect(component.form.get('dep')?.hasValidator(Validators.required)).toBeTrue();
    expect(personnelService.getdeps).toHaveBeenCalled();
  });

  it('sets the LABO department for PersonelLaboTE', () => {
    localStorage.setItem('as', 'PersonelLaboTE');
    component.ngOnInit();

    expect(component.showdep).toBeFalse();
    expect(component.form.get('dep')?.value).toBe('LABO');
  });

  it('does not call login when the form is invalid', () => {
    component.form.get('idPersonnel')?.setValue('');
    component.ngOnInit();
    component.OnSubmit();

    expect(component.form.touched).toBeTrue();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('logs in and navigates to Dashboard on a valid submit', () => {
    localStorage.setItem('as', 'AutrePersonelTE');
    component.ngOnInit();
    component.form.get('idPersonnel')?.setValue('123');
    component.form.get('dep')?.setValue('LABO');

    component.OnSubmit();

    expect(authService.login).toHaveBeenCalledWith({ idPersonnel: '123', dep: 'LABO' });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/Dashboard']);
    expect(localStorage.getItem('id')).toBe('123');
    expect(localStorage.getItem('logout')).toBe('true');
    expect(component.isLoading()).toBeFalse();
  });
});
