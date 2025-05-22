import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { keywords, toastrMsg, url, urlAndPageNames } from 'src/app/shared/constant';
import { ApiPaths, getOrDeleteData } from 'src/app/shared/util';
import { TravelDeskService } from './travel-desk-modal/travel-desk.service';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from 'src/app/services/store.service';
import { DatePipe } from '@angular/common';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-travel-desk',
  templateUrl: './travel-desk.component.html'
})
export class TravelDeskComponent {
  travelDeskPageInfo: any;
  dataSource;
  gridHeader: any;
  showNoRecords: boolean;
  reqCreatedDate:any
  date:any=new Date()
  shared: any;
  ngOnInit(): void {
    this.getPageAPIInfo();
  }

  constructor(private lodder: LoaderService, private service: RestApiService, private travelService: TravelDeskService, private toastr: ToastrService,private store:StoreService,private datepipe:DatePipe,
    private sharedSerivce:SharedService) {
  
    
  }

  getPageAPIInfo() {
    let obj = {
      urlPageName: null,
      groupingEnabled: false,
      url: null,

    }
    if (location.href.indexOf(url.travelReqUrl) > -1) {
      obj.urlPageName = urlAndPageNames.travelReq;
      obj.url = ApiPaths.travelRequest
  }
  if (location.href.indexOf(url.visaUrl) > -1) {
     obj.urlPageName = urlAndPageNames.visaDetails;
     obj.url = ApiPaths.visaDetails;
     this.store.dataSourceSubject.subscribe(data=>{
      this.dataSource = data != null || data != undefined ? data : null;
      //console.log('datasource',this.dataSource)
      })
  }
  if (location.href.indexOf(url.viewTravelReqUrl) > -1) {
     obj.urlPageName = urlAndPageNames.viewTravelReq;
  }
  if (location.href.indexOf('/rims/emp/travelExpense') > -1) {
    obj.urlPageName = 'travelExpense';
    obj.url = ApiPaths.travelExpense

 }
 if (location.href.indexOf('/rims/emp/travelExpenseEdit') > -1) {
  obj.urlPageName = 'travelExpenseEdit';
  obj.url = ApiPaths.travelExpense

}
 if (location.href.indexOf('/rims/emp/demoPage') > -1) {
  obj.urlPageName = 'demoPage';
}
    this.travelDeskPageInfo = obj
 
   }

   dataArray=[]
   addItems(e){ //console.log('e',e)
   this.service.setdocument([e])
   //if(this.travelDeskPageInfo.urlPageName != 'travelRequest'){
    this.lodder.show();
  // }

  let url=this.travelDeskPageInfo.url
  this.service.saveTravelRequest(url,e).subscribe(data=>{ //console.log('Request created data',data)
    this.travelService.setempID([data])
      if(!data){
        this.dataSource = null;
        this.showNoRecords = null
      }else{
       
        this.dataSource=[data]
        let processURL=ApiPaths.travelProcess 
        let processBody={
          traveldeskEntityModel:{
                        reqId: data.reqId
                     },
          requestCreated:"Request Created",
          requestCreatedStatus:"Completed",
          reqCreatedDate:null,

    documentCollected:"Document (Collect passport, Degree)",
    documentCollectedStatus:"Pending",

    sendDetails:"Sent email to Anjum for getting visa invitation slip",
    sendDetailsStatus:"Pending",

    receiveVisaInvitation:"Received visa invitation slip from client through Anjum",
    receiveVisaInvitationStatus:"Pending",

    marathaChember:"Maratha Chember of Commerce",
    marathaChemberStatus:"Pending",

    companyLetterToSaudiEmbassy:"Company's Letter to Saudi Embassy",
    companyLetterToSaudiEmbassyStatus:"Pending",
    
    biometricAppointment:"Biometric VFS Appointment",
    biometricAppointmentStatus:"Pending",

    biometricCompleted:"Biometric completed + E.visa Approved",
    biometricCompletedStatus:"Pending",

    passportEvisaReceived:"Passport and E-visa received",
    passportEvisaReceivedStatus:"Pending",

    requestRaised:"Request raised to rafique for ticket",
    requestRaisedStatus:"Pending",

    travellingStaffDocument:"Documents provided to first time travelling staff",
    travellingStaffDocumentStatus:"Pending",

    empOnBoarded:"Employee on boarded on client location",
    empOnBoardedStatus:"Pending",
  
      }
      processBody.reqCreatedDate=new Date();
      processBody.reqCreatedDate=this.datepipe.transform(processBody.reqCreatedDate,'MM/dd/yyyy hh:mm:ss');
      this.service.saveTravelRequest(processURL,processBody).subscribe(data=>{ //console.log('travel Process data',data)
      let id=data.id
      this.travelService.setUniqueId(id);
     
      })
        //this.service.setdocument(this.dataSource)
       // console.log('data',this.dataSource)
       // if(this.travelDeskPageInfo.urlPageName != 'travelRequest'){
          this.lodder.hide();
        // }
      }
  },
  
  err=>{
    if(err){
      this.lodder.hide();
      this.dataSource = null;
      this.showNoRecords = null
    }
  }
  )
   }

   addEvent:any=null
   getItemEvent(e){
    
    if(e==null){console.log('e',e)
      this.dataSource = null
      this.showNoRecords=null
    }
   
    if(!e){
      this.dataSource = null
      this.showNoRecords=null
    }else{
      this.dataSource=e
    }
   }

   addEdit(e){
   // console.log('getItemEvent',e)
    if(e == "addEdit"){
      this.addEvent=e;
     // console.log('addEvent',this.addEvent)
    }else if(e == 'Go Back'){
      this.addEvent=e;
    }

   }

   dataSource2:any
   newRecord:boolean=false
   travelReqEvent(e){
    if(e != null){
      let url=e
      this.lodder.show();
      this.service.getTravelProcess(url).subscribe(data => {
       // console.log('Add behaviour subject', data)
        this.dataSource = data;
        this.dataSource.forEach(val=>{
        //  console.log('dataSoure',val)
          this.reqCreatedDate=val.travelProcessDetailsEntity[0]?.reqCreatedDate
          this.reqCreatedDate=this.datepipe.transform(this.reqCreatedDate,'MM/dd/yyyy');
          this.date=new Date();
          this.date=this.datepipe.transform(this.date,'MM/dd/yyyy');
        //  console.log('reqCreatedDate',this.reqCreatedDate,'date',this.date)
          if(this.date == this.reqCreatedDate){
           //   console.log('emp',val.employeName)
            
             // val.employeName=val.employeName +' '+'(new record)'
              this.newRecord=true;
          }else{
            this.newRecord=false
          }
          
         })
        this.lodder.hide();
       // console.log('dataSource', this.dataSource)
      },
        err => {
          if (err) {
            this.toastr.error(toastrMsg.errMsg)
            this.lodder.hide();
          }
        }
      )
    }
   
  }

  visaDetails(filter: any) {

    if(filter.reset){
      this.dataSource = null;
      return;
    }
    this.lodder.show();
    this.service.saveData(ApiPaths.visaDetails,filter,null).subscribe(data=>{
      this.lodder.hide();
      this.shared.refreshGrid.next();
      getOrDeleteData(this.store,this.service,this.lodder,ApiPaths.getVisaDetails)
    },(err)=>{
      this.lodder.hide();
    })
  }
}
