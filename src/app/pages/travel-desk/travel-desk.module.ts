import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from './shared.module';
import { TravelDeskComponent } from './travel-desk.component';
import { TravelDeskRoutingModule } from './travel-desk-routing.module';


@NgModule({
  declarations: [TravelDeskComponent ],
  imports: [
    CommonModule,
    TravelDeskRoutingModule,
    SharedModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
})
export class TravelDeskModule { }
