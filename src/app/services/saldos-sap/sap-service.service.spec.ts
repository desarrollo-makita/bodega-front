import { TestBed } from '@angular/core/testing';

import { SapServiceService } from './sap-service.service';

describe('SapServiceService', () => {
  let service: SapServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SapServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
