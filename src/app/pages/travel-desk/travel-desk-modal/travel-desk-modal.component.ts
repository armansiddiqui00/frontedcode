import { Component , TemplateRef } from '@angular/core';
import { TravelDeskService } from './travel-desk.service';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { RestApiService } from 'src/app/services/rest-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ApiPaths } from 'src/app/shared/util';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal'

@Component({
  selector: 'app-travel-desk-modal',
  templateUrl: './travel-desk-modal.component.html',
  styleUrls: ['./travel-desk-modal.component.scss']
})
export class TravelDeskModalComponent {
  modalRef?: BsModalRef;
  maxDate=new Date();
  actionStr;
  processStatus = keywords.travelReqStatus;
  reqCreated:boolean=true;
  documentCollected:boolean=false
  sendDetailsStatus:boolean=false
  marathaChemberStatus:boolean=false
  receiveVisaInvitationStatus:boolean=false
  biometricAppointmentStatus:boolean=false
  companyLetterToSaudiEmbassyStatus:boolean=false
  biometricCompletedStatus:boolean=false
  passportEvisaReceivedStatus:boolean=false
  requestRaisedStatus:boolean=false
  ticketBoockedStatus:boolean=false
  travellingStaffDocumentStatus:boolean=false
  empOnBoardedStatus:boolean=false
  empId:any;
  dataSource:any=null
  empID:string="empId";
  id:any
  BiometricList:any=[]
  showField:boolean=false
  mahrattareason:any;
  vfsCenter:any=['Mumbai','Chennai','New Delhi']
  vfscenter:any='Select VFS Center'

  constructor(private travelDeskService:TravelDeskService,private service:RestApiService,private lodder:LoaderService,private toastr:ToastrService,private datepipe:DatePipe,private modalService: BsModalService){
    //this.updateProcessDetails();
  }

  travelProcessReq={
    id:null,
    traveldeskEntityModel:{
      reqId: null
   },

    requestCreated:"Request Created",
    requestCreatedStatus:null,
    reqCreatedDate:null,

    documentCollected:"Document (Collect passport, Degree)",
    documentCollectedStatus:null,
    documentStartDate:null,
    documentEndDate:null,
    documentRange:null,

    sendDetails:"Sent email to Anjum for getting visa invitation slip",
    sendDetailsStatus:null,
    sendDetailsReminderDate:null,

    receiveVisaInvitation:"Received visa invitation slip from client through Anjum",
    receiveVisaInvitationStatus:null,
    receiveVisaInvitationDate:null,

    marathaChember:"Maratha Chember of Commerce",
    marathaChemberStatus:null,
    marathaChemberSubmissionDate:null,
    marathaChemberReceivedDate:null,
    marathaChemberRange:null,
    mahrattareason:null,

    companyLetterToSaudiEmbassy:"Company's Letter to Saudi Embassy",
    companyLetterToSaudiEmbassyStatus:null,
    companyLetterToSaudiEmbassyDate:null,
    
    biometricAppointment:"Biometric VFS Appointment",
    biometricAppointmentStatus:null,
    biometricAppointmentStartDate:null,
    biometricAppointmentEndDate:null,
    biometricAppointmentRange:null,
    vfsCenter:null,

    biometricCompleted:"Biometric completed + E.visa Approved",
    biometricCompletedStatus:null,
    biometricCompletedDate:null,

    passportEvisaReceived:"Passport and E-visa received",
    passportEvisaReceivedStatus:null,
    passportEvisaReceivedDate:null,

    requestRaised:"Request raised to rafique for ticket",
    requestRaisedStatus:null,
    requestRaisedDate:null,
    requestRaisedTicketReceivedDate:null,
    requestRaisedRange:null,

    travellingStaffDocument:"Documents provided to first time travelling staff",
    travellingStaffDocumentStatus:null,
    travellingStaffDocumentProvidedDate:null,

    empOnBoarded:"Employee on boarded on client location",
    empOnBoardedStatus:null,
    empOnBoardedDate:null,
  
  }
editData:any;
visaDetails:any;
passportDetails:any;
reqType:any
reason:any
travelExpense:any

  ngOnInit(){  console.log('e',this.reqCreated) ; console.log('Biometric',this.BiometricList.length)
  this.reason=null
  this.travelDeskService.selectedReqDate$.subscribe(val=>{
    console.log('reqDate val',val)
    this.travelProcessReq.reqCreatedDate=val
    this.travelProcessReq.reqCreatedDate=this.datepipe.transform(this.travelProcessReq.reqCreatedDate,'MM/dd/yyyy hh:mm:ss');
  })
    this.actionStr = this.travelDeskService.action; console.log('actionStr',this.actionStr)

    if(this.actionStr == 'visaDetails'){
         this.visaDetails = this.travelDeskService.visaDetails[0]
         console.log('visaDetails',this.visaDetails)
    }

    if(this.actionStr == 'passportDetails'){
      this.passportDetails = this.travelDeskService.passportDetails;
      console.log('passportDetails',this.passportDetails)
 }

 if(this.actionStr == 'travelExpense'){
        this.travelExpense= this.travelDeskService.travelExpenseDetails;
        console.log('travelExpense',this.travelExpense)
 }

    this.travelProcessReq.traveldeskEntityModel.reqId=this.travelDeskService.reqId;
    this.reqType=this.travelDeskService.reqType
    console.log('reqType',this.reqType)
    if(this.reqType=='U turn from Onsite' || this.reqType=='U turn from Hometown'){
        this.showField=true;
    }else{
      this.showField=false;
    }
    this.reqCreated==true?this.travelProcessReq.requestCreatedStatus='Completed':this.travelProcessReq.requestCreatedStatus='Pending'
   

    this.travelDeskService.selectedEditTravelRequest$.subscribe(val=>{
      console.log('travel Modal req edit',val)
      this.editData=val;
      if(this.editData != null){ 
        this.id=this.editData.travelProcessDetailsEntity[0].id;
      }
    })

    
   
     if(this.travelDeskService.id == null || this.travelDeskService.id == undefined || this.travelDeskService.id==''){
       this.travelDeskService.selectedSubId$.subscribe(id=>{
       console.log('ID Unique Submit',id)
       if(id != null){
         this.id=id
       }
      
      })
     }else{
      this.id=this.travelDeskService.id;
      console.log('id from datagrid',this.id)
     }
     let url=ApiPaths.getTravelProcess+'/id?id='+this.id
    // console.log('url',url)
     if(this.id != null){
      console.log('id',this.id)
    
       this.lodder.show();
        this.service.getTravelProcess(url).subscribe(data=>{
            console.log('getData',data)
            
            this.lodder.hide();
            if(data != null || data != undefined || data != '' || data.length > 0){
             
              const lastOnj=data.slice(-1 )
              this.dataSource=lastOnj[0]
           //  this.dataSource=data
             // console.log('last id : ',this.dataSource.id)
              if(this.id == this.dataSource.id){
             console.log('dataSource',this.dataSource)
            this.BiometricList=this.dataSource.biometricAppointmentEntity
            console.log('Biometric',this.BiometricList.length)
              this.dataSource.requestCreatedStatus=='Completed'?this.reqCreated==true:this.reqCreated==false;
              this.dataSource.documentCollectedStatus=='Completed'?this.documentCollected=true:this.documentCollected=false
              this.dataSource.sendDetailsStatus=='Completed'?this.sendDetailsStatus=true:this.sendDetailsStatus=false
              this.dataSource.receiveVisaInvitationStatus=='Completed'?this.receiveVisaInvitationStatus=true:this.receiveVisaInvitationStatus=false
              this.dataSource.marathaChemberStatus=='Completed'?this.marathaChemberStatus=true:this.marathaChemberStatus=false
              this.dataSource.companyLetterToSaudiEmbassyStatus=='Completed'?this.companyLetterToSaudiEmbassyStatus=true:this.companyLetterToSaudiEmbassyStatus=false
              this.dataSource.biometricAppointmentStatus=='Completed'?this.biometricAppointmentStatus=true:this.biometricAppointmentStatus=false
              this.dataSource.biometricCompletedStatus=='Completed'?this.biometricCompletedStatus=true:this.biometricCompletedStatus=false
              this.dataSource.passportEvisaReceivedStatus=='Completed'?this.passportEvisaReceivedStatus=true:this.passportEvisaReceivedStatus=false
              this.dataSource.requestRaisedStatus=='Completed'?this.requestRaisedStatus=true:this.requestRaisedStatus=false
              this.dataSource.ticketBoockedStatus=='Completed'?this.ticketBoockedStatus=true:this.ticketBoockedStatus=false
              this.dataSource.travellingStaffDocumentStatus=='Completed'?this.travellingStaffDocumentStatus=true:this.travellingStaffDocumentStatus=false
              this.dataSource.empOnBoardedStatus=='Completed'?this.empOnBoardedStatus=true:this.empOnBoardedStatus=false
              
              this.dataSource.reqCreatedDate != null?this.travelProcessReq.reqCreatedDate=this.dataSource.reqCreatedDate:this.travelProcessReq.reqCreatedDate=null;
              this.dataSource.documentEndDate != null? this.travelProcessReq.documentEndDate=this.dataSource.documentEndDate:this.travelProcessReq.documentEndDate
              this.travelProcessReq.documentStartDate=this.dataSource.documentStartDate
              this.travelProcessReq.sendDetailsReminderDate=this.dataSource.sendDetailsReminderDate
              this.travelProcessReq.receiveVisaInvitationDate=this.dataSource.receiveVisaInvitationDate
              this.travelProcessReq.marathaChemberSubmissionDate=this.dataSource.marathaChemberSubmissionDate
              this.travelProcessReq.marathaChemberReceivedDate=this.dataSource.marathaChemberReceivedDate
              this.travelProcessReq.companyLetterToSaudiEmbassyDate=this.dataSource.companyLetterToSaudiEmbassyDate
              this.travelProcessReq.biometricAppointmentStartDate=this.dataSource.biometricAppointmentStartDate
              this.travelProcessReq.biometricAppointmentEndDate=this.dataSource.biometricAppointmentEndDate
              this.travelProcessReq.biometricCompletedDate=this.dataSource.biometricCompletedDate
              this.travelProcessReq.passportEvisaReceivedDate=this.dataSource.passportEvisaReceivedDate
              this.travelProcessReq.requestRaisedDate=this.dataSource.requestRaisedDate
              this.travelProcessReq.requestRaisedTicketReceivedDate=this.dataSource.requestRaisedTicketReceivedDate
              this.travelProcessReq.travellingStaffDocumentProvidedDate=this.dataSource.travellingStaffDocumentProvidedDate
              this.travelProcessReq.empOnBoardedDate=this.dataSource.empOnBoardedDate
              this.travelProcessReq.mahrattareason=this.dataSource.mahrattareason
              this.travelProcessReq.vfsCenter=this.dataSource.vfsCenter
              if(this.dataSource.vfsCenter != null){
                this.vfscenter=this.dataSource.vfsCenter;
              }
             
              this.documentRangeChange(this.travelProcessReq.documentEndDate);
              this.marathaChemberChange(this.travelProcessReq.marathaChemberReceivedDate);
              this.biometricAppointmentChange( this.travelProcessReq.biometricAppointmentEndDate);
              this.requestRaisedChange(this.travelProcessReq.requestRaisedTicketReceivedDate);
             
            }
            }else {
                  this.dataSource=null;
                  this.BiometricList=null
                 // console.log('dataSource',this.dataSource)
            }
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

  submitStatus(){
  //  console.log('e',this.reqCreated)
    this.reqCreated==true?this.travelProcessReq.requestCreatedStatus='Completed':this.travelProcessReq.requestCreatedStatus='Pending';
    this.documentCollected==true?this.travelProcessReq.documentCollectedStatus='Completed':this.travelProcessReq.documentCollectedStatus='Pending'
    this.sendDetailsStatus==true?this.travelProcessReq.sendDetailsStatus='Completed':this.travelProcessReq.sendDetailsStatus='Pending'
    this.receiveVisaInvitationStatus==true?this.travelProcessReq.receiveVisaInvitationStatus='Completed':this.travelProcessReq.receiveVisaInvitationStatus='Pending'
    this.marathaChemberStatus==true?this.travelProcessReq.marathaChemberStatus='Completed':this.travelProcessReq.marathaChemberStatus='Pending'
    this.companyLetterToSaudiEmbassyStatus==true?this.travelProcessReq.companyLetterToSaudiEmbassyStatus='Completed':this.travelProcessReq.companyLetterToSaudiEmbassyStatus='Pending'
    this.biometricAppointmentStatus==true?this.travelProcessReq.biometricAppointmentStatus='Completed':this.travelProcessReq.biometricAppointmentStatus='Pending'
    this.biometricCompletedStatus==true?this.travelProcessReq.biometricCompletedStatus='Completed':this.travelProcessReq.biometricCompletedStatus='Pending'
    this.passportEvisaReceivedStatus==true?this.travelProcessReq.passportEvisaReceivedStatus='Completed':this.travelProcessReq.passportEvisaReceivedStatus='Pending'
    this.requestRaisedStatus==true?this.travelProcessReq.requestRaisedStatus='Completed':this.travelProcessReq.requestRaisedStatus='Pending'
    this.travellingStaffDocumentStatus==true?this.travelProcessReq.travellingStaffDocumentStatus='Completed':this.travelProcessReq.travellingStaffDocumentStatus='Pending'
    this.empOnBoardedStatus==true?this.travelProcessReq.empOnBoardedStatus='Completed':this.travelProcessReq.empOnBoardedStatus='Pending'
   //console.log('travelProcessReq',this.travelProcessReq)
  }


  updateProcessDetails(){
    this.submitStatus();
    this.travelProcessReq.traveldeskEntityModel.reqId=this.travelDeskService.reqId
     this.travelProcessReq.id=this.id
    this.travelProcessReq.reqCreatedDate=this.datepipe.transform(this.travelProcessReq.reqCreatedDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.documentStartDate=this.datepipe.transform(this.travelProcessReq.documentStartDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.documentEndDate=this.datepipe.transform(this.travelProcessReq.documentEndDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.sendDetailsReminderDate=this.datepipe.transform(this.travelProcessReq.sendDetailsReminderDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.receiveVisaInvitationDate=this.datepipe.transform(this.travelProcessReq.receiveVisaInvitationDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.marathaChemberSubmissionDate=this.datepipe.transform(this.travelProcessReq.marathaChemberSubmissionDate, 'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.marathaChemberReceivedDate=this.datepipe.transform(this.travelProcessReq.marathaChemberReceivedDate,'MM/dd/yyyy hh:mm:ss')
    this.travelProcessReq.companyLetterToSaudiEmbassyDate=this.datepipe.transform(this.travelProcessReq.companyLetterToSaudiEmbassyDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.biometricAppointmentStartDate=this.datepipe.transform(this.travelProcessReq.biometricAppointmentStartDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.biometricAppointmentEndDate=this.datepipe.transform(this.travelProcessReq.biometricAppointmentEndDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.biometricCompletedDate=this.datepipe.transform(this.travelProcessReq.biometricCompletedDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.passportEvisaReceivedDate=this.datepipe.transform(this.travelProcessReq.passportEvisaReceivedDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.requestRaisedTicketReceivedDate=this.datepipe.transform(this.travelProcessReq.requestRaisedTicketReceivedDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.travellingStaffDocumentProvidedDate=this.datepipe.transform(this.travelProcessReq.travellingStaffDocumentProvidedDate,'MM/dd/yyyy hh:mm:ss');
    this.travelProcessReq.empOnBoardedDate=this.datepipe.transform(this.travelProcessReq.empOnBoardedDate,'MM/dd/yyyy hh:mm:ss');


    this.lodder.show();
    let url=ApiPaths.travelProcess  
    let urlMail=ApiPaths.sendSimpleMail
    let body=this.travelProcessReq
    console.log('Body',body)
    this.service.saveTravelRequest(url,body).subscribe(data=>{ console.log('Processdata',data)
      if(data != null || data != undefined || data != ''){
        this.toastr.success(toastrMsg.updatedSuccessfully)
        this.travelDeskService.close();
        // this.service.sendSimpleMail(urlMail).subscribe(data=>{
        //   this.toastr.success(toastrMsg.mailSendSuccessfully)
        // })
        if(this.travelProcessReq.biometricAppointmentStartDate != null){
          let  urll=ApiPaths.biometricAppointment
          let bioBody={
           biometricAppointmentStartDate:this.travelProcessReq.biometricAppointmentStartDate,
           biometricAppointmentEndDate:this.travelProcessReq.biometricAppointmentEndDate,
           reason:this.reason,
           vfsCenter:this.travelProcessReq.vfsCenter,
           travelProcessDetailsEntity:{
                  id: data.id
              }
          }
          this.service.saveTravelRequest(urll,bioBody).subscribe(data=>{
            console.log('data',data);
            
          }
          )
        }
      
      }
      this.id=data.id
      this.travelDeskService.setUniqueId(this.id)
      console.log('Postdata',this.id)
      this.lodder.hide()
    },
    err => {
      if (err) {
        this.toastr.error(toastrMsg.errMsg)
      }
    }
    )
  }

  documentRangeChange(val:any){  
    if(val != null){
      console.log('travelProcessReq.documentStartDate',this.travelProcessReq.documentStartDate)
      const date1Modified = new Date(this.travelProcessReq.documentStartDate);
      console.log('date1Modified',date1Modified)
      console.log('val',val)
      const date2Modified = new Date(val);
      console.log('date2Modified',date2Modified)
      const time = date2Modified.getTime() - date1Modified.getTime();
      console.log('time',time)
      this.travelProcessReq.documentRange = time / (1000 * 3600 * 24);
      console.log('documentRange',this.travelProcessReq.documentRange)
      this.documentCollected=true
      this.travelProcessReq.documentCollectedStatus='Completed';
    }else{ this.travelProcessReq.documentRange = null;
      this.documentCollected=false
      this.travelProcessReq.documentCollectedStatus='Pending';
    }
  }

  sentMail(val:any){
    if(val != null){
      this.sendDetailsStatus=true;
      this.travelProcessReq.sendDetailsStatus='Completed';
    }else{
      this.sendDetailsStatus=true;
      this.travelProcessReq.sendDetailsStatus='Completed';
    }
  }

  receivedVisaInvitation(val:any){
    if(val != null){
      this.receiveVisaInvitationStatus=true;
      this.travelProcessReq.receiveVisaInvitationStatus='Completed';
    }else{
      this.receiveVisaInvitationStatus=true;
      this.travelProcessReq.receiveVisaInvitationStatus='Completed';
    }
  }

      marathaChemberChange(val:Date){console.log('val',val);
        if(val != null){
          const date1Modified = new Date(this.travelProcessReq.marathaChemberSubmissionDate);
          const date2Modified = new Date(val);
          const time = date2Modified.getTime() - date1Modified.getTime();
          this.travelProcessReq.marathaChemberRange = time / (1000 * 3600 * 24);
          this.marathaChemberStatus=true;
          this.travelProcessReq.marathaChemberStatus='Completed';
        }else{ this.travelProcessReq.marathaChemberRange = null;
          this.marathaChemberStatus=false;
          this.travelProcessReq.marathaChemberStatus='Pending';
        }
        }

        companyLetterChange(val:any){
          if(val != null){
            this.companyLetterToSaudiEmbassyStatus=true;
            this.travelProcessReq.companyLetterToSaudiEmbassyStatus='Completed';
          }else{
            this.companyLetterToSaudiEmbassyStatus=true;
            this.travelProcessReq.companyLetterToSaudiEmbassyStatus='Completed';
          }
        }

          biometricAppointmentChange(val:Date){
            if(val != null){
              const date1Modified = new Date(this.travelProcessReq.biometricAppointmentStartDate);
              const date2Modified = new Date(val);
              const time = date2Modified.getTime() - date1Modified.getTime();
              this.travelProcessReq.biometricAppointmentRange = time / (1000 * 3600 * 24);
              this.biometricAppointmentStatus=true
              this.travelProcessReq.biometricAppointmentStatus='Completed';
            }else{ this.travelProcessReq.biometricAppointmentRange = null;
              this.biometricAppointmentStatus=false
              this.travelProcessReq.biometricAppointmentStatus='Pending';
            }
            }

            passportReceived(val:any){
              if(val != null){
                this.passportEvisaReceivedStatus=true;
                this.travelProcessReq.passportEvisaReceivedStatus='Completed';
              }else{
                this.passportEvisaReceivedStatus=true;
                this.travelProcessReq.passportEvisaReceivedStatus='Completed';
              }
            }

                requestRaisedChange(val:Date){
                  if(val != null){
                    const date1Modified = new Date(this.travelProcessReq.requestRaisedDate);
                    const date2Modified = new Date(val);
                    const time = date2Modified.getTime() - date1Modified.getTime();
                    this.travelProcessReq.requestRaisedRange = time / (1000 * 3600 * 24);
                    this.requestRaisedStatus=true
                    this.travelProcessReq.requestRaisedStatus='Completed';
                  }else{ this.travelProcessReq.requestRaisedRange = null;
                    this.requestRaisedStatus=false
                    this.travelProcessReq.requestRaisedStatus='Pending';
                  }
                  }

                  documentsProvided(val:any){
                    if(val != null){
                      this.travellingStaffDocumentStatus=true;
                      this.travelProcessReq.travellingStaffDocumentStatus='Completed';
                    }else{
                      this.travellingStaffDocumentStatus=true;
                      this.travelProcessReq.travellingStaffDocumentStatus='Completed';
                    }
                  }

                  EmployeeOnBoarded(val:any){
                    if(val != null){
                      this.empOnBoardedStatus=true;
                      this.travelProcessReq.empOnBoardedStatus='Completed';
                    }else{
                      this.empOnBoardedStatus=true;
                      this.travelProcessReq.empOnBoardedStatus='Completed';
                    }
                  }

  close(){
    this.travelDeskService.close();
  }
  cancel(){
    this.travelDeskService.close();
  }

  
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  openReasonModal(template: TemplateRef<any>){
    this.modalRef = this.modalService.show(template);
  }




  dropdown(vfs:any){
    console.log('vfs',vfs)
  this.vfscenter=vfs
  this.travelProcessReq.vfsCenter=this.vfscenter

  }
}