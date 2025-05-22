import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelDeskComponent } from './travel-desk.component';

describe('TravelDeskComponent', () => {
  let component: TravelDeskComponent;
  let fixture: ComponentFixture<TravelDeskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelDeskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelDeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
