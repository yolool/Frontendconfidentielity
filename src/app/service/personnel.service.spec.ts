import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DepartementDto, PersonnelDto, PersonnelService } from './personnel.service';

describe('PersonnelService', () => {
  let service: PersonnelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PersonnelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getdeps GETs /deps', () => {
    const deps: DepartementDto[] = [{ dep: 'LABO' }, { dep: 'CHIMIE' }];
    let result: DepartementDto[] | undefined;

    service.getdeps().subscribe((r) => (result = r));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/Personnel/deps');
    expect(req.request.method).toBe('GET');
    req.flush(deps);

    expect(result).toEqual(deps);
  });

  it('getPersonnel GETs /:id', () => {
    const p: PersonnelDto = { IdPersonnel: '1', Name: 'N', Department: 'D' };
    let result: PersonnelDto | undefined;

    service.getPersonnel('1').subscribe((r) => (result = r));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/Personnel/1');
    expect(req.request.method).toBe('GET');
    req.flush(p);

    expect(result).toEqual(p);
  });
});
