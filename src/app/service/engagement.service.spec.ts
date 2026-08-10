import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EngagementDto, EngagementService } from './engagement.service';

describe('EngagementService', () => {
  let service: EngagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(EngagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uploadEngagement posts a FormData to /upload', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const dto: EngagementDto = {
      id: 1n,
      name: 'x',
      type: 'pdf',
      statut: 'pending',
      url: 'u',
      IdPersonnel: '123'
    };

    service.uploadEngagement(file, 'subject value', '123').subscribe((r) => {
      expect(r).toEqual(dto);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/engagement/upload');
    expect(req.request.method).toBe('POST');
    const body = req.request.body as FormData;
    expect(body.get('subject')).toBe('subject value');
    expect(body.get('idPersonnel')).toBe('123');
    expect((body.get('file') as File).name).toBe('test.pdf');
    req.flush(dto);
  });

  it('uploadEngagement omits idPersonnel when not provided', () => {
    const file = new File(['c'], 't.pdf');

    service.uploadEngagement(file, 'subject', '').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/engagement/upload');
    const body = req.request.body as FormData;
    expect(body.get('idPersonnel')).toBeNull();
    req.flush({});
  });

  it('getStatut GETs /perso/:id', () => {
    const dto: EngagementDto = {
      id: 1n,
      name: 'n',
      type: 't',
      statut: 'signed',
      url: 'u',
      IdPersonnel: 'p'
    };
    let result: EngagementDto | undefined;

    service.getStatut('p1').subscribe((r) => (result = r));

    const req = httpMock.expectOne('http://localhost:8080/api/v1/engagement/perso/p1');
    expect(req.request.method).toBe('GET');
    req.flush(dto);

    expect(result).toEqual(dto);
  });
});
