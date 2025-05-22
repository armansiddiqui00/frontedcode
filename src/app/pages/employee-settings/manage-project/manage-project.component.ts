import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from 'src/app/components/confirmation-dialog/confirmation-dialog.service';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { ReviewService } from '../../review-invoice/review-invoice-modal/review.service';
import { InvoiceService } from '../../invoice-details/invoice.service';
import { ApiPaths, deepClone, delay, removeNullUndefinedEmpty } from 'src/app/shared/util';
import { AuthenticationService } from 'src/app/_services';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { NgForm } from '@angular/forms';
import { SignatureService } from 'src/app/services/SignatureService';

@Component({
  selector: 'app-manage-project',
  templateUrl: './manage-project.component.html',
  styleUrls: ['./manage-project.component.scss']
})
export class ManageProjectComponent {
  @Output() getFilter = new EventEmitter();
  // @Output() saveOrUpdateFilter = new EventEmitter();
  @Input() pageConfig;
  @Input() dataSource;
  @Input() headerConfig;
  manageProjectPageInfo;
  userDetails: any;
  data = {
    cpdId: null,
    clientId: null,
    projectId: null,
    clientName: '',
    clientAddress: '',
    clientLocation: '',
    projectName: null,
    projectDesc: '',
    supervisor: null
  }
  sessionTimeout = true
  actionSignature;
  constructor(private authService: AuthenticationService, private signatureService: SignatureService, private apiService: RestApiService, private lodder: LoaderService, private toastr: ToastrService, private confirmationDialogService: ConfirmationDialogService, private loader: LoaderService, private store: StoreService, private datepipe: DatePipe) {
    this.authService.currentUser.subscribe(d => {
      this.userDetails = d?.loginUserDetails;
      if(this.userDetails != null){
        this.actionSignature = signatureService.signPayload(this.userDetails?.userEmailId);
      }
    });
  }

  ngOnInit() {
    this.apiService.getSession(keywords.checkStatus,this.userDetails?.userEmailId,this.actionSignature).subscribe(o =>{
      if(o?.isValid){
      this.applyFilters();
      this.store.gridRowData.subscribe(d => {
        if (d != null) {
          this.data = d;
          this.data = {
            cpdId: d.cpdId,
            clientId: d.clientId,
            projectId: d.projectId,
            clientName: d.clientName,
            clientAddress: d.clientAddress,
            clientLocation: d.clientLocation,
            projectName: d.projectName,
            projectDesc: d.projectDesc,
            supervisor: d.supervisor
          }
        }
      })
    }else{
      this.toastr.error(o?.message);
      this.authService.logoutThroughAngular()
    }
  });
  }

  key: any = null
  Save(projectForm: NgForm) {
    this.apiService.getSession(keywords.checkStatus,this.userDetails?.userEmailId,this.actionSignature).subscribe(o =>{
      if(o?.isValid){
        let flag = false;
        if (this.data.projectName != '' && this.data.projectName != null) {
          if (this.dataSource != null && this.dataSource != undefined && this.data.cpdId == null) {
            this.dataSource?.forEach(e => {
              // if(e.projectName.toLowerCase() == this.data.projectName.toLowerCase() && e.clientName.toLowerCase() == this.data.clientName.toLocaleLowerCase()){
              //   flag = true;
              // }
              if (e.projectName.toLowerCase().trim() == this.data.projectName.toLowerCase().trim()) {
                flag = true;
              }
            })
          } else {
            let index = this.dataSource.findIndex(f => this.data.cpdId == f.cpdId);
            this.dataSource?.forEach((o, i) => {
              if (index != i && o.projectName.toLowerCase().trim() == this.data.projectName.toLowerCase().trim()) {
                flag = true;
              }
            })
          }
        }
    
        if (projectForm.invalid) {
          this.toastr.error(toastrMsg.mandatoryMsg);
          return;
        } else if (flag) {
          this.toastr.error(toastrMsg.projectNameExist);
          return;
        } else if ((!isNaN(this.data.projectName) && !isNaN(parseFloat(this.data.projectName)))) {
          this.toastr.error(toastrMsg.projectNameNotProper);
          return;
        } else {
          let preparedFilters = {
            cpdId: this.data.cpdId == null ? 0 : this.data.cpdId,
            clientId: this.data.clientName.toLowerCase(),
            clientName: this.data.clientName,
            clientAddress: this.data.clientAddress,
            clientLocation: this.data.clientLocation,
            projectId: this.data.projectName.toLowerCase(),
            projectName: this.data.projectName,
            projectDesc: this.data.projectDesc,
            supervisor: this.data.supervisor,
            //url : ApiPaths.saveOrUpdateProjectDetails
          }
          removeNullUndefinedEmpty(preparedFilters)
          let payload = {
            projectPayload: JSON.parse(this.signatureService.stringifyWithSortedKeys(preparedFilters)),
            signature: this.signatureService.signPayload(preparedFilters)
          }
          this.loader.show();
          this.headerConfig["request-type"] = this.data.cpdId == null || this.data.cpdId == 0 ? 'save' : 'update';
          this.apiService.saveData(ApiPaths.saveOrUpdateProjectDetails, payload, this.headerConfig).subscribe(d => {

            d.status == keywords.SUCCESS ? this.toastr.success(d?.message) : this.toastr.error(d?.message);
            this.getFilter.emit();
            this.loader.hide();
          }, (err) => {
            this.loader.hide();
            this.toastr.error(toastrMsg.errMsg);
          })
          setTimeout(() => {
    
          }, 2000)
    
          this.reset();
        }
    }else{
      this.toastr.error(o?.message);
      this.authService.logoutThroughAngular()
    }
  });
  }


  applyFilters() {
    this.getFilter.emit()
  }

  reset() {
    this.apiService.getSession(keywords.checkStatus,this.userDetails?.userEmailId,this.actionSignature).subscribe(o =>{
    if(o?.isValid){
    this.data = {
      cpdId: null,
      clientId: null,
      projectId: null,
      clientName: '',
      clientAddress: '',
      clientLocation: '',
      projectName: '',
      projectDesc: '',
      supervisor: null
    }
    this.store.gridRowData.next(null);
    this.loader.hide()
    }else{
      this.loader.hide();
      this.toastr.error(o?.message);
      this.authService.logoutThroughAngular()
    }
  });
  }

  pasteOrNot(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
  }

  // // Using HostListener to listen for click events globally
  // @HostListener('document:click', ['$event'])
  // handleDocumentClick(event: MouseEvent) {
  //   this.authService.logout(keywords.checkStatus);
  // }
}
