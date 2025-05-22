import { DatePipe } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SideMenuService } from 'src/app/services/side-menu.service';
import { StoreService } from 'src/app/services/store.service';
import { keywords } from 'src/app/shared/constant';
import { ApiPaths } from 'src/app/shared/util';
import { CommonModalService } from '../common-modal/common-modal.service';
import { AuthenticationService } from 'src/app/_services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent {
  viewTsData;
  timesheetDate=new Date();
  dataSource:any;
  dataToDisplay:any=[];
  showNoRecords:boolean=false
  date:any
  inboxTableHeader=keywords.inboxTableHeader;
  timesheetStatus:any='Pending'
 userId:any;
 approvalName:any;
 modalRef?: BsModalRef;
 approved:boolean=false;
 rejected:boolean=false;
 statusData:any
 comment:any
 maxDate = new Date()
  body={
    timesheetId:null,
    timesheetStatus:null,
    lastUpdatedDatetime:null,
    lastUpdatedEmpId:null,
    lastUpdatedEmpName:null,
    comment:null
  
  }
  

  constructor(private authService:AuthenticationService ,store : StoreService,private commonModalService:CommonModalService,private datepipe:DatePipe,private restApiService: RestApiService,private route: ActivatedRoute,private lodder:LoaderService,private router: Router, private service: RestApiService,private modalService: BsModalService){}
  ngOnInit(){

    //this.store.dailyTSObj.subscribe(data=>this.viewTsData = data);
    this.authService.currentUser.subscribe(data=>{
    //  console.log('data',data)
      this.userId = data.loginUserDetails.userId,
      this.approvalName=data.loginUserDetails.userName
     // console.log('approvalName',this.approvalName)
    });
}

timesheetData:any
viewTS(timeSheetId:any){
  
  
  
  this.lodder.show()
  let url=ApiPaths.getTimeSheetByTimesheetId
  this.restApiService.getTimeSheetDetails(timeSheetId,url,this.userId).subscribe(data=>{
   // console.log('data',data)
    this.timesheetData=data
    this.commonModalService.changeMessage(this.timesheetData)
    this.lodder.hide()
   
  })
  
}

submitteddate(val){
  //console.log('val',val)
  let date=val ==undefined?this.timesheetDate:val
  this.date = this.datepipe.transform(date,'YYYY-MM-dd')
  //console.log(this.userId,'val',this.date)

  this.lodder.show()
  let url=ApiPaths.getTimesheetSummary
  this.restApiService.getTimeSheetDetails(this.date,url,this.userId).subscribe(data=>{
    if(data?.approvyUserDetails?.length==0 && data?.reviewyUserDetails?.length == 0 && data?.timesheetDetails?.length == 0){
      this.dataSource=null;
      this.showNoRecords=true;
      this.dataToDisplay = [];
    }else{
      this.dataSource = data;
     this.dataSource['approvyUserDetails'].map(m=>{
      this.dataSource['reviewyUserDetails'].filter((f,index)=>{
        m.timesheetId == f.timesheetId ? delete this.dataSource['reviewyUserDetails'][index] : '';
      })
     })
      Object.keys(this.dataSource).forEach(o=>{
        this.dataSource[o]?.forEach(e=>{
          o != 'reviewyUserDetails' ? e.flag = true : e.flag = false;
          
          let index = this.dataToDisplay.findIndex(find=>find?.timesheetId==e?.timesheetId);
       //   console.log("index", this.dataSource[o],e,index);
          if(index > -1){
            this.dataToDisplay?.splice(index,1);
            this.dataToDisplay.push(e);
          }else{
            this.dataToDisplay.push(e);
          } 
       })
        
      })    
     // console.log('data', this.dataSource) 
      this.showNoRecords=false
    }
  
  this.lodder.hide()
},
err => {
  if (err) {
    this.dataSource = null;
    this.dataToDisplay = [];
    this.showNoRecords = true;
  }
}
)
}


approvedTimesheet(timeSheetId:any){
  
  //console.log('TimeSheet',timeSheetId)
  this.timesheetStatus='Approved'
  this.dataSource.timesheetStatus=this.timesheetStatus
   this.callingService(timeSheetId)
   //this.submitteddate(this.date)
    
 
}

openModalApproved(template: TemplateRef<any>) {
  this.approved=true
  this.rejected=false
  this.comment=null
  this.modalRef = this.modalService.show(template);
}

rejectedTimesheet(timeSheetId:any){
//  / console.log('TimeSheet',timeSheetId)
this.timesheetStatus='Rejected'
this.dataSource.timesheetStatus=this.timesheetStatus
this.callingService(timeSheetId)

}


openModalRejected(template: TemplateRef<any>) {
  this.rejected=true
  this.approved=false
  this.comment=null
  this.modalRef = this.modalService.show(template);
}


callingService(timeSheetId:any){
  
  this.body.timesheetId=timeSheetId
  this.body.timesheetStatus=this.timesheetStatus
  this.body.lastUpdatedDatetime=new Date()
  this.body.lastUpdatedEmpId=this.userId//this.service.obj.userId
  this.body.lastUpdatedEmpName=this.approvalName//this.service.obj.userName
  this.body.comment=this.comment

  //console.log('Body',this.body)
  this.lodder.show()
  let url=ApiPaths.approveOrRejectTimesheet
  this.restApiService.approveRejectTimesheet(url,this.body).subscribe(data=>{

    if(!data){
      this.statusData = null;
      this.showNoRecords = true;
    }else{
      this.statusData=data
      //console.log('sataData',this.statusData)
      this.submitteddate(this.date)
    }
   this.lodder.hide()
  },
  err => {
    if (err) {
      this.lodder.hide()
      this.statusData = null;
      this.showNoRecords = true;
    }
  }
  )

}

}
