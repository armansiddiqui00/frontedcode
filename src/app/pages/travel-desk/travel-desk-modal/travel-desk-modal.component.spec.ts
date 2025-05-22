import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelDeskModalComponent } from './travel-desk-modal.component';

describe('TravelDeskModalComponent', () => {
  let component: TravelDeskModalComponent;
  let fixture: ComponentFixture<TravelDeskModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelDeskModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelDeskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
