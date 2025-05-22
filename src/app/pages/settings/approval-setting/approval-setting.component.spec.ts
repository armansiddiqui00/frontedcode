import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalSettingComponent } from './approval-setting.component';

describe('ApprovalSettingComponent', () => {
  let component: ApprovalSettingComponent;
  let fixture: ComponentFixture<ApprovalSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovalSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
