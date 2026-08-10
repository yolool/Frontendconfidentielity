import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { PersonnelService } from '../service/personnel.service';
import { EngagementService } from '../service/engagement.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let personnelService: any;
  let engagementService: any;

  beforeEach(async () => {
    personnelService = {
      getPersonnel: jasmine
        .createSpy('getPersonnel')
        .and.returnValue(of({ IdPersonnel: '1', Name: 'N', Department: 'D' }))
    };
    engagementService = {
      getStatut: jasmine.createSpy('getStatut').and.returnValue(of({ statut: 'pending' }))
    };
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: PersonnelService, useValue: personnelService },
        { provide: EngagementService, useValue: engagementService },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads personnel and engagement status on init', () => {
    localStorage.setItem('id', '1');
    component.ngOnInit();

    expect(personnelService.getPersonnel).toHaveBeenCalledWith('1');
    expect(engagementService.getStatut).toHaveBeenCalledWith('1');
  });

  it('sets sign to true and stores the sign when status is signed', () => {
    engagementService.getStatut.and.returnValue(of({ statut: 'signed' }));
    localStorage.setItem('id', '1');

    component.ngOnInit();

    expect(component.sign).toBeTrue();
    expect(localStorage.getItem('sign')).toBe('signed');
  });

  it('leaves sign false for a pending status', () => {
    engagementService.getStatut.and.returnValue(of({ statut: 'pending' }));
    localStorage.setItem('id', '1');

    component.ngOnInit();

    expect(component.sign).toBeFalse();
    expect(localStorage.getItem('sign')).toBeNull();
  });

  it('collapse shows the collapse control', () => {
    component.showexpand = true;
    component.collapse();

    expect(component.showcollapse).toBeTrue();
    expect(component.showexpand).toBeFalse();
  });

  it('extand shows the expand control', () => {
    component.showcollapse = false;
    component.extand();

    expect(component.showcollapse).toBeFalse();
    expect(component.showexpand).toBeTrue();
  });
});
