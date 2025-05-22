import { CommonModule, DecimalPipe } from '@angular/common';

//import { SharedModule } from './shared.module';
//import { TravelDeskComponent } from './travel-desk.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { InvoiceDetailsComponent } from './invoice-details.component';

import { InvoiceRoutingModule } from './invoice-details-routing.module';

import { SharedModule } from './shared.module';


@NgModule({
  declarations: [InvoiceDetailsComponent ],
  imports: [
    CommonModule,
    InvoiceRoutingModule,
   SharedModule,
  
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
  providers:[DecimalPipe]
})
export class InvoiceDetailsModule { }