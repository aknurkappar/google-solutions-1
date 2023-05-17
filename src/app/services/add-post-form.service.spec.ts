import { TestBed } from '@angular/core/testing';

import { AddPostFormService } from './add-post-form.service';

describe('AddPostFormService', () => {
  let service: AddPostFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddPostFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
