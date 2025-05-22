import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule, DatePipe } from "@angular/common";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DxDataGridModule, DxSelectBoxModule} from 'devextreme-angular';
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { DataGridComponent } from "./datagrid/datagrid.component";
import { InvoiceHistoryComponent } from "./invoice-history/invoice-history.component";
import { ReviewInvoiceModalComponent } from "./review-invoice-modal/review-invoice-modal.component";
import { InvoiceReviewComponent } from "./invoice-review/invoice-review.component";
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { WjInputModule } from '@grapecity/wijmo.angular2.input';
import { DetailGridComponent } from "./detail-grid/detail-grid/detail-grid.component";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { FinanceReviewInvoiceComponent } from "./finance-review-invoice/finance-review-invoice/finance-review-invoice.component";
import { ReportsAttendenceComponent } from "./reports/reports-attendence.component";
import { ReleasedNoteComponent } from "./released-note/released-note.component";
@NgModule({
    declarations:[InvoiceReviewComponent,InvoiceHistoryComponent,DataGridComponent,ReviewInvoiceModalComponent,DetailGridComponent,FinanceReviewInvoiceComponent,ReportsAttendenceComponent,ReleasedNoteComponent],
    imports:[FormsModule,CommonModule,BsDatepickerModule.forRoot(),DxDataGridModule,AngularMultiSelectModule,PdfViewerModule,WjInputModule,BsDropdownModule,DxSelectBoxModule],
    exports:[InvoiceReviewComponent,InvoiceHistoryComponent,DataGridComponent,ReviewInvoiceModalComponent,DetailGridComponent,FinanceReviewInvoiceComponent,ReportsAttendenceComponent,ReleasedNoteComponent],
    providers:[DatePipe]
    
})
export class SharedModule{}