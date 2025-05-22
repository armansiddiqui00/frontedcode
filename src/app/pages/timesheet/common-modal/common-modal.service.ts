import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { CommonModalComponent } from './common-modal.component';

@Injectable({
  providedIn: 'root'
})
export class CommonModalService {
  tSData:any;
  datapassedToView:any;
 
  messageSource = new BehaviorSubject<string>("default message");
  currentMessage = this.messageSource.asObservable();
  timesheetId:any;
  constructor(private modalService:NgbModal) { }

 
  changeMessage(message: any) {
    this.messageSource.next(message)
    this.timesheetId=message
    //console.log('message',this.timesheetId)
    const modalRef=this.modalService.open(CommonModalComponent, {modalDialogClass: 'modal-dialog-scrollable',centered:true,size:'xl',backdrop:true,backdropClass:'custom-class'})
    modalRef.componentInstance.timesheetDetailsDetaa = this.timesheetId;
  }



  open(data){
    this.tSData = data;
  //  console.log("TSDATA",this.tSData)
    
  }

 

  close(){
    this.modalService.dismissAll();
  }
}
