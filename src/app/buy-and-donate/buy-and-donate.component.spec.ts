import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyAndDonateComponent } from './buy-and-donate.component';

describe('BuyAndDonateComponent', () => {
  let component: BuyAndDonateComponent;
  let fixture: ComponentFixture<BuyAndDonateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyAndDonateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyAndDonateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
