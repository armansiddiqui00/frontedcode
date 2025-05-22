import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ReviewService } from '../review-invoice-modal/review.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { AuthenticationService } from 'src/app/_services';
import * as $ from 'jquery'; 
import 'jquery-ui/dist/jquery-ui'; 
import { NgForm } from '@angular/forms';
import { ApiPaths, deepClone, delay } from 'src/app/shared/util';
import { InvoiceService } from '../../invoice-details/invoice.service';
import { SignatureService } from 'src/app/services/SignatureService';
import { ToastrService } from 'ngx-toastr';
import { keywords, toastrMsg } from 'src/app/shared/constant';
@Component({
  selector: 'app-invoice-history',
  templateUrl: './invoice-history.component.html',
  styleUrls: ['./invoice-history.component.scss']
})
export class InvoiceHistoryComponent {
  reviewInvoicePageInfo;
  @Output() getFilter = new EventEmitter();
  @Output() getParams = new EventEmitter();
  @Output() resetFilter =new EventEmitter();
  @Input() pageConfig;
  @Input() dataSource;
  

  history = {
  invoiceNo : 'All',
  month : new Date().getMonth() + +1,
  viewHistory : false,
  empId:null,
  dateRange:null,
  fromDate:null,
  toDate:null,
  invoiceStatus:null,
  roleName:null
}
month = new Date();
dateSelected: any = [];
selectedClass = [];
date:any;
minDate;
maxDate;
userData:any;
monthAndYear = new Date().getDate() >= 1 ? (new Date().getMonth() + 1) + '-' + new Date().getFullYear() : new Date().getMonth() + 1 + '-' + new Date().getFullYear();
invStatusDrp = [{name:'underReview',value:'Under Review'},{name:'Approved',value:'Approved'},{name:'Rejected',value:'Rejected'},{name:'paymentInitiated',value:'Payment Initiated'},{name:'paid',value:'Paid'}]
actionSignature;
    constructor(private auth:AuthenticationService,private datepipe:DatePipe,private invoiceService:InvoiceService,private signatureService:SignatureService,private toastr:ToastrService, private restApi:RestApiService){
          this.auth.currentUser.subscribe(d => {this.history.empId = d?.loginUserDetails?.empId,this.history.roleName = d?.loginUserDetails?.roleName,this.userData = d?.loginUserDetails})
          this.actionSignature = signatureService.signPayload(this.userData?.userEmailId)
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

    ngOnInit() {
      this.month = new Date().getDate() >= 1 ? new Date(new Date().setMonth(new Date().getMonth())) : new Date();
      this.minDate = new Date('2023-01-01')
      if (new Date().getDate() >= 1) {
        let str = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + '1'
        this.maxDate = new Date(str)
        this.history.month = new Date(str).getMonth() + +1
      } else {
        this.maxDate = new Date()
        this.history.month = new Date().getMonth() + +1
      }
 
      this.search();
  }
 
    onMonthChange(m:any){ 
      let date = new Date(m);
    this.history.month = date.getMonth() + 1;
    this.monthAndYear = date.getMonth() + 1 + '-' + date.getFullYear()
    }

    getDateItem(date: Date): string {
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
  
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
  
    applyFilters(url) {
      this.getFilter.emit(url)
    }

    viweHistory(event){
      this.history.viewHistory = event.target.checked;
      this.invoiceService.viewHistory.next(event?.target.checked)
      if(event?.target.checked == true){
        this.history.invoiceNo = "All"
        let monthpick:any=[]
        setTimeout(() => {
          var $j = jQuery.noConflict();
          let day = new Date().getDate();
          let currentDate =  new Date();
         let selectedDate= ( $j('#exampleInput') as any).multiMonthPicker(monthpick={
          value: [this.datepipe.transform(currentDate,'YYYY-MMM')],
          //  this.datepipe.transform(new Date(),keywords.formateDateOnly
              monthFormat:'yyyy-mmm',
              index:currentDate.getMonth(),
              currentyear:currentDate.getFullYear()
            
          }
          ); 
        },1000);
        
      //   let date = 'Mon Jan 01 2024 16:11:01 GMT+0530'
      //   this.dateSelected.push(new Date(date))
      //   let num=[]
      //   this.dateSelected.forEach(e=>{ 
      //     let ee=this.datepipe.transform(e,'MM/YYYY');
      //      num.push(ee)
      // })
      // this.date=num.toString();
      }
    }
    onchange(event){
    }
    search(){
      if(this.history.viewHistory){
        let month = document.getElementById("exampleInput")["value"];
      if(month == ''){
        this.toastr.error(toastrMsg.monthRangeMsg);
        return;
      }
    }

      let monthArray = []
      if(this.history?.viewHistory){
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
      // let monthArray = []
      // this.dateSelected.forEach(f =>{
      //   let month = new Date(f).getMonth() + 1
      //   monthArray.push(month)
      // })
      let preparedFilters = deepClone(this.history)
      Object.keys(preparedFilters).forEach(o => {
        let obj = preparedFilters[o];
        if (Array.isArray(obj)) {
          preparedFilters[o] = obj.map(d => d[o] || d['name']);
        }
      })

      this.getDefaultValue(preparedFilters)
      if(!this.history.viewHistory && this.history.month && this.history.invoiceNo == 'All'){
        this.getParams.emit(null)
        let sign = this.history.empId+this.history.roleName+this.monthAndYear;
        let signData = this.signatureService.signPayload(sign);
        let encodeData = encodeURIComponent(signData);
        let url = 'getInvoiceByEmpId/'+this.history.empId + '/' +  this.monthAndYear + '/' + this.history.roleName + '?signature=' + encodeData;
        this.getFilter.emit(url)
      }else if(!this.history.viewHistory && this.history.month && this.history.invoiceNo != 'All'){
        let params = {invNum:this.history.invoiceNo,monthAndYear:this.monthAndYear,encSignature:this.signatureService.signPayload(this.history?.invoiceNo+this.history.month)};
        let url = 'getInvoiceByInvoiceNo';
        this.getParams.emit(params)
        this.getFilter.emit(url)
      }else if(this.history.viewHistory && monthArray.length > 0){
        let params = {invNum:this.history.invoiceNo,empId:this.history.empId,month:monthArray.toString(),invoiceStatus:preparedFilters?.invoiceStatus.toString(),roleName:this.history.roleName,encSignature:this.signatureService.signPayload(this.history?.empId+this.history?.roleName)};
        let url = 'getEmpInvHistory';
        this.getParams.emit(params)
        this.getFilter.emit(url)
      }
  }
    getDefaultValue(preparedFilters){
      if(preparedFilters.invoiceStatus == null || preparedFilters.invoiceStatus.length == 0){
        preparedFilters.invoiceStatus = this.invStatusDrp.map(o => o.name)
      }
    }
   reset(){
     this.restApi.getSession(keywords.checkStatus, this?.userData?.userEmailId, this.actionSignature).subscribe(o => {
          if (o?.isValid) {
      this.selectedClass = [];
      this.dateSelected = [];
      this.history.viewHistory = false;
      this.resetFilter.emit(true)
      this.history = {
        invoiceNo : 'All',
        month : new Date().getMonth() + +1,
        viewHistory : false,
        empId:this.history.empId,
        dateRange:null,
        fromDate:null,
        toDate:null,
        invoiceStatus:null,
        roleName : this.userData?.roleName
      }
      this.month = new Date();
    } else {
      this.auth.logoutThroughAngular();
      this.toastr.error(o?.message);
    }
  },(err) => this.toastr.error(toastrMsg.errMsg));
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
