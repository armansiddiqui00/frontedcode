import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DxTooltipComponent } from 'devextreme-angular';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from 'src/app/components/confirmation-dialog/confirmation-dialog.service';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { ReviewService } from '../../review-invoice/review-invoice-modal/review.service';
import { InvoiceService } from '../../invoice-details/invoice.service';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { ApiPaths, decrypt, delay } from 'src/app/shared/util';
import { SharedService } from 'src/app/services/shared.service';
import { AuthenticationService } from 'src/app/_services';
import { Clipboard } from '@angular/cdk/clipboard';
import { SignatureService } from 'src/app/services/SignatureService';
@Component({
  selector: 'app-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss']
})
export class DatagridComponent {
  @Output() getFilter = new EventEmitter();
  @Input() dataSource;
  @Input() managePageInfo;
  @Input() showNoRecords;
  @Input() showNoService;
  @Input() filters;
  @Input() pageConfig;
  @Input() headerConfig;
  columns = [];
  gridHeader:any;
  actionClick:Function;
  deleteRow:Function;
  userData = null;
  displayMode = 'full';

  showPageSizeSelector = true;

  showInfo = true;

  showNavButtons = true;
  showGrid:boolean = false;
  sessionTimeout = true;
  actionSignature;
  constructor(private store:StoreService, private confirmatioDialogService:ConfirmationDialogService, private restApi:RestApiService,private sharedSerivce:SharedService,private toastr:ToastrService,private signatureService:SignatureService, private clipboard:Clipboard, private invoiceService:InvoiceService,
    private authService:AuthenticationService
  ){
    this.deleteCellTemplate = this.deleteCellTemplate.bind(this);
    this.editCellTemplate = this.editCellTemplate.bind(this);
    this.deleteRow= (data) => this.onDeleteClick(data);
    this.actionClick = (data) => this.onActionClick(data);
    authService.currentUser.subscribe(d =>{
      this.userData = d?.loginUserDetails;
      if(this.userData != null){
        this.actionSignature = signatureService.signPayload(this.userData?.userEmailId);
      }
    })
  
  }

  ngOnInit(){
    this.invoiceService.gridView.subscribe(e => this.showGrid = e)
    this.sharedSerivce.refreshGrid.subscribe(o => {
      this.refresh();
    })
    this.gridHeader = this.managePageInfo.pageName == keywords.manageproject ? keywords.dwcProjectHead : keywords.dwcEmployeeHead;
   
    this.setGridColumn()
  }

  setGridColumn(){
    this.sharedSerivce.refreshGrid.subscribe(o => {
      this.refresh();
    })
    Object.entries(this.gridHeader).forEach(col=>{
      this.columns.push({dataField: col[0], caption : col[1],adaptive: true})
     })
     this.columns.push({ dataField: '', caption: 'Action', adative: true, cellTemplate: this.editCellTemplate });
     this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.deleteCellTemplate });   
  }
  
  refresh(){
    this.getFilter.emit()
  }

  deleteCellTemplate(container,options){
    let div =document.createElement('div'); 
    let a = document.createElement('a');
    a.style.fontSize = '20px';
    a.style.color = 'red'
    let html = '<img src="assets/icons/icon-delete.svg" atl="delete">'
    a.innerHTML = html;
    a.onclick = () => this.deleteRow(options.key)
    div.append(a);  
    return div;
  }

  editCellTemplate(container,options){
    let div =document.createElement('div'); 
    let a = document.createElement('a');
    a.classList.add('color-blue')
    let html = '<i class="fa fa-edit"></i>'
    a.innerHTML = html;
    a.onclick = () => this.actionClick(options.key)
    div.append(a);  
    return div;
  }

  onActionClick(data){
    
    this.restApi.getSession(keywords.checkStatus,this.userData?.userEmailId,this.actionSignature).subscribe(o =>{
      if(o?.isValid){
      this.store.gridRowData.next(null);
      if(this.managePageInfo.pageName == keywords.manageemployee){
        let bank = data && data?.bankEntity && data?.bankEntity?.length > 0 ? data?.bankEntity?.filter(b => b?.status == "active") : data?.bankEntity;
        let comp = data && data?.compEntity && data?.compEntity?.length > 0 ? data?.compEntity?.filter(b => b?.status == "active")  : data?.compEntity;

        if (data) {
            data.bankEntity = bank;
            data.compEntity =  comp;
        }
        
        data.id = 1;
        this.store.gridRowData.next(data);
        // setTimeout(()=>{
        //  this.store.gridRowData.next(data);
        // },500)
      }else{
       this.store.gridRowData.next(data);
      }
     }else{
      this.toastr.error(o?.message);
      this.authService.logoutThroughAngular()
    }
    });
    
   }

  onDeleteClick(data){
    this.restApi.getSession(keywords.checkStatus,this.userData?.userEmailId,this.actionSignature).subscribe(o =>{
      if(o?.isValid){
        this.openConfirmationDialog(data)
      }else{
        this.toastr.error(o?.message);
        this.authService.logoutThroughAngular()
      }
    });
    
  }
  openConfirmationDialog(data){
    this.confirmatioDialogService.confirm(keywords.delete, "Are you sure, you want to delete?")
    .then((confirm)=>{
      this.restApi.getSession(keywords.checkStatus,this.userData?.userEmailId,this.actionSignature).subscribe(o =>{
        if(o?.isValid){
          if(confirm){
            let url = this.managePageInfo.pageName == keywords.manageemployee ? ApiPaths.deleteEmployee : ApiPaths.deleteProject;
            let id =  this.managePageInfo.pageName == keywords.manageemployee ? data?.empId : data?.cpdId;
            let signId = this.signatureService.signPayload(id);
            let encodeData = encodeURIComponent(signId);
            this.headerConfig["request-type"] = "delete";
             this.restApi.deleteData(url+id+'?signature='+encodeData,null,this.headerConfig).subscribe(data=>{
             data?.status == keywords.ERROR ? this.toastr.error(data?.message) : this.toastr.success(data?.message);
              this.getFilter.emit();
              this.restApi.getPageConfig({empId:this.userData.empId,roleName:this.userData.roleName}).subscribe(d => {
                this.pageConfig = d;
              });
             // this.sharedSerivce.refreshGrid.next();
             // getOrDeleteData(this.store,this.restApi,null,ApiPaths.getAppReviewerList)
          },(err)=>{
            this.toastr.error(toastrMsg.errMsg)
          });
        }
        }else{
          this.toastr.error(o?.message);
          this.authService.logoutThroughAngular()
        }
      });
    })
  }

  onRightClick(e) {
    if (e.target == keywords.content) {
        e.items = [{
          text: keywords.copy,
          onItemClick:  ()=> {  
           this.clipboard.copy(e?.targetElement.innerHTML);
          }
     } ]
    
    }
  }
}


