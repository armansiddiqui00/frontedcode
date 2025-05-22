import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewInvoiceComponent } from './review-invoice.component';

describe('ReviewInvoiceComponent', () => {
  let component: ReviewInvoiceComponent;
  let fixture: ComponentFixture<ReviewInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
