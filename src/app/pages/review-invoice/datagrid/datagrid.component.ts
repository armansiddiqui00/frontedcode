import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { image, keywords, toastrMsg } from 'src/app/shared/constant';
import ContextMenu from "devextreme/ui/context_menu";
import { ActivatedRoute, Router } from '@angular/router';
import { ApiPaths, decrypt, decryptUsingAES256, delay, encryptUsingAES256, removeNullUndefinedEmpty } from 'src/app/shared/util';
import { RestApiService } from 'src/app/services/rest-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from 'src/app/components/confirmation-dialog/confirmation-dialog.service';
import { StoreService } from 'src/app/services/store.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal'
import { DxDataGridComponent, DxTooltipComponent } from 'devextreme-angular';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReviewService } from '../review-invoice-modal/review.service';
import { InvoiceService } from '../../invoice-details/invoice.service';
import { AuthenticationService } from 'src/app/_services';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Clipboard } from '@angular/cdk/clipboard';
import { SignatureService } from 'src/app/services/SignatureService';
import { PageConfigService } from 'src/app/services/page-config.service';
import { SharedService } from 'src/app/services/shared.service';
import themes from 'devextreme/ui/themes';
@Component({
  selector: 'data-grid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss']
})
export class DataGridComponent {
  @Input() dataSource;
  @Input() gridHeader;
  @Input() reviewInvoicePageInfo;
  @Input() showNoRecords;
  @Input() newRecord;
  @Input() pageConfig;
  @Input() params;
  @Input() bankDataGrid;
  @Input() filter;
  @Input() headerConfig;
  @Input() pageName
  @ViewChild(DxTooltipComponent) tooltip: DxTooltipComponent;
  @ViewChild('approveInvoice') approveInvoice: TemplateRef<any>;
  @ViewChild('rejectInvoice') rejectInvoice: TemplateRef<any>;
  @ViewChild('passwordTemplate') passwordTemplate: TemplateRef<any>;
  @ViewChild('downloadTemplate') downloadTemplate: TemplateRef<any>;
  @ViewChild('updateTemplate') updateTemplate: TemplateRef<any>;
  @Output() getFilter = new EventEmitter();
  @Output() getParams = new EventEmitter();
  @Output() getReviewHistory = new EventEmitter();

  @ViewChild(DxDataGridComponent, {
    static: false
  }) dataGrid: DxDataGridComponent;
  header: any;
  columns = [];
  actionClick: Function;
  editClick: Function;
  editTravelRequest: Function;
  deleteRow: Function;
  editDropDownMenu: any;
  menuInstance;
  pageId: any;
  modalRef?: BsModalRef;
  focusedRowKey;
  focus: boolean = false
  reqCreatedDate: any
  date: any = new Date()
  highlight: boolean = false;
  viewInvoice: Function;
  password: any;
  userDetails;
  optionsData;
  primaryKey: any;
  filterData: any;
  empAddress: any;
  generatePdfDetailsList: any = [];
  amountInWords: any;
  totalAmount = 0;
  selectedVal: any[] = [];
  selectedValCopy: any[] = [];
  selectedAll: any;
  checkbox = 'Invoice';
  search = null;
  pmtProcessed = false;
  pmtProgress = false;
  sarAndInr = 'regular';
  others = false;
  displayMode = 'full';
  showPageSizeSelector = true;

  showInfo = true;

  showNavButtons = true;
  trxRefNo = null;
  pmtCheckbox = []
  allMode: string;
  checkBoxesMode: string;
  selectedRows: number[] = [];
  sessionTimeout = true;
  sessionFlag = false;
  constructor(private router: Router, private service: RestApiService, private loader: LoaderService, private toastr: ToastrService, private modalService: BsModalService, private store: StoreService, private datepipe: DatePipe, private reviewService: ReviewService, private invoiceService: InvoiceService,
    private auth: AuthenticationService, private _decimalPipe: DecimalPipe, private clipboard: Clipboard, private signatureService: SignatureService, private pageConfigService: PageConfigService, private sharedService: SharedService, private confirmatioDialogService: ConfirmationDialogService, private restApi: RestApiService) {
    this.viewCellTemplate = this.viewCellTemplate.bind(this)
    this.approveCellTemplate = this.approveCellTemplate.bind(this)
    this.rejectCellTemplate = this.rejectCellTemplate.bind(this)
    this.editCellTemplate = this.editCellTemplate.bind(this)
    this.actionCellTemplate = this.actionCellTemplate.bind(this);
    this.viewAccountCellTemplate = this.viewAccountCellTemplate.bind(this)
    this.updateCellTemplate = this.updateCellTemplate.bind(this)

    this.onClick = this.onClick.bind(this);
    // this.viewInvoice=(data)=> this.viewReview(data);
    this.auth.currentUser.subscribe(d => {
      this.userDetails = d?.loginUserDetails;
    })
    invoiceService.viewHistory.subscribe(v => { this.filterData = v });
    this.sharedService.refreshGrid.subscribe(o => {
      this.refresh();
    })
    //select all checkbox
    //this.checkBoxesMode = themes.current().startsWith('material') ? 'always' : 'onClick';
    this.checkBoxesMode = 'always';

  }

  demo = []

  ngOnInit() {
    //this.header = this.reviewInvoicePageInfo == undefined ? keywords.empBakHead : this.reviewInvoicePageInfo.pageName == 'reviewinvoice' ? keywords.invoiceReview : this.reviewInvoicePageInfo.pageName == 'invoicehistory' ? keywords.invoiceHistory : this.reviewInvoicePageInfo.pageName == 'processinvoices' ? keywords.invoiceReview : '';
    this.header = this.reviewInvoicePageInfo == undefined ? keywords.empBakHead : this.reviewInvoicePageInfo.pageName == 'reviewinvoice' || this.reviewInvoicePageInfo.pageName == 'processinvoices' || this.reviewInvoicePageInfo.pageName == 'attendence' ? keywords.invoiceReview : this.reviewInvoicePageInfo.pageName == 'invoicehistory' ? keywords.invoiceHistory : '';
    if (this.reviewInvoicePageInfo?.pageName == 'processinvoices' && this.userDetails?.roleName == keywords.finance) {
      this.header.forEach((f, i) => {
        f.id == "invoiceObj.reviewer01Comments" || f.id == "invoiceObj.reviewer02Comments" || f.id == "clientName" ? this.header.splice(i, 1) : '';
      })
    }
    // setTimeout(() => {
    this.columns = [];

    this.setColoumns();
    // }, 10);
    // this.activeRoute.queryParams.subscribe(data=> this.pageId = data.pageId);
  }

  ngOnChanges() {
    this.selectedVal = []
    // this.dataSource?.forEach(f => {
    //   let emp = this.pageConfig?.employeeList?.filter(o => f.invoiceObj.empId == o.empId);
    //   if (emp != null && emp != undefined && emp.length > 0) {
    //     let obj = {
    //       empName: emp[0]?.firstName + " " + emp[0]?.lastName + " (" + f.invoiceObj.invNum + ")",
    //       empId: emp[0]?.empId,
    //       invNum: f.invoiceObj?.invNum,
    //       paymentStatus: f?.invoiceObj?.paymentStatus,
    //       currency: f?.currency,
    //       defaultPkg: f?.defaultPkg,
    //       selected: false
    //     }
    //     this.selectedVal.push(obj)
    //   }
    // })

    // this.selectedValCopy = this.selectedVal.filter(f => f?.currency == 'SAR ( ر.س)' ||  f?.currency == 'INR (₹)');
    // this.dataSource?.forEach(f => {
    //   if (f.invoiceObj != null && f.invoiceObj != undefined) {
    //         let obj = {
    //           empName: f.invoiceObj?.consultantName + " (" + f.invoiceObj.invNum + ")",
    //           empId: f.invoiceObj?.empId,
    //           invNum: f.invoiceObj?.invNum,
    //           paymentStatus: f?.invoiceObj?.paymentStatus,
    //           currency: f?.currency,
    //           defaultPkg: f?.defaultPkg,
    //           selected: true
    //         }
    //         this.selectedVal.push(obj)
    //       }
    // })
    // this.selectedValCopy = this.selectedVal
  }
  setColoumns() {

    this.header.filter((filter: any) => {
      // if(filter.id == 'invoiceObj.clientId'){
      //   this.columns.push({ dataField: filter.id, alignment: 'left', caption: filter.name, adaptive: true })
      // }

      if (filter.id == "invoiceObj.invoiceStatus") {
        this.columns.push({
          dataField: filter.id, alignment: 'left', caption: filter.name, adaptive: true, valueFormatter: function (cellInfo) {
            return cellInfo.value ? cellInfo.value.toUpperCase() : '';
          }
        })

      }
      else {
        this.columns.push({ dataField: filter.id, alignment: 'left', caption: filter.name, adaptive: true })
      }

    })

    if (this.reviewInvoicePageInfo?.pageName == 'reviewinvoice') {
      this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.viewAccountCellTemplate });
      this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.viewCellTemplate });
      this.pageConfigService.user.roleName != 'Finance' ? this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.approveCellTemplate }) : ''
      this.pageConfigService.user.roleName != 'Finance' ? this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.rejectCellTemplate }) : ''
      this.pageConfigService.user.roleName == 'Finance' ? this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.updateCellTemplate }) : ''
      this.pageConfigService.user.roleName == 'Finance' ? this.columns.unshift({ dataField: '', caption: "", cssClass: keywords.plusIcon, allowSorting: false }) : ''
    }
    else if (this.reviewInvoicePageInfo?.pageName == 'invoicehistory') {
      this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.viewAccountCellTemplate });
      this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.viewCellTemplate });
      this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.editCellTemplate });
    } else if (this.reviewInvoicePageInfo == undefined) {
      this.primaryKey = 'empId'
      this.columns.unshift({ dataField: '', caption: "", cssClass: keywords.plusIcon, allowSorting: false, cellTemplate: this.actionCellTemplate })
    } else if (this.reviewInvoicePageInfo?.pageName == 'processinvoices') {
      this.columns.unshift({ dataField: '', caption: "", cssClass: keywords.plusIcon, allowSorting: false })
      this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.viewAccountCellTemplate });
      this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.viewCellTemplate });
      this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.updateCellTemplate })
    }
  }

  approveData: any
  approver: boolean = false
  rejectFlag: boolean = false
  approveCellTemplate(container, options) {
    let div = document.createElement('div');
    //changes made due to invoice status change
    options.data?.invoiceObj?.invoiceStatus == keywords.paymentInitiated || options.data?.invoiceObj?.invoiceStatus == keywords.paid || this.userDetails.roleName == 'Manager' || (options.data?.invoiceObj?.reviewer01Status == "Approved" && this.userDetails.roleName == 'HR') || (options.data?.invoiceObj?.reviewer01Status == "Approved" && options.data?.invoiceObj?.reviewer02Status == "Approved") ? div.classList.add('disabled-access') : (options.data?.invoiceObj?.reviewer01Status == "Approved" || options.data?.invoiceObj?.reviewer01Status == "Rejected") && this.userDetails.roleName == 'Manager' ? div.classList.add('disabled-access') : options.data?.invoiceObj?.invoiceStatus == 'Rejected' ? div.classList.add('disabled-access') : div;
    let a = document.createElement('a');
    a.classList.add('color-blue')
    // if((options.data?.invoiceObj?.reviewer01Id == null && this.userDetails.roleName != 'HR' && this.userDetails.roleName != 'Finanace') || (options.data?.invoiceObj?.reviewer01Id != null && this.userDetails.roleName == 'HR')){
    let html = '<i class="fa fa-check" style="color: #81d302;font-size: 20px;"></i>'
    a.innerHTML = html;
    a.onclick = () => {
      this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
        if (d?.isValid) {
          this.template(this.approveInvoice)
          this.approveData = options.data?.invoiceObj;
        } else {
          this.auth.logoutThroughAngular();
          this.toastr.error(d?.message);
        }
      }, (err) => this.toastr.error(toastrMsg.errMsg))
    }
    div.append(a);
    return div;
  }

  rejectData: any;
  comment = null;

  rejectCellTemplate(container, options) {
    let div = document.createElement('div');
    // options.data?.invoiceObj?.reviewer01Status == "Approved" && options.data?.invoiceObj?.reviewer02Status == "Approved" ? div.classList.add('disabled-access') : (options.data?.invoiceObj?.reviewer01Status == "Approved" || options.data?.invoiceObj?.reviewer01Status == "Rejected") && this.userDetails.roleName == 'Manager' ? div.classList.add('disabled-access') : options.data?.invoiceObj?.invoiceStatus == 'Rejected' ? div.classList.add('disabled-access') : div;
    options.data?.invoiceObj?.invoiceStatus == keywords.paymentInitiated || options.data?.invoiceObj?.invoiceStatus == keywords.paid || this.userDetails.roleName == 'Manager' || options.data?.invoiceObj?.reviewer01Status == "Rejected" || options.data?.invoiceObj?.reviewer02Status == "Rejected" || this.userDetails.roleName == 'Finance' ? div.classList.add('disabled-access') : div
    let a = document.createElement('a');
    a.classList.add('color-blue');
    a.setAttribute("title", "Withdraw Invoices");
    // if(this.approver == false){
    let html = '<i class="fa fa-close" style="color: red;font-size: 20px;"></i>'
    a.innerHTML = html;
    a.onclick = () => {
      this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
        if (d?.isValid) {
          this.template(this.rejectInvoice);
          this.comment = null
          this.approveData = options.data?.invoiceObj;
          options.key.status = "Rejected"
          this.rejectFlag = true
          this.approver = false
          //  options.key.comment=this.comment
          this.rejectData = options.data?.invoiceObj
        } else {
          this.auth.logoutThroughAngular();
          this.toastr.error(d?.message);
        }
      }, (err) => this.toastr.error(toastrMsg.errMsg))

      //this.applyFiltersEvent.emit(options);
    }
    // }else{
    //   let html = '<i class="fa fa-close" style="color: gray;font-size: 20px;"></i>'
    //   a.innerHTML = html;
    // }


    div.append(a);
    return div;
  }

  actionCellTemplate(container, options) {
    let div = document.createElement('div')
    let a = document.createElement('a');
    a.classList.add('color-blue')
    let html = '<button type=button class="btn btn-primary" style="background: #2A235F; height: 35px;">View History</button>'

    if (this.dataGrid.instance.isRowExpanded(options.key)) {
      html = '<button type=button class="btn btn-primary" style="background: #2A235F; height: 35px;">Hide History</button>'
    }
    a.innerHTML = html;
    a.onclick = () => {
      this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
        if (d?.isValid) {
          if (this.dataGrid.instance.isRowExpanded(options.key)) {
            this.dataGrid.instance.collapseRow(options.key)
          } else {
            options.component.collapseAll(-1)
            this.dataGrid.instance.expandRow(options.key)
          }
        } else {
          this.auth.logoutThroughAngular();
          this.toastr.error(d?.message);
          this.reviewService.close()
          this.modalRef?.hide();
          
        }
      }, (err) => this.toastr.error(toastrMsg.errMsg))
    }
    div.append(a);
    return div;
  }


  //For Finance new UI adding checkboxes
  // checkBoxCellTemplate(container, options) {
  //   let div = document.createElement('div');
  //   let a = document.createElement('a');
  //   a.classList.add('color-blue')
  //   let html = '<input type="checkbox" id="inProgress" name="inProgress" value="inProgress">'
  //   a.innerHTML = html;
  //   a.onclick = () => {
  //     let checkbox = null ;
  //     setTimeout(() =>{
  //       // checkbox = document.getElementById("inProgress") as HTMLInputElement;
  //       checkbox = options.cellElement.getElementsByTagName('input')[0].checked
  //     if(checkbox == true){
  //       let obj = {
  //         invNum : options.data?.invoiceObj?.invNum,
  //         invoiceYear : options.data?.invoiceObj?.invoiceYear,
  //         transactionRefId : options?.data?.invoiceObj?.transactionRefId
  //       }
  //       this.pmtCheckbox.push(obj)
  //     }else if(checkbox == false){
  //       let index = this.pmtCheckbox.findIndex(ind => ind.invNum == options.data?.invoiceObj?.invNum)
  //       index > -1 ? this.pmtCheckbox.splice(index,1) : '' ;
  //     }
  //     },200)
  //   }
  //   div.append(a);
  //   return div;
  // }

  //For Finance new UI adding checkboxes
  consultantName: any
  invoiceNumber: any
  transRefNo: any
  updateCellTemplate(container, options) {
    let div = document.createElement('div');
    options?.data?.invoiceObj?.invoiceStatus != 'underReview' && options?.data?.invoiceObj?.invoiceStatus != 'Rejected' ? div : div.classList.add('disabled-access');    let a = document.createElement('a');
    a.classList.add('color-blue')
    // let html = '<i class="fa fa-refresh" aria-hidden="true"></i>'
    let html = '<img src="assets/icons/RECIPT_UPDATE.png" alt="Girl in a jacket" width="28" height="28">'
    a.innerHTML = html;
    a.onclick = () => {
      this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
        if (d?.isValid) {
          this.template(this.updateTemplate);
          this.consultantName = options.data.invoiceObj.consultantName
          this.invoiceNumber = options.data.invoiceObj.invNum;
          this.trxRefNo = options.data.invoiceObj.transactionRefId;
          this.approveData = options.data?.invoiceObj;
        } else {
          this.auth.logoutThroughAngular();
          this.toastr.error(d?.message);
        }
      }, (err) => this.toastr.error(toastrMsg.errMsg))
    }
    div.append(a);
    return div;
  }


  template(template: TemplateRef<any>) {
    this.password = null
    this.modalRef = this.modalService.show(template);

  }

  approve() {
    this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
      if (d?.isValid) {
        let approveD = {
          invoiceStatus: null,
          invoiceYear:null,
          reviewer01Comments: null,
          reviewer01Id: null,
          reviewer01PrcDt: null,
          reviewer01Status: null,
          reviewer02Comments: null,
          reviewer02Id: null,
          reviewer02PrcDt: null,
          reviewer02Status: null
        }
        if (this.userDetails?.roleName == 'HR') {
          approveD.reviewer01Id = this.userDetails?.empId;
          approveD.reviewer01PrcDt = this.datepipe.transform(new Date(), keywords.formateDateOnly);
          approveD.reviewer01Status = "Approved";
          approveD.reviewer01Comments = "-"
          approveD.invoiceStatus = keywords.underReview;
          // this.approveData.reportingId = this.userDetails.hrId;
        } else if (this.userDetails?.roleName == 'Authorized' && this.approveData.reviewer01Id != null) {
          approveD.reviewer02Id = this.userDetails?.empId;
          approveD.reviewer02PrcDt = this.datepipe.transform(new Date(), keywords.formateDateOnly);
          approveD.reviewer02Status = "Approved";
          approveD.reviewer02Comments = "-";
          approveD.invoiceStatus = "Approved";
          // this.approveData.reportingId = this.userDetails.financeId;
        }
        let date = new Date();
        // let month = date.getMonth() + +1
        let month = this.approveData.invoiceYear
        approveD.invoiceYear = this.approveData.invoiceYear 
        this.approveData.invAmount = isNaN(this.approveData.invAmount) ? this.approveData.invAmount : encryptUsingAES256(this.approveData.invAmount);


        
        removeNullUndefinedEmpty(approveD)
        let payload = {
          approveData: approveD,
          signature: this.signatureService.signPayload(approveD)
        }
        this.headerConfig["request-type"] = "update";

        this.service.savePatchData('updateInvStatus/' + this.approveData.invId, payload, this.headerConfig).subscribe(d => {
          d?.status == "SUCCESS" ? this.toastr.success('Invoice Approved Successfully!') : this.toastr.error(d?.message);
          if (this.filterData?.url == 'getEmpInvReviewHistory/') {
            delete this.filterData.url
            this.getReviewHistory.emit(this.filterData)
          } else if (this.filterData?.url == 'getInvoiceByReportingId/') {
            let url = 'getInvoiceByReportingId/' + this.filterData?.roleName + '/' + this.filterData?.reportingId + '/' + this.filterData?.month + "?signature=" + this.filterData?.encSignature;
            this.getParams.emit(null)
            this.getFilter.emit(url)
          } else if (this.filterData?.url == 'getInvoiceByInvoiceNo/') {
            let params = { invNum: this.filterData?.invNum, month: this.filterData?.month };
            let url = 'getInvoiceByInvoiceNo';
            this.getParams.emit(params)
            this.getFilter.emit(url)
          }
        })

        //  this.toastr.success('Invoice Approved Successfully!');
      } else {
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))
  }

  reject() {
    this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
      if (d?.isValid) {
        let rejectD = {
          invoiceStatus: null,
          reviewer01Comments: null,
          reviewer01Id: null,
          reviewer01PrcDt: null,
          reviewer01Status: null,
          reviewer02Comments: null,
          reviewer02Id: null,
          reviewer02PrcDt: null,
          reviewer02Status: null,



        }
        if (this.comment == null || this.comment == '' || this.comment == undefined) {
          this.toastr.error(toastrMsg.rejectMsg);
          return;
        }
        else {
          if (this.userDetails?.roleName == 'HR') {
            rejectD.reviewer01Id = this.userDetails?.empId;
            rejectD.reviewer01PrcDt = this.datepipe.transform(new Date(), keywords.formateDateOnly);
            rejectD.reviewer01Status = "Rejected";
            rejectD.reviewer01Comments = this.comment;
            rejectD.invoiceStatus = "Rejected";
            //this.rejectData.reportingId = null;
          } else if (this.userDetails?.roleName == 'Authorized' && this.approveData.reviewer01Id != null && this.approveData.reviewer01Status == 'Approved') {
            rejectD.reviewer02Id = this.rejectData.hrId;
            rejectD.reviewer02PrcDt = this.datepipe.transform(new Date(), keywords.formateDateOnly);
            rejectD.reviewer02Status = "Rejected";
            rejectD.reviewer02Comments = this.comment;
            rejectD.invoiceStatus = "Rejected";
            //this.approveData.reportingId = null;
          }
          //  else if (this.userDetails?.roleName == 'HR' && this.approveData.reviewer01Id == null) {
          //   this.rejectData.reviewer02Id = this.rejectData.hrId;
          //   this.rejectData.reviewer02PrcDt = this.datepipe.transform(new Date(), keywords.formateDateOnly);
          //   this.rejectData.reviewer02Status = "Rejected";
          //   this.rejectData.reviewer02Comments = this.comment;
          //   this.rejectData.invoiceStatus = "Rejected";
          //   this.rejectData.reviewer01Id = this.userDetails?.empId;
          //   this.rejectData.reviewer01PrcDt = new Date();
          //   this.rejectData.reviewer01Status = "Rejected";
          //   this.rejectData.reviewer01Comments = this.comment;
          //   this.rejectData.invoiceStatus = "Rejected";
          //   //this.approveData.reportingId = null;
          // }

          let date = new Date();
          //let month = date.getMonth() + +1
          let month = this.rejectData.invoiceYear
          this.approveData.invAmount = isNaN(this.approveData.invAmount) ? this.approveData.invAmount : encryptUsingAES256(this.approveData.invAmount);
          // let body = {
          //   attendence: [],
          //   invoice: JSON.parse(this.signatureService.stringifyWithSortedKeys(this.approveData)),
          //   particular: []
          // }

          // let payload = {
          //   invPayload: body,
          //   signature: this.signatureService.signPayload(body)
          // }
          removeNullUndefinedEmpty(rejectD)
          let payload = {
            approveData: rejectD,
            signature: this.signatureService.signPayload(rejectD)
          }
          this.headerConfig["request-type"] = "update";
          this.service.savePatchData('updateInvStatus/' + this.approveData.invId, payload, this.headerConfig).subscribe(d => {
            d?.status == "SUCCESS" ? this.toastr.success('Invoice Rejected Successfully!') : this.toastr.error(d?.message);
            if (this.filterData?.url == 'getEmpInvReviewHistory/') {
              // this.getParams.emit(null)
              // let url = 'getEmpInvReviewHistory/'+this.filterData?.roleName +'/'+this.filterData?.reportingId + '/' + this.filterData?.empId +'/' + this.filterData?.month + '/' + this.filterData?.status;
              // this.getFilter.emit(url)
              delete this.filterData.url
              this.getReviewHistory.emit(this.filterData)
            } else if (this.filterData?.url == 'getInvoiceByReportingId/') {
              let url = 'getInvoiceByReportingId/' + this.filterData?.roleName + '/' + this.filterData?.reportingId + '/' + this.filterData?.month + '?signature=' + this.filterData?.encSignature;
              this.getParams.emit(null)
              this.getFilter.emit(url)
            } else if (this.filterData?.url == 'getInvoiceByInvoiceNo/') {
              let params = { invNum: this.filterData?.invNum, month: this.filterData?.month };
              let url = 'getInvoiceByInvoiceNo';
              this.getParams.emit(params)
              this.getFilter.emit(url)
            }
          })

          // this.service.saveData('saveOrUpdateinvoice',this.rejectData).subscribe(d =>this.getFilter.emit('getInvoiceByReportingId/' + this.userDetails.roleName + '/' + this.userDetails.empId+'/'+ month))



          this.modalRef.hide()
          //this.rejectData.comment=this.comment
          // this.rejectData.status='Rejected'
        }
      } else {
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
        this.modalRef.hide();
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))
  }


  viewCellTemplate(container, options) {
    let div = document.createElement('div');
    let a = document.createElement('a');
    this.reviewInvoicePageInfo.pageName == 'reviewinvoice' && this.userDetails.roleName == 'Manager' ? div.classList.add('disabled-access') : div;
    a.classList.add('color-blue')
    let html = '<i class="fas fa-file-invoice"></i>'
    a.innerHTML = html;
    a.onclick = (e) => {
      this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
        if (d?.isValid) {
          if (this.userDetails?.roleName == keywords.finance) {
            this.optionsData = options;
            this.onViewReview(options);
          } else {
            this.template(this.passwordTemplate);
            this.optionsData = options;
          }
        } else {
          this.auth.logoutThroughAngular();
          this.toastr.error(d?.message);
          this.reviewService.close()
          this.modalRef?.hide();
        }
      }, (err) => this.toastr.error(toastrMsg.errMsg))
    }
    div.append(a);
    return div;
  }

  viewAccountCellTemplate(container, options) {
    let div = document.createElement('div');
    let a = document.createElement('a');
    this.reviewInvoicePageInfo.pageName == 'reviewinvoice' && this.userDetails.roleName == 'Manager' ? div.classList.add('disabled-access') : div;
    a.classList.add('color-blue')
    let html = '<i class="fa fa-bank"></i>'
    a.innerHTML = html;
    a.onclick = (e) => {
      this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
        if (d?.isValid) {
          if (this.userDetails?.roleName == keywords.finance) {
            this.optionsData = options;
            this.onViewReview(options);
          } else {
            this.template(this.passwordTemplate);
            this.optionsData = options;
          }
        } else {
          this.auth.logoutThroughAngular();
          this.toastr.error(d?.message);
        }
      }, (err) => this.toastr.error(toastrMsg.errMsg))
    }
    div.append(a);
    return div;
  }
  onViewReview(data: any) {
    let clientName = this.optionsData?.data?.invoiceObj?.clientId?.split(',');
    let clientNameModel = clientName?.map(m => m?.charAt(0)?.toUpperCase() + m?.slice(1))
    if ((this.password == null || this.password == undefined || this.password == '') && this.userDetails.roleName != keywords.finance) {
      this.toastr.error(toastrMsg.mandatoryMsg)
    } else {
      this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
        if (d?.isValid) {
          this.loader.show()
          let sign = this.signatureService.signPayload(this.optionsData.data.invoiceObj.empId);
          let encode = encodeURIComponent(sign);
          setTimeout(() => {
            if (this.reviewInvoicePageInfo?.pageName == 'reviewinvoice' || this.reviewInvoicePageInfo?.pageName == 'processinvoices' || this.reviewInvoicePageInfo?.pageName == 'attendence') {
              this.loader.hide();
              let columnIndex = this.reviewInvoicePageInfo?.pageName == 'reviewinvoice' || this.reviewInvoicePageInfo?.pageName == 'attendence' ? 12 : 11
              if (this.userDetails.roleName == keywords.finance) {
                this.password = this.userDetails?.empId;
              }
              if (this.password == this.userDetails.empId && this.optionsData.columnIndex == columnIndex) {
                // this.service.getOrDeleteData(ApiPaths.getAddress + this.optionsData.data.invoiceObj.empId + '?signature=' + encode, null, this.headerConfig).subscribe(o => {
                //   this.optionsData.data.employee = o
                this.reviewService.open(this.optionsData.data, this.pageConfig, this.reviewInvoicePageInfo?.pageName, 'invoice', this.userDetails.roleName);
                //})

              } else if (this.password == this.userDetails.empId && this.optionsData.columnIndex == columnIndex - 1) {

                // this.service.getOrDeleteData(ApiPaths.getBankDetails + this.optionsData.data.invoiceObj.empId + '/' + 'active' + '?signature=' + encode, null, this.headerConfig).subscribe(d => {
                //   if (d[0]?.message?.status == "ERROR") {
                //     this.toastr.error(d[0].message.message);
                //   }

                //   if (d != null || d?.length > 0) {
                //     d[0].accountHolderName = decrypt(d[0]?.accountHolderName);
                //     d[0].accountNumber = decrypt(d[0]?.accountNumber)
                //     d[0].bankAddress = decrypt(d[0]?.bankAddress)
                //     d[0].bankName = decrypt(d[0]?.bankName)
                //     this.reviewService.open(d, this.pageConfig, this.reviewInvoicePageInfo?.pageName, 'bank', '')
                //   }
                // })
                let employee = this.pageConfig.employeeList.filter(o => o?.empId == this.optionsData?.data?.invoiceObj?.empId)
                if (employee[0]?.bankEntity.length > 0) {
                  let activeBank = employee[0]?.bankEntity.filter(b => b?.status == 'active');
                  let bankDataArr = []
                  if (activeBank.length > 0) {
                    let bankObj = {
                      accountHolderName: decrypt(activeBank[0]?.accountHolderName),  
                      accountNumber: decrypt(activeBank[0]?.accountNumber),
                      bankAddress: decrypt(activeBank[0]?.bankAddress),
                      bankName: decrypt(activeBank[0]?.bankName),
                      ifscCode: activeBank[0]?.ifscCode,
                      swiftCode: activeBank[0]?.swiftCode,
                      empId: employee[0]?.empId,
                      status: activeBank[0]?.status
                    }

                    bankDataArr.push(bankObj);
                    // activeBank[0].accountHolderName = activeBank[0]?.accountHolderName && typeof activeBank[0]?.accountHolderName === 'string' && isNaN((activeBank[0]?.accountHolderName)) // Check if it looks like an encrypted string
                    //                                   ? decrypt(activeBank[0]?.accountHolderName): activeBank[0]?.accountHolderName;
                    // activeBank[0].accountNumber = isNaN(activeBank[0]?.accountNumber) ? decrypt(activeBank[0]?.accountNumber) : activeBank[0]?.accountNumber;
                    // // activeBank[0].bankAddress = activeBank[0]?.bankAddress && typeof activeBank[0]?.bankAddress === 'string' && isNaN(Number(activeBank[0]?.bankAddress))// Check if it looks like an encrypted string
                    // //                              ? decrypt(activeBank[0]?.bankAddress) : activeBank[0]?.bankAddress;
                    // activeBank[0].bankName = activeBank[0]?.bankName && typeof activeBank[0]?.bankName === 'string' && isNaN(Number(activeBank[0]?.bankName))// Check if it looks like an encrypted string
                    //                           ? decrypt(activeBank[0]?.bankName) : activeBank[0]?.bankName;
                    // activeBank[0].empId = employee[0]?.empId
                    this.reviewService.open(bankDataArr, this.pageConfig, this.reviewInvoicePageInfo?.pageName, 'bank', '')
                  }
                }
              }
              else {
                this.toastr.error("Password is incorrect")
              }
            } else if (this.reviewInvoicePageInfo.pageName == 'invoicehistory') {
              this.loader.hide()
              if (this.password == decryptUsingAES256(this.pageConfig.employee?.empPassword) && this.optionsData.columnIndex == 10) {
                if (this.pageConfig?.employee?.bankEntity.length > 0) {
                  let activeBank = this.pageConfig?.employee?.bankEntity.filter(b => b?.status == 'active');
                  let bankDataArr = []
                  if (activeBank.length > 0) {
                    // activeBank[0].accountHolderName = activeBank[0]?.accountHolderName && typeof activeBank[0]?.accountHolderName === 'string' && isNaN(Number(activeBank[0]?.accountHolderName))// Check if it looks like an encrypted string
                    //                                   ? decrypt(activeBank[0]?.accountHolderName): activeBank[0]?.accountHolderName;
                    // activeBank[0].accountNumber = isNaN(activeBank[0]?.accountNumber) ? decrypt(activeBank[0]?.accountNumber) : activeBank[0]?.accountNumber;
                    // activeBank[0].bankAddress = activeBank[0]?.bankAddress && typeof activeBank[0]?.bankAddress === 'string' && isNaN(Number(activeBank[0]?.bankAddress)) // Check if it looks like an encrypted string
                    //                              ? decrypt(activeBank[0]?.bankAddress) : activeBank[0]?.bankAddress;
                    // activeBank[0].bankName = activeBank[0]?.bankName && typeof activeBank[0]?.bankName === 'string' && isNaN(Number(activeBank[0]?.bankName)) // Check if it looks like an encrypted string
                    //                           ? decrypt(activeBank[0]?.bankName) : activeBank[0]?.bankName;
                    // activeBank[0].empId = this.pageConfig?.employee?.empId

                    let bankObj = {
                      accountHolderName: decrypt(activeBank[0]?.accountHolderName),  
                      accountNumber: decrypt(activeBank[0]?.accountNumber),
                      bankAddress: decrypt(activeBank[0]?.bankAddress),
                      bankName: decrypt(activeBank[0]?.bankName),
                      ifscCode: activeBank[0]?.ifscCode,
                      swiftCode: activeBank[0]?.swiftCode,
                      empId: this.pageConfig?.employee?.empId,
                      status: activeBank[0]?.status
                    }
                    bankDataArr.push(bankObj);
                    this.reviewService.open(bankDataArr, this.pageConfig, this.reviewInvoicePageInfo?.pageName, 'bank', '')
                  }
                }
              } else if (this.password == decryptUsingAES256(this.pageConfig.employee?.empPassword) && this.optionsData.columnIndex == 11) {
                // this.service.getOrDeleteData(ApiPaths.getAddress + this.optionsData.data.invoiceObj.empId + '?signature=' + encode, null, this.headerConfig).subscribe(o => {
                // this.optionsData.data.employee = o
                // if (o != null && o.message.status == "ERROR") {
                //   this.toastr.error(o.message.message);
                // } else {
                this.reviewService.open(this.optionsData.data, this.pageConfig, this.reviewInvoicePageInfo?.pageName, 'invoice', '');
                // }

                //})
                //this.reviewService.open(this.optionsData.data,this.pageConfig,this.reviewInvoicePageInfo?.pageName,'invoice')
              } else {
                this.toastr.error("Password is incorrect")
              }
            }
          }, 3000)
          this.modalHide()
        } else {
          this.auth.logoutThroughAngular();
          this.toastr.error(d?.message); this.modalHide()
        }
      })
    }
  }


  onClick(e) {

  }

  editCellTemplate(container, options) {

    let div = document.createElement('div');
    if (this.reviewInvoicePageInfo.pageName == 'reviewinvoice') {
      (options.data?.invoiceObj?.reviewer01Status == "Approved" && options.data?.invoiceObj?.reviewer02Status == "Approved") ? div.classList.add('disabled-access') : options.data?.invoiceObj?.status == 'inactive' ? div.classList.add('disabled-access') : (options.data?.invoiceObj?.reviewer01Status == "Approved" || options.data?.invoiceObj?.reviewer01Status == "Rejected") && this.userDetails?.roleName == 'Manager' || options.data?.invoiceObj?.invoiceStatus == keywords.paymentInitiated || options.data?.invoiceObj?.invoiceStatus == keywords.paid ? div.classList.add('disabled-access') : div;
    } else {
      //Add condition because invoiceStatus is changed
      (options.data?.invoiceObj?.reviewer01Status == "Approved" && options.data?.invoiceObj?.reviewer02Status == "Pending") || options.data?.invoiceObj?.status == "inactive" || options.data?.invoiceObj?.invoiceStatus == 'Approved' || options.data?.invoiceObj?.invoiceStatus == keywords.paymentInitiated || options.data?.invoiceObj?.invoiceStatus == keywords.paid || (options.data?.invoiceObj?.invoiceStatus == "Rejected" && this.filterData == true) ? div.classList.add('disabled-access') : div;
    }
    let a = document.createElement('a');
    a.classList.add('color-blue')
    let html = '<i class="fa fa-edit"></i>'
    a.innerHTML = html;
    a.onclick = () => {
      this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
        if (d?.isValid) {
          this.onEdit2(options)
        } else {
          this.auth.logoutThroughAngular();
          this.toastr.error(d?.message);
        }
      }, (err) => this.toastr.error(toastrMsg.errMsg))
    }
    div.append(a);
    return div;
  }

  onEdit2(data: any) {
    let dataCopy = data?.data;

    let projects = dataCopy.invoiceObj.cpdId.includes(',') ? dataCopy.invoiceObj.cpdId.split(',') : [dataCopy.invoiceObj.cpdId]
    let clients = dataCopy.invoiceObj.clientId.includes(',') ? dataCopy.invoiceObj.clientId.split(',') : [dataCopy.invoiceObj.clientId];
    let expenses = [];
    let deduction = [];
    if (dataCopy?.invoiceObj?.invParticulars.length > 0) {
      dataCopy?.invoiceObj?.invParticulars?.forEach(par => {
        if (par.particularType == "deduction") {
          let date = par?.deductionDate?.includes(',') ? par?.deductionDate?.split(',') : null
          date?.forEach((d, index) => {
            date[index] = new Date(d)
          })
          let deduct = {
            particularId: par?.particularId,
            name: par?.name,
            amount: isNaN(par?.amount) ? decryptUsingAES256(par?.amount) : par?.amount,
            amountcal: isNaN(par?.amountcal) ? decryptUsingAES256(par?.amountcal) : par?.amountcal,
            noOfDays: isNaN(par?.noOfDays) || par?.noOfDays == 0 ? null : +par?.noOfDays,
            others: '',
            hours: '',
            dates: date,
            comment: par.comment,
            particularType: 'deduction',
            startDay: par.startDay,
            endDay: par.endDay
          }
          deduction.push(deduct);

        }
        else if (par.particularType == "expenses") {
          let date = par?.deductionDate?.split(',')
          date?.forEach((d, index) => {
            date[index] = new Date(d)
          })
          let amouncal = par?.amountcal != undefined && par?.amountcal != null ? par?.amountcal : null
          let part = {
            particularId: par?.particularId,
            name: par?.name,
            amount: isNaN(par?.amount) ? decryptUsingAES256(par?.amount) : par?.amount,
            attachment: par.attachment != null && par.attachment != undefined ? par.attachment : [],
            others: par.others,
            hours: +par.hours,
            noOfDays: +par.noOfDays,
            amountcal: isNaN(amouncal) ? decryptUsingAES256(amouncal) : amouncal,
            checkbox: par.checkbox,
            comment: par.comment,
            dates: date,
            otHourlyRate : +par.otHourlyRate,
            expCurrency: par?.expCurrency,
            expCurrencyRate: +par?.expCurrencyRate
          }
          // dataCopy?.invoiceObj?.invParticulars?.attachment?.forEach(file => {
          //   if (file.particularId == par.particularId) {
          //     part.attachment.push(file)
          //   }
          // });
          expenses.push(part);
        }
      })
    }

    if (deduction.length == 0) {
      let deduct = {
        particularId: null,
        name: '',
        amount: 0,
        noOfDays: 0,
        others: '',
        hours: 0,
        dates: [],
        comment: '',
        particularType: 'deduction',
        startDay: keywords.fromFull,
        endDay: keywords.toFull,
      }
      deduction.push(deduct);
    } if (expenses.length == 0) {
      let part = {
        particularId: null,
        name: '',
        amount: 0,
        attachment: [],
        others: null,
        hours: 0,
        noOfDays: 0,
        amountcal: null,
        checkbox: null,
        dates: [],
        comment: '',
        otHourlyRate: 0,
        expCurrency: null,
        expCurrencyRate: 0
      }
      expenses.push(part);
    }

    let split = dataCopy?.invoiceObj.invNum.split(':');

    let year = split[1].substr(0, 4)
    let date = this.datepipe.transform(new Date(year + '-' + dataCopy?.invoiceObj?.invoiceMonth + '-' + '1'), 'EEEE, MMMM d, y, h:mm:ss a zzzz')

    const invoiceDetails = {
      invId: dataCopy?.invoiceObj?.invId,
      consultantName: dataCopy?.invoiceObj.consultantName,
      reportingManagerName: dataCopy?.invoiceObj.reportingManagerName,
      projectId: projects,
      clientId: clients,
      submissionDate: new Date(dataCopy?.invoiceObj.submissionDate),
      submissionMonth: date,
      invoiceNo: dataCopy?.invoiceObj.invNum,
      particulars: dataCopy?.invoiceObj?.particulars,
      noOfDays: dataCopy?.invoiceObj.noOfDays,
      invSubmittedCurr: dataCopy?.invoiceObj.invSubmittedCurr,
      invAmount: isNaN(dataCopy?.invoiceObj.invAmount) ? decryptUsingAES256(dataCopy?.invoiceObj.invAmount) : dataCopy?.invoiceObj.invAmount,
      invoiceMonth: dataCopy?.invoiceObj?.invoiceMonth,
      invoiceYear: dataCopy?.invoiceObj?.invoiceYear,
      totalAmount: isNaN(dataCopy?.invoiceObj.totalAmount) ? decryptUsingAES256(dataCopy?.invoiceObj?.totalAmount) : dataCopy?.invoiceObj?.totalAmount,
      effectiveFromDate: this.pageConfig?.compensation?.effectiveFromDate,
      effectiveToDate: this.pageConfig?.compensation?.effectiveToDate,
      invoiceStatus: dataCopy?.invoiceObj?.invoiceStatus,
      reviewer01Status: dataCopy?.invoiceObj?.reviewer01Status,
      reviewer02Status: dataCopy?.invoiceObj?.reviewer02Status,
      reportingId: dataCopy?.invoiceObj.reportingId,
      paymentStatus: dataCopy?.invoiceObj.paymentStatus,
      sar: dataCopy?.invoiceObj.sar,
      inr: dataCopy?.invoiceObj.inr,
      eur: dataCopy?.invoiceObj.eur,
      usd: dataCopy?.invoiceObj.usd,
      pkr: dataCopy?.invoiceObj.pkr,
      expenses: expenses,
      deductions: deduction,
      attendenceDetails: dataCopy?.invoiceObj?.attendance,
      transferCurrency: dataCopy?.invoiceObj.transferCurrency,
      transferCountry: dataCopy?.invoiceObj.transferCountry,
      transactionRefId: dataCopy?.invoiceObj?.transactionRefId,
      vendor: dataCopy?.invoiceObj?.vendor,
      compEntity: dataCopy?.invoiceObj?.compEntity,
    }

    //this.store.gridRowData.next(data.data)
    this.invoiceService.reset('edit')
    this.invoiceService.setdocument(invoiceDetails);
    this.store.gridRowData.next(dataCopy?.attendenceEntity)
    this.router.navigate(['/dwc/inv/createinvoice'], { queryParams: { pageId: "RES002" } })
  }

  modalHide() {
    this.modalService.hide()
  }

  downloadFlag: any
  download(e: any) {
    this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
      if (d?.isValid) {
        this.sarAndInr = "regular";
        this.pmtProcessed = false;
        this.pmtProgress = false
        this.downloadFlag = e;
        this.search = null;
        //this.pmtStatus = null;
        this.selectedVal.forEach((c) => c.selected = false);
        this.selectedAll = false;
        // this.selectedValCopy = this.selectedVal;
        this.template(this.downloadTemplate);
      } else {
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))

  }

  reportDownload(e: any) {
    this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
      if (d?.isValid) {
        this.sarAndInr = ""
        this.downloadFlag = e;
        this.checkbox = 'Attendence'
        this.pdfdownload()
      } else {
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
        this.reviewService?.close();
        this.modalRef?.hide()
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))
  }

  sumOfIncome(totalAmount: any) {
    const numWords = require('num-words')
    this.amountInWords = numWords(isNaN(totalAmount) ? decryptUsingAES256(totalAmount) : totalAmount)
    this.amountInWords = this.amountInWords.charAt(0).toUpperCase() + this.amountInWords.slice(1) + ' only';
    return this.amountInWords;
  }
  pdfdownload() {
    this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
      if (d?.isValid) {
        this.loader.show();
        let allowDownload = this.selectedValCopy
        if (allowDownload.length == 0) {
          this.loader.hide();
          this.toastr.error(toastrMsg.pdfDownloadMsg);
          return;
        }
        else {

          let empIDArray = this.selectedValCopy.map(a => a.empId);
          let data;
          // if(this.checkbox != "Attendence"){
          //   this.service.saveData(ApiPaths.getcompAndBankDetails, { empId: empIDArray.toString(), signature: this.signatureService.signPayload(empIDArray.toString()) }, this.headerConfig).subscribe(o => { data = o });
          // }
          // Find the object where the id matches the userId
          // let matchingRecord = array1.find(item1 =>
          //   array2.some(item2 => item1.id === item2.userId)
          // );
          let userPassword = '';
          let ownerPassword = ''
          setTimeout(() => {
            if (this.reviewService.pageName == 'reviewinvoice') {
              // userPassword = this.userData.empId
              // ownerPassword = this.userData.empId
            } else if (this.reviewService.pageName == 'invoicehistory') {
              userPassword = decryptUsingAES256(this.pageConfig?.employee?.empPassword);
              ownerPassword = decryptUsingAES256(this.pageConfig?.employee?.empPassword);
            }
            this.loader.hide()
            const doc = new jsPDF({
              encryption: {
                userPassword: userPassword,
                ownerPassword: ownerPassword,
                userPermissions: ["print", "modify", "copy", "annot-forms"]
              }
            });
            // new jsPDF('p','mm','a4')
            let dataSourceData = [];
            this.selectedValCopy.forEach(d => {
              this.dataSource.map(m => {
                //  && d.selected == true 
                if (d.empId == m.invoiceObj.empId && d.invNum == m.invoiceObj.invNum) {
                  m.invoiceObj.invAmount = isNaN(m.invoiceObj.invAmount) ? decryptUsingAES256(m.invoiceObj.invAmount) : m.invoiceObj.invAmount
                  let present = dataSourceData.some(elem => elem === m);
                  if (!present) {
                    dataSourceData.push(m);
                  }
                }
              })
            })
            let dataDownload = [];
            let downloadDatasource = []
            if (this.sarAndInr == 'regular') {
              downloadDatasource = dataSourceData
            } else if (this.sarAndInr == 'online' || this.checkbox == 'Attendence') {
              downloadDatasource = dataSourceData
            }


            for (let i = 0; i < downloadDatasource.length; i++) {
              //  let address = data.filter(f => downloadDatasource[i].invoiceObj?.empId == f.bank?.empId)
              this.generatePdfDetailsList = downloadDatasource[i];
              // this.generatePdfDetailsList['employee'] = address;
              // this.generatePdfDetailsList.invoiceObj.invAmount = decryptUsingAES256(this.generatePdfDetailsList.invoiceObj.invAmount)
              // this.generatePdfDetailsList.particularEntity.forEach((f, index) => {
              //   this.generatePdfDetailsList.particularEntity[index].amount = isNaN(this.generatePdfDetailsList.particularEntity[index].amount) ? decryptUsingAES256(this.generatePdfDetailsList.particularEntity[index].amount) : this.generatePdfDetailsList.particularEntity[index].amount;
              // })
              let body = []
              let finlaLIst: any = []
              var tittle = 'Invoice'
              var summary = 'Consultant Details'
              var bankDetails = 'Bank Details';
              var details = 'Invoice Details'
              var status = 'Status :'
              let lengthOfIndex = 0;
              var invStatus = this.generatePdfDetailsList.invoiceObj.invoiceStatus
              //var color = this.generatePdfDetailsList.invoiceObj.invoiceStatus == 'Approved' ? 'green' : this.generatePdfDetailsList.invoiceObj.invoiceStatus == 'Rejected' ? 'red' : 'orange'
              //  if(this.selectedLang == 'en'){
              invStatus = invStatus == keywords.underReview ? keywords.underRevLabel : invStatus == keywords.paymentInitiated ? "Payment Initiated" : invStatus == keywords.paid ? "Paid" : invStatus;
              var color = this.generatePdfDetailsList.invoiceObj.invoiceStatus == 'Approved' || this.generatePdfDetailsList.invoiceObj.invoiceStatus == keywords.paid || this.generatePdfDetailsList.invoiceObj.invoiceStatus == keywords.paymentInitiated ? 'green' : this.generatePdfDetailsList.invoiceObj.invoiceStatus == 'Rejected' ? 'red' : 'orange'

              finlaLIst.push([this.generatePdfDetailsList.invoiceObj.particulars, this.generatePdfDetailsList.invoiceObj.noOfDays, this.generatePdfDetailsList.invoiceObj.invAmount])
              this.generatePdfDetailsList.invoiceObj.invParticulars.forEach(element => {
                body = []
                let part = ''
                if (element.name == 'Overtime') {
                  part = element.name + " (" + element.hours + ' hrs)'
                } else if (element.name == 'Others') {
                  part = element.name + " (" + element.others + ')'
                } else if (element.name == keywords.offUnLeave) {
                  part = element.name + " (" + element.comment + ')'
                } else if (element.name == keywords.onSiteUnLeave) {
                  part = element.name + " (" + element.comment + ')'
                } else if (element.name == keywords.offshore) {
                  part = element.comment
                } else if (element.name == keywords.onsite) {
                  part = element.comment
                } else if (element.name == keywords.partialInvoice) {
                  part = keywords.partialInvoiceLabel + " (" + element.comment + ')'
                } else if (element.name == keywords.otherAddition) {
                  part = keywords.otherAdditionLabel + " (" + element.comment + ')'
                } else if (element.name == keywords.otherDeduction) {
                  part = keywords.otherDeductionLabel + " (" + element.comment + ')'
                } else if (element.name == keywords.offPdLeave) {
                  part = keywords.offPdLeave + " (" + element.comment + ')'
                } else if (element.name == keywords.onsitePdLeave) {
                  part = keywords.onsitePdLeave + " (" + element.comment + ')'
                }
                else if (element.name != '') {
                  part = element.name
                }
                let amount = isNaN(element.amount) ? decryptUsingAES256(element.amount) : element.amount;
                body.push(part, element.noOfDays, amount)
                finlaLIst.push(body)
              });
              this.sumOfIncome(this.generatePdfDetailsList?.invoiceObj?.totalAmount);
              // finlaLIst.push([this.amountInWords, 'Total Amount:', decryptUsingAES256(this.generatePdfDetailsList?.invoiceObj?.totalAmount)])


              finlaLIst.push([this.amountInWords, 'Total Amount:', isNaN(this.generatePdfDetailsList?.invoiceObj?.totalAmount) ? decryptUsingAES256(this.generatePdfDetailsList?.invoiceObj?.totalAmount) : this.generatePdfDetailsList?.invoiceObj?.totalAmount])
              finlaLIst.forEach(e => {
                //let minus = e[0].includes('Unpaid') ? '-' + e[2] : e[2];
                let num = this._decimalPipe.transform(e[2], '1.2-2');
                num = e[0]?.includes('Unpaid') || e[0]?.includes(keywords.partialInvoiceLabel) || e[0]?.includes(keywords.otherDeductionLabel) ? '- ' + num : num;
                e[2] = num
              })
              lengthOfIndex = finlaLIst.length - 1;
              let addr = this.generatePdfDetailsList?.address;
              let clientNames = ''


              let client = this.generatePdfDetailsList.clientName.join().toString()//"Ministry of tourism,Cst,Rootware technology,AMC,rootware,STC,DWC,Zatca Test,Channels,testing,jspdf,working properly or not"//arrayy.join().toString()

              var splitTitle = doc.splitTextToSize(client, 100);

              let cur = this.generatePdfDetailsList?.invoiceObj?.compEntity?.currency;
              let onsiteCurr = this.generatePdfDetailsList?.invoiceObj?.compEntity?.onsiteCurrency;
              let currency = cur == 'SAR ( ر.س)' ? '(SAR)' : cur == 'INR (₹)' ? '(INR)' : cur == 'USD ($)' ? '(USD)' : cur == 'PAK (PKR)' ? '(PKR)' : cur == 'EUR (€)' ? '(EUR)' : ""
              let onsiteCurrency = onsiteCurr == 'SAR ( ر.س)' ? '(SAR)' : onsiteCurr == 'INR (₹)' ? '(INR)' : onsiteCurr == 'USD ($)' ? '(USD)' : onsiteCurr == 'PAK (PKR)' ? '(PKR)' : onsiteCurr == 'EUR (€)' ? '(EUR)' : ""
              let amountHead = this.generatePdfDetailsList?.invoiceObj?.compEntity?.defaultPkg == 'Onsite' ? onsiteCurrency : currency
              if (tittle) {
                doc.setFontSize(24),
                  doc.setFont('helvetica', 'bold'),
                  doc.setFillColor('#113132')
                doc.rect(0, 0, 210, 45, 'F')
                doc.setTextColor('white');
                doc.text(tittle, 5, 38),

                  doc.addImage(image.rootImg, 5, 5, 80, 20);
              }

              if (status) {
                doc.setFontSize(14),
                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor('black');
                doc.text(status, 100, 60)

                doc.setFontSize(14),
                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor(color);
                doc.text(invStatus, 130, 60)

              }
              if (summary) {
                doc.setFontSize(14),
                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor('black');
                doc.text(summary, 5, 60)

                doc.setDrawColor('#ECEBEB');
                doc.setFillColor('#F6F8FA')
                splitTitle.length > 4 ? doc.roundedRect(3, 65, 203, 130, 3, 3, 'FD') : doc.roundedRect(3, 65, 203, 110, 3, 3, 'FD');
                //doc.roundedRect(3, 65, 203, 110, 3, 3, 'FD');

                doc.setFontSize(10),
                  doc.setFont('helvetica', 'normal'),
                  doc.setTextColor('black');
                doc.text('Consultant/Company Name', 10, 75)

                doc.setFontSize(14),
                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor('black');
                doc.text(this.generatePdfDetailsList?.invoiceObj?.vendor || this.generatePdfDetailsList?.invoiceObj?.consultantName, 10, 85)


                doc.setFontSize(10),
                  doc.setFont('helvetica', 'normal'),
                  doc.setTextColor('black');
                doc.text('Manager Name', 100, 75)

                doc.setFontSize(14),
                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor('black');
                doc.text(this.generatePdfDetailsList.invoiceObj.reportingManagerName, 100, 85)

                doc.setFontSize(10),
                  doc.setFont('helvetica', 'normal'),
                  doc.setTextColor('black');
                doc.text('Invoice Number', 10, 95)

                doc.setFontSize(14),
                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor('black');
                doc.text(this.generatePdfDetailsList.invoiceObj.invNum, 10, 102)

                doc.setFontSize(10),
                  doc.setFont('helvetica', 'normal'),
                  doc.setTextColor('black');
                doc.text('Client Name(s)', 100, 95)

                doc.setFontSize(14),
                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor('black');
                doc.text(splitTitle, 100, 102)

                doc.setFontSize(10),
                  doc.setFont('helvetica', 'normal'),
                  doc.setTextColor('black');
                splitTitle.length > 4 ? doc.text('Invoice Date', 10, 140) : splitTitle.length > 3 ? doc.text('Invoice Date', 10, 130) : doc.text('Invoice Date', 10, 125)
                // splitTitle.length > 3?doc.text('Invoice Date', 10, 130):  doc.text('Invoice Date', 10, 125)

                doc.setFontSize(14),
                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor('black');
                splitTitle.length > 4 ? doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 150) : splitTitle.length > 3 ? doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 140) : doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 135)
                // splitTitle.length > 3?doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 140) :doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 135)

                doc.setFontSize(10),
                  doc.setFont('helvetica', 'normal'),
                  doc.setTextColor('black');
                splitTitle.length > 4 ? doc.text('Consultant Address', 100, 140) : splitTitle.length > 3 ? doc.text('Consultant Address', 100, 130) : doc.text('Consultant Address', 100, 125)
                // splitTitle.length > 3?doc.text('Consultant Address', 100, 130) :doc.text('Consultant Address', 100, 125)

                doc.setFontSize(14),
                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor('black');
                splitTitle.length > 4 ? doc.text(addr, 100, 150, { maxWidth: 100 }) : splitTitle.length > 3 ? doc.text(addr, 100, 140, { maxWidth: 100 }) : doc.text(addr, 100, 135, { maxWidth: 100 })
                //splitTitle.length > 3?doc.text(addr, 100, 140, { maxWidth: 100 }):doc.text(addr, 100, 135, { maxWidth: 100 })

                doc.setFontSize(10),
                  doc.setFont('helvetica', 'normal'),
                  doc.setTextColor('black');
                splitTitle.length > 4 ? doc.text('Bill To ', 10, 172) : doc.text('Bill To ', 10, 152)
                //doc.text('Bill To ', 10, 152)

                doc.setFontSize(14),
                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor('black');
                splitTitle.length > 4 ? doc.text('Rootware Technologies DWC-LLC Dated 4/26/2024 PO Box 712738 Dubai UAE', 10, 180, { maxWidth: 80 }) : doc.text('Rootware Technologies DWC-LLC Dated 4/26/2024 PO Box 712738 Dubai UAE', 10, 160, { maxWidth: 80 })
                //doc.text('Rootware Technologies DWC-LLC Dated 4/26/2024 PO Box 712738 Dubai UAE', 10, 160 ,  { maxWidth: 80 })

              }

              if (details) {
                doc.setFontSize(14),

                  doc.setFont('helvetica', 'bold'),
                  doc.setTextColor('black');
                splitTitle.length > 4 ? doc.text(details, 5, 205) : doc.text(details, 5, 185)
                //doc.text(details, 5, 185)

              }
              if (this.checkbox == 'Invoice') {
                autoTable(doc, {
                  margin: { horizontal: 5 },
                  bodyStyles: {},
                  startY: splitTitle.length > 4 ? 210 : 190,
                  headStyles: {
                    fillColor: 'white',
                    fontStyle: 'bold',
                    halign: 'left',    //'center' or 'right'   
                    textColor: '#1D1556', //White     
                    fontSize: 10,
                  },
                  styles: {
                    cellPadding: 3,
                    fontSize: 8,
                    valign: 'middle',
                    overflow: 'linebreak',
                    lineWidth: 0,
                  },
                  //change the text style of last row
                  willDrawCell: function (data) {
                    var rows = data.table.body;
                    if (data.row.index === rows.length - 1) {
                      doc.setFont('helvetica', 'bold'),
                        doc.setTextColor('black');
                    }
                  },
                  head: [['Particular(s)', 'No.Of Days', 'Amount(s)' + amountHead]],
                  body: finlaLIst,
                  showHead: "firstPage",
                  alternateRowStyles: {

                  },
                  //align specific header column
                  didParseCell: (hookData) => {
                    if (hookData.section === 'head') {
                      if (hookData.column.dataKey === 1) {
                        hookData.cell.styles.halign = 'right';
                      }
                    }
                  },

                  columnStyles: {
                    1: {
                      halign: 'right',
                      fontStyle: 'bold',
                      textColor: 'black',
                      //cellWidth: 20,
                      lineColor: 'black',
                    },
                    2: {
                      halign: 'right',
                      fontStyle: 'bold',
                      textColor: 'black',
                      cellWidth: 20,
                      lineColor: 'black',
                    }
                  },
                  didDrawPage: function (data) {
                    if (data.pageCount > 1) { }
                  },
                });

              }
              let attendenceBody = []
              if (this.checkbox == 'Attendence') {
               // attendenceBody.push([this.generatePdfDetailsList.attendenceEntity.dateOfMonth, this.generatePdfDetailsList.attendenceEntity.noOfHoursWorked, this.generatePdfDetailsList.attendenceEntity.overTimeHours, this.generatePdfDetailsList.attendenceEntity.totalHours, this.generatePdfDetailsList.attendenceEntity.remarks]);

                this.generatePdfDetailsList.invoiceObj.attendance.forEach(att => {
                  body = []
                  body.push(att.dateOfMonth, att.noOfHoursWorked, att.overTimeHours, att.totalHours, att.remarks)
                  attendenceBody.push(body)
                });
                autoTable(doc, {
                  margin: { horizontal: 5 },
                  bodyStyles: {},
                  startY: 173,
                  headStyles: {
                    fillColor: 'white',
                    fontStyle: 'bold',
                    halign: 'left',    //'center' or 'right'   
                    textColor: '#1D1556', //White     
                    fontSize: 10,
                  },
                  styles: {
                    cellPadding: 3,
                    fontSize: 8,
                    valign: 'middle',
                    overflow: 'linebreak',
                    lineWidth: 0,
                  },

                  head: [['Date Of Month', 'No.Of Hours Worked', 'Overtime', 'Total Hours', 'Remark']],
                  body: attendenceBody,
                  showHead: "firstPage",
                  alternateRowStyles: {

                  },

                  didDrawPage: function (data) {
                    if (data.pageCount > 1) { }
                  },
                });

              }

              doc.addPage()
            }

            // let filter = this.selectedValCopy.filter(f => f.selected == true);
            let filter = this.selectedValCopy
            let nameOfMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            let month = +this.generatePdfDetailsList.invoiceObj.invoiceMonth < 10 ? '0' + this.generatePdfDetailsList.invoiceObj.invoiceMonth : +this.generatePdfDetailsList.invoiceObj.invoiceMonth
            let year = this.generatePdfDetailsList.invoiceObj.invoiceYear.split('-')
            let pdfName = '';
            if (this.filterData?.empId == null) {
              if (filter.length == 1) {
                let split = filter[0]?.empName.split('(')
                pdfName = this.checkbox == 'Invoice' ? 'Invoice_sheet_' + split[0] + '_' + nameOfMonth[+month - 1] + '_' + year[1] : 'Time_sheet_' + split[0] + '_' + nameOfMonth[+month - 1] + '_' + year[1];
              }
              else {
                pdfName = this.checkbox == 'Invoice' ? 'InvoiceDetails_' + year[1] + month : 'TimesheetDetails_' + year[1] + month;
              }
              // pdfName = this.checkbox == 'Invoice' ? 'Invoice_Sheet_' + month[+downloadDatasource[0].invoiceObj.invoiceMonth - 1] + '_' + year[1]  : 'Attendance_Sheet_'+ month[+downloadDatasource[0].invoiceObj.invoiceMonth - 1] + '_' + year[1] 

            } else {
              let currentMonth = (new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)

              if (filter.length == 1) {
                let split = filter[0]?.empName.split('(');
                if (this.sarAndInr == 'regular') {
                  pdfName = this.checkbox == 'Invoice' ? 'Regular_Invoice_sheet_' + split[0] + '_' + nameOfMonth[+currentMonth - 1] + '_' + new Date().getFullYear() : 'Time_sheet_' + split[0] + '_' + nameOfMonth[+currentMonth - 1] + '_' + new Date().getFullYear();
                } else if (this.sarAndInr == 'online') {
                  pdfName = this.checkbox == 'Invoice' ? 'Online_Invoice_sheet_' + split[0] + '_' + nameOfMonth[+currentMonth - 1] + '_' + new Date().getFullYear() : 'Time_sheet_' + split[0] + '_' + nameOfMonth[+currentMonth - 1] + '_' + new Date().getFullYear();
                }

              }
              else {
                if (this.sarAndInr == 'regular') {
                  pdfName = this.checkbox == 'Invoice' ? 'RegularInvoiceDetails_' + new Date().getFullYear() + currentMonth : 'TimesheetDetails_' + new Date().getFullYear() + currentMonth
                } else if (this.sarAndInr == 'online') {
                  pdfName = this.checkbox == 'Invoice' ? 'OnlineInvoiceDetails_' + new Date().getFullYear() + currentMonth : 'TimesheetDetails_' + new Date().getFullYear() + currentMonth
                }

              }

            }
            doc.save(pdfName);
          }, 2000)
        }
      } else {
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);

        this.reviewService?.close();
        this.modalRef?.hide()
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))

  }
  async csvData() {
    this.restApi.getSession(
      keywords.checkStatus,
      this.userDetails?.userEmailId,
      this.signatureService.signPayload(this.userDetails?.userEmailId)
    ).subscribe({
      next: async (d) => {
        if (!d?.isValid) {
          this.auth.logoutThroughAngular();
          this.toastr.error(d?.message);
          return;
        }

        try {
          this.loader.show();

          if (!this.selectedValCopy || this.selectedValCopy.length === 0) {
            this.loader.hide();
            this.toastr.error(toastrMsg.excelDownloadMsg);
            return;
          }

          const downloadDatasource = this.getDownloadDatasource();
          if (downloadDatasource.length === 0) {
            this.loader.hide();
            this.toastr.error("No valid records found for download.");
            return;
          }

          const bankObjList = this.buildBankObjects(downloadDatasource);
          this.loader.hide();
          // Generate CSV based on selection type
          if (this.sarAndInr === "regular") {
            this.regularCSV(bankObjList, downloadDatasource);
          } else if (this.sarAndInr === "online") {
            this.onlineCSV(bankObjList, downloadDatasource);
          }

        } catch (error) {
          this.loader.hide();
          this.toastr.error("An error occurred during CSV generation.");
          console.error("CSV Error:", error);
        }
      },
      error: () => {
        this.toastr.error(toastrMsg.errMsg);
      }
    });
  }

  private getDownloadDatasource(): any[] {
    const downloadDatasource = [];

    this.selectedValCopy.forEach(selected => {
      this.dataSource.forEach(data => {
        if (
          selected.selected &&
          selected.empId === data.invoiceObj.empId &&
          selected.invNum === data.invoiceObj.invNum &&
          !downloadDatasource.includes(data)
        ) {
          downloadDatasource.push(data);
        }
      });
    });
    return downloadDatasource;
  }

  private buildBankObjects(datasource): any[] {
    const bankList = [];
  
    datasource.forEach(entry => {
      const empId = entry.invoiceObj.empId;
  
      const employee = this.pageConfig?.employeeList.find(e => e.empId === empId);
      if (!employee) return;
  
      const activeBank = employee?.bankEntity?.find(b => b.status === "active");
      if (!activeBank) return;
  
      const bankObj = {
        empId: employee.empId,
        accountHolderName: decrypt(activeBank.accountHolderName),
        bankName: decrypt(activeBank.bankName),
        bankAddress: decrypt(activeBank.bankAddress),
        ifscCode: activeBank.ifscCode,
        accountNumber: decrypt(activeBank.accountNumber),
        currency: entry.invoiceObj?.compEntity?.currency,
        onsiteCurrency: entry.invoiceObj?.compEntity?.onsiteCurrency,
        transferCurrency: entry.invoiceObj?.compEntity?.transferCurrency,
        defaultPkg: entry.invoiceObj?.compEntity?.defaultPkg,
        invoice: entry.invoiceObj,
        vendor: entry.invoiceObj?.vendor
      };
      // Prevent duplicates by invoice ID
      if (!bankList.some(b => b.invoice?.invId === bankObj.invoice?.invId)) {
        bankList.push(bankObj);
      }
    });
    return bankList;
  }

  regularCSV(bank, downloadDatasource) {
    let excelArray = []
   
    bank = bank?.filter(b => b?.invoice?.transferCurrency == "INR (₹)" &&  b?.invoice?.vendor == null)

    let bankCopy = [];
    // bankCopy.push(this.groupByINR(bank, "currency", "defaultPkg")["INR (₹)"])
    // let sarList: any = this.groupBySAR(bank, "currency", "defaultPkg")["SAR ( ر.س)"]
    
    let inrList = this.groupByINRRegular(bank, "currency", "defaultPkg")["INR (₹)"] || [];
    inrList = inrList.map((item: any, index: number) => ({ ...item, srno: index + 1 }));
    bankCopy.push(inrList);

    let sarList: any = this.groupBySARRegular(bank, "currency","onsiteCurrency", "defaultPkg")["SAR ( ر.س)"] || [];
    sarList = sarList.map((item: any, index: number) => ({ ...item, srno: index + 1 }));
    let usdList = this.groupByUSDRegular(bank, "currency","onsiteCurrency" ,"defaultPkg")["USD ($)"] || [];
    usdList = usdList.map((item: any, index: number) => ({ ...item, srno: index + 1 }));
    bankCopy.push(sarList.length > 0 ? sarList.concat(this.filterDataListINR("INR (₹)", bank, "Onsite")) : this.filterDataListINR("INR (₹)", bank, "Onsite"));

    bankCopy.push(usdList.length > 0 ? usdList.concat(this.filterDataListINR("USD ($)", bank, "Onsite")) : this.filterDataListINR("USD ($)", bank, "Onsite"));

    bankCopy = this.removeDuplicates1(bankCopy);
    

    //let bankCopy = bank;
    bankCopy?.forEach((curencyGroup, i) => {
      curencyGroup?.forEach((f, i) => {
        let amount = decryptUsingAES256(f.invoice?.totalAmount);
        let aedAmt = (f.invoice.compEntity.defaultPkg == keywords.onsite && f.invoice?.compEntity?.onsiteCurrency == 'SAR ( ر.س)') || (f.invoice?.compEntity?.defaultPkg == keywords.offshore && f.invoice?.compEntity?.currency == 'SAR ( ر.س)') || (f.invoice?.compEntity?.transferCurrency != 'INR (₹)' && f.invoice?.compEntity?.currency != 'INR (₹)') ? +amount * 0.98 : (f.invoice.compEntity?.currency || f.invoice.compEntity?.onsiteCurrency) == 'USD ($)' ? +amount * 3.671 : '';
        let rate = (f.invoice.compEntity.defaultPkg == keywords.onsite && f.invoice.compEntity?.onsiteCurrency == 'SAR ( ر.س)') || (f.invoice.compEntity?.defaultPkg == keywords.offshore && f.invoice.compEntity?.currency == 'SAR ( ر.س)') || (f.invoice.compEntity?.transferCurrency != 'INR (₹)' && f.invoice.compEntity?.currency != 'INR (₹)') ? 0.98 : (f.invoice.compEntity?.currency || f.invoice.compEntity?.onsiteCurrency) == 'USD ($)' ? 3.671 : ''
        // let excelObj = { srno: i + 1, accountHolderName: f?.bank?.accountHolderName, bankName: f.bank.bankName, bankAddress: f.bank.bankAddress, ifsc: f.bank.ifscCode, accountNumber: f.bank.accountNumber, currency: f.currency, inrAmount: f.defaultPkg == 'Offshore' && f.currency == 'INR (₹)' ? +amount : '', rate: '', aedAmount: +aedAmt, alAnsari: 26.5, totalAed: f.defaultPkg == 'Onsite' ? +(+amount * 0.98) + 26.5 : '', country: f?.invoice?.transferCountry }
        let excelObj = {
          srno: f?.srno, accountHolderName: f?.accountHolderName, bankName: f.bankName, bankAddress: f.bankAddress, ifsc: f.ifscCode, accountNumber: f.accountNumber, currency: f.invoice.compEntity.transferCurrency, inrAmount: f.invoice.compEntity.defaultPkg == 'Offshore' && f.invoice.compEntity?.currency == 'INR (₹)' ? +amount : '', rate: +rate, aedAmount: +aedAmt, alAnsari: 26.5,
          totalAed: (f.invoice.compEntity.defaultPkg == keywords.onsite && f.invoice.compEntity?.onsiteCurrency == 'SAR ( ر.س)') || (f.invoice.compEntity.defaultPkg == keywords.offshore && f.invoice.compEntity?.currency == 'SAR ( ر.س)') || (f.invoice.compEntity?.transferCurrency != 'INR (₹)' && f.invoice.compEntity?.currency != 'INR (₹)') ? +(+amount * 0.98) + 26.5 : (f.invoice.compEntity?.currency || f.invoice.compEntity?.onsiteCurrency) == 'USD ($)'? +aedAmt + 26.5: '', country: f?.invoice.compEntity.transferCountry
        }
        //let excelObj = { srno: i + 1, accountHolderName: f?.bank?.accountHolderName, bankName: f.bank.bankName, bankAddress: f.bank.bankAddress, ifsc: f.bank.ifscCode, accountNumber: f.bank.accountNumber, currency: f.transferCurrency, inrAmount: f.currency == 'INR (₹)' ? +amount : '', rate: '', totalAed: f.defaultPkg == 'Onsite' || f.currency == 'SAR ( ر.س)'? +(+amount * 0.98) + 26.5 : '', country: f?.invoice?.transferCountry }
        excelArray.push(excelObj)
      })
    })
    if (excelArray.length == 0) {
      this.toastr.error("No Invoice found for download");
      return;
    } else {
      let header = keywords.regularCsvHeader;

      // Create workbook and worksheet
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Sharing Data');

      // Add Row and formatting
      let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      let year = downloadDatasource[0].invoiceObj.invoiceYear.split('-')
      const titleRow = worksheet.addRow(["Invoices for the month of " + month[downloadDatasource[0].invoiceObj.invoiceMonth - 1] + ',' + year[1]]);
      titleRow.font = {
        name: 'Corbel',
        family: 4,
        size: 16,
        bold: true,
      };
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.mergeCells('A1:M1');
      // Add Header Row
      const headerRow = worksheet.addRow(header);

      // Cell Style : Fill and Border
      headerRow.eachCell((cell, number) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' },
          bgColor: { argb: 'FFFFFF' },
        };
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' },
        };
      });

      excelArray.forEach((d, i) => {
        const row = worksheet.addRow(Object.values(d));
      })

      //set the width of the cell
      for (let i = 2; i < 12; i++) {
        worksheet.getColumn(i).width = 30;
      }
      //  worksheet.getColumn(8).numFmt = '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)';

      worksheet.getColumn(8).numFmt = '#,###';
      worksheet.getColumn(10).numFmt = '#,###';
      worksheet.getColumn(12).numFmt = '#,###';
      worksheet.addRow([]);
      // Generate Excel File with given name
      workbook.xlsx.writeBuffer().then((data: any) => {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let year = downloadDatasource[0].invoiceObj.invoiceYear.split('-');
        let invoiceName = '';
        // if (this.filterData.empId == null) {
        //   invoiceName = 'Invoice_Sheet_' + month[+downloadDatasource[0].invoiceObj.invoiceMonth - 1] + '_' + year[1] + '.xlsx'
        // } else {
        //   invoiceName = 'Invoice_Sheet_' + month[new Date().getMonth()] + '_' + new Date().getFullYear() + '.xlsx'
        // }
        invoiceName = 'Regular_Invoice_Sheet_' + month[new Date().getMonth()] + '_' + new Date().getFullYear() + '.xlsx'
        fs.saveAs(blob, invoiceName);
      });

    }
  }

  onlineCSV(bank, downloadDatasource) {
    bank = bank?.filter(b => (b?.invoice?.transferCurrency == "INR (₹)" && b?.invoice?.vendor != null) || (b?.invoice?.transferCurrency != "INR (₹)"))
    
    let bankCopy = [];
    bankCopy.push(this.groupCurrency(bank, "transferCurrency", "defaultPkg")['USD ($)'])
    bankCopy.push(this.groupCurrency(bank, "transferCurrency", "defaultPkg")['PAK (PKR)'])
    bankCopy.push(this.groupCurrency(bank, "transferCurrency", "defaultPkg")['EUR (€)'])
    bankCopy.push(this.groupByINR(bank, "transferCurrency", "defaultPkg")["INR (₹)"])
   let sarList: any = this.groupBySAR(bank, "transferCurrency", "defaultPkg")["SAR ( ر.س)"]
    bankCopy.push(sarList != undefined ? sarList.concat(this.filterDataListINR("INR (₹)", bank, "Onsite")) : this.filterDataListINR("INR (₹)", bank, "Onsite"))
    //bank = bank?.filter(b => b?.transferCurrency == "INR (₹)")
    // bankCopy.push(this.groupByINR(bank,"currency","defaultPkg")["INR (₹)"])
    let excelArray = []
    bankCopy?.forEach((curencyGroup, j) => {
      curencyGroup?.forEach((f, i) => {
        let excelObj = {}
        let amount = f.invoice?.totalAmount;
        let monthlyFee = decryptUsingAES256(f.invoice?.invAmount);
        let minusAmt = f?.invoice?.invParticulars.map(t => t.name == keywords.otherDeduction || t.name == keywords.onSiteUnLeave || t.name == keywords.offUnLeave || t.name == keywords.partialInvoice ? isNaN(t.amount) ? decryptUsingAES256(t.amount) : t.amount : '').reduce((a, b) => +a + +b, 0);
        let totalAmount = f?.invoice?.invParticulars.map(t => t.name == keywords.offshore || t.name == keywords.onsite || t.name == keywords.overTime || t.name == keywords.otherAddition || t.name == keywords.dongleRecharge || t.name == keywords.others || t.name == keywords.perdiem ? isNaN(t.amount) ? decryptUsingAES256(t.amount) : t.amount : '').reduce((a, b) => +a + +b, 0);
        let adjustedAmount = Math.round(totalAmount - minusAmt)
        let aedAmt = (f?.invoice?.compEntity?.defaultPkg == keywords.onsite && f?.invoice?.compEntity?.onsiteCurrency  == 'SAR ( ر.س)') || (f?.invoice?.compEntity?.defaultPkg == keywords.offshore && f?.invoice?.compEntity?.currency  == 'SAR ( ر.س)')? (+monthlyFee + (adjustedAmount)) * 0.98 : (f?.invoice?.compEntity?.defaultPkg == keywords.onsite && f?.invoice?.compEntity?.onsiteCurrency  == 'USD ($)') || (f?.invoice?.compEntity?.defaultPkg == keywords.offshore && f?.invoice?.compEntity?.currency  == 'USD ($)') ? (+monthlyFee + (adjustedAmount)) * 3.671 : '';
        //let excelObj = { srno: i + 1, accountHolderName: f?.invoice?.consultantName, bankName: f.bank.bankName, bankAddress: f.bank.bankAddress, ifsc: f.bank.ifscCode, accountNumber: f.bank.accountNumber, currency: f.transferCurrency, inrAmount: f.defaultPkg == 'Offshore' && f.currency == 'INR (₹)' ? +amount : '', rate: '', aedAmount: +aedAmt, alAnsari: 26.5, totalAed: f.defaultPkg == 'Onsite' ? +(+amount * 0.98) + 26.5 : '', country: f.transferCountry }
        excelObj= {
          srno: i + 1, consultantName:  f?.invoice?.vendor || f?.invoice?.consultantName, invoiceCurrency: f?.invoice?.compEntity?.defaultPkg == keywords.offshore ? f?.invoice?.compEntity?.currency : f?.invoice?.compEntity?.onsiteCurrency, monthlyFee: monthlyFee, adjustedAmount: adjustedAmount, finalAmount: (+monthlyFee + (adjustedAmount)), aed: aedAmt,
          transferCurrency: f?.invoice?.compEntity?.transferCurrency, excBankFee: aedAmt, bankFee: '', incBankfee: aedAmt,
        };
        excelArray.push(excelObj); // Ensure the object is added to the array
      })
    })
    if (excelArray.length == 0) {
      this.toastr.error("No invoice found for download");
      return;
    } else {

      let header = keywords.onlineCsvHeader
      // Create workbook and worksheet
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Sharing Data');

      // Add Row and formatting
      let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      let year = downloadDatasource[0].invoiceObj.invoiceYear.split('-')
      const titleRow = worksheet.addRow(["Invoices for the month of " + month[downloadDatasource[0].invoiceObj.invoiceMonth - 1] + ',' + year[1]]);
      titleRow.font = {
        name: 'Corbel',
        family: 4,
        size: 16,
        bold: true,
      };
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.mergeCells('A1:K1');
      // Add Header Row
      const headerRow = worksheet.addRow(header);

      // Cell Style : Fill and Border
      headerRow.eachCell((cell, number) => {
        cell.border = {
          top: { style: 'thin', color: { argb: '0000' } },  // Blue double border at the top
          left: { style: 'thin', color: { argb: '0000' } }, // Green dotted border on the left
          bottom: { style: 'thick', color: { argb: '0000' } }, // Red thick border at the bottom
          right: { style: 'thin', color: { argb: '0000' } } // Black thin border on the right
        };
        //text wrap
        cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: true };
        //font
        cell.font = { bold: true, size: 10 };
        if (number > 3 && number < 7) {
          cell.fill = {
            type: 'pattern',  // The fill type (e.g., solid, gradient)
            pattern: 'solid', // Pattern type (solid color fill)
            fgColor: { argb: '7030a0' }, // The color (in ARGB format) for the cell background (purple)
            bgColor: { argb: 'FFFFFFFF' }  // The color for the background (optional)
          };
          cell.font = {
            color: { argb: 'FFFFFF' },
            bold: false
          }
        }
        if (number > 6) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: number == 7 ? { argb: 'b4c6e7' } : number == 9 ? { argb: 'fff2cc' } : number == 11 ? { argb: 'e2efda' } : { argb: 'FFFFFF' },
            bgColor: { argb: 'FFFFFFFF' }
          };
        }
      });

      excelArray.forEach((d, i) => {
        const row = worksheet.addRow(Object.values(d));
      })
      worksheet.addRow([]);


      worksheet.getColumn(4).numFmt = '#,###';
      worksheet.getColumn(5).numFmt = '#,###';
      worksheet.getColumn(6).numFmt = '#,###';
      worksheet.getColumn(9).numFmt = '#,###';
      worksheet.getColumn(11).numFmt = '#,###';
      const lastRow = worksheet.lastRow;

      // Assuming we want to merge cells A and B in the last row
      /// Merge cells A1 and B1 in the last row
      worksheet.mergeCells(`A${lastRow.number}:D${lastRow.number}`);

      // Set the merged cell value
      const mergedCell = worksheet.getCell(`A${lastRow.number}:D${lastRow.number}`);
      mergedCell.value = 'TOTAL BILLING AMOUNT';
      mergedCell.alignment = { vertical: 'middle', horizontal: 'center' };

      const totalExc = worksheet.getCell(`I${lastRow.number}`);
      const totalInc = worksheet.getCell(`K${lastRow.number}`);
      let totalExcSum = 0;
      let totalIncSum = 0;
      worksheet?.eachRow((row, rowNumber) => {
        for (let i = 5; i <= worksheet.lastRow.number; i++) {
          const cellValueI = row.getCell("I").value;
          const cellValueK = row.getCell("K").value;
          // Check if the cell value is a number
          if (rowNumber == i) {
            if (typeof cellValueI === 'number') {
              totalExcSum += cellValueI;
            }
            if (typeof cellValueK === 'number') {
              totalIncSum += cellValueK;
            }
          }

          row.eachCell((cell, colNumber) => {
            cell.border = {
              top: { style: 'thin', color: { argb: '0000' } },
              left: { style: 'thin', color: { argb: '0000' } },
              bottom: { style: 'thin', color: { argb: '0000' } },
              right: { style: 'thin', color: { argb: '0000' } }
            };
            if (colNumber == 3 || colNumber == 11) {
              cell.font = { bold: true, size: 10 }
            }
            if (colNumber == 1 || colNumber == 2 || colNumber == 3) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
          })
        }
      })
      totalExc.value = totalExcSum;
      totalInc.value = totalIncSum;
      // Loop over the cells in the specified row up to the last column
      const columns = worksheet.getColumn("K").number; // Get column index for 'I'

      for (let col = 1; col <= columns; col++) {
        const cell = worksheet.getRow(lastRow.number).getCell(col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '375623' },
          bgColor: { argb: 'FFFFFFFF' }
        }; // Apply the fill color to the cell

        cell.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } },
          cell.border = {
            top: { style: 'thin', color: { argb: '0000' } },
            left: { style: 'thin', color: { argb: '0000' } },
            bottom: { style: 'thin', color: { argb: '0000' } },
            right: { style: 'thin', color: { argb: '0000' } }
          };

      }

      // Define the fill color (in this case, light blue)
      const totalColor = { type: 'pattern', pattern: 'solid', fgColor: { argb: '375623' } }; // Light Blue

      // Generate Excel File with given name
      workbook.xlsx.writeBuffer().then((data: any) => {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let year = downloadDatasource[0].invoiceObj.invoiceYear.split('-');
        let invoiceName = '';
        invoiceName = 'Online_Invoice_Sheet_' + month[new Date().getMonth()] + '_' + new Date().getFullYear() + '.xlsx';
        fs.saveAs(blob, invoiceName);
      });
      this.selectedRows = [];
    }
  }


  removeDuplicates(arr) {
    return arr.filter((item,
      index) => arr.indexOf(item) === index);
  }
  array = [

  ]

  // toggleSelectAll() {

  //   this.selectedValCopy.forEach((c) => {
  //     c.selected = this.selectedAll
  //   })
  // }

  // checkboxChanged() {
  //   if (this.isAllSelected()) {
  //     this.selectedAll = true
  //   } else {
  //     this.selectedAll = false
  //   }
  // }

  isAllSelected() {
    return this.selectedValCopy.every((c) => c.selected)
  }

  openConfirmationDialog(data) {
    let count = this.pmtCheckbox.filter(f => f.transactionRefId == null || f.transactionRefId == "" || f.transactionRefId == undefined)
    //const response = confirm("Are you sure you want to initiate payment for "+ count.length);
    if (count.length == 0) {
      this.toastr.error(toastrMsg.initiatePmt);
      return;
    }
    else {
      this.confirmatioDialogService.confirm('Initiate Payment', "Are you sure you want to initiate the payment process for the selected invoices?")
        .then((confirm) => {
          if (confirm) {
            this.updatePaymentStatus('paymentInitiated')
          }
        })
    }
  }

  updatePaymentStatus(event) {

    this.restApi.getSession(keywords.checkStatus, this.userDetails?.userEmailId, this.signatureService.signPayload(this.userDetails?.userEmailId)).subscribe(d => {
      if (d?.isValid) {
        let ids = [];
        if (event == keywords.paid) {
          ids = [{ invoiceYear: this.approveData.invoiceYear, invNum: this.approveData.invNum, transactionRefId: this.trxRefNo }];
        } else if (event == keywords.paymentInitiated) {
          if (this.pmtCheckbox.length > 0) {
            ids = this.pmtCheckbox.filter(f => f.transactionRefId == null || f.transactionRefId == "" || f.transactionRefId == undefined)
          } else {
            this.toastr.error(toastrMsg.initiatePmt);
            return;
          }

        }

        this.loader.show();
        let payload = {
          updatePmtPayload: ids,
          signature: this.signatureService.signPayload(ids)
        }
        this.headerConfig["request-type"] = "update";
        this.service.saveData(ApiPaths.updatePaymentStatus, payload, this.headerConfig).subscribe(o => {

          o?.status == 'SUCCESS' ? this.toastr.success(o?.message) : this.toastr.error(o?.message)
          this.loader.hide();
        }, (err) => {
          this.loader.hide();
          this.toastr.error(toastrMsg?.errMsg);
        })

        setTimeout(() => {
          let params = { invNum: this.filterData?.invNum, month: this.filterData?.month + '/' + this.filterData?.encSignature };
          this.sharedService.refreshGrid.next(true);
        }, 500)
      } else {
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))
  }

  onInput() {
    this.selectedValCopy = this.selectedVal?.filter(m => m.empName.toLowerCase().includes(this.search.toLowerCase()));
  }


  onRightClick(e) {
    if (e.target == keywords.content) {
      e.items = [{
        text: keywords.copy,
        onItemClick: () => {
          this.clipboard.copy(e?.targetElement.innerHTML);
        }
      }]

    }
  }

  dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      /* next line works with strings and numbers, 
       * and you may want to customize it to your needs
       */
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }

  groupByINR(items: any[], key: string, defalt: string): any {
    return items.reduce((result, item) => {
      // Get the value of the attribute to group by
      const groupKey = item[key];
      const defaltKy = item[defalt]
      // If the group doesn't exist, create an empty array for it
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      //"INR (₹)"

      // Add the current item to the group
 
      if (groupKey == "INR (₹)") {
        result[groupKey].push(item)
      }

      return result;
    }, {});
  }

  groupByINRRegular(items: any[], key: string, defalt: string): any {
    return items.reduce((result, item) => {
      // Get the value of the attribute to group by
      const groupKey = item[key];
      const defaltKy = item[defalt]
      // If the group doesn't exist, create an empty array for it
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      //"INR (₹)"

      // Add the current item to the group

      if (groupKey == "INR (₹)" && defaltKy == keywords.offshore) {
        result[groupKey].push(item)
      }

      return result;
    }, {});
  }
  groupBySARRegular(items: any[], key: string,onsiteKey: string, defalt: string): any {
    let filterKey = [];
    return items.reduce((result, item) => {
      // Get the value of the attribute to group by
      let groupKey = item.defaultPkg == keywords.onsite ? item[onsiteKey] : item[key];
      const defaltKy = item[defalt]
      // If the group doesn't exist, create an empty array for it
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      //"INR (₹)"
      // Add the current item to the group
      if (groupKey == "INR (₹)" || groupKey == "SAR ( ر.س)") {
        //groupKey='SAR ( ر.س)';
        result[groupKey].push(item)
      }

      return result;
    }, {});
  }

  groupByUSDRegular(items: any[], key: string,onsiteKey: string, defalt: string): any {
    let filterKey = [];
    return items.reduce((result, item) => {
      // Get the value of the attribute to group by
      let groupKey = item.defaultPkg == keywords.onsite ? item[onsiteKey] : item[key];
      const defaltKy = item[defalt]
      // If the group doesn't exist, create an empty array for it
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      //"INR (₹)"
      // Add the current item to the group
      if (groupKey == "INR (₹)" || groupKey == "SAR ( ر.س)" || groupKey == "USD ($)") {
        //groupKey='SAR ( ر.س)';
        result[groupKey].push(item)
      }

      return result;
    }, {});
  }


  groupBySAR(items: any[], key: string, defalt: string): any {
    let filterKey = [];
    return items.reduce((result, item) => {
      // Get the value of the attribute to group by
      let groupKey = item[key];
      const defaltKy = item[defalt]
      // If the group doesn't exist, create an empty array for it
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      //"INR (₹)"
      // Add the current item to the group
      //if(defaltKy == "Onsite" && (groupKey == "INR (₹)" || groupKey == "SAR ( ر.س)")){
      if (groupKey == "INR (₹)" || groupKey == "SAR ( ر.س)") {
        //groupKey='SAR ( ر.س)';
        result[groupKey].push(item)
      }

      return result;
    }, {});
  }

  //grouping for other currency
  groupCurrency(items: any[], key: string, defalt: string): any {
    return items.reduce((result, item) => {
      // Get the value of the attribute to group by
      const groupKey = item[key];
      const defaltKy = item[defalt]
      // If the group doesn't exist, create an empty array for it
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      //"INR (₹)"

      // Add the current item to the group
      if (groupKey == "INR (₹)") {
        result[groupKey].push(item)
      } else if (groupKey == "PAK (PKR)") {
        result[groupKey].push(item)
      } else if (groupKey == "USD ($)") {
        result[groupKey].push(item)
      } else if (groupKey == "EUR (€)") {
        result[groupKey].push(item)
      }

      return result;
    }, {});
  }

  //filteredData = [];

  filterDataListINR(searchKey: string, data: any, defaultPkg) {
    return data.filter(item =>

      defaultPkg == null ? item.currency == searchKey : item.currency == searchKey && item.defaultPkg == defaultPkg)


  }

  filterDataListSAR(searchKey: string, data: any, defaultPkg) {
    return data.filter(item =>

      defaultPkg == null ? item.currency == searchKey : item.currency == searchKey && item.defaultPkg != defaultPkg)


  }

  //refesh grid after update 

  refresh() {
    this.getReviewHistory.emit(this.filter);
  }

  filterSelected(event) {
    //this.selectionChangedBySelectbox = true;

    const prefix = event.value;

    // if (!prefix) { return; }
    // if (prefix === 'All') { this.selectedRows = this.employees.map((employee) => employee.ID); } else {
    //   this.selectedRows = this.employees.filter((employe) => employe.Prefix === prefix).map((employee) => employee.ID);
    // }

    // this.prefix = prefix;

  }

  selectionChangedHandler(event) {
    this.pmtCheckbox = [];
    this.selectedValCopy = [];
    event?.selectedRowsData?.forEach(o => {
    

      if (o?.invoiceObj?.invoiceStatus != keywords.underReview && o?.invoiceObj?.invoiceStatus != 'Rejected') {
      let obj = {
        invNum: o?.invoiceObj?.invNum,
        invoiceYear: o?.invoiceObj?.invoiceYear,
        transactionRefId: o?.invoiceObj?.transactionRefId
      }
      this.pmtCheckbox.push(obj)

      let pdf = {
        empName: o?.invoiceObj?.consultantName + " (" + o?.invoiceObj.invNum + ")",
        empId: o?.invoiceObj?.empId,
        invNum: o?.invoiceObj?.invNum,
        paymentStatus: o.invoiceObj?.paymentStatus,
        currency: o.invoiceObj?.currency,
        defaultPkg: o.invoiceObj?.defaultPkg,
        invoiceStatus: o?.invoiceObj?.invoiceStatus,
        selected: true
      }
      this.selectedValCopy.push(pdf);
    }
    })
  }

  //to change invoice status text
  onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.column.dataField === "invoiceObj.invoiceStatus") {
        e.cellElement.innerHTML = e.displayValue == keywords.underReview ? keywords.underRevLabel : e.displayValue == keywords.paid ? "Paid" :
          e.displayValue == keywords.paymentInitiated ? "Payment Initiated" : e.displayValue;
      }
    }
  }

  removeDuplicates1(data: any | any[][]): any[] {
    const uniqueMap = new Map<string, any>();

    // Normalize to array of arrays
    const groupedData = Array.isArray(data[0]) ? data : [data];

    for (const group of groupedData) {
      for (const item of group) {
        const key = `${item.empId}_${item.invoice?.invId}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      }
    }

    return Array.from(uniqueMap.values()).map(item => [item]);;
  }

}