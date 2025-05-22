import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BehaviorSubject } from "rxjs";

@Injectable()

export class InvoiceService{
    action;
  
    subject$ = new  BehaviorSubject<any>(null);
    selectedSub$ = this.subject$.asObservable();

    subjectReset$ = new  BehaviorSubject<any>(null);
    selectedSubReset$ = this.subjectReset$.asObservable();

    subjectSheet$ = new  BehaviorSubject<any>(null);
    selectedSheet$ = this.subjectSheet$.asObservable()

    subjectcurrentUser$ = new  BehaviorSubject<any>(null);
    selectedcurrentUser$ = this.subjectcurrentUser$.asObservable()

    
    subjectPrevious$ = new  BehaviorSubject<any>(null);
    selectedPrevious$ = this.subjectPrevious$.asObservable()

    subjectPageConfig$ = new  BehaviorSubject<any>(null);
    selectedPageCOnfig$ = this.subjectPageConfig$.asObservable();

    goToPrivious = new  BehaviorSubject<any>(null);
    viewHistory = new  BehaviorSubject<any>(null);
    
    gridView = new BehaviorSubject<any>(null)
    constructor(private modalService:NgbModal){}
  
   

    setdocument(value: any) { 
        this.subject$.next(value);
      }

      reset(val:any){
        this.subjectReset$.next(val);

      }

      invoiceAndAttendance(val){
           this.subjectSheet$.next(val)
      }

      
      currentUser(val){
            this.subjectcurrentUser$.next(val)
      }

      previous(val){ //console.log('previous',val)
        this.subjectPrevious$.next(val)
      }

      manageProject(val){ //console.log('manageProject List',val)
        this.subjectPageConfig$.next(val)
      }
     
}