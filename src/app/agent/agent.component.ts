import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '../_models';
import { UserService } from '../_services';
import { ButtonRendererComponent } from '../renderer/button-renderer.component';

@Component({selector:'agent-action', templateUrl: 'agent.component.html' })
export class AgentComponent implements OnInit {
    frameworkComponents: any;
    loading = false;
    users: User[] = [];
    rowDataClicked1 = {};
    rowDataClicked2 = {};
    columnDefs1 = [
       
        {headerName: 'Employee Name', field: 'empName', sortable: true, filter: true},
        //{headerName: 'Phone Number', field: 'phone',sortable: true, filter: true },
        {headerName: 'Email', field: 'email',sortable: true, filter: true},
       // {headerName: 'Department', field: 'department',sortable: true, filter: true},
        {headerName: 'Departure Date', field: 'depatureDate',sortable: true, filter: true},
        {headerName: 'Arrival Date', field: 'arrivalDate',sortable: true, filter: true}, 
        //{headerName: 'Purpose of Travel', field: 'pofTravel',sortable: true, filter: true},
        {headerName: 'Destination', field: 'destination',sortable: true, filter: true},
        {headerName: 'Approved By Manager', field: 'approvedByManager',sortable: true, filter: true}, 
        {headerName: 'Approved By HR', field: 'approvedByHr',sortable: true, filter: true},
       {headerName: 'Download',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onBtnClick1.bind(this),
          label: 'Download'
        }
       },
       {headerName: 'Print',
       cellRenderer: 'buttonRenderer',
       cellRendererParams: {
         onClick: this.onBtnClick1.bind(this),
         label: 'Print'
       }
      },
        
    ];

    rowData1 = [
        { empName:'Akram Siddiqui', email: 'akaram.siddiqui@amconsult.com', destination:'UAE', depatureDate: '31-12-2019', arrivalDate: '31-12-2019', approvedByManager:'Anjum', approvedByHr:'Piyusha'},
        { empName:'Azhar Ch', email: 'azhar.chawdhari@amconsult.com', destination:'Saudi Arabia', depatureDate: '31-12-2019', arrivalDate: '31-12-2019', approvedByManager:'Samir',approvedByHr:'Mohshin'},
        { empName:'Salman Siddiqui', phone:'8260231560', email: 'salman.siddiqui@amconsult.com',destination:'USA', depatureDate: '30-12-2019', arrivalDate: '31-12-2019', approvedByManager:'Anjum',approvedByHr:'Piyusha'},
        { empName:'Alwin',email: 'alwin@amconsult.com', destination:'Mumbai',depatureDate: '28-12-2019', approvedBy:'Anjum',approvedByHr:'Piyusha'},
        { empName:'xyz',email: 'xyz@amconsult.com',  destination:'Delhi', depatureDate: '25-12-2019', arrivalDate: '31-12-2019', approvedByManager:'Samir',approvedByHr:'Piyusha'},
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