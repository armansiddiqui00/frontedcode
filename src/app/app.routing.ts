import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { HRTeamComponent } from './hrteam';
import { LoginComponent } from './login';
import { AuthGuard } from './_helpers';
import { Role } from './_models';
import { ManagerComponent } from './manager';
import { AgentComponent } from './agent';
import { BusinesstripComponent } from './businesstrip';
import { PermissionDeniedComponent } from './components/permission-denied/permission-denied.component';
import { PageConfigService } from './services/page-config.service';
import { InvoiceDetailsComponent } from './pages/invoice-details/invoice-details.component';
import { ReviewInvoiceComponent } from './pages/review-invoice/review-invoice.component';
import { InvoiceSheetComponent } from './pages/invoice-details/invoice-sheet/invoice-sheet.component';
import { InvoiceReviewComponent } from './pages/review-invoice/invoice-review/invoice-review.component';
import { InvoiceHistoryComponent } from './pages/review-invoice/invoice-history/invoice-history.component';
import { AttendanceTimesheetComponent } from './pages/invoice-details/attendance-timesheet/attendance-timesheet.component';
//import { InvoiceComponent } from './pages/invoice/invoice/invoice.component';
//import { CanDeactivateGuard } from './_helpers/canDeactivateGuard';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    /* {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard]
    }, */
    {
        path: '',
        component: LoginComponent,
        canActivate: [AuthGuard]
    },
    
      {
        path:'rims/emp', 
            children:[
                {
                    path:'submittimesheet',  loadChildren: ()=> import('./pages/timesheet/timesheet.module').then(m => m.TimesheetModule),
                    resolve:{
                        config: PageConfigService
                    }
                },
                {
                    path:'viewtimesheet' , loadChildren: ()=> import('./pages/timesheet/timesheet.module').then(m => m.TimesheetModule),
                    resolve:{
                        config: PageConfigService
                    }
                },
                {
                    path:'Inbox' , loadChildren: ()=> import('./pages/timesheet/timesheet.module').then(m => m.TimesheetModule),
                    resolve:{
                        config: PageConfigService
                    }
                },
                {
                    path:'travelRequest', loadChildren: ()=> import('./pages/travel-desk/travel-desk.module').then(m => m.TravelDeskModule),
                    resolve:{
                       // config: PageConfigService
                    }
                },
                {
                    path:'visaDetails' , loadChildren: ()=> import('./pages/travel-desk/travel-desk.module').then(m => m.TravelDeskModule),
                    resolve:{
                       // config: PageConfigService
                    }
                },
                {
                    path:'viewTravelReqStatus' , loadChildren: ()=> import('./pages/travel-desk/travel-desk.module').then(m => m.TravelDeskModule),
                    resolve:{
                       // config: PageConfigService
                    }
                },
                {
                    path:'travelExpense' , loadChildren: ()=> import('./pages/travel-desk/travel-desk.module').then(m => m.TravelDeskModule),
                    resolve:{
                      //  config: PageConfigService
                    }
                },
                {
                    path:'travelExpenseEdit' , loadChildren: ()=> import('./pages/travel-desk/travel-desk.module').then(m => m.TravelDeskModule),
                    resolve:{
                        //config: PageConfigService
                    }
                },
                {
                    path:'demoPage' , loadChildren: ()=> import('./pages/travel-desk/travel-desk.module').then(m => m.TravelDeskModule),
                    resolve:{
                        config: PageConfigService
                    }
                },
                {
                    path:'reviwerSetting' , loadChildren: ()=> import('./pages/settings/settings.module').then(m => m.SettingsModule),
                    resolve:{
                        config: PageConfigService
                    }
                },
                {
                    path:'approvalSetting' , loadChildren: ()=> import('./pages/settings/settings.module').then(m => m.SettingsModule),
                    resolve:{
                        config: PageConfigService
                    }
                },
                // {
                //     path: 'employee' , loadChildren: ()=> import('./pages/admin/admin.module').then(m => m.AdminModule),
                //     resolve:{
                //         config: PageConfigService
                //     }
                // },
                // {
                //     path: 'designation' , loadChildren: ()=> import('./pages/admin/admin.module').then(m => m.AdminModule),
                //     resolve:{
                //         config: PageConfigService
                //     }
                // },
                // {
                //     path: 'project' , loadChildren: ()=> import('./pages/admin/admin.module').then(m => m.AdminModule),
                //     resolve:{
                //         config: PageConfigService
                //     }
                // },
                // {
                //     path: 'task' , loadChildren: ()=> import('./pages/admin/admin.module').then(m => m.AdminModule),
                //     resolve:{
                //         config: PageConfigService
                //     }
                // },
                // {
                //     path: 'taskmapping' , loadChildren: ()=> import('./pages/admin/admin.module').then(m => m.AdminModule),
                //     resolve:{
                //         config: PageConfigService
                //     }
                // },
                // {
                //     path: 'empmapping' , loadChildren: ()=> import('./pages/admin/admin.module').then(m => m.AdminModule),
                //     resolve:{
                //         config: PageConfigService
                //     }
                // },
                // {
                //     path:'passport' , loadChildren: ()=> import('./pages/admin/admin.module').then(m => m.AdminModule),
                //     resolve:{
                //         config: PageConfigService
                //     }
                // },
                {
                    path:'employee', loadChildren: ()=> import('./pages/employee-settings/employee-settings.module').then(m => m.EmployeeSettingsModule),
                    resolve:{
                        config: PageConfigService
                    }
                },
                {
                    path:'project' , loadChildren: ()=> import('./pages/employee-settings/employee-settings.module').then(m => m.EmployeeSettingsModule),
                    resolve:{
                        config: PageConfigService
                    }
                },
                {
                    path:'task' , loadChildren: ()=> import('./pages/review-invoice/review-invoice.module').then(m => m.ReviewModule),
                    resolve:{
                        config: PageConfigService
                    }
                },
                {
                    path:'designation' , loadChildren: ()=> import('./pages/review-invoice/review-invoice.module').then(m => m.ReviewModule),
                    resolve:{
                        config: PageConfigService
                    }
                },
            ]
      },
      {
        path:'dwc/master', 
        children:[
            {
                path:'manageemployee', loadChildren: ()=> import('./pages/employee-settings/employee-settings.module').then(m => m.EmployeeSettingsModule),
                resolve:{
                    config: PageConfigService
                }
            }, {
                path:'manageproject', loadChildren: ()=> import('./pages/employee-settings/employee-settings.module').then(m => m.EmployeeSettingsModule),
                resolve:{
                    config: PageConfigService
                }
            },
        ]
      },
   //   {
//   {
//         path:'dwc/inv', component:InvoiceDetailsComponent,
//         resolve:{
//             config: PageConfigService
//         }
//       },

      {
        path:'dwc/inv', 
        children:[
            {
                path:'createinvoice' ,loadChildren: ()=> import('./pages/invoice-details/invoice-details.module').then(m => m.InvoiceDetailsModule),
                resolve:{
                    config: PageConfigService
                }
            }
            
        ]
      },

      {
        path:'dwc/inv', 
        children:[
            {
                path:'reviewinvoice', loadChildren: ()=> import('./pages/review-invoice/review-invoice.module').then(m => m.ReviewModule),
                resolve:{
                    config: PageConfigService
                }
            }, {
                path:'invoicehistory', loadChildren: ()=> import('./pages/review-invoice/review-invoice.module').then(m => m.ReviewModule),
                resolve:{
                    config: PageConfigService
                }
            }, {
                path:'processinvoices', loadChildren: ()=> import('./pages/review-invoice/review-invoice.module').then(m => m.ReviewModule),
                resolve:{
                    config: PageConfigService
                }
            },
	        {
                path:'attendence', loadChildren: ()=> import('./pages/review-invoice/review-invoice.module').then(m => m.ReviewModule),
                resolve:{
                    config: PageConfigService
                }
            },
            {
                path:'releasednote', loadChildren: ()=> import('./pages/review-invoice/review-invoice.module').then(m => m.ReviewModule),
                resolve:{
                    config: PageConfigService
                }
            },
        ]
      },
      {
        path:'dwc/inv/reviewinvoice', component:InvoiceReviewComponent,
        resolve:{
            config: PageConfigService
        }
      },{
        path:'dwc/inv/invoicehistory', component:InvoiceHistoryComponent,
        resolve:{
            config: PageConfigService
        }
    },
      { path: 'permission-denied', component:PermissionDeniedComponent},
      { path: 'invoice-details-component', component:InvoiceDetailsComponent,resolve:{
        config: PageConfigService
    }},
    //   { path: 'review-invoice-component', component:ReviewInvoiceComponent},
    //   { path: 'invoice-sheet-component', component:InvoiceSheetComponent,resolve:{
    //     config: PageConfigService
    // }},
      { path: 'attendanceTimesheet-component', component:AttendanceTimesheetComponent,resolve:{
        config: PageConfigService
    }},
    //   { path: 'invoice-review-component', component:InvoiceReviewComponent,resolve:{
    //     config: PageConfigService
    // }},
    //   { path: 'invoice-history-component', component:InvoiceHistoryComponent,resolve:{
    //     config: PageConfigService
    // }},

    //   { path: 'manage-employee-component', component:ManageEmployeeComponent},
    //   { path: 'manage-project-component', component:ManageProjectComponent},

    /* 
    {
        path: 'businesstrip',
        component: BusinesstripComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'hrteam',
        component: HRTeamComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.HR] }
    },
    {
        path: 'manager',
        component: ManagerComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Manager] }
    },
    {
        path: 'agent',
        component: AgentComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.agent] }
    },
    {
        path: 'login',
        component: LoginComponent
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' } */


];

export const appRoutingModule = RouterModule.forRoot(routes);