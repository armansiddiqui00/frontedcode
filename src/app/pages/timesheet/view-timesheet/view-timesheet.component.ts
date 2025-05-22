import { Component, Input } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';
import { CommonModalService } from '../common-modal/common-modal.service';
import { DatePipe } from '@angular/common';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { dateFormat, keywords } from 'src/app/shared/constant';
import { LoaderService } from 'src/app/services/loader.service';
import { SideMenuService } from 'src/app/services/side-menu.service';
import { ApiPaths } from 'src/app/shared/util';
import { AuthenticationService } from 'src/app/_services';

@Component({
  selector: 'app-view-timesheet',
  templateUrl: './view-timesheet.component.html',
  styleUrls: ['./view-timesheet.component.scss']
})
export class ViewTimesheetComponent {
  viewTsData;
  timesheetDate=new Date();
  dataSource:any
  showNoRecords:boolean=false
  viewTableHeader=keywords.viewTableHeader;
  date:any
  userId:any;
  maxDate = new Date()
  constructor(private authService:AuthenticationService,private store : StoreService,private commonModalService:CommonModalService,private datepipe:DatePipe,private restApiService: RestApiService,private route: ActivatedRoute,private lodder:LoaderService,private router: Router, private service: SideMenuService){}
  ngOnInit(){
    let tempData;
    this.authService.currentUser.subscribe(data=>{tempData = data});
     // console.log(this.userId,"tempdata is isisisisi ",tempData)
      this.userId = tempData?.loginUserDetails?.userId
    this.store.dailyTSObj.subscribe(data=>this.viewTsData = data);
  }
  
  viewEachTimeSheet(data){
  
  
  
    this.lodder.show()
    let url=ApiPaths.getTimeSheetByTimesheetId
    this.restApiService.getTimeSheetDetails(data.timesheetId,url,this.userId).subscribe(data=>{
      //console.log('data',data)
      this.commonModalService.changeMessage(data)
      this.lodder.hide()
     
    })
    
  }
  

  submitteddate(val){
  let date = val ==undefined?this.timesheetDate:val;
    //console.log('val',this.date)
    this.date = this.datepipe.transform(date,'YYYY-MM-dd')
    //this.date = dateFormat(val)
    this.lodder.show()
   // let userId;
   // this.store.user.subscribe(Data=>userId = Data.userId)
    this.restApiService.getTimeSsummaryByUserIdDate(this.date,ApiPaths.getTimesheetSummaryByEmpIdAndDare,this.userId).subscribe(data=>{
      //console.log("dd",data)
      
      if(data.length==0){
        this.dataSource=null
        this.showNoRecords=true
      }else if(data.length>0){
        this.dataSource=data;
        this.showNoRecords=false
      }
    
    this.lodder.hide()
  },
  err => {
    if (err) {
      this.dataSource = null;
      this.showNoRecords = true;
    }
    this.lodder.hide()
  }
  )
  }

  reSubmit(data){
   // console.log('time',data)
    this.service.changeMessage(data);
    this.router.navigate(['/rims/emp/submittimesheet'], { state: { TimeSheetDate: data, navEditFlag:true} });
  }
}
