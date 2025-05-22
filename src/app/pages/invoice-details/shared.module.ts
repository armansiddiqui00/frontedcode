import { CommonModule, DecimalPipe } from '@angular/common';

//import { SharedModule } from './shared.module';
//import { TravelDeskComponent } from './travel-desk.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms'
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { NgxMaskDirective, NgxMaskModule, NgxMaskPipe } from 'ngx-mask';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxCurrencyModule } from "ngx-currency"

import { InvoiceSheetComponent } from './invoice-sheet/invoice-sheet.component';

@NgModule({
  declarations: [ InvoiceSheetComponent],
  imports: [
    CommonModule,
    FormsModule,
    AngularMultiSelectModule,
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    PdfViewerModule,
    NgxCurrencyModule,
 
  //  NgxMaskDirective, NgxMaskPipe
  
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
  exports:[InvoiceSheetComponent],
  providers:[DecimalPipe]
})
export class SharedModule {}