import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimesheetRoutingModule } from './timesheet-routing.module';
import { SharedModule } from './shared.module';
import { TimeSheetComponent } from './timesheet.component';


@NgModule({
  declarations: [TimeSheetComponent ],
  imports: [
    CommonModule,
    TimesheetRoutingModule,
    SharedModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
})
export class TimesheetModule { }
