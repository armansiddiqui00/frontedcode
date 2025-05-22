import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { TravelRequestComponent } from "./travel-request/travel-request.component";
import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { DataGridComponent } from "./data-grid/data-grid.component";
import { DxDataGridModule,DxTemplateModule,DxTemplateHost } from "devextreme-angular";
import { DxTooltipModule } from 'devextreme-angular';
import { TravelDeskModalComponent } from "./travel-desk-modal/travel-desk-modal.component";
import { TravelDeskService } from "./travel-desk-modal/travel-desk.service";
import { VisaComponent } from "./visa/visa.component";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { ViewTravelReqComponent } from "./view-travel-req/view-travel-req.component";
import { TravelExpenseComponent } from "./travel-expense/travel-expense.component";
import { DemoPageComponent } from "./demoPage/demo-page.component";
import { TravelExpenseEditComponent } from "./travel-expense-edit/travel-expense-edit.component";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { TooltipModule } from 'ngx-bootstrap/tooltip';


@NgModule({
    declarations:[TravelRequestComponent,DataGridComponent,TravelDeskModalComponent,VisaComponent,ViewTravelReqComponent,TravelExpenseComponent,DemoPageComponent,TravelExpenseEditComponent],
    imports:[CommonModule,FormsModule,AngularMultiSelectModule,BsDatepickerModule.forRoot(),DxDataGridModule,DxTooltipModule,DxTemplateModule,BsDropdownModule.forRoot(),NgbPaginationModule,TooltipModule.forRoot()],
    exports:[TravelRequestComponent,DataGridComponent,TravelDeskModalComponent,VisaComponent,ViewTravelReqComponent,TravelExpenseComponent,DemoPageComponent,TravelExpenseEditComponent],
    providers:[DatePipe],
    schemas:[CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA]
})
export class SharedModule{}