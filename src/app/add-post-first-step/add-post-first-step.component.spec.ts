import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPostFirstStepComponent } from './add-post-first-step.component';

describe('AddPostFirstStepComponent', () => {
  let component: AddPostFirstStepComponent;
  let fixture: ComponentFixture<AddPostFirstStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPostFirstStepComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPostFirstStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
