import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpecialUsersComponent } from './admin-special-users.component';

describe('AdminSpecialUsersComponent', () => {
  let component: AdminSpecialUsersComponent;
  let fixture: ComponentFixture<AdminSpecialUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminSpecialUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSpecialUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
