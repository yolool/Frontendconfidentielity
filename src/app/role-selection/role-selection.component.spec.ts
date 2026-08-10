import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RoleSelectionComponent } from './role-selection.component';

describe('RoleSelectionComponent', () => {
  let component: RoleSelectionComponent;
  let fixture: ComponentFixture<RoleSelectionComponent>;
  const routerMock = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    localStorage.clear();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [RoleSelectionComponent],
      providers: [{ provide: Router, useValue: routerMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleSelectionComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes the role radio group', () => {
    expect(component.radioGroupe.get('role')).toBeTruthy();
  });

  it('shows the option group for PersonelTE', () => {
    component.radioGroupe.get('role')?.setValue('PersonelTE');
    component.verifierTE();
    expect(component.showoption).toBeTrue();
  });

  it('hides the option group for PersonelExtern', () => {
    component.radioGroupe.get('role')?.setValue('PersonelExtern');
    component.verifierTE();
    expect(component.showoption).toBeFalse();
  });

  it('routes to Engagment as guest for PersonelExtern', () => {
    component.radioGroupe.get('role')?.setValue('PersonelExtern');
    component.OnSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/Engagment']);
    expect(localStorage.getItem('type')).toBe('guest');
  });

  it('routes to login and flags PersonelLaboTE', () => {
    component.radioGroupe.get('role')?.setValue('PersonelLaboTE');
    component.OnSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(localStorage.getItem('as')).toBe('PersonelLaboTE');
  });

  it('routes to login and flags AutrePersonelTE', () => {
    component.radioGroupe.get('role')?.setValue('AutrePersonelTE');
    component.OnSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(localStorage.getItem('as')).toBe('AutrePersonelTE');
  });

  it('does not navigate for an unselected role', () => {
    component.radioGroupe.get('role')?.setValue('');
    component.OnSubmit();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
