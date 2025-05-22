import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '../_models';
import { UserService } from '../_services';
import { BusinessTrip } from './businesstripmodel';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({selector:'business-app', templateUrl: 'businesstrip.component.html' })
export class BusinesstripComponent implements OnInit {
    loading = false;
    users: User[] = [];
   businessTripModel=new  BusinessTrip();
    constructor(private userService: UserService,private calendar: NgbCalendar,private arival: NgbCalendar) {}
    model: NgbDateStruct;
    modelArrival: NgbDateStruct;
    date: {year: number, month: number};
    submitted = false;
    ngOnInit() {
       
        this.loading = true;
       // console.log(" this.userService ", this.userService )
        // this.userService != null && this.userService != undefined?this.userService.getAll()?.pipe(first())?.subscribe(users => {
        //     this.loading = false;
        //     users != null && users != undefined?this.users = users:'';
        // }):'';
        this.businessTripModel.departments=["HR","Management","Agent Department"]
    }
    selectToday() {
        this.modelArrival = this.arival.getToday();
        this.model = this.calendar.getToday();
      }
      onSubmit() { 
        //  console.log(this.model,"you have submitted form with model",this.businessTripModel);
          this.submitted = true; 
        }
}