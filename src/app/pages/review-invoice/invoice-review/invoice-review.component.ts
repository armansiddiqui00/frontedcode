import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ReviewService } from '../review-invoice-modal/review.service';
import { values } from 'lodash';
import { InvoiceService } from '../../invoice-details/invoice.service';
import { AuthenticationService } from 'src/app/_services';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { esLocale } from 'ngx-bootstrap/chronos';
import * as $ from 'jquery'; 
import 'jquery-ui/dist/jquery-ui'; 
import { ApiPaths, deepClone, delay, encryptUsingAES256 } from 'src/app/shared/util';
import { ToastrService } from 'ngx-toastr';
import { SignatureService } from 'src/app/services/SignatureService';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from 'src/app/services/store.service';
import { RestApiService } from 'src/app/services/rest-api.service';


@Component({
  selector: 'app-invoice-review',
  templateUrl: './invoice-review.component.html',
  styleUrls: ['./invoice-review.component.scss']
})
export class InvoiceReviewComponent {
@Output() getFilter = new EventEmitter();
@Output() getParams = new EventEmitter();
@Output() resetFilter =new EventEmitter();
@Output() getReviewHistory = new EventEmitter();

@Input() pageConfig;
dateSelected: any = [];
selectedClass = [];
review = {
  invoiceNo : 'All',
  month : null,
  viewHistory : false,
  empId:null,
  dateRange:null,
  fromDate:null,
  toDate:null,
  invoiceStatus:null
}
  ;
userData=null;
currentDate = new Date();
currentMonth = 0;
params=null;
url = ''
displayMonth = new Date()
//monthAndYear;
//monthAndYear = new Date().getDate() >= 1 ? (new Date().getMonth() + 1) + '-' + new Date().getFullYear() : new Date().getMonth() + 1 + '-' + new Date().getFullYear();
monthAndYear = new Date().getMonth() + 1 + '-' + new Date().getFullYear()
minDate;
maxDate;
sessionTimeout = true
invStatusDrp = [{name:'underReview',value:'Under Review'},{name:'Approved',value:'Approved'},{name:'Rejected',value:'Rejected'},{name:'paymentInitiated',value:'Payment Initiated'},{name:'paid',value:'Paid'}]
 
//invStatusDrp = [{invoiceStatus:'Pending',value:'Pending'},{invoiceStatus:'Approved',value:'Approved'},{invoiceStatus:'Rejected',value:'Rejected'}]
  constructor(private auth:AuthenticationService,private datepipe:DatePipe,private invoiceService:InvoiceService,private toastr:ToastrService,private signature:SignatureService,private restApi:RestApiService){
    this.auth.currentUser.subscribe(d => this.userData = d?.loginUserDetails)
   
  }

  dropdownSettings = {
    singleSelection: false,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    badgeShowLimit: 1,
    classes: 'drop',
    searchPlaceholderText: 'search'
  }

  getEmployeeSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: 'All Consultants',
      primaryKey: 'empId',
      labelKey: 'firstName',
   //   classes:dropdown.classes,
    }
    return Object.assign(commonSettings,specificSetting);
  }
  getStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: 'All Status',
      primaryKey: 'name',
      labelKey: 'value',
   //   classes:dropdown.classes,
    }
    return Object.assign(commonSettings,specificSetting);
  }
  ngOnInit(){
   // this.displayMonth = new Date().getDate() < 25 ? new Date(new Date().setMonth(new Date().getMonth() - 1)) : new Date();
    if(this.userData.roleName == 'Finance'){
       this.invStatusDrp = [{name:'underReview',value:'Under Review'},{name:'Approved',value:'Approved'}]
    }
    //console.log("currentMonth",this.currentMonth)
    this.minDate = new Date('2023-01-01');
    this.maxDate = new Date();
    this.review.month = new Date();
    // if (new Date().getDate() < 26) {
    //   let str = new Date().getFullYear() + '-' + new Date().getMonth() + '-' + '1'
    //   this.maxDate = new Date(str)
    //   //console.log("month",str)
    //   this.review.month = new Date(str).getMonth() + +1
    // } else {
    //   this.maxDate = new Date()
    //   this.review.month = new Date().getMonth() + +1
    // }
    // this.review.month =  new Date().getMonth() + +1;
    this.search();
  }


  getDateItem(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  onMonthChange(event){
    let date = new Date(event);
    this.review.month = date.getMonth() + 1;
    this.monthAndYear = date.getMonth() + 1 + '-' + date.getFullYear()
  }

  date:any;
  onMonthRangeChange(event){
    // if (event.length === undefined) {
    //   const date = this.getDateItem(event);

    //   const index = this.dateSelected.findIndex((item) => {
    //     const testDate = this.getDateItem(item);
    //     return testDate === date;
    //   });


    //   if (index < 0) {
    //     this.dateSelected.push(event);
    //   } else {
    //     this.dateSelected.splice(index, 1);
    //   }
    // }

    // if (this.dateSelected.length > 0) {
    //   this.selectedClass = this.dateSelected.map((date) => { 
    //     return {
    //       date,
    //       classes: ['custom-selected-date'],
    //     };
    //   });
    // }
 
      //console.log('event', event);
      if (event.length === undefined) {
        const date = this.getDateItem(event);
  
        const index = this.dateSelected.findIndex((item) => { 
          const testDate = this.getDateItem(item);
          return testDate === date;
        });
        if (index < 0) {
          this.dateSelected.push(event);
  
        } else {
          this.dateSelected.splice(index, 1);
        }
      }
  
      let num=[]
       this.dateSelected.forEach(e=>{ 
         let ee=this.datepipe.transform(e,'MM/YYYY');
          num.push(ee)
     })
     this.date=num.toString();
  
      if (this.dateSelected.length > 0) {
       this.dateSelected.map((date) => { 
          
        let d=date.toString()
         var split=d.slice(0,8);
         let arr= split.split(" ")
       
         setTimeout(() => {
          let element =  document.getElementById("datePicker");
         
           let collection=element.getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('span')
          for (let i = 0; i < collection.length; i++) {
            let e =collection.item(i)
            if(arr[1] == e.innerHTML){
              e.classList.add("custom-selected-date");
            }
           }
        }, 1);  
        });
  
      }
  
    }
  viweHistory(event){
   
    this.restApi.getSession(keywords.checkStatus,this.userData?.userEmailId,this.signature.signPayload(this.userData?.userEmailId)).subscribe(d =>{
      if(d?.isValid){
        this.review.viewHistory = event.target.checked;
    if(event.target.checked == true){
      this.review.invoiceNo = 'All'
      let monthpick:any=[]
        setTimeout(() => {
          var $j = jQuery.noConflict();
          let day = new Date().getDate();
          let currentDate =  new Date();
         let selectedDate= ( $j('#exampleInput') as any).multiMonthPicker(monthpick={
          value: [this.datepipe.transform(currentDate,'YYYY-MMM')],
          minDate: this.datepipe.transform(new Date(),'YYYY-MMM'),
          maxDate: this.datepipe.transform(new Date(),'YYYY-MMM'),
          //  this.datepipe.transform(new Date(),keywords.formateDateOnly
              monthFormat:'yyyy-mmm',
              index:currentDate.getMonth(),
              currentyear:currentDate.getFullYear()
            
          }
          ); 
        },1000);
        this.review.empId = null;
        this.review.invoiceStatus = null;
    }
      }else{
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))


    
  }
  dateRangeChange(rangedate) {
    //let utilFun = changeDateRange(rangedate, this.searchFilters.fromDate, this.searchFilters.toDate, this.latestDateRange, this.latestTime, this.timeChange,this.datepipe)
    this.review.fromDate = this.datepipe.transform(rangedate[0], keywords.formateDateOnly);
    this.review.toDate = this.datepipe.transform(rangedate[1], keywords.formateDateOnly);
  }

  search(){
    // if(this.review.viewHistory && this.review.empId != null && this.review.fromDate != null && this.review.toDate != null ){
    //   if(this.review.invoiceNo == 'All'){
    //     this.params = {fromDate:this.datepipe.transform(this.review.fromDate,keywords.formateDateOnly),toDate:this.datepipe.transform(this.review.toDate,keywords.formateDateOnly),empId:this.review.empId};
    //     this.url = 'getInvoiceHistory';
    //     this.getParams.emit(this.params)
    //     this.getFilter.emit(this.url)
    //   }else{
    //     this.params = {invNum:this.review.invoiceNo,fromDate:this.datepipe.transform(this.review.fromDate,keywords.formateDateOnly),toDate:this.datepipe.transform(this.review.toDate,keywords.formateDateOnly),empId:this.review.empId};
    //     this.url = 'getInvoiceByInvNoAndDateRange';
    //     this.getParams.emit(this.params)
    //     this.getFilter.emit(this.url)
    //   }
    // }
    // else if(!this.review.viewHistory && this.review.month != null){
    //   if(this.review.invoiceNo == 'All'){
    //     this.params = null;
    //     this.url = 'getInvoiceByReportingId/' + this.userData.roleName + '/' + this.userData.empId+'/'+this.review.month
    //     this.getParams.emit(this.params)
    //     this.getFilter.emit(this.url)
    //   }
    //  else{
    //   this.params = {invNum : this.review.invoiceNo,invMonth:this.review.month};
    //     this.url = 'getInvoiceByInvoiceNo';
    //     this.getParams.emit(this.params)
    //     this.getFilter.emit(this.url)
    //  }
    // }
    if(this.review.viewHistory){
      let month = document.getElementById("exampleInput")["value"];
    if(month == ''){
      this.toastr.error(toastrMsg.monthRangeMsg);
      return;
    }
   
    }


    let monthArray = []
      if(this.review?.viewHistory){
        let month = [{key:'Jan',value:1},{key:'Feb',value:2},{key:'Mar',value:3},{key:'Apr',value:4},{key:'May',value:5},{key:'Jun',value:6},{key:'Jul',value:7},{key:'Aug',value:8},{key:'Sep',value:9},{key:'Oct',value:10},{key:'Nov',value:11},{key:'Dec',value:12}]
        var select=document.getElementById("exampleInput")["value"];
        if(Array.isArray(select)){
          select = select.toString();
        }
        let  selectMonthArray = select.includes(',') ? select.split(',') : ['',select];
       
        selectMonthArray.forEach(f =>{
          let split = f.split('-')
          Object.assign(month).forEach(o => {
             if(split[1] == o.key){
              monthArray.push(o.value + '-' +split[0].trim())
             }
          })
        })
      } 
    let preparedFilters = deepClone(this.review)
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => d[o] || d['name']);
      }
    })
    // let monthArray = []
    // this.dateSelected.forEach(f =>{
    //   let month = new Date(f).getMonth() + 1
    //   monthArray.push(month)
    // })
    this.getDefaultValue(preparedFilters)

//console.log("review",preparedFilters,monthArray)

    if(this.review.viewHistory && preparedFilters.empId != null && monthArray.length > 0){
    //  this.params = {reprotingId:this.userData.empId,empId:preparedFilters?.empId.toString(),months:monthArray.toString()};
    //console.log("this.userData.empId ",preparedFilters?.empId.toString )
    let filter = {
      //viewHistory:true,
      roleName:this.userData.roleName,
      reportingId:this.userData.empId,
      empId:preparedFilters.empId.length == this.pageConfig?.employeeList.length ? "ALL" : preparedFilters.empId.toString(),
      month: monthArray.toString(),
      invoiceStatus:preparedFilters.invoiceStatus.length == this.invStatusDrp.length ? "ALL" : preparedFilters.invoiceStatus.toString(),
      url:'getEmpInvReviewHistory/'
    }
    this.invoiceService.viewHistory.next(filter)
      // this.getParams.emit(null)
      //   this.url = 'getEmpInvReviewHistory/'+this.userData.roleName +'/'+this.userData.empId + '/' + preparedFilters?.empId.toString() +'/' + monthArray.toString() + '/' + preparedFilters?.invoiceStatus;
      //   this.getFilter.emit(this.url)
      this.getReviewHistory.emit(filter)
    }else if(!this.review.viewHistory && this.review.month != null && this.review.invoiceNo == "All"){
      //  this.params = {reprotingId:this.userData.empId,empId:preparedFilters?.empId.toString(),months:monthArray.toString()};
          let sig=this.userData.roleName+this.userData.empId;

          let encSignature=this.signature.signPayload(sig);
          let encodeData = encodeURIComponent(encSignature);
          this.url = ApiPaths.getInvoiceByReportingId + this.userData.roleName + '/' + this.userData.empId+'/'+ this.monthAndYear+'?signature='+encodeData;
          
       
          let filter = {
            viewHistory:false,
            roleName:this.userData.roleName,
            reportingId:this.userData.empId,
            empId:null,
            month: this.monthAndYear,
            status:null,
            url:ApiPaths.getInvoiceByReportingId,
            encSignature:encodeData
          }
          this.invoiceService.viewHistory.next(filter)
          this.getParams.emit(null)
          this.getFilter.emit(this.url)
      }else if(!this.review.viewHistory && this.review.month != null && this.review.invoiceNo != "All"){
        let sig=this.review.invoiceNo;
        let encSignature=this.signature.signPayload(sig);
        let encodeData = encodeURIComponent(encSignature);
        let filter = {
          viewHistory:false,
          invNum:this.review.invoiceNo,
          month: preparedFilters.month,
          url:'getInvoiceByInvoiceNo/',
          encSignature:encodeData
        }
        this.invoiceService.viewHistory.next(filter)
          let params = {invNum:this.review.invoiceNo,month:preparedFilters.month, encSignature:encSignature};
          let url = 'getInvoiceByInvoiceNo';
          this.getParams.emit(params)
          this.getFilter.emit(url)
      }
  }

  getDefaultValue(preparedFilters){
    if (preparedFilters.empId == null || preparedFilters.empId.length == 0) {
      preparedFilters.empId = this.pageConfig?.employeeList.map(o => o.empId)
    }if(preparedFilters.invoiceStatus == null || preparedFilters.invoiceStatus.length == 0){
      preparedFilters.invoiceStatus = this.invStatusDrp.map(o => o.name)
    }
  }
  reset(){
    this.restApi.getSession(keywords.checkStatus,this.userData?.userEmailId,this.signature.signPayload(this.userData?.userEmailId)).subscribe(d =>{
      if(d?.isValid){
        this.review = {
          invoiceNo : 'All',
          month : new Date().getMonth() + +1,
          viewHistory : false,
          empId:null,
          dateRange:null,
          fromDate:null,
          toDate:null,
          invoiceStatus:null
        }
        this.displayMonth = new Date();
        this.selectedClass = [];
        this.dateSelected = [];
        this.review.viewHistory = false;
        this.resetFilter.emit(true)

        this.invStatusDrp = [{name:'underReview',value:'Under Review'},{name:'Approved',value:'Approved'},{name:'Rejected',value:'Rejected'},{name:'paymentInitiated',value:'Payment Initiated'},{name:'paid',value:'Paid'}]
        if(this.userData.roleName == 'Finance'){
          this.invStatusDrp = [{name:'underReview',value:'Under Review'},{name:'Approved',value:'Approved'}]
       }
      }else{
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))
   
  }

  visible:boolean = false
   onclick(){
     this.visible = !this.visible
     if (this.dateSelected.length > 0) {
      this.dateSelected.map((date) => { 
       let d=date.toString()
        var split=d.slice(0,8);
        let arr= split.split(" ")
      
        setTimeout(() => {
         let element =  document.getElementById("datePicker");
        
          let collection=element.getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('span')
         for (let i = 0; i < collection.length; i++) {
           let e =collection.item(i)
           if(arr[1] == e.innerHTML){
             e.classList.add("custom-selected-date");
           }
          }
       }, 1);  
       });
 
     }
   }
}
