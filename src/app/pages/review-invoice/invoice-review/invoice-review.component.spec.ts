import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceReviewComponent } from './invoice-review.component';

describe('InvoiceReviewComponent', () => {
  let component: InvoiceReviewComponent;
  let fixture: ComponentFixture<InvoiceReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
