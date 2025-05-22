import { NgModule } from "@angular/core";
import { ReviewerSettingComponent } from "./reviewer-setting/reviewer-setting.component";
import { ApprovalSettingComponent } from "./approval-setting/approval-setting.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DataGridComponent } from "./data-grid/data-grid.component";
import { DxDataGridModule } from "devextreme-angular";

@NgModule({
    declarations:[ReviewerSettingComponent,ApprovalSettingComponent,DataGridComponent],
    imports:[CommonModule,FormsModule,AngularMultiSelectModule,DxDataGridModule],
    exports:[ReviewerSettingComponent,ApprovalSettingComponent,DataGridComponent],
    providers:[]
})

export class SharedModule{}