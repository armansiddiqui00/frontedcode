import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SignatureService } from 'src/app/services/SignatureService';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { ApiPaths, deepClone, delay } from 'src/app/shared/util';
var $j = jQuery.noConflict();
@Component({
  selector: 'app-finance-review-invoice',
  templateUrl: './finance-review-invoice.component.html',
  styleUrls: ['./finance-review-invoice.component.scss']
})
export class FinanceReviewInvoiceComponent {
  @Output() getReviewHistory = new EventEmitter();
  @Output() resetFilter = new EventEmitter();
  @Input() pageConfig;
  processInvoice = {
    month: null,
    empId: null,
    invoiceStatus: null,
    transferCurrency: null
  }

  invStatusDrp = [{name:'underReview',value:'Under Review'},{ name: 'Approved', value: 'Approved' },{name:'Rejected',value:'Rejected'}, { name: 'paymentInitiated', value: 'Payment Initiated' }, { name: 'paid', value: 'Paid' }]
  currencyTypeDrp = [{ name: 'INR (₹)', value: 'INR (₹)' }, { name: 'SAR ( ر.س)', value: 'SAR ( ر.س)' }, { name: 'USD ($)', value: 'USD ($)' }, { name: 'PAK (PKR)', value: 'PAK (PKR)' }, { name: 'EUR (€)', value: 'EUR (€)' }]
  userData = null;
  actionSignature = null;
  constructor(private datepipe: DatePipe, private signatureService: SignatureService, private auth: AuthenticationService, private toastr: ToastrService, private restApi: RestApiService) {
    this.auth.currentUser.subscribe(d => this.userData = d?.loginUserDetails);
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

  getEmployeeSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: 'All Consultants',
      primaryKey: 'empId',
      labelKey: 'firstName',
      //   classes:dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }
  getStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: 'All Status',
      primaryKey: 'name',
      labelKey: 'value',
      //   classes:dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }
  getCurrencySetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: 'All Currencies',
      primaryKey: 'name',
      labelKey: 'value',
      //   classes:dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  ngOnInit() {
    this.changeMonthRange();
  }
  changeMonthRange() {
    let monthpick: any = []
    setTimeout(() => {
      // var $j = jQuery.noConflict();
      let currentDate = new Date();
      let selectedDate = ($j('#exampleInput') as any).multiMonthPicker(monthpick = {
        value: [this.datepipe.transform(currentDate, 'YYYY-MMM')],
        minDate: this.datepipe.transform(new Date(), 'YYYY-MMM'),
        maxDate: this.datepipe.transform(new Date(), 'YYYY-MMM'),
        //  this.datepipe.transform(new Date(),keywords.formateDateOnly
        monthFormat: 'yyyy-mmm',
        index: currentDate.getMonth(),
        currentyear: currentDate.getFullYear()

      }
      );
      this.search()
    }, 1000);
  }

  search() {
    let monthArray = []
    let month = [{ key: 'Jan', value: 1 }, { key: 'Feb', value: 2 }, { key: 'Mar', value: 3 }, { key: 'Apr', value: 4 }, { key: 'May', value: 5 }, { key: 'Jun', value: 6 }, { key: 'Jul', value: 7 }, { key: 'Aug', value: 8 }, { key: 'Sep', value: 9 }, { key: 'Oct', value: 10 }, { key: 'Nov', value: 11 }, { key: 'Dec', value: 12 }]
    var select = document.getElementById("exampleInput")["value"];
    if (select == '') {
      this.toastr.error(toastrMsg.monthRangeMsg);
      return;
    }
    if (Array.isArray(select)) {
      select = select.toString();
    }
    let selectMonthArray = select.includes(',') ? select.split(',') : ['', select];
    selectMonthArray.forEach(f => {
      let split = f.split('-')
      Object.assign(month).forEach(o => {
        if (split[1] == o.key) {
          monthArray.push(o.value + '-' + split[0].trim())
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
    let params = { empId: preparedFilters.empId.length == this.pageConfig?.employeeList.length ? "ALL" : preparedFilters.empId.toString(),
                   month: monthArray.toString(), 
                   invoiceStatus: preparedFilters.invoiceStatus.length == this.invStatusDrp.length ? "ALL" : preparedFilters?.invoiceStatus.toString(),
                   transferCurrency: preparedFilters.transferCurrency.length == this.currencyTypeDrp.length ? "ALL" : preparedFilters?.transferCurrency.toString(),
                   roleName: this.userData?.roleName, reportingId: this.userData?.empId, url: ApiPaths.getEmpInvForFinance };
    this.getReviewHistory.emit(params);

  }

  getDefaultValue(preparedFilters) {
    if (preparedFilters.invoiceStatus == null || preparedFilters.invoiceStatus.length == 0) {
      preparedFilters.invoiceStatus = this.invStatusDrp.map(o => o.name)
    } 
    if (preparedFilters.empId == null || preparedFilters.empId.length == 0) {
      preparedFilters.empId = this.pageConfig?.employeeList.map(o => o.empId);
    }
    if (preparedFilters.transferCurrency == null || preparedFilters.transferCurrency.length == 0) {
      preparedFilters.transferCurrency = this.currencyTypeDrp.map(o => o.name)
    }

  }
  reset() {
    this.restApi.getSession(keywords.checkStatus, this?.userData?.userEmailId, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        this.processInvoice = {
          month: null,
          empId: null,
          invoiceStatus: null,
          transferCurrency: null
        },
          // ( $j('#exampleInput') as any).multiMonthPicker('destroy')

      //  this.changeMonthRange()
        this.resetFilter.emit(true)
      } else {
        this.auth.logoutThroughAngular();
        this.toastr.error(o?.message);
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg));
  }
}
