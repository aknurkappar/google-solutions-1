import { TestBed } from '@angular/core/testing';

import { ModalConditionService } from './modal-condition.service';

describe('ModalConditionService', () => {
  let service: ModalConditionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalConditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
