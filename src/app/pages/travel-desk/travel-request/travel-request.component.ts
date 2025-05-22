import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { TravelDeskService } from '../travel-desk-modal/travel-desk.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ApiPaths } from 'src/app/shared/util';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-travel-request',
  templateUrl: './travel-request.component.html',
  styleUrls: ['./travel-request.component.scss']
})
export class TravelRequestComponent {
  @Output() newItemEvent = new EventEmitter();
  @Output() newrequestEvent = new EventEmitter();
   dataSource:any
  travelDataArray=[];
  submitFlag:boolean=false;
  travelReq={
    //newReq:'new request',
   // existReq:null,
   reqId:null,
   empId:null,
   employeName:null,
   employeeEmailId:null,
   travelOrign:null,
   travelDestination:null,
   noOFDays:null,
   onSiteDays:null,
   travelPurpose:null,
    travelDate:null,
   // requestDate:new Date(),
   // status:'Pending',
   // billableToCustomer:null,
    typeOFRequest:null,
    travelReqStatus:'In Progress',
    travelId:'TravelID1'
  }
  employeeList:any;
  minDate:any=new Date();
  editData:any
  showField:boolean=false;
  edit:boolean=false;
  requestData=null;
  constructor(private toastr:ToastrService,private service:RestApiService,private lodder:LoaderService,private datepipe:DatePipe,private travelDeskService:TravelDeskService,private router:Router){
   
  }

  ngOnInit(){ console.log('dataSource',this.dataSource)
    this.minDate = new Date();
    this.travelReq.typeOFRequest="new request"
    this.edit=false;
  
    
     
   // this.lodder.show();
    this.travelDeskService.selectedEditTravelRequest$.subscribe(val=>{
   //   console.log('tavelRequest val',val)
      this.editData=val;
     // console.log('editData',this.editData);
      
      if(this.editData != null){
     this.edit=true;
      this.employeeList=null
      this.travelReq.reqId=this.editData?.reqId;
      this.travelReq.empId=this.editData?.empId;
      this.travelReq.employeName=this.editData?.employeName;
      this.travelReq.employeeEmailId=this.editData?.employeeEmailId;
      this.travelReq.travelOrign=this.editData?.travelOrign;
      this.travelReq.travelDestination=this.editData?.travelDestination;
      this.travelReq.noOFDays=this.editData?.noOFDays;
      this.travelReq.onSiteDays=this.editData?.onSiteDays;
      this.travelReq.travelPurpose=this.editData?.travelPurpose;
      this.travelReq.travelDate=this.editData?.travelDate;
      //this.travelReq.billableToCustomer=this.editData?.billableToCustomer;
     // this.travelReq.typeOFRequest=this.editData?.typeOFRequest
      if(this.editData?.typeOFRequest == 'new request' || this.editData?.typeOFRequest == 'existing request' ){
        this.travelReq.typeOFRequest='existing request'
        this.showField=false;
      }else if(this.editData?.typeOFRequest == 'U turn from Onsite' || this.editData?.typeOFRequest == 'U turn from Hometown'){
        this.travelReq.typeOFRequest=this.editData?.typeOFRequest
        this.showField=true;
      }

      let body=this.travelReq
      //console.log('body',body)
      let url =ApiPaths.getTravelRequest+'/reqId?reqId='+this.editData?.reqId
      this.newrequestEvent.emit(url);
      //this.lodder.hide();
      }
     
    })

    
if(this.editData == null){
  this.edit=false;
  let urlreq = ApiPaths.getTravelRequest
  this.newrequestEvent.emit(urlreq);
  //this.lodder.show()
  this.service.getOrDeleteData(ApiPaths.getEmployeeList,null,null).subscribe(data=>{
    this.employeeList = data;
    //console.log('employeeList',this.employeeList)
    this.travelReq.employeName=null
    // this.lodder.hide();
  },
  err=>{
    if(err){
      this.lodder.hide();
    }
  }
  );
}
   
  
//this.travelDeskService.editTravelRequest(null)

 
  }

  onChange(){ console.log('employeName',this.travelReq.employeName);

       this.employeeList.forEach(e=>{
        if(e.empFirstName == this.travelReq.employeName){
         // this.travelReq.employeeEmailId == e.empEmailId
         this.travelReq.employeeEmailId = e.empEmailId
         this.travelReq.empId = e.empId
        
          //console.log('EmailId',e.empEmailId)
        }
       })

       let url
       let empId
       this.travelDeskService.selectedDataSource$.subscribe(val=>{
          this.dataSource=val;
        //  console.log('dataSource',this.dataSource)
        
            this.dataSource.forEach(val=>{
              if(this.travelReq.empId == val.empId){
              empId=val.empId
            }
            })
         
          
         
       })
       if(this.travelReq.empId == empId){
             
        url =ApiPaths.getTravelRequest+'/empId?empId='+this.travelReq.empId
        this.newrequestEvent.emit(url);
      }
      else{
        this.newrequestEvent.emit(null);
      }

       
    }

    onSelect(){
      if(this.travelReq.typeOFRequest=='new request' || this.travelReq.typeOFRequest=='existing request'){
        this.showField=false;
      }else if(this.travelReq.typeOFRequest=='U turn from Onsite' || this.travelReq.typeOFRequest=='U turn from Hometown'){
        this.showField=true;
      }
    }

  submitEmpInfo(travelForm:NgForm){ console.log('travel Array',this.travelDataArray)
    //console.log("form submitted",travelForm.submitted)
   if(travelForm.invalid){
    this.submitFlag = true;
    this.toastr.error(toastrMsg.mandatoryMsg)
   }
   else{
    this.submitFlag = false;

    let reqDate=new Date();
    //console.log('reqDate',reqDate);
    this.travelDeskService.reqDate(reqDate);

    let systemDate=new Date();

    

    this.travelReq.travelDate=this.datepipe.transform(this.travelReq.travelDate,'MM/dd/yyyy hh:mm:ss')
    this.travelDataArray.push(this.travelReq)
   
   // this.service.setdocument(this.travelDataArray)
 
    
   
    let body=this.travelDataArray[0]
    this.newItemEvent.emit(body);

  //  this.travelReq={
  //     newReq:'new request',
  //     existReq:null,
  //     empName:null,
  //     empEmailId:null,
  //     origin:null,
  //     destination:null,
  //     travelNoOfDays:null,
  //     onSiteDays:null,
  //     purposeOfTravel:null,
  //     travelDate:new Date(),
  //     requestDate:new Date(),
  //     status:'Pending',
  //     billable:null
  //   }
   }

  }


  reset(){
    this.travelReq.employeName=null;
    this.travelReq.employeeEmailId=null;
    this.travelReq.travelOrign=null;
    this.travelReq.travelDestination=null;
    this.travelReq.noOFDays=null;
    this.travelReq.onSiteDays=null;
    this.travelReq.travelPurpose=null;
    this.travelReq.travelDate=null;
    this.travelReq.typeOFRequest='new request';
    this.showField=false
    let reset='reset'
    this.newItemEvent.emit(reset)
    this.lodder.show()
    this.service.getOrDeleteData(ApiPaths.getEmployeeList,null,null).subscribe(data=>{
      this.employeeList = data;
    //  console.log('employeeList',this.employeeList)
      this.travelReq.employeName=null
       this.lodder.hide();
    },
    err=>{
      if(err){
        this.lodder.hide();
      }
    }
    );
    // this.travelReq={
    //   employeeName:null,
    //   employeeEmailId:null,
    //   travelOrign:null,
    //   travelDestination:null,
    //   noOFDays:null,
    //   onSiteDays:null,
    //   travelPurpose:null,
    //    travelDate:1,
    // }
    if(this.editData!=null){
      this.router.navigate(['/rims/emp/viewTravelReqStatus'])
    }
  }


}
