import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceSheetComponent } from './invoice-sheet.component';

describe('InvoiceSheetComponent', () => {
  let component: InvoiceSheetComponent;
  let fixture: ComponentFixture<InvoiceSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
