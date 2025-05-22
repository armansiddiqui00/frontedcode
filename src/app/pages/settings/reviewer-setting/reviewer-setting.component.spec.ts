import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewerSettingComponent } from './reviewer-setting.component';

describe('ReviewerSettingComponent', () => {
  let component: ReviewerSettingComponent;
  let fixture: ComponentFixture<ReviewerSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewerSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewerSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
