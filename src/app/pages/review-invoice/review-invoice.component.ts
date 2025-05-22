import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { TravelDeskService } from '../travel-desk/travel-desk-modal/travel-desk.service';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from 'src/app/services/store.service';
import { DatePipe } from '@angular/common';
import { ApiPaths, deepClone } from 'src/app/shared/util';
import { ActivatedRoute } from '@angular/router';
import { padEnd } from 'lodash';
import { param } from 'jquery';
import { SignatureService } from 'src/app/services/SignatureService';
import { config } from 'rxjs';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { AuthenticationService } from 'src/app/_services';

@Component({
  selector: 'app-review-invoice',
  templateUrl: './review-invoice.component.html',
  styleUrls: ['./review-invoice.component.scss']
})
export class ReviewInvoiceComponent {
  dataSource = null;
  showNoRecords = false;
  showNoService = false;
  reviewInvoicePageInfo: any;
  pageConfig = null;
  params = null
  filter = null;
  headerConfig;
  actionSignature;
  userEmailId;
  constructor(private loader: LoaderService, private apiService: RestApiService, private activateRoute: ActivatedRoute, private toastr: ToastrService, private signatureService: SignatureService, private auth:AuthenticationService) {
    auth.currentUser.subscribe(o => this.userEmailId = o?.loginUserDetails?.userEmailId);
    this.actionSignature = signatureService.signPayload(this.userEmailId);
  }
  ngOnInit(): void {
    this.activateRoute.data.subscribe(data => {
      this.pageConfig = data.config;
    })
    this.headerConfig=keywords.config;
    this.getPageAPIInfo();
  }



  getPageAPIInfo() {
    let obj = {
      pageName: null,
      groupingEnabled: false,
      url: null,

    }

    if (location.href.indexOf('/dwc/inv/reviewinvoice') > -1) {
      obj.pageName = 'reviewinvoice';
  //    obj.url = 'getInvoice'

    }
    if (location.href.indexOf('/dwc/inv/invoicehistory') > -1) {
      obj.pageName = 'invoicehistory';
    //  obj.url = 'getInvoice'
    }
    if (location.href.indexOf('/dwc/inv/processinvoices') > -1) {
      obj.pageName = 'processinvoices';
      obj.url = 'getEmpInvForFinance'
    }
     if (location.href.indexOf('/dwc/inv/attendence') > -1) {
      obj.pageName = 'attendence';
    //  obj.url = 'getInvoice'
    }
    if (location.href.indexOf('/dwc/inv/releasednote') > -1) {
      obj.pageName = 'releasednote';
    //  obj.url = 'getInvoice'
    }
    this.reviewInvoicePageInfo = obj

  }

  getFilter(url){
    this.apiService.getSession(keywords.checkStatus,this?.userEmailId,this.actionSignature).subscribe(d =>{
      if(d?.isValid){
        this.loader.show();
        this.headerConfig["request-type"] = 'search';
        this.apiService.getOrDeleteData(url,this.params,this.headerConfig).subscribe(data=>{
          this.loader.hide();
        if(data == null || data == undefined || data.length == 0){
          this.dataSource = null;
          this.showNoRecords = true;
          this.showNoService = false;
        }else{
          let arrayOrNot = Array.isArray(data)
          this.dataSource = arrayOrNot == true ? data : [data];
          this.showNoRecords = false;
          this.showNoService = false;
        }
        if(data[0]?.message?.status != null && data[0]?.message?.status=="ERROR"){
          this.toastr.error(data[0].message?.message);
        }
      },(err) => {
        this.loader.hide();
        this.showNoRecords = false;
        this.showNoService = true;
  
        })
        
      }else{
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))
  }


  getReviewHistory(filter:any){
    this.apiService.getSession(keywords.checkStatus,this?.userEmailId,this.actionSignature).subscribe(d =>{
      if(d?.isValid){
        this.filter = deepClone(filter)
       
   let url = this.filter.url;
    filter.url == "getEmpInvReviewHistory/" || filter.url == ApiPaths.getEmpInvForFinance? delete filter.url:filter
    
    //delete filter.url;
    delete filter.viewHistory
    let invHistory = {
      invoiceReviwePayload : JSON.parse(this.signatureService.stringifyWithSortedKeys(filter)),
      signature : this.signatureService.signPayload(filter)
    }
    this.loader.show();
   //ApiPaths.getEmpInvReviewHistory
   this.headerConfig["request-type"] = 'search';
    this.apiService.saveData(url,invHistory,this.headerConfig).subscribe(data=>{
      this.loader.hide();
      if(data[0]?.message?.status == "ERROR"){
        this.toastr.error(data[0]?.message?.message) 
      }else{
        if(data == null || data == undefined || data.length == 0){
          this.dataSource = null;
          this.showNoRecords = true;
          this.showNoService = false;
        }else{
          let arrayOrNot = Array.isArray(data)
          this.dataSource = arrayOrNot == true ? data : [data];
          this.showNoRecords = false;
          this.showNoService = false;
        }
      }
  },(err) => {
    this.loader.hide();
    this.showNoRecords = false;
    this.showNoService = true;

    })
      }else{
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))
   
  }
  
  resetFilter(event){
    this.apiService.getSession(keywords.checkStatus,this?.userEmailId,this.actionSignature).subscribe(d =>{
      if(d?.isValid){
        if(event){
          this.dataSource = null;
        this.showNoRecords = false;
        this.showNoService = false
        }
      }else{
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))
  }

  getParams(params){
    this.params = params;
  }

}
