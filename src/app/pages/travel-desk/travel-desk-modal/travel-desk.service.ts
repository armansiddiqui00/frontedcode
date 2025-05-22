import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TravelDeskModalComponent } from "./travel-desk-modal.component";
import { BehaviorSubject } from "rxjs";

@Injectable()

export class TravelDeskService{
    action;
    reqId;
    visaDetails;
    passportDetails;
    travelExpenseDetails:any
    id;
     reqType;
    subject$ = new  BehaviorSubject<any>(null);
    selectedSub$ = this.subject$.asObservable();

    subjectId$ = new  BehaviorSubject<any>(null);
    selectedSubId$ = this.subjectId$.asObservable();

    subjectEmpId$ = new  BehaviorSubject<any>(null);
    selectedSubEmpId$ = this.subjectEmpId$.asObservable();

    subjectEditTravelRequest$ = new  BehaviorSubject<any>(null);
    selectedEditTravelRequest$ = this.subjectEditTravelRequest$.asObservable();

    subjectReqDate$ =new  BehaviorSubject<any>(null);
    selectedReqDate$ = this.subjectReqDate$.asObservable();

    subjectDataSource$ =new  BehaviorSubject<any>(null);
    selectedDataSource$ = this.subjectDataSource$.asObservable();

    constructor(private modalService:NgbModal){}
    open(action,reqId,id,reqType){
        this.action = action;
        this.reqId=reqId;
        this.visaDetails=reqId;
        this.id=id
        this.reqType=reqType
        this.passportDetails = reqId;
        this.travelExpenseDetails=reqId;
        console.log("reqId",reqId)
        console.log("action",action);
        console.log('id',id)
        if(action == 'edit'){
          this.modalService.open(TravelDeskModalComponent,{ modalDialogClass: 'modal-fullscreen modal-dialog-scrollable  travel', centered: true, size: 'lg'})
        }else if(action == 'visaDetails'){
          this.modalService.open(TravelDeskModalComponent,{ modalDialogClass: 'modal-dialog-scrollable  travel', centered: true, size: 'lg'})
        }else if(action == 'passportDetails'){
          this.modalService.open(TravelDeskModalComponent,{ modalDialogClass: 'modal-dialog-scrollable  travel', centered: true, size: 'lg'})
        }else if(action == 'travelExpense'){
          this.modalService.open(TravelDeskModalComponent,{ modalDialogClass: 'modal-dialog-scrollable  travel', centered: true, size: 'lg'})
        }
        else{
          this.modalService.open(TravelDeskModalComponent,{ modalDialogClass: 'modal-dialog-scrollable  travel', centered: true, size: 'lg'})
        }
        
    }
    close(){
        this.modalService.dismissAll();
    }

    setdocument(value: any) { console.log('val',value)
       // this.reportType=value
        this.subject$.next(value);
      }

      setUniqueId(value: any) { console.log('val',value)
        // this.reportType=value
         this.subjectId$.next(value);
       }

       setempID(empID:any){
        this.subjectEmpId$.next(empID);
       } 

       editTravelRequest(edit:any){ console.log('edit Travel Request',edit)
        this.subjectEditTravelRequest$.next(edit);
       } 

       reqDate(req:any){
        this.subjectReqDate$.next(req);
       }

       getDataource(val:any){ console.log('getDataSource',val)
        this.subjectDataSource$.next(val);
       }
}