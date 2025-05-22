import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTravelReqComponent } from './view-travel-req.component';

describe('ViewTravelReqComponent', () => {
  let component: ViewTravelReqComponent;
  let fixture: ComponentFixture<ViewTravelReqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTravelReqComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTravelReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
