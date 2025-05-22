import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '../_models';
import { UserService } from '../_services';
import { ButtonRendererComponent } from '../renderer/button-renderer.component';

@Component({selector:'hr-action' ,templateUrl: 'hrteam.component.html' })
export class HRTeamComponent implements OnInit {
    frameworkComponents: any;
    loading = false;
    users: User[] = [];
    rowDataClicked1 = {};
    rowDataClicked2 = {};

    columnDefs1 = [
       
         {headerName: 'Employee Name', field: 'empName', sortable: true, filter: true},
         {headerName: 'Phone Number', field: 'phone',sortable: true, filter: true },
         {headerName: 'Email', field: 'email',sortable: true, filter: true},
         {headerName: 'Department', field: 'department',sortable: true, filter: true},
         {headerName: 'Departure Date', field: 'depatureDate',sortable: true, filter: true},
         {headerName: 'Arrival Date', field: 'arrivalDate',sortable: true, filter: true}, 
         {headerName: 'Purpose of Travel', field: 'pofTravel',sortable: true, filter: true},
         {headerName: 'Destination', field: 'destination',sortable: true, filter: true},
         {headerName: 'Approved By', field: 'approvedBy',sortable: true, filter: true}, 
        {headerName: 'Approve',
         cellRenderer: 'buttonRenderer',
         cellRendererParams: {
           onClick: this.onBtnClick1.bind(this),
           label: 'Approved'
         }
        },
        {headerName: 'Reject',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onBtnClick1.bind(this),
          label: 'Rejected'
        }
       },
         
     ];
 
     rowData1 = [
         { empName:'Akram Siddiqui', phone:'8260231560', department:'HR', email: 'akaram.siddiqui@amconsult.com', pofTravel:'Attending metting', destination:'UAE', depatureDate: '31-12-2019', arrivalDate: '31-12-2019', approvedBy:'Anjum'},
         { empName:'Azhar Ch', phone:'8260231560', department:'Management', email: 'azhar.chawdhari@amconsult.com', pofTravel:'Attending metting', destination:'Saudi Arabia', depatureDate: '31-12-2019', arrivalDate: '31-12-2019', approvedBy:'Samir'},
         { empName:'Salman Siddiqui', phone:'8260231560', department:'HR', email: 'salman.siddiqui@amconsult.com', pofTravel:'Attending metting',destination:'USA', depatureDate: '30-12-2019', arrivalDate: '31-12-2019', approvedBy:'Anjum'},
         { empName:'Alwin', phone:'8260231560', department:'Management', email: 'alwin@amconsult.com', pofTravel:'Attending metting', destination:'Mumbai',depatureDate: '28-12-2019', approvedBy:'Anjum'},
         { empName:'xyz', phone:'8260231560', department:'Management', email: 'xyz@amconsult.com',pofTravel:'Attending metting',  destination:'Delhi', depatureDate: '25-12-2019', arrivalDate: '31-12-2019', approvedBy:'Samir'},
        ];


    constructor(private userService: UserService) {
        this.frameworkComponents = {
            buttonRenderer: ButtonRendererComponent,
          }
     }

    ngOnInit() {
        this.loading = true;
        this.userService.getAll().pipe(first()).subscribe(users => {
            this.loading = false;
            this.users = users;
        }); 
    }

   
     onBtnClick1(e) {
        this.rowDataClicked1 = e.rowData;
      }
      
      onBtnClick2(e) {
       this.rowDataClicked2 = e.rowData;
      }
}