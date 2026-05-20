import { TestBed } from '@angular/core/testing';

import { DeliveryZoneService } from './delivery-zone.service';

describe('DeliveryZoneService', () => {
  let service: DeliveryZoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryZoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
