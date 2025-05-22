import { NgModule } from "@angular/core";
import { DailyTimesheetComponent } from "./daily-timesheet/daily-timesheet.component";
import { FormsModule } from "@angular/forms";
import { CommonModule, DatePipe } from "@angular/common";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { DxDataGridModule } from "devextreme-angular";
import { ViewTimesheetComponent } from "./view-timesheet/view-timesheet.component";
import { DataGirdComponent } from "./data-gird/data-gird.component";

//import { CommonModalService } from "./common-modal/common-modal.service";
import { InboxComponent } from "./inbox/inbox.component";
import { CommonModalComponent } from "./common-modal/common-modal.component";
import { CommonModalService } from "./common-modal/common-modal.service";
import { ModalModule } from 'ngx-bootstrap/modal';


@NgModule({
    declarations:[DailyTimesheetComponent,ViewTimesheetComponent,DataGirdComponent,CommonModalComponent,InboxComponent],
    imports:[FormsModule,CommonModule,BsDatepickerModule.forRoot(),DxDataGridModule,ModalModule.forRoot()],
    exports:[DailyTimesheetComponent,ViewTimesheetComponent,DataGirdComponent,CommonModalComponent,InboxComponent],
    providers:[CommonModalService,DatePipe]
})
export class SharedModule{}