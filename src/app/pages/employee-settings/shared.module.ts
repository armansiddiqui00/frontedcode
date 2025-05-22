import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule, DatePipe } from "@angular/common";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DxDataGridModule} from 'devextreme-angular';
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { ManageEmployeeComponent } from "./manage-employee/manage-employee.component";
import { ManageProjectComponent } from "./manage-project/manage-project.component";
import { DatagridComponent } from "./datagrid/datagrid.component";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BlockCopyPasteDirective } from "src/app/shared/directives/block_copy_paste.directive";

@NgModule({
    declarations:[ManageEmployeeComponent,ManageProjectComponent,DatagridComponent,BlockCopyPasteDirective],
    imports:[FormsModule,CommonModule,BsDatepickerModule.forRoot(),DxDataGridModule,AngularMultiSelectModule,BsDropdownModule.forRoot(),NgbModule],
    exports:[ManageEmployeeComponent,ManageProjectComponent,DatagridComponent],
    providers:[DatePipe]
    
})
export class SharedModule{}