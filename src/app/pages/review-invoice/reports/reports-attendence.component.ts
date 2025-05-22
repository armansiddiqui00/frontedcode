import { DatePipe } from '@angular/common';
import { Component, EventEmitter,Input, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SignatureService } from 'src/app/services/SignatureService';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { ApiPaths, deepClone } from 'src/app/shared/util';


@Component({
  selector: 'app-reports-attendence',
  templateUrl: './reports-attendence.component.html',
  styleUrls: ['./reports-attendence.component.scss']
})
export class ReportsAttendenceComponent {
  @Output() getReviewHistory = new EventEmitter();
  @Output() resetFilter =new EventEmitter();
  @Input() pageConfig;
  processInvoice = {
    month : null,
    empId:null,
    dateRange:null,
    fromDate:null,
    toDate:null,
    invoiceStatus:null,
    transferCurrency:null
  } 

  invStatusDrp = [{name:'underReview',value:'Under Review'},{name:'approved',value:'Approved'},{name:'rejected',value:'Rejected'},{name:'paymentInitiated',value:'Payment Initiated'},{name:'paid',value:'Paid'}]
  currencyTypeDrp = [{name:'INR (₹)',value:'INR (₹)'},{name:'SAR ( ر.س)',value:'SAR ( ر.س)'},{name:'USD ($)',value:'USD ($)'},{name:'PAK (PKR)',value:'PAK (PKR)'},{name:'EUR (€)',value:'EUR (€)'}]
  userData = null;
  constructor(private datepipe:DatePipe, private signature:SignatureService,private auth:AuthenticationService,private toastr:ToastrService,private restApi:RestApiService){
    this.auth.currentUser.subscribe(d => this.userData = d?.loginUserDetails);
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
  getCurrencySetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: 'All Currencies',
      primaryKey: 'name',
      labelKey: 'value',
   //   classes:dropdown.classes,
    }
    return Object.assign(commonSettings,specificSetting);
  }

  ngOnInit(){
    this.changeMonthRange();
    
  }
  changeMonthRange(){
      let monthpick:any=[]
        setTimeout(() => {
          var $j = jQuery.noConflict();
          let day = new Date().getDate();
          let currentDate =  new Date();// = day < 25 ? new Date(new Date().setMonth(new Date().getMonth() - 1)) : new Date();
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
          this.search();
        },1000);
  }

  search(){
        let monthArray = []
    let month = [{key:'Jan',value:1},{key:'Feb',value:2},{key:'Mar',value:3},{key:'Apr',value:4},{key:'May',value:5},{key:'Jun',value:6},{key:'Jul',value:7},{key:'Aug',value:8},{key:'Sep',value:9},{key:'Oct',value:10},{key:'Nov',value:11},{key:'Dec',value:12}]
    var select=document.getElementById("exampleInput")["value"];
    if(select == ''){
      this.toastr.error(toastrMsg.monthRangeMsg);
      return;
    }
    if(Array.isArray(select)){
      select = select.toString();
    }
    let  selectMonthArray = select.includes(',') ? select.split(',') : ['',select];
  //  console.log("select,select ",selectMonthArray)
    selectMonthArray.forEach(f =>{
      let split = f.split('-')
      Object.assign(month).forEach(o => {
       // console.log("key",o,split[1])
         if(split[1] == o.key){
          monthArray.push(o.value + '-' +split[0].trim())
         }
      })
    })

    let preparedFilters = deepClone(this.processInvoice)
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => d[o] || d['name']);
      }
    })

    this.getDefaultValue(preparedFilters)
    let params = {empId:preparedFilters.empId.length == this.pageConfig?.employeeList.length ? "ALL" : preparedFilters.empId.toString(),
                  month:monthArray.toString(),
                  invoiceStatus:preparedFilters.invoiceStatus.length == this.invStatusDrp.length ? "ALL" : preparedFilters?.invoiceStatus.toString(),
                  transferCurrency:preparedFilters.transferCurrency.length == this.currencyTypeDrp.length ? "ALL" : preparedFilters?.transferCurrency.toString(),
                  roleName:this.userData?.roleName,
                  reportingId:this.userData?.empId,
                  url:ApiPaths.getEmpInvReviewHistory};
                  this.getReviewHistory.emit(params);    
  }

  getDefaultValue(preparedFilters){
    if(preparedFilters.invoiceStatus == null || preparedFilters.invoiceStatus.length == 0){
      preparedFilters.invoiceStatus = this.invStatusDrp.map(o => o.name)
    }if (preparedFilters.empId == null || preparedFilters.empId.length == 0) {
      preparedFilters.empId = this.pageConfig?.employeeList.map(o => o.empId);
    }if (preparedFilters.transferCurrency == null || preparedFilters.transferCurrency.length == 0) {
      preparedFilters.transferCurrency = this.currencyTypeDrp.map(o => o.name)
    }
   
  }
  reset(){
    this.restApi.getSession(keywords.checkStatus,this.userData?.userEmailId,this.signature.signPayload(this.userData?.userEmailId)).subscribe(d =>{
      if(d?.isValid){
        this.processInvoice = {
          month : null,
          empId:null,
          dateRange:null,
          fromDate:null,
          toDate:null,
          invoiceStatus:null,
          transferCurrency:null
        } 
        this.resetFilter.emit(true);
      }else{
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))
   
  }
}
