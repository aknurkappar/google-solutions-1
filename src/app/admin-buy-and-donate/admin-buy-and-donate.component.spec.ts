import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBuyAndDonateComponent } from './admin-buy-and-donate.component';

describe('AdminBuyAndDonateComponent', () => {
  let component: AdminBuyAndDonateComponent;
  let fixture: ComponentFixture<AdminBuyAndDonateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminBuyAndDonateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBuyAndDonateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
