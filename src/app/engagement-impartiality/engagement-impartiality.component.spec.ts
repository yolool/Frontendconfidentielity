import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { EngagementImpartialityComponent } from './engagement-impartiality.component';
import { EngagementService } from '../service/engagement.service';

describe('EngagementImpartialityComponent', () => {
  let component: EngagementImpartialityComponent;
  let fixture: ComponentFixture<EngagementImpartialityComponent>;
  let engagementService: any;
  const routerMock = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    engagementService = {
      uploadEngagement: jasmine.createSpy('uploadEngagement').and.returnValue(of({}))
    };
    localStorage.clear();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [EngagementImpartialityComponent],
      providers: [
        FormBuilder,
        { provide: EngagementService, useValue: engagementService },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EngagementImpartialityComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes all form controls', () => {
    ['check', 'name', 'teid', 'date'].forEach((name) => {
      expect(component.form.get(name)).toBeTruthy(`missing control ${name}`);
    });
  });

  it('uppercases the teid value on change', () => {
    component.ngOnInit();
    component.form.get('teid')?.setValue('abc');
    expect(component.form.get('teid')?.value).toBe('ABC');
  });

  it('makes teid required by default', () => {
    expect(component.form.get('teid')?.hasValidator(Validators.required)).toBeTrue();
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
    component.ngOnInit();
    component.form.get('teid')?.setValue('ABC');

    await component.generatePdf();

    expect(component.errorMessage()).toBe('the id is invalid');
    expect(engagementService.uploadEngagement).not.toHaveBeenCalled();
  });

  it('generatePdf flags a missing signature', async () => {
    localStorage.setItem('id', '123');
    component.ngOnInit();
    component.form.get('teid')?.setValue('123');
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
    expect((component as any).getErrorMessage({ status: 409, error: null })).toBe(
      'This document has already been submitted.'
    );
    expect((component as any).getErrorMessage({ status: 500, error: null })).toBe(
      'Server error. Please try again later.'
    );
  });

  it('submits the PDF after a valid, signed form', async () => {
    localStorage.setItem('id', '123');
    component.ngOnInit();
    component.form.get('teid')?.setValue('123');
    component.form.get('name')?.setValue('Jean Dupont');

    component.signaturePad = jasmine.createSpyObj('SignaturePad', [
      'isEmpty',
      'clear',
      'off',
      'on'
    ]) as any;
    (component.signaturePad as any).isEmpty.and.returnValue(false);

    const pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    document.body.appendChild(pageDiv);

    engagementService.uploadEngagement.and.returnValue(of({}));

    await component.generatePdf();

    expect(engagementService.uploadEngagement).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
    expect(component.successMessage()).toBe('Document submitted successfully!');

    // wait for the real 1500ms navigation timer
    await new Promise((resolve) => setTimeout(resolve, 1600));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/Dashboard']);

    document.body.removeChild(pageDiv);
  });
});
