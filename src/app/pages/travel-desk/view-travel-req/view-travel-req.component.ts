import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { AuthenticationService } from 'src/app/_services';
import { ApiPaths } from 'src/app/shared/util';

@Component({
  selector: 'app-view-travel-req',
  templateUrl: './view-travel-req.component.html',
  styleUrls: ['./view-travel-req.component.scss']
})
export class ViewTravelReqComponent {
  @Output() newItemEvent = new EventEmitter()
  @Output() newrequestEvent = new EventEmitter()
  maxDate = new Date();
  viewTravelDate =  new Date();
  constructor(private datePipe:DatePipe,private authService:AuthenticationService){}
  search(e){
    let searchDate = e != null && e != undefined ? e : this.viewTravelDate;
    searchDate = this.datePipe.transform(searchDate,'YYYY-MM-dd');
    this.newItemEvent.emit(searchDate);
  }

  userRole:any
  user:any
  ngOnInit(){ 
  

    this.authService.currentUser.subscribe(user=>{
      this.user=user;
     // console.log('user',user)
      this.userRole=user.loginUserDetails.userRole
    })

    if(this.userRole=='employee'){
      let url =ApiPaths.getTravelRequest+'/empId?empId='+this.user.loginUserDetails.userId
      this.newrequestEvent.emit(url);
    }else if(this.userRole=='Admin'){
      let url =ApiPaths.getTravelRequest
      this.newrequestEvent.emit(url);
    }
  }
}
