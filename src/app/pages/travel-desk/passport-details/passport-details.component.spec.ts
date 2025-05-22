import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassportDetailsComponent } from './passport-details.component';

describe('PassportDetailsComponent', () => {
  let component: PassportDetailsComponent;
  let fixture: ComponentFixture<PassportDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassportDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
