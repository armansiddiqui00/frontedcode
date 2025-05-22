import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceReviewInvoiceComponent } from './finance-review-invoice.component';

describe('FinanceReviewInvoiceComponent', () => {
  let component: FinanceReviewInvoiceComponent;
  let fixture: ComponentFixture<FinanceReviewInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinanceReviewInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceReviewInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
