import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDonationsComponent } from './admin-donations.component';

describe('AdminDonationsComponent', () => {
  let component: AdminDonationsComponent;
  let fixture: ComponentFixture<AdminDonationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminDonationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDonationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
