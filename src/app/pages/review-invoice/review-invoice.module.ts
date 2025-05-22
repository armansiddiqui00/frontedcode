import { CommonModule } from '@angular/common';

//import { SharedModule } from './shared.module';
//import { TravelDeskComponent } from './travel-desk.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule }   from '@angular/forms'
import { InvoiceHistoryComponent } from './invoice-history/invoice-history.component';
import { InvoiceReviewComponent } from './invoice-review/invoice-review.component';
import { DataGridComponent } from './datagrid/datagrid.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DxDataGridModule, DxTemplateModule, DxTooltipModule } from 'devextreme-angular';
import { ReviewInvoiceModalComponent } from './review-invoice-modal/review-invoice-modal.component';
import { ReviewInvoiceRoutingModule } from './review-invoice-routing.module';
import { SharedModule } from './shared.module';
import { EmployeeSettingsComponent } from '../employee-settings/employee-settings.component';
import { ReviewInvoiceComponent } from './review-invoice.component';
//import {NgxMaskModule} from 'ngx-mask'


@NgModule({
  declarations: [ReviewInvoiceComponent],
  imports: [
    CommonModule,
    ReviewInvoiceRoutingModule,
    SharedModule
    //NgxMaskModule.forRoot()
  
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
})
export class ReviewModule { }