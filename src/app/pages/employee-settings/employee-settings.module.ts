import { CommonModule } from '@angular/common';

//import { SharedModule } from './shared.module';
//import { TravelDeskComponent } from './travel-desk.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms'
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { NgxMaskDirective, NgxMaskModule, NgxMaskPipe } from 'ngx-mask';
import { ManageEmployeeComponent } from './manage-employee/manage-employee.component';
import { ManageProjectComponent } from './manage-project/manage-project.component';

import { DxDataGridModule } from 'devextreme-angular';
import { DatagridComponent } from './datagrid/datagrid.component';
import { EmployeeSettingsComponent } from './employee-settings.component';
import { SharedModule } from './shared.module';
import { EmployeeSettingRoutingModule } from './employee-setting-routing.module';


@NgModule({
  declarations: [EmployeeSettingsComponent],
  imports: [
    SharedModule,
    EmployeeSettingRoutingModule,
  CommonModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
})
export class EmployeeSettingsModule { }