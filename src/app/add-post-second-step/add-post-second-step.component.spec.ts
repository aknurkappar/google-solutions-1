import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPostSecondStepComponent } from './add-post-second-step.component';

describe('AddPostSecondStepComponent', () => {
  let component: AddPostSecondStepComponent;
  let fixture: ComponentFixture<AddPostSecondStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPostSecondStepComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPostSecondStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
