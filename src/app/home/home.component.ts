import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '../_models';
import { UserService, AuthenticationService } from '../_services';

@Component({ templateUrl: 'home.component.html', styleUrls:['home.component.scss'] })
export class HomeComponent {
    loading = false;
    currentUser: User;
    userFromApi: User;
    columnDefs:any[];
    rowData:any[];

    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    ngOnInit() {
        this.loading = true;
        this.userService.getById(this.currentUser.id).pipe(first()).subscribe(user => {
            this.loading = false;
            this.userFromApi = user;
        });

        this.columnDefs = [
           // {headerName: 'Request Id', field: 'requestId' },
            {headerName: 'Employee Name', field: 'empName' },
            {headerName: 'Phone Number', field: 'phone' },
            {headerName: 'Email', field: 'email'},
            {headerName: 'Department', field: 'department'},
            {headerName: 'Departure Date', field: 'depatureDate'},
            {headerName: 'Arrival Date', field: 'arrivalDate'}, 
            {headerName: 'Purpose of Travel', field: 'pofTravel'},
            {headerName: 'Destination', field: 'destination'}, 
            {headerName: 'Status', field: 'status'},
            {headerName: 'Approved/Rejected By', field: 'approvedby'},
            {headerName: 'Comment', field: 'comment'},
        ];
    
        this.rowData = [
            { empName:'Akram Siddiqui', phone:'8260231560', department:'HR', email: 'akaram.siddiqui@amconsult.com', pofTravel:'Attending metting', destination:'UAE', depatureDate: '31-12-2019', arrivalDate: '31-12-2019', status:'Pending', approvedby:'Anjum' ,comment:''},
            { empName:'Azhar Ch', phone:'8260231560', department:'Management', email: 'azhar.chawdhari@amconsult.com', pofTravel:'Attending metting', destination:'Saudi Arabia', depatureDate: '31-12-2019', arrivalDate: '31-12-2019', status:'Approved', approvedby:'Samir', comment:'' },
            { empName:'Salman Siddiqui', phone:'8260231560', department:'HR', email: 'salman.siddiqui@amconsult.com', pofTravel:'Attending metting',destination:'USA', depatureDate: '30-12-2019', arrivalDate: '31-12-2019', status:'Canceled', approvedby:'Gowtham', comment:'Not applicable for trip' },
            { empName:'Alwin', phone:'8260231560', department:'Management', email: 'alwin@amconsult.com', pofTravel:'Attending metting', destination:'Mumbai',depatureDate: '28-12-2019', status:'Pending', approvedby:'Anjum', comment:''},
            { empName:'xyz', phone:'8260231560', department:'Management', email: 'xyz@amconsult.com',pofTravel:'Attending metting',  destination:'Delhi', depatureDate: '25-12-2019', arrivalDate: '31-12-2019', status:'Approved', comment:'' },
            { empName:'Gowtham', phone:'8260231560', department:'Management', email: 'gowtham@amconsult.com', pofTravel:'Attending metting', destination:'Kowat', depatureDate: '31-12-2019', arrivalDate: '31-12-2019', status:'Canceled', approvedby:'Anjum', comment:'Not applicable for trip' },
            { empName:'Akram Siddiqui', phone:'8260231560', department:'Management', email: 'akaram.siddiqui@amconsult.com', pofTravel:'Attending metting', destination:'USA', depatureDate: '31-12-2019', arrivalDate: '31-12-2019', status:'Pending', approvedby:'Anjum', comment:''},
            { empName:'Azhar Ch', phone:'8260231560',department:'Management', email: 'azhar.chawdhari@amconsult.com', pofTravel:'Attending metting',destination:'USA',  depatureDate: '30-12-2019', arrivalDate: '31-12-2019', status:'Approved', approvedby:'Anjum', comment:'' },
            { empName:'Salman Siddiqui', phone:'8260231560', department:'Management', email: 'salman.siddiqui@amconsult.com', pofTravel:'Attending metting', destination:'USA', depatureDate: '36-12-2019', arrivalDate: '31-12-2019',status:'Canceled', approvedby:'Anjum', comment:'Not applicable for trip' }
        ];
    }
}