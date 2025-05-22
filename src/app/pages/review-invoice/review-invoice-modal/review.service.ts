import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BehaviorSubject } from "rxjs";
import { ReviewInvoiceModalComponent } from "./review-invoice-modal.component";

@Injectable()

export class ReviewService{

    viewData:any
    pageConfig:any;

    subjectDataSource$ =new  BehaviorSubject<any>(null);
    selectedDataSource$ = this.subjectDataSource$.asObservable();

    subjectSheet$ = new  BehaviorSubject<any>(null);
    selectedSheet$ = this.subjectSheet$.asObservable()

    approvesubjectSheet$ = new  BehaviorSubject<any>(null);
    approveselectedSheet$ = this.approvesubjectSheet$.asObservable()

    pageName;
    obj;
    roleName;
    constructor(private modalService:NgbModal){}
    open(data,pageConfig,pageName,obj,roleName){
      this.viewData=data
      this.viewData.clientName = this.viewData?.clientName;
      this.obj = obj
      this.roleName =roleName
      //console.log('data',this.viewData)
      this.pageConfig = pageConfig;
      this.pageName = pageName
        if(this.viewData != null){
          this.modalService.open(ReviewInvoiceModalComponent,{ modalDialogClass: 'modal-dialog-scrollable travel', centered: true, size: 'xl'})
        }
    }
    close(){
        this.modalService.dismissAll();
    }

   

      //  getDataource(val:any){ console.log('getDataSource',val)
      //   this.subjectDataSource$.next(val);
      //  }

      //  sheet(val:any){
      //      this.subjectSheet$.next(val);
      //  }

      //  getReviewData(val:any){ console.log('val',val)
      //    this.approvesubjectSheet$.next(val);
      //  }
}