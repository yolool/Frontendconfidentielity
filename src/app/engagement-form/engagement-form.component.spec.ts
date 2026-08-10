import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { EngagementFormComponent } from './engagement-form.component';
import { EngagementService } from '../service/engagement.service';

describe('EngagementFormComponent', () => {
  let component: EngagementFormComponent;
  let fixture: ComponentFixture<EngagementFormComponent>;
  let engagementService: any;
  const routerMock = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    engagementService = {
      uploadEngagement: jasmine.createSpy('uploadEngagement').and.returnValue(of({}))
    };
    localStorage.clear();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [EngagementFormComponent],
      providers: [
        FormBuilder,
        { provide: EngagementService, useValue: engagementService },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EngagementFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes all form controls', () => {
    ['check', 'name', 'role', 'company', 'teid', 'city', 'date'].forEach((name) => {
      expect(component.form.get(name)).toBeTruthy(`missing control ${name}`);
    });
  });

  it('uppercases the teid value on change', () => {
    component.ngOnInit();
    component.form.get('teid')?.setValue('abc');
    expect(component.form.get('teid')?.value).toBe('ABC');
  });

  it('makes teid required for non-guest users', () => {
    localStorage.setItem('type', 'labo');
    component.ngOnInit();
    expect(component.form.get('teid')?.hasValidator(Validators.required)).toBeTrue();
  });

  it('keeps teid optional for guests', () => {
    localStorage.setItem('type', 'guest');
    component.ngOnInit();
    expect(component.form.get('teid')?.hasValidator(Validators.required)).toBeFalse();
  });

  it('verfiecheck shows the submit button when checked', () => {
    component.form.get('check')?.setValue(true);
    component.verfiecheck();
    expect(component.showbtn).toBeTrue();
  });

  it('verfiecheck hides the submit button when unchecked', () => {
    component.form.get('check')?.setValue(false);
    component.verfiecheck();
    expect(component.showbtn).toBeFalse();
  });

  it('clearSignature clears the signature pad', () => {
    component.signaturePad = jasmine.createSpyObj('SignaturePad', ['clear']);
    component.clearSignature();
    expect(component.signaturePad.clear).toHaveBeenCalled();
  });

  it('generatePdf rejects when the stored id does not match teid', async () => {
    localStorage.setItem('id', '123');
    localStorage.setItem('type', 'labo');
    component.ngOnInit();
    component.form.get('teid')?.setValue('ABC');

    await component.generatePdf();

    expect(component.errorMessage()).toBe('the id is invalid');
    expect(engagementService.uploadEngagement).not.toHaveBeenCalled();
  });

  it('generatePdf flags a missing signature', async () => {
    localStorage.removeItem('id');
    localStorage.setItem('type', 'guest');
    component.ngOnInit();
    component.signaturePad = jasmine.createSpyObj('SignaturePad', [
      'isEmpty',
      'clear',
      'off',
      'on'
    ]) as any;
    (component.signaturePad as any).isEmpty.and.returnValue(true);

    await component.generatePdf();

    expect(component.signture).toBeTrue();
    expect(component.form.touched).toBeTrue();
    expect(engagementService.uploadEngagement).not.toHaveBeenCalled();
  });

  it('maps HTTP error statuses to messages', () => {
    expect((component as any).getErrorMessage({ status: 401, error: null })).toBe(
      'Session expired. Please login again.'
    );
    expect((component as any).getErrorMessage({ status: 500, error: null })).toBe(
      'Server error. Please try again later.'
    );
  });

  it('submits the PDF after a valid, signed form', async () => {
    localStorage.removeItem('id');
    localStorage.setItem('type', 'labo');
    component.ngOnInit();

    component.form.get('check')?.setValue(true);
    component.form.get('name')?.setValue('Jean Dupont');
    component.form.get('role')?.setValue('Ingénieur');
    component.form.get('company')?.setValue('TE Connectivity');
    component.form.get('teid')?.setValue('TE001');
    component.form.get('city')?.setValue('Casablanca');

    component.signaturePad = jasmine.createSpyObj('SignaturePad', [
      'isEmpty',
      'clear',
      'off',
      'on'
    ]) as any;
    (component.signaturePad as any).isEmpty.and.returnValue(false);

    const contentDiv = document.createElement('div');
    contentDiv.id = 'pdfContent';
    document.body.appendChild(contentDiv);

    engagementService.uploadEngagement.and.returnValue(of({ statut: 'signed' }));

    await component.generatePdf();

    expect(engagementService.uploadEngagement).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
    expect(component.successMessage()).toBe('Document submitted successfully!');

    // wait for the real 1500ms navigation timer
    await new Promise((resolve) => setTimeout(resolve, 1600));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/Dashboard']);

    document.body.removeChild(contentDiv);
  });
});
