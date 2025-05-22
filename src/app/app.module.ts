import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { AppComponent } from './app.component';
import { appRoutingModule } from './app.routing';
import { ToastrModule } from 'ngx-toastr';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { HomeComponent } from './home';
import { HRTeamComponent } from './hrteam';
import { ManagerComponent } from './manager';
//import { AgentComponent } from './agent';
 
import { AgentComponent } from './agent';
import { AgGridModule } from 'ag-grid-angular';
import { BusinesstripComponent } from './businesstrip'; 
import { FormsModule }   from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonRendererComponent } from './renderer/button-renderer.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { PageNameComponent } from './components/page-name/page-name.component';
import { User } from './_models';
import { HeaderComponent } from './components/header/header.component';
import { SideMenuService } from './services/side-menu.service';
import { FooterComponent } from './components/footer/footer.component';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';

import { RestApiService } from './services/rest-api.service';
import { CommonModalService } from './pages/timesheet/common-modal/common-modal.service';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { TravelDeskService } from './pages/travel-desk/travel-desk-modal/travel-desk.service';
import { ConfirmationDialogService } from './components/confirmation-dialog/confirmation-dialog.service';
import { PermissionDeniedComponent } from './components/permission-denied/permission-denied.component';
import { PageConfigService } from './services/page-config.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DxDataGridModule,DxTemplateModule } from "devextreme-angular";
//import { InvoiceDetailsComponent } from './pages/invoice-details/invoice-details.component';
import { ReviewInvoiceComponent } from './pages/review-invoice/review-invoice.component';
//import { InvoiceSheetComponent } from './pages/invoice-details/invoice-sheet/invoice-sheet.component';
//import { InvoiceReviewComponent } from './pages/review-invoice/invoice-review/invoice-review.component';
//import { InvoiceHistoryComponent } from './pages/review-invoice/invoice-history/invoice-history.component';
import { InvoiceDetailsModule } from './pages/invoice-details/invoice-details.module';
import { InvoiceService } from './pages/invoice-details/invoice.service';
import { ReviewModule } from './pages/review-invoice/review-invoice.module';
import { FileUploadService } from './pages/invoice-details/file-upload.service';
import { ReviewService } from './pages/review-invoice/review-invoice-modal/review.service';
import { NgxMaskDirective, NgxMaskModule, NgxMaskPipe } from 'ngx-mask';
import { EmployeeSettingsModule } from './pages/employee-settings/employee-settings.module';
// import { EmployeeSettingsComponent } from './pages/employee-settings/employee-settings.component';
// import { ManageEmployeeComponent } from './pages/employee-settings/manage-employee/manage-employee.component';
// import { ManageProjectComponent } from './pages/employee-settings/manage-project/manage-project.component';
// import { PackageHistoryComponent } from './pages/employee-settings/package-history/package-history.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedService } from './services/shared.service';
import { SignatureService } from './services/SignatureService';
 
import { LoaderService } from './services/loader.service';
import { LoginComponent } from './login/login.component';
import { AttendanceTimesheetComponent } from './pages/invoice-details/attendance-timesheet/attendance-timesheet.component';
import { RightMenuComponent } from './components/right-menu/right-menu.component';
import { ReleasedModal } from './pages/review-invoice/released-note/release-note-modal.service';
import { RouteService } from './services/router.service';


@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        appRoutingModule,
        //AgGridModule.withComponents([ButtonRendererComponent]),
        AgGridModule,
        FormsModule,
        BrowserAnimationsModule,
        NgbModule,
        ToastrModule.forRoot(),
        SocialLoginModule,
	      NgbModule,
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        DxTemplateModule,
       InvoiceDetailsModule,
       ReviewModule,
       EmployeeSettingsModule,
     //  NgxMaskModule.forRoot(),
        PdfViewerModule
       
       ],
    declarations: [
        AppComponent,
        HomeComponent,
        HRTeamComponent,
        ManagerComponent,
        AgentComponent,
        LoginComponent,
        BusinesstripComponent,
        ButtonRendererComponent,
        SideMenuComponent,
        PageNameComponent,
        HeaderComponent,
        FooterComponent,
        ConfirmationDialogComponent,
        AttendanceTimesheetComponent,
        RightMenuComponent,
        // EmployeeSettingsComponent,
        // ManageEmployeeComponent,
        // ManageProjectComponent,
        // PackageHistoryComponent,
       // InvoiceReviewComponent,
       // InvoiceHistoryComponent,
       
        
    ],
    providers: [SharedService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: LocationStrategy, useClass: HashLocationStrategy },

        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
              autoLogin: false,
              providers: [
                {
                  id: GoogleLoginProvider.PROVIDER_ID,
                  provider: new GoogleLoginProvider(
                    '974596587527-kjic913pv3c34paf35il047lk4pc4qvj.apps.googleusercontent.com'
                  )
                }
              ]
            } as SocialAuthServiceConfig,
          } ,

        // provider used to create fake backend
        fakeBackendProvider,
        User,
        SideMenuService,
        RestApiService,
        CommonModalService,
        TravelDeskService,
        ConfirmationDialogService ,
        PageConfigService,
        InvoiceService,
        DatePipe,
        FileUploadService,
        ReviewService,
        SignatureService,
        ReleasedModal,
        RouteService
        
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent]
})

export class AppModule { }