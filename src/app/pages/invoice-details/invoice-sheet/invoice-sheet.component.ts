import { Component, HostListener, Input, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../invoice.service';
import { DatePipe } from '@angular/common';
import { ApiPaths, decryptUsingAES256, deepClone, delay, getDatesInRange } from 'src/app/shared/util';
import { FileUploadService } from '../file-upload.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal'
import { AuthenticationService } from 'src/app/_services';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { LoaderService } from 'src/app/services/loader.service';
import { CurrencyMaskInputMode } from 'ngx-currency';
declare var require: any;
import { first } from 'rxjs/operators';
import { DatepickerDateCustomClasses } from 'ngx-bootstrap/datepicker';
import PostalMime from 'postal-mime';
import { SignatureService } from 'src/app/services/SignatureService';
@Component({
  selector: 'app-invoice-sheet',
  templateUrl: './invoice-sheet.component.html',
  styleUrls: ['./invoice-sheet.component.scss']
})
export class InvoiceSheetComponent {
  modalRef?: BsModalRef;
  monthlyPayments: any = ['Particulars', 'No of Days', 'Amounts (Rs)']
  projects: any;
  clients: any;
  others: '';
  showPdf = "";
  showImage = "";
  showMail: any;
  pdfOrNot;
  imageOrNot = "";
  options = { prefix: '', thousands: ',', decimal: '.', inputMode: CurrencyMaskInputMode.NATURAL }
  projectList = [];
  invoiceDetails = {
    invId: null,
    compEntity: null,
    consultantName: null,
    reportingManagerName: null,
    projectId: [],
    clientId: null,
    clientName: null,
    defaultPkg: null,
    projectName: null,
    submissionDate: null,
    submissionMonth: null,
    invoiceNo: null,
    particulars: '',
    noOfDays: null,
    invAmount: null,
    totalAmt: null,
    effectiveFromDate: null,
    effectiveToDate: null,
    invoiceStatus: keywords.underReview,
    reportingId: null,
    invoiceMonth: null,
    reviewer01Status: 'Pending',
    reviewer02Status: 'Pending',
    invoiceYear: null,
    paymentStatus: 'In Progress',
    totalAmount: 0,
    sar: 0,
    inr: 0,
    eur: 0,
    usd: 0,
    pkr: 0,
    expenses: [
      {
        particularId: null,
        name: '',
        amount: null,
        attachment: [],
        others: '',
        hours: '',
        noOfDays: null,
        amountcal: null,
        checkbox: null,
        particularType: 'expenses',
        comment: '',
        dates: [],
        otHourlyRate : '',
        expCurrency:null,
        expCurrencyRate: 0
      },
    ],
    deductions: [
      {
        particularId: null,
        name: '',
        amount: null,
        amountcal: null,
        noOfDays: 0,
        others: '',
        hours: 0,
        dates: [],
        comment: '',
        startDay: keywords.fromFull,
        endDay: keywords.toFull,
        particularType: 'deduction'
      },
    ],
    attendenceDetails: [],
    currencyRate: 0,
    transferCurrency: null,
    transferCountry: null,
    vendor: null,
  }
  noOfDaysCopy = 0;
  selectedDateAndMonth;


  userData: any;
  data: any
  gridView: boolean = false;
  pageConfig: any;
  selectedProjects = [];
  selectedClients = [];
  minDate;
  maxDate;
  userId: any;
  leapDays = 0;
  offshorePkgAnnum: any;
  onsitePkgAnnum: any;
  perDiem: any;
  perDiemTotalAmt = 0;
  onlyPerdiemFlag: boolean = false;
  minDate1 = new Date();
  maxDate1 = new Date();

  offshoreAndPerdiem: boolean = false;
  onsiteAndOffshore: boolean = false;
  offshoreOnly: boolean = false;
  offshorewithSar: boolean = false;
  onsiteOnly: boolean = false;
  isBackOrEdit: boolean = false;
  count = 0;
  dates = [];
  actionSignature;
  userEmail;
  hourlyRate  = 0;
  multiselect = {
    currencyType: ['INR (₹)', 'SAR ( ر.س)', 'USD ($)', 'PAK (PKR)', 'EUR (€)','Other']
  }
  constructor(private router: Router, private invoiceService: InvoiceService, private datepipe: DatePipe, private fileUploadService: FileUploadService, private modalService: BsModalService,
    private activeRoute: ActivatedRoute, private authService: AuthenticationService, private restApi: RestApiService, private store: StoreService, private toastr: ToastrService, private loader: LoaderService,
    private signatureService: SignatureService) {
    this.authService.currentUser.subscribe(d => {
      let lastName = d?.loginUserDetails?.lastName != null && d?.loginUserDetails?.lastName != undefined ? d?.loginUserDetails?.lastName : ''
      this.invoiceDetails.consultantName = d?.loginUserDetails?.firstName + ' ' + lastName, this.userData = d?.loginUserDetails;
      this.invoiceDetails.reportingManagerName = d?.loginUserDetails?.reportingManagerName;
      this.invoiceDetails.reportingId = d?.loginUserDetails?.reportingId;
      this.userId = d?.loginUserDetails.empId;
      this.userEmail = d?.loginUserDetails?.userEmailId

    });
    this.activeRoute.data.subscribe(d => {
      this.pageConfig = d.config;
    })
    this.actionSignature = signatureService.signPayload(this.userEmail);
  }

  heading: any
  currencyRate = 0;
  allcurrencyRate: any;
  currencyType;
  offshoreCurrencyType;
  url1 = '';
  isDisabled;
  disabledDates = [];
  dateSelected: any = [];
  offOrOnShoreDates: any = []
  offOrOnShoreDatesCopy: any = []
  selectedClass = [];
  flag = false;
  currencyConverterPage: any = null;
  dateCustomClasses: DatepickerDateCustomClasses[] = [];
  clientList = [];
  fixedOrFloat = 'floating';
  compensation;
  ngOnInit() {
    this.restApi.getSession(keywords.checkStatus, this.userEmail, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        this.invoiceService.selectedSub$.pipe(first()).subscribe(val => {
      this.invoiceDetails.vendor = this.pageConfig?.employee?.vendor?.vendorName || null;
      this.compensation = val == null ? this.pageConfig?.employee?.compEntity[0] : val?.compEntity;
      this.clientList = this.pageConfig?.projectRelatedToEmp?.filter((obj1, i, arr) =>
        arr.findIndex(obj2 => (obj2.clientId === obj1.clientId)) === i
      )
      console.log(this.compensation)
      // this.compensation.defaultPkg = this.compensation?.defaultPkg;
      // this.onsiteCurrency = this.compensation?.onsiteCurrency;
      // this.offshoreCurrency = this.compensation?.offshoreCurrency;
      this.fixedOrFloat = this.compensation?.packageType;
      this.offshorePkgAnnum = this.compensation?.offshorePkgAnnum != null ? decryptUsingAES256(this.compensation?.offshorePkgAnnum) : this.compensation?.offshorePkgAnnum;
      this.onsitePkgAnnum = this.compensation?.onsitePkgAnnum != null ? decryptUsingAES256(this.compensation?.onsitePkgAnnum) : this.compensation?.onsitePkgAnnum;
      this.perDiem = this.compensation?.perDiem != null ? decryptUsingAES256(this.compensation?.perDiem) : this.compensation?.perDiem;
      this.projectList = this.pageConfig?.projectRelatedToEmp;
      this.onlyPerdiemFlag = ((this.offshorePkgAnnum == null || this.offshorePkgAnnum == 0 || this.offshorePkgAnnum == '') && (this.onsitePkgAnnum == null || this.onsitePkgAnnum == 0 || this.onsitePkgAnnum == '') && (this.perDiem != null && this.perDiem != 0 && this.perDiem != "")) ? true : false
      this.offshoreAndPerdiem = ((this.offshorePkgAnnum != null && this.offshorePkgAnnum != 0 && this.offshorePkgAnnum != '') && (this.onsitePkgAnnum == null || this.onsitePkgAnnum == 0 || this.onsitePkgAnnum == '') && (this.perDiem != null && this.perDiem != 0 && this.perDiem != "")) ? true : false
      this.onsiteAndOffshore = ((this.offshorePkgAnnum != null && this.offshorePkgAnnum != 0 && this.offshorePkgAnnum != '') && (this.onsitePkgAnnum != null && this.onsitePkgAnnum != 0 && this.onsitePkgAnnum != '') && (this.perDiem == null || this.perDiem == 0 || this.perDiem == "")) ? true : false
      this.offshoreOnly = ((this.offshorePkgAnnum != null && this.offshorePkgAnnum != 0 && this.offshorePkgAnnum != '') && (this.onsitePkgAnnum == null || this.onsitePkgAnnum == 0 || this.onsitePkgAnnum == '') && (this.perDiem == null || this.perDiem == 0 || this.perDiem == "")) ? true : false
      this.onsiteOnly = ((this.offshorePkgAnnum == null || this.offshorePkgAnnum == 0 || this.offshorePkgAnnum == '') && (this.onsitePkgAnnum != null && this.onsitePkgAnnum != 0 && this.onsitePkgAnnum != '') && (this.perDiem == null || this.perDiem == 0 || this.perDiem == "")) ? true : false
      this.offshorewithSar = (this.compensation?.defaultPkg == keywords.offshore && this.compensation?.currency == 'SAR ( ر.س)') ? true : false
      this.invoiceDetails.expenses[0].checkbox = this.compensation?.defaultPkg;
      this.invoiceDetails.transferCurrency = this.compensation?.transferCurrency;
        this.invoiceDetails.transferCountry = this.compensation?.transferCountry;

        localStorage.removeItem('todo');
        this.minDate = new Date('2023-01-01')
        // new Date().getDate() < 26
        // Get the current date
        let curr;
        let currentDate;
        // Add four days
        let newDate;
        if (+this.compensation?.effectiveFromDate > + this.compensation?.effectiveToDate && +this.pageConfig?.employee?.invoiceDueDate > 0 && +this.pageConfig?.employee?.invoiceDueDays > 0) {
          curr = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + this.pageConfig?.employee?.invoiceDueDate;
          currentDate = new Date(curr);
          newDate = new Date(currentDate);
          newDate.setDate(currentDate.getDate() + +this.pageConfig?.employee?.invoiceDueDays);
        } else if (+this.compensation?.effectiveFromDate < + this.compensation?.effectiveToDate) {
          curr = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + this.pageConfig?.employee?.invoiceDueDate;
          currentDate = new Date(curr);
          newDate = new Date(currentDate);
          newDate.setDate(currentDate.getDate() + +this.pageConfig?.employee?.invoiceDueDays);
        }
        if (+this.pageConfig?.employee?.invoiceDueDate > 0 && +this.pageConfig?.employee?.invoiceDueDays > 0 && this.datepipe.transform(newDate, keywords.formateDateOnly) >= this.datepipe.transform(new Date(), keywords.formateDateOnly) && new Date().getDate() >= this.pageConfig?.employee?.invoiceDueDate) {
          this.maxDate = new Date(newDate)

        } else {
          const currentDate = new Date();
          const previousMonthDate = new Date(currentDate);
          previousMonthDate.setMonth(currentDate.getMonth() - 1);
          this.maxDate = new Date(previousMonthDate)
        }

        let year = new Date().getFullYear()
        if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
          this.leapDays = 366;
        } else {
          this.leapDays = 365;
        }
       
          this.flag = !this.flag;

          if (val != null) {
            this.isBackOrEdit = true;
            val.clientId = [...new Set(val.clientId)]
            this.invoiceDetails = val;
            this.invoiceDetails.submissionMonth = new Date(val?.submissionMonth)
            this.selectedDateAndMonth = this.invoiceDetails.submissionMonth;
            this.invoiceDetails.deductions.forEach(f => this.setMinMax(f.name))
            this.selectedClass = [];
            this.dateSelected = [];
            this.invoiceDetails.deductions?.forEach(f => {
              if (f.dates != null && f.dates?.length > 0) {
                f.dates[0] = new Date(f.dates[0]);
                f.dates[1] = new Date(f.dates[1]);
              }
            })
            if (this.selectedClass.length > 0) {
              setTimeout(() => {
                let str = ''
                this.selectedClass?.forEach((elem) => {
                  if (elem != null && elem != undefined && elem != 'Invalid Date') {
                    let date = this.datepipe.transform(new Date(elem.date), keywords.formateDateOnly)
                    str = str == '' ? str + date : str + ',' + date;
                    const input = (<HTMLInputElement>document.getElementById('deductDP')).value = str;
                  }
                })
              }, 1000)
            }
            setTimeout(() => {
              let clientSplit = this.invoiceDetails.clientId;
              let selectedClient = []


              this.pageConfig?.projectRelatedToEmp?.forEach(s => {
                clientSplit?.forEach(f => {
                  if (s.clientId == f) {
                    let index = selectedClient.findIndex(f => f.clientId == s.clientId)
                    index == -1 ? selectedClient.push(s) : '';
                  }
                })
              })
              if (selectedClient.length > 0) {
                this.invoiceDetails.clientId = selectedClient;
              }

              let projectSplit = this.invoiceDetails.projectId;
              let selectedProject = []
              this.pageConfig?.projectRelatedToEmp?.forEach(s => {
                projectSplit?.forEach(f => {
                  if (s.projectId == f) {
                    selectedProject.push(s);
                  }
                })
              })
              if (selectedProject.length > 0) {
                this.projectList = [...selectedProject]
                this.invoiceDetails.projectId = selectedProject
              }

            }, 2000)

            this.invoiceService.subjectReset$.pipe(first()).subscribe(d => {
              if (d == 'edit') {
               // this.currencyType = this.compensation?.currency != null && this.compensation?.currency != '' && this.compensation?.currency != undefined ? this.compensation?.currency : 'SAR ( ر.س)';
               this.currencyType = this.compensation?.onsiteCurrency ? this.compensation?.onsiteCurrency : null;
                this.offshoreCurrencyType = this.compensation?.currency ? this.compensation?.currency : null;
                
               if (this.offshoreCurrencyType == 'USD ($)') {
                  this.invoiceDetails.currencyRate = this.invoiceDetails.usd;
                } else if (this.offshoreCurrencyType == 'PAK (PKR)') {
                  this.invoiceDetails.currencyRate = this.invoiceDetails.pkr;
                } else if (this.offshoreCurrencyType == 'EUR (€)') {
                  this.invoiceDetails.currencyRate = this.invoiceDetails.eur;
                } else if (this.offshoreCurrencyType == 'INR (₹)') {
                  this.invoiceDetails.currencyRate = this.invoiceDetails.inr;
                } else if (this.offshoreCurrencyType == 'SAR ( ر.س)') {
                  this.invoiceDetails.currencyRate = this.invoiceDetails.sar;
                }else if (this.onlyPerdiemFlag) {
                  this.invoiceDetails.currencyRate = 1;
                }
              }
            })
          }
          this.disabledDates = []
        })
        if (this.invoiceDetails.invoiceStatus == 'Rejected') {
          this.invoiceDetails.invoiceStatus = keywords.underReview
          let split = this.invoiceDetails.invoiceNo?.includes('_') ? this.invoiceDetails.invoiceNo?.split('_') : this.invoiceDetails.invoiceNo;
          if (Array.isArray(split)) {
            let sum = +split[1] + +1
            this.invoiceDetails.invoiceNo = split[0] + '_' + sum;

          } else {
            this.invoiceDetails.invoiceNo = this.invoiceDetails.invoiceNo + '_1'
          }
          this.invoiceDetails.reportingId = this.userData?.reportingId;
          this.invoiceDetails.invId = null;
          this.invoiceDetails?.expenses?.forEach(p => {
            p.particularId = null;
            p.attachment?.forEach((a, index) => {
              delete a.particularId;
              delete a.fileId;
              if (a.fileType == 'image') {
                a.file = a.file.includes('data:image/png;base64,') ? a.file : 'data:image/png;base64,' + a.file;
              } else {
                a.file = a.file.includes('data:application/pdf;base64,') ? a.file : 'data:application/pdf;base64,' + a.file;
              }
            })

          })

        }
        // setTimeout(() => {
        //   if (this.compensation?.currency == 'USD ($)') {
        //     this.url1 = 'https://www.xe.com/currencyconverter/convert/?Amount=1&From=SAR&To=USD';
        //   } else if (this.compensation?.currency == 'PAK (PKR)') {
        //     this.url1 = 'https://www.xe.com/currencyconverter/convert/?Amount=1&From=SAR&To=PKR'
        //   } else if (this.compensation?.currency == 'EUR (€)') {
        //     this.url1 = 'https://www.xe.com/currencyconverter/convert/?Amount=1&From=SAR&To=EUR';
        //   } else if (this.compensation?.currency == 'INR (₹)') {
        //     this.url1 = 'https://www.xe.com/currencyconverter/convert/?Amount=1&From=SAR&To=INR';
        //   } else if (this.compensation?.currency == 'SAR ( ر.س)') {
        //     this.url1 = 'https://www.xe.com/currencyconverter/convert/?Amount=1&From=SAR&To=SAR';
        //   }

        //   let request = new XMLHttpRequest();
        //   request.open("GET", this.url1, true);
        //   request.onload = () => {
        //     this.currencyConverterPage = new DOMParser().parseFromString(request.responseText, 'text/html');
        //     //  document.querySelector('#content').innerHTML = doc.querySelector('h1').innerHTML;
        //   }
        //   request.send();
        //   setTimeout(() => {
        //     if (this.currencyConverterPage != null) {
        //       var body = this.currencyConverterPage.querySelector('body')

        //       var section = body.querySelector('section')


        //       var main = section.querySelector('main')


        //       var pList = main.querySelectorAll('p')
        //       pList[1].innerHTML
        //       var str = pList[1].innerHTML
        //       var str1 = str.split('<')
        //       this.invoiceDetails.currencyRate = +str1[0]
        //     }
        //   }, 2000)


        // }, 2000)
        setTimeout(() => {
          this.invoiceService.subjectReset$.pipe(first()).subscribe(d => {
            if (d != 'previous' && d != 'edit') {
                this.currencyType = this.compensation?.onsiteCurrency ? this.compensation?.onsiteCurrency : null;
                this.offshoreCurrencyType = this.compensation?.currency ? this.compensation?.currency : null;
                if (this.compensation?.currency == 'USD ($)' || this.compensation?.currency == 'PAK (PKR)' || this.compensation?.currency == 'EUR (€)' || this.compensation?.currency == 'INR (₹)' || this.compensation?.currency == 'SAR ( ر.س)' || this.compensation?.onsiteCurrency) {
                let currency = this.currencyType.split(' ')[0];
                currency = currency == "PAK" ? 'PKR' : currency;
                this.url1 = `https://open.er-api.com/v6/latest/${currency}`;
                
                this.restApi.getCurrency(this.url1).subscribe(d => {
             
                  if (this.offshoreCurrencyType == 'USD ($)') {
                  this.currencyRate = d?.rates?.USD;
                  this.invoiceDetails.usd = this.currencyRate
                  } else if (this.offshoreCurrencyType == 'PAK (PKR)') {
                  this.currencyRate = d?.rates?.PKR;
                  this.invoiceDetails.pkr = this.currencyRate
                  } else if (this.offshoreCurrencyType == 'EUR (€)') {
                  this.currencyRate = d?.rates?.EUR;
                  this.invoiceDetails.eur = this.currencyRate
                  } else if (this.offshoreCurrencyType == 'INR (₹)') {
                  this.currencyRate = d?.rates?.INR;
                  this.invoiceDetails.inr = this.currencyRate
                  } else if (this.offshoreCurrencyType == 'SAR ( ر.س)') {
                  this.currencyRate = d?.rates?.SAR;
                  this.invoiceDetails.sar = this.currencyRate
                  }else if (this.onlyPerdiemFlag) {
                    this.currencyRate = 1;
                  }
                  //this.currencyRate = this.currencyType == 'USD ($)' ? d?.rates?.USD : this.currencyType == 'PAK (PKR)' ? d?.rates?.PKR : this.currencyType == 'EUR (€)' ? d?.rates?.EUR : this.currencyType == 'INR (₹)' ? d?.rates?.INR : this.currencyType == 'SAR ( ر.س)' ? d?.rates?.SAR : '';
                  this.invoiceDetails.currencyRate = this.currencyRate
                  this.allcurrencyRate = d?.rates;
                })
              }
            }
          })
        }, 350)


        this.calculations();
        this.invoiceService.selectedSubReset$.subscribe(val => {
          if (val == 'resetA') {
            this.reset();
            this.invoiceService.setdocument(null);
          }
        })


        //  this.invoiceDetails.amount=120000
        if (this.invoiceDetails.submissionDate != null) {
          this.gridView = true
        } else {
          this.gridView = false;
        }
      } else {
        this.loader.hide();
        this.authService.logoutThroughAngular();
        this.toastr.error(o?.message)
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg));
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

  getProjectsSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: keywords.selectAllProject,
      primaryKey: 'projectId',
      labelKey: 'projectName',
      classes: 'projectclass',
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getClientsSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: keywords.selectAllClient,
      primaryKey: 'clientId',
      labelKey: 'clientName',
      classes: 'clientclass',
    }
    return Object.assign(commonSettings, specificSetting);
  }


  increment(particular) {
    this.restApi.getSession(keywords.checkStatus, this.userEmail, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        if (particular == 'deduction') {
          this.disabledDates = []
          this.invoiceDetails.deductions.forEach((d, i) => {
            d?.dates?.length > 0 && d?.name != keywords.onsite && d?.name != keywords.offshore ? this.disabledDatePush(d?.dates[0], d?.dates[1]) : ''
          })
          let index = this.invoiceDetails.deductions.findIndex(o => o.amount == null || o.dates?.length == 0 || o.noOfDays == 0 || o.comment == '');
          if (index > -1) {
            this.toastr.error('Please fill all deduction details');
            return;
          } else {
            const deductObj = {
              particularId: null,
              name: '',
              amount: null,
              amountcal: null,
              noOfDays: 0,
              others: '',
              hours: 0,
              dates: [],
              comment: '',
              startDay: keywords.fromFull,
              endDay: keywords.toFull,
              particularType: 'deduction'
            }
            this.dateSelected = [];
            this.selectedClass = []
            this.invoiceDetails.deductions.push(deductObj)
          }

        } else if (particular == 'expenses') {
          let index = this.invoiceDetails.expenses.findIndex(o => o.amount == '' || o.amount == null);
          let ot = this.invoiceDetails.expenses.filter(f => f.name == keywords.overTime && (f.otHourlyRate == null && f.otHourlyRate == '' && f.hours == null && f.hours == '' && f.hours == ''));
          let others = this.invoiceDetails.expenses.filter(f => f.name == keywords.others && (f.others == null || f.others == '' || f.amount == 0 || f.amount == '' || f.amount == null || f.expCurrency == null || f.expCurrencyRate == 0));
          if (index > -1 || others.length > 0 || ot.length > 0) {
            this.toastr.error('Please fill all expenses details')
          } else {
            const obj = {
              particularId: null,
              name: '',
              amount: null,
              totalSum: '',
              attachment: [],
              others: '',
              hours: '',
              noOfDays: '',
              amountcal: null,
              checkbox: this.compensation.defaultPkg,
              particularType: 'expenses',
              comment: null,
              dates: [],
              otHourlyRate : '',
              expCurrency:null,
              expCurrencyRate: 0
            };
            this.invoiceDetails.expenses.push(obj)
          }
        }
      } else {
        this.loader.hide();
        this.authService.logoutThroughAngular();
        this.toastr.error(o?.message)
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg));
  }


  decrement(particular) {
    this.restApi.getSession(keywords.checkStatus, this.userEmail, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        if (particular == 'deduction') {
          if (this.invoiceDetails.deductions.length > 1) {
            //Recalculate the first particular on decrement
            let pop = this.invoiceDetails.deductions.pop();
            // this.disabledDatePop(pop.dates[0],pop.dates[1])
            if (pop.name == keywords.onsite && this.compensation?.defaultPkg == keywords.offshore) {
              this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays + +pop.noOfDays;
              this.invoiceDetails.invAmount = this.compensation?.packageType == "floating" ? Math.round((this.offshorePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays)) : Math.round((this.offshorePkgAnnum / +12));
            } else if (pop.name == keywords.offshore && this.compensation?.defaultPkg == keywords.onsite) {
              this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays + +pop.noOfDays;
              this.invoiceDetails.invAmount = this.compensation?.packageType == "floating" ? Math.round((this.onsitePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays)) : Math.round((this.onsitePkgAnnum / +12));
            }
          } else if (this.invoiceDetails.deductions.length == 1) {
            // this.disabledDatePop(this.invoiceDetails.deductions[0].dates[0],this.invoiceDetails.deductions[0].dates[1])
            if (this.invoiceDetails.deductions[0].name == keywords.onsite && this.compensation?.defaultPkg == keywords.offshore) {
              this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays + +this.invoiceDetails.deductions[0].noOfDays;
              console.log("decrement", this.offshorePkgAnnum,this.invoiceDetails.noOfDays)
              this.invoiceDetails.invAmount = this.compensation?.packageType == "floating" ? Math.round((this.offshorePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays)) : Math.round((this.offshorePkgAnnum / +12));
            } else if (this.invoiceDetails.deductions[0].name == keywords.offshore && this.compensation?.defaultPkg == keywords.onsite) {
              this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays + +this.invoiceDetails.deductions[0].noOfDays;
              this.invoiceDetails.invAmount = this.compensation?.packageType == "floating" ? Math.round((this.onsitePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays)) : Math.round((this.onsitePkgAnnum / +12));
            }

        this.invoiceDetails.deductions[0] = {
          particularId: null,
          name: '',
          amount: null,
          amountcal: null,
          noOfDays: 0,
          others: '',
          hours: 0,
          dates: [],
          comment: '',
          startDay: keywords.fromFull,
          endDay: keywords.toFull,
          particularType: 'deduction'
        }

      }
    } else if (particular == 'expenses') {
      if (this.invoiceDetails.expenses.length > 1) {
        let pop = this.invoiceDetails.expenses.pop();
        let popFilter = pop.name == 'Perdiem' ? true : false;
        if (popFilter) {
          let expenseIndex = [];
          this.invoiceDetails.deductions.forEach((o, index) => o.name == keywords.onsitePdLeave ? expenseIndex.push(index) : (this.onlyPerdiemFlag && (o.name == keywords.otherAddition || o.name == keywords.otherDeduction)) ? expenseIndex.push(index) : '');
          // this.invoiceDetails.deductions.forEach((o, index) => o.name == keywords.onsitePdLeave ? expenseIndex.push(index) : '');

          if (expenseIndex.length > 0) {
            expenseIndex = expenseIndex.reverse();
            expenseIndex.forEach(f => {
              if (f == 0) {
                this.invoiceDetails.deductions[f] = {
                  particularId: null,
                  name: '',
                  amount: null,
                  amountcal: null,
                  noOfDays: 0,
                  others: '',
                  hours: 0,
                  dates: [],
                  comment: '',
                  startDay: keywords.fromFull,
                  endDay: keywords.toFull,
                  particularType: 'deduction'
                }
              } else if (f > 0) {
                this.invoiceDetails.deductions.splice(f, 1)
              }
              // f == 0 ? this.invoiceDetails.deductions[f] = deductionsObj : f > 0 ? this.invoiceDetails.deductions.splice(f,1) : ''
            })
          }
          //   expenseIndex == 0 ? this.invoiceDetails.deductions[expenseIndex] = deductionsObj : expenseIndex > 0 ? this.invoiceDetails.deductions.splice(expenseIndex,1) : '' 
        }

          } else if (this.invoiceDetails.expenses.length == 1) {
            let pop = this.invoiceDetails.expenses.filter(f => f.name == 'Perdiem');
            if (pop) {
              let expenseIndex = [];
              // this.invoiceDetails.deductions.forEach((o, index) => o.name == keywords.onsitePdLeave ? expenseIndex.push(index) : '');
              this.invoiceDetails.deductions.forEach((o, index) => o.name == keywords.onsitePdLeave ? expenseIndex.push(index) : (this.onlyPerdiemFlag && (o.name == keywords.otherAddition || o.name == keywords.otherDeduction)) ? expenseIndex.push(index) : '');
              if (expenseIndex.length > 0) {
                expenseIndex = expenseIndex.reverse();
                expenseIndex.forEach(f => {
                  if (f == 0) {
                    this.invoiceDetails.deductions[f] = {
                      particularId: null,
                      name: '',
                      amount: null,
                      amountcal: null,
                      noOfDays: 0,
                      others: '',
                      hours: 0,
                      dates: [],
                      comment: '',
                      startDay: keywords.fromFull,
                      endDay: keywords.toFull,
                      particularType: 'deduction'
                    }
                  } else if (f > 0) {
                    this.invoiceDetails.deductions.splice(f, 1)
                  }
                })
              }
            }
            this.invoiceDetails.expenses[0] = {
              particularId: null,
              name: '',
              amount: null,
              attachment: [],
              others: '',
              hours: '',
              noOfDays: null,
              amountcal: null,
              checkbox: this.compensation.defaultPkg,
              particularType: 'expenses',
              comment: null,
              dates: [],
              otHourlyRate : '',
              expCurrency:null,
              expCurrencyRate: 0,
            }
          }
        }
      } else {
        this.loader.hide();
        this.authService.logoutThroughAngular();
        this.toastr.error(o?.message)
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg));
  }


  route() {
    // this.router.navigate(['/rims/emp/travelExpenseEdit'])
  }

  completeTotalOfRows: any;
  completeDeductionRows: any;
  Save(invoiceSheetForm: NgForm) {
    this.restApi.getSession(keywords.checkStatus, this.userEmail, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        this.invoiceDetails.clientName = [];
        this.invoiceDetails.projectName = [];
        let deductionDays = this.invoiceDetails.deductions.filter(t => t.name == keywords.offUnLeave);
        let perdiemDays = this.invoiceDetails.expenses.filter(f => f.name == keywords.perDiem);
        let overTime = this.invoiceDetails.expenses.filter(f => f.name == keywords.overTime && (f.hours == null || f.hours == '' || f.otHourlyRate == null || f.otHourlyRate == ''));
        let dongleRecharge = this.invoiceDetails.expenses.filter(f => f.name == keywords.dongleRecharge && (f.amountcal == null || f.amountcal == '' || f.expCurrency == null || f.expCurrency == ''));
        let variablePay = this.invoiceDetails.expenses.filter(f => f.name == keywords.variablePay && (f.amount == null || f.amount == ''));
        let perdiem = this.invoiceDetails.expenses.filter(f => f.name == keywords.perdiem && (f.noOfDays == null || f.noOfDays == ''));
        let others = this.invoiceDetails.expenses.filter(f => f.name == keywords.others && (f.others == null || f.others == '' || f.amount == 0 || f.amount == '' || f.amount == null || f.expCurrency == null || f.expCurrency == '') );
        let deductionData = this.invoiceDetails.deductions.filter(f => (f.dates?.length == 0 || f.noOfDays == 0 || f.amount == null || f.comment == '')&& f.name != '');// 
        let name = this.invoiceDetails.expenses.filter(f => (f.name == '' || f.name == null || f.name == undefined) && f.attachment.length > 0);
        deductionDays = perdiemDays ? perdiemDays[0]?.noOfDays + deductionDays : deductionDays[0]?.noOfDays;
        if (this.invoiceDetails.clientId == null || this.invoiceDetails.clientId.length == 0 || this.invoiceDetails.projectId.length == 0 || this.invoiceDetails.projectId == null || this.invoiceDetails.invoiceMonth == null || this.invoiceDetails.invoiceMonth == "" || this.invoiceDetails.invoiceNo == null ||
          this.invoiceDetails.invoiceNo == "" || this.invoiceDetails.consultantName == null || this.invoiceDetails.reportingManagerName == null) {
          this.toastr.error("Please fill all mandatory fields");
          return;
        } else if ((deductionDays > this.invoiceDetails.noOfDays) && (this.offshorePkgAnnum == null || this.offshorePkgAnnum == 0) && (this.onsitePkgAnnum == null || this.onsitePkgAnnum == 0) && (this.perDiem != null && this.perDiem != 0)) {
          this.toastr.error("Perdiem days are more than total no. of days");
          return;
        }
        else if (overTime.length > 0 || dongleRecharge.length > 0 || variablePay.length > 0 || perdiem.length > 0 || others.length > 0 || name.length > 0) {
          this.toastr.error("Please fill all expenses row properly");
          return;
        } else if (deductionData.length > 0) {
          this.toastr.error("Please fill all deduction row properly");
          return;
        }
        else {
          this.loader.show();
          setTimeout(() => {
            // let preparedFilters = deepClone(this.invoiceDetails);
            Object.keys(this.invoiceDetails)?.forEach(o => {
              let obj = this.invoiceDetails[o];
              if (Array.isArray(obj)) {
                this.invoiceDetails[o] = obj.map(d => o != 'deductions' && o != 'expenses' && o != 'attendenceDetails' ? d[o] || d['name'] : d);
              }
            })

            this.invoiceDetails.clientId?.forEach(f => {
              this.clientList.filter(o => {
                f == o.clientId ? this.invoiceDetails.clientName.push(o.clientName) : ''
              })
            })

       this.invoiceDetails.projectId?.forEach(f =>{
        this.pageConfig?.projectRelatedToEmp.filter(o =>{
          f == o.projectId ? this.invoiceDetails.projectName.push(o.projectName) : ''
        })
       })
      this.invoiceDetails.submissionDate = this.datepipe.transform(this.invoiceDetails.submissionDate, keywords.formateDateOnly)
      this.invoiceDetails.clientId = this.invoiceDetails.clientId;
      this.invoiceDetails.projectId = this.invoiceDetails.projectId;
      this.invoiceDetails.clientName = this.invoiceDetails.clientName?.toString();
      this.invoiceDetails.projectName = this.invoiceDetails.projectName.toString();
      this.invoiceDetails.invoiceMonth = new Date(this.invoiceDetails.effectiveToDate).getMonth() + +1;

            // this.currencyType == 'USD ($)' ? this.invoiceDetails.usd = this.currencyRate : this.currencyType == 'PAK (PKR)' ? this.invoiceDetails.pkr = this.currencyRate : this.currencyType == 'EUR (€)' ? this.invoiceDetails.eur = this.currencyRate : this.currencyType == 'INR (₹)' ? this.invoiceDetails.inr = this.currencyRate : this.currencyType == 'SAR ( ر.س)' ? this.invoiceDetails.sar = this.currencyRate : '';
            this.invoiceDetails['perdiemFlag'] = ((this.offshorePkgAnnum == 0 || this.offshorePkgAnnum == null) && (this.onsitePkgAnnum == 0 || this.onsitePkgAnnum == null) && (this.perDiem != 0 && this.perDiem != null)) || ((this.offshorePkgAnnum != 0 && this.offshorePkgAnnum != null) && (this.onsitePkgAnnum == 0 || this.onsitePkgAnnum == null) && (this.perDiem != 0 && this.perDiem != null)) ? true : false;
            this.invoiceDetails['onlyPerdiemFlag'] = ((this.offshorePkgAnnum == 0 || this.offshorePkgAnnum == null) && (this.onsitePkgAnnum == 0 || this.onsitePkgAnnum == null) && (this.perDiem != 0 && this.perDiem != null)) ? true : false;
           this.invoiceDetails['pageConfig'] = this.pageConfig;
           this.invoiceDetails.compEntity = this.compensation;
            this.invoiceService.setdocument(this.invoiceDetails)
            this.router.navigate(['/attendanceTimesheet-component'], { queryParams: { pageId: "RES002" } });
          }, 3000)
        }
      } else {
        this.loader.hide();
        this.authService.logoutThroughAngular();
        this.toastr.error(o?.message)
      }
    });

  }

  totalSumFunction() {

    let sum = []
    this.invoiceDetails.expenses?.forEach((key: any) => {
      sum.push(key.amount)
      var total = sum.reduce((acc, cur) => acc + cur, 0);
      //key.totalSum= +key.amount 

    })
  }

  amountInWords: any
  sumOfIncome() {
    const numWords = require('num-words')
    let addrow = this.invoiceDetails.deductions.map(t => t.name == keywords.otherAddition || t.name == keywords.offshore || t.name == keywords.onsite ? t.amount : '').reduce((a, b) => +a + +b, 0);
    this.completeTotalOfRows = this.invoiceDetails.expenses.map(t => t.amount).reduce((a, b) => +a + +b, 0);
    this.completeDeductionRows = this.invoiceDetails.deductions.map(t => t.name == keywords.otherDeduction ||t.name == keywords.offUnLeave || t.name == keywords.onSiteUnLeave || t.name == keywords.partialInvoice ? t.amount : '').reduce((a, b) => +a + +b, 0);
    this.invoiceDetails.totalAmt = Math.round((+this.completeTotalOfRows + this.invoiceDetails?.invAmount) - +this.completeDeductionRows + addrow);
    this.amountInWords = numWords(this.invoiceDetails.totalAmt = Math.round(+this.completeTotalOfRows + +this.invoiceDetails?.invAmount - +this.completeDeductionRows + addrow))
    this.amountInWords = this.amountInWords.charAt(0).toUpperCase() + this.amountInWords.slice(1) + " only";
    this.invoiceDetails.totalAmount = Math.round(+this.completeTotalOfRows + this.invoiceDetails?.invAmount - +this.completeDeductionRows + addrow)
    return this.invoiceDetails.totalAmt = Math.round(+this.completeTotalOfRows + this.invoiceDetails?.invAmount - +this.completeDeductionRows + addrow)
  }

  onDateChange(date: any) {
    this.restApi.getSession(keywords.checkStatus, this.userEmail, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        this.invoiceService.gridView.next(false)
        this.invoiceService.reset(null)
        if (date != undefined && date != null && date != 'Invalid Date') {
          this.invoiceDetails.invoiceMonth = new Date(date).getMonth() + 1;
          this.invoiceDetails.submissionDate = this.datepipe?.transform(new Date(), keywords.formateDateOnly);
          this.invoiceDetails.invoiceYear = new Date(date).getMonth() + +1 + '-' + new Date(date).getFullYear()
          this.invoiceDetails.submissionMonth = date;
          this.selectedDateAndMonth = date
          this.calculations();
          let invoicePresent = false;
          let signature = this.signatureService.signPayload(this.userData?.empId)
          let encodeData = encodeURIComponent(signature);
          let url = ApiPaths.invoiceSubmitted + '/' + this.userData.empId + '/' + this.invoiceDetails.invoiceYear + "?signature=" + encodeData;
          this.loader.show();
          let config = keywords.config;
          this.restApi.getOrDeleteData(url, null, config).subscribe(inv => {
            this.loader.hide();
            invoicePresent = inv?.status == "SUCCESS" ? true : false;
            if (invoicePresent) {
              this.gridView = false;
              this.toastr.error(inv.message);
            } else {
              if (date != 'Invalid Date' && date != null) {
                this.invoiceDetails.deductions = [
                  {
                    particularId: null,
                    name: '',
                    amount: null,
                    amountcal: null,
                    noOfDays: 0,
                    others: '',
                    hours: 0,
                    dates: [],
                    comment: '',
                    startDay: keywords.fromFull,
                    endDay: keywords.toFull,
                    particularType: 'deduction'
                  },
                ],
                  this.invoiceDetails.expenses = [
                    {
                      particularId: null,
                      name: '',
                      amount: null,
                      attachment: [],
                      others: '',
                      hours: '',
                      noOfDays: null,
                      amountcal: null,
                      checkbox: this.compensation.defaultPkg,
                      particularType: 'expenses',
                      comment: '',
                      dates: [],
                      otHourlyRate : '',
                      expCurrency:null,
                      expCurrencyRate: 0
                    },
                  ],
                  this.invoiceDetails.attendenceDetails = [];
                date = this.datepipe.transform(new Date(date), keywords.formateDateOnly)
                let split = date.split('-');
                let currentDay: any = new Date().getDate();
                currentDay = currentDay < 10 ? '0' + currentDay : currentDay;
                let lastName = this.userData?.lastName != undefined && this.userData?.lastName != null ? this.userData.lastName?.substr(0, 1) : '';
                this.invoiceDetails.invoiceNo = this.userData.empId + ":" + split[0] + currentDay + split[1];
                this.gridView = true
              }
            }
          }, error => {
            this.loader.hide();
            this.toastr.error(error);
          });
        }
      } else {
        this.loader.hide();
        this.authService.logoutThroughAngular();
        this.toastr.error(o?.message)
      }
    });
  }

  reset() {
    this.restApi.getSession(keywords.checkStatus, this.userEmail, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        this.invoiceDetails = {
          invId: null,
          compEntity: null,
          consultantName: this.invoiceDetails.consultantName,
          defaultPkg: null,
          reportingManagerName: this.invoiceDetails.reportingManagerName,
          projectId: null,
          clientId: null,
          clientName: null,
          projectName: null,
          submissionDate: null,
          invoiceNo: null,
          particulars: this.invoiceDetails.particulars,
          noOfDays: this.invoiceDetails.noOfDays,
          invAmount: this.invoiceDetails.invAmount,
          reportingId: this.invoiceDetails.reportingId,
          invoiceMonth: null,
          reviewer01Status: 'Pending',
          reviewer02Status: 'Pending',
          submissionMonth: null,
          invoiceYear: null,
          paymentStatus: 'In Progress',
          totalAmount: 0,
          sar: this.invoiceDetails.sar,
          inr: this.invoiceDetails.inr,
          eur: this.invoiceDetails.eur,
          usd: this.invoiceDetails.usd,
          pkr: this.invoiceDetails.pkr,
          expenses: [
            {
              particularId: null,
              name: '',
              amount: null,
              attachment: [],
              others: '',
              hours: '',
              noOfDays: null,
              amountcal: null,
              checkbox: this.compensation.defaultPkg,
              particularType: 'expenses',
              comment: null,
              dates: [],
              otHourlyRate : '',
              expCurrency:null,
              expCurrencyRate: 0
            }
          ],
          deductions: [
            {
              particularId: null,
              name: '',
              amount: null,
              amountcal: null,
              noOfDays: 0,
              others: '',
              hours: 0,
              dates: [],
              comment: '',
              startDay: keywords.fromFull,
              endDay: keywords.toFull,
              particularType: 'deduction'
            }
          ],
          totalAmt: null,
          effectiveFromDate: null,
          effectiveToDate: null,
          invoiceStatus: keywords.underReview,
          attendenceDetails: [],
          currencyRate: this.invoiceDetails.currencyRate,
          transferCurrency: this.invoiceDetails?.transferCurrency,
          transferCountry: this.invoiceDetails?.transferCountry,
          vendor: null,
        }
        this.gridView = false;
        this.store.gridRowData.next(null);
        this.selectedClass = [];
        this.dateSelected = [];
        this.invoiceService.setdocument(null)
        this.disabledDates = [];
        this.offOrOnShoreDatesCopy = [];
        this.minDate1 = new Date();
        this.maxDate1 = new Date();
        //this.perDiem = this.compensation?.perDiem != null ? decryptUsingAES256(this.compensation?.perDiem) : this.compensation?.perDiem;
      } else {
        this.authService.logoutThroughAngular();
        this.toastr.error(o?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg));
  }

  shortLink: string = ''; // Variable to store shortLink from api response
  loading: boolean = false; // Flag variable
  file: File = null; // Variable to store file to Upload

  // On file Select
  onChange(index) {

    this.invoiceDetails.expenses[index].amount = 0;
    this.invoiceDetails.expenses[index].amountcal = 0;
    this.invoiceDetails.expenses[index].expCurrency = null;
    this.invoiceDetails.expenses[index].expCurrencyRate = 0;
    this.invoiceDetails.expenses[index].attachment = [];
    this.invoiceDetails.expenses[index].otHourlyRate = '';
    this.invoiceDetails.expenses[index].hours = '';
    this.invoiceDetails.expenses[index].comment = '';
    let variablePay = this.invoiceDetails.expenses.filter(f => f.name == 'Variable Pay');
    let dongleRecharge = this.invoiceDetails.expenses.filter(f => f.name == 'Dongle Recharge');
    let overtimeFilter = this.invoiceDetails.expenses.filter(f => f.name == 'Overtime');
    if (variablePay.length > 1 || (this.onlyPerdiemFlag && (dongleRecharge.length > 1 || overtimeFilter.length > 1)) || (this.offshorewithSar && dongleRecharge.length > 1 ) || (this.offshoreOnly && (dongleRecharge.length > 1 || overtimeFilter.length > 1)) || (this.onsiteOnly && (dongleRecharge.length > 1 || overtimeFilter.length > 1)) || (this.offshoreAndPerdiem && (dongleRecharge.length > 2 || overtimeFilter.length > 2)) || (this.onsiteAndOffshore && (dongleRecharge.length > 2 || overtimeFilter.length > 2))) {
      variablePay.length > 1 ? this.toastr.error("Variable Pay already selected!") : (dongleRecharge.length > 1 && this.invoiceDetails.expenses[index].name == keywords.dongleRecharge) ? this.toastr.error("Dongle Recharge already selected!") : (overtimeFilter.length > 1 && this.invoiceDetails.expenses[index].name == keywords.overTime) ? this.toastr.error("Overtime already selected!") : ''
      this.invoiceDetails.expenses[index] = {
        particularId: null,
        name: '',
        amount: null,
        attachment: [],
        others: '',
        hours: '',
        noOfDays: null,
        amountcal: null,
        checkbox: this.invoiceDetails?.expenses[index].checkbox,
        particularType: 'expenses',
        comment: null,
        dates: [],
        otHourlyRate : '',
        expCurrency:null,
        expCurrencyRate: 0
      }
      return;
    }
    if ((this.offshorePkgAnnum == 0 || this.offshorePkgAnnum == null) && (this.onsitePkgAnnum == 0 || this.onsitePkgAnnum == null) && (this.perDiem != 0 && this.perDiem != null)) {
      // this.invoiceDetails.expenses[index].noOfDays = this.invoiceDetails.noOfDays;
      // this.calculatePerdiem(this.invoiceDetails.expenses[index].noOfDays, index)
    } else {
      this.invoiceDetails.expenses[index].amount = 0;
      this.invoiceDetails.expenses[index].amountcal = null;
    }

    //  this.amountCal = 0
    // this.file = event.target.files[0];
    // this.onUpload()
  }

  url: any = '';
  myFiles: string[] = [];
  onSelectFile(e, index) {
    this.restApi.getSession(keywords.checkStatus, this.userData?.userEmailId, this.actionSignature).subscribe(async d => {
      if (d?.isValid) {
        for (let i = 0; i < e.target.files.length; i++) {
          if (e.target.files[i].size > 1048576) { // 1 MB = 1048576 bytes
            this.toastr.error('File size should not exceed 1 MB');
            return;
          }
          else if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'message/rfc822'].includes(e.target.files[i].type)) {
            this.toastr.error('Only PDF, JPG, and EML files are allowed.');
            return;
          }
          if (e.target.files[i].type == 'message/rfc822') {
            let reader = new FileReader();
            reader.readAsText(e.target.files[i]);
            reader.onload = (event2) => {
              // this.pdfSrc = "";
              let file = { file: '', fileType: 'message' }
              file.file = reader.result.toString()
              this.invoiceDetails.expenses[index].attachment.push(file);
            };

          } else {
            let reader = new FileReader();
            reader.readAsDataURL(e.target.files[i]);
            reader.onload = (event2) => {
              // this.pdfSrc = "";

              let split = (<string>reader.result).split(',');
              let file = { file: '', fileType: null }
              file.fileType = split[0] == 'data:application/pdf;base64' ? 'pdf' : 'image';
              file.file = reader.result.toString()

              this.invoiceDetails.expenses[index].attachment.push(file);
            };
          }
        }

      } else {
        this.authService.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))
  }

  openReasonModal(template: TemplateRef<any>, index, fileIndex) {

    this.restApi.getSession(keywords.checkStatus, this.userData?.userEmailId, this.actionSignature).subscribe(async d => {
      if (d?.isValid) {
        for (let i = 0; i < this.invoiceDetails.expenses[index].attachment.length; i++) {
          this.showPdf = '';
          this.showImage = '';
          this.showMail = ''
          this.pdfOrNot = this.invoiceDetails.expenses[index].attachment[fileIndex].fileType;

          if (this.pdfOrNot == 'pdf') {

            if (this.invoiceDetails.invId == null) {
              let split = this.invoiceDetails.expenses[index].attachment[fileIndex].file.includes(',') ? this.invoiceDetails.expenses[index].attachment[fileIndex].file.split(',') : this.invoiceDetails.expenses[index].attachment[fileIndex].file;
              if (Array.isArray(split)) {
                this.loader.show();
                var blob = this.b64toBlob(split[1]);
              } else {
                this.loader.show();
                var blob = this.b64toBlob(this.invoiceDetails.expenses[index].attachment[fileIndex].file);
              }

            } else {
              let split = this.invoiceDetails.expenses[index].attachment[fileIndex].file.includes(',') ? this.invoiceDetails.expenses[index].attachment[fileIndex].file.split(',') : this.invoiceDetails.expenses[index].attachment[fileIndex].file;
              this.loader.show();
              if (Array.isArray(split)) {
                this.loader.show();
                var blob = this.b64toBlob(split[1]);
              } else {
                this.loader.show();
                var blob = this.b64toBlob(this.invoiceDetails.expenses[index].attachment[fileIndex].file);
              }
              //var blob = this.b64toBlob(this.invoiceDetails.expenses[index].attachment[fileIndex].file);
            }
            this.showPdf = window.URL.createObjectURL(blob);
            this.modalRef = this.modalService.show(template);
          } else if (this.pdfOrNot == 'message') {
            if (this.invoiceDetails.invId == null) {
              //  let mail = new DOMParser().parseFromString(this.invoiceDetails.expenses[index].attachment[fileIndex].file, "text/html");

                if (this.invoiceDetails.expenses[index].attachment[fileIndex].file.startsWith('data:')) {
                const base64Data = this.invoiceDetails.expenses[index].attachment[fileIndex].file.split(',')[1];
                const decodedData = atob(base64Data);
                this.showMail = await PostalMime.parse(decodedData);
                } else {
                this.showMail = await PostalMime.parse(this.invoiceDetails.expenses[index].attachment[fileIndex].file);
                }
              this.modalRef = this.modalService.show(template);
            } else {
              if (this.invoiceDetails.expenses[index].attachment[fileIndex].fileId == null || this.invoiceDetails.expenses[index].attachment[fileIndex].fileId == 0 || this.invoiceDetails.expenses[index].attachment[fileIndex].fileId == "") {
                this.showMail = await PostalMime.parse(this.invoiceDetails.expenses[index].attachment[fileIndex].file);
              } else {
                const base64Data = this.invoiceDetails.expenses[index].attachment[fileIndex].file;
                const decodedData = base64Data.startsWith('data:') ? atob(base64Data.split(',')[1]) : atob(base64Data);
                this.showMail = await PostalMime.parse(decodedData);
              }
              this.modalRef = this.modalService.show(template);
            }

          }
          else {
            if (this.invoiceDetails.invId == null) {
              this.pdfOrNot == ''
              this.showImage = this.invoiceDetails?.expenses[index].attachment[fileIndex].file;

            } else {
              this.pdfOrNot == ''
              if (this.invoiceDetails?.expenses[index].attachment[fileIndex].file.includes('data:image/png;base64,')) {
                this.showImage = this.invoiceDetails?.expenses[index].attachment[fileIndex].file
              } else {
                this.showImage = 'data:image/png;base64,' + this.invoiceDetails?.expenses[index].attachment[fileIndex].file;
              }

              if (this.invoiceDetails?.expenses[index].attachment[fileIndex].file.includes('data:image/jpeg;base64,')) {
                this.showImage = this.invoiceDetails?.expenses[index].attachment[fileIndex].file
              } else if(!this.showImage.includes('data:image/png;base64,')){
                this.showImage = 'data:image/jpeg;base64,' + this.invoiceDetails?.expenses[index].attachment[fileIndex].file;
              }
              // this.showImage = this.invoiceDetails?.expenses[index].attachment[fileIndex].file.includes('data:image/png;base64,') ? this.invoiceDetails?.expenses[index].attachment[fileIndex].file : 'data:image/png;base64,' + this.invoiceDetails?.expenses[index].attachment[fileIndex].file;
            }
            this.modalRef = this.modalService.show(template);

          }
        }
      } else {
        this.authService.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))


  }
  hideModal() {
    this.modalService.hide()
  }
  num: string
  numFormatted(num: string) {
    let commaSeperator = document.getElementById('noformat')

    let formattedNum = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    num = formattedNum
    this.num = formattedNum
    return num;
    // this.num = 
  }


  currency: any

  cancelImage(index, fileIndex) {
    this.invoiceDetails.expenses[index].attachment.splice(fileIndex, 1);
  }

  onHourChange(noOfOvertimeHour, index) {
    let otHourlyRate = +this.invoiceDetails.expenses[index].otHourlyRate;
    // Only perdiem case
    if ((this.offshorePkgAnnum == null || this.offshorePkgAnnum == 0 || this.offshorePkgAnnum == '') && (this.onsitePkgAnnum == null || this.onsitePkgAnnum == 0 || this.onsitePkgAnnum == '') && (this.perDiem != null && this.perDiem != 0 && this.perDiem != '')) {
      if (this.invoiceDetails.expenses[index].checkbox == keywords.offshore) {
        let hourAmt = this.perDiem / 8
        this.invoiceDetails.expenses[index].amount = Math.round(hourAmt * noOfOvertimeHour * otHourlyRate);
      } else if (this.invoiceDetails.expenses[index].checkbox == keywords.onsite) {
        let hourAmt = this.perDiem / 8
        hourAmt = hourAmt * this.invoiceDetails.currencyRate
        this.invoiceDetails.expenses[index].amount = Math.round(hourAmt * noOfOvertimeHour * otHourlyRate);
      }
    }//Offshore + Perdiem 
    else if ((this.offshorePkgAnnum != null && this.offshorePkgAnnum != 0 && this.offshorePkgAnnum != '') && (this.onsitePkgAnnum == null || this.onsitePkgAnnum == 0 || this.onsitePkgAnnum == '') && (this.perDiem != null && this.perDiem != 0 && this.perDiem != '')) {
      //let dayAmt = +this.perDiem / +this.invoiceDetails.noOfDays
      if (this.invoiceDetails.expenses[index].checkbox == keywords.offshore) {
        let dayAmt = +this.invoiceDetails.invAmount / +this.invoiceDetails.noOfDays
        let hourAmt = dayAmt / 8
        this.invoiceDetails.expenses[index].amount = Math.round(hourAmt * noOfOvertimeHour * otHourlyRate)
      } else if (this.invoiceDetails.expenses[index].checkbox == keywords.onsite) {
        let hourAmt = this.perDiem / 8
        hourAmt = hourAmt * this.invoiceDetails.currencyRate
        this.invoiceDetails.expenses[index].amount = Math.round(hourAmt * noOfOvertimeHour * otHourlyRate)
      }

    }
    else {
      if (this.compensation.defaultPkg == keywords.offshore) {
        if (this.invoiceDetails.expenses[index].checkbox == keywords.offshore) {
          let dayAmt = +this.invoiceDetails.invAmount / +this.invoiceDetails.noOfDays;
          let hourAmt = dayAmt / 8
          this.invoiceDetails.expenses[index].amount = Math.round(hourAmt * noOfOvertimeHour * otHourlyRate)
        } else if (this.invoiceDetails.expenses[index].checkbox == keywords.onsite) {
          let offAmt = this.onsitePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays;
          let dayAmt = this.fixedOrFloat == keywords.fixed ? ((this.onsitePkgAnnum / 12) / this.noOfDaysCopy) : offAmt / +this.invoiceDetails.noOfDays
          let hourAmt = dayAmt / 8
          hourAmt = hourAmt * this.invoiceDetails.currencyRate
          this.invoiceDetails.expenses[index].amount = Math.round(hourAmt * noOfOvertimeHour * otHourlyRate)

          //  this.invoiceDetails.expenses[index].amount = (hourAmt * noOfOvertimeHour);
        }
      } else if (this.compensation.defaultPkg == keywords.onsite) {
        let dayAmt = this.fixedOrFloat == keywords.fixed ? ((this.onsitePkgAnnum / 12) / this.noOfDaysCopy) : (this.onsitePkgAnnum  / +this.leapDays )
        let hourAmt = dayAmt / 8
         hourAmt =  !this.onlyPerdiemFlag ? hourAmt : hourAmt  / this.invoiceDetails.currencyRate 
         this.invoiceDetails.expenses[index].amount = hourAmt * noOfOvertimeHour * otHourlyRate
      }


    }

  }
  onHourlyRateChange(index) {
    this.onHourChange(this.invoiceDetails.expenses[index].hours, index)
  }
  calculatePerdiem(dates, index) {
    let onsiteIndex = this.invoiceDetails.deductions.filter(f => f.name == keywords.onsitePdLeave);
    if (onsiteIndex.length > 0) {

    }
    if (dates.length > 0 && this.pageConfig?.employee.defaultPkg == keywords.onsite) {
      this.invoiceDetails.expenses[index].noOfDays = this.calculateDifferentDays(dates);
      this.invoiceDetails.expenses[index].amountcal = Math.round(this.perDiem * +this.invoiceDetails.expenses[index].noOfDays);
      this.invoiceDetails.expenses[index].amount = Math.round(this.perDiem * +this.invoiceDetails.expenses[index].noOfDays);
      this.invoiceDetails.expenses[index].comment = 'Onsite-Perdiem'
    }else if (dates.length > 0  && this.pageConfig?.employee.defaultPkg == keywords.offshore) {
      this.invoiceDetails.expenses[index].noOfDays = this.calculateDifferentDays(dates);
      this.invoiceDetails.expenses[index].amountcal = Math.round(this.perDiem * this.invoiceDetails.currencyRate * +this.invoiceDetails.expenses[index].noOfDays);
      this.invoiceDetails.expenses[index].amount = Math.round(this.perDiem * this.invoiceDetails.currencyRate * +this.invoiceDetails.expenses[index].noOfDays);
      this.invoiceDetails.expenses[index].comment = 'Onsite-Perdiem'
    }
  }
  calculateoffOrOnsite(amount, index) {
    //offshore onshore dongle recharge and others calculation
    this.invoiceDetails.expenses[index].amount = this.invoiceDetails.expenses[index].amountcal
    if (this.invoiceDetails.expenses[index].checkbox == keywords.offshore && this.compensation.defaultPkg == keywords.offshore) {
      this.invoiceDetails.expenses[index].amount = this.invoiceDetails.expenses[index].amountcal
    } else if (this.invoiceDetails.expenses[index].checkbox == keywords.onsite && this.compensation.defaultPkg == keywords.offshore) {
      this.invoiceDetails.expenses[index].amount = +this.invoiceDetails.expenses[index].amountcal * this.invoiceDetails.currencyRate
    } else if (this.invoiceDetails.expenses[index].checkbox == keywords.offshore && this.compensation .defaultPkg == keywords.onsite) {
      this.invoiceDetails.expenses[index].amount = this.invoiceDetails.expenses[index].amountcal / this.invoiceDetails.currencyRate
    } else if (this.invoiceDetails.expenses[index].checkbox == keywords.onsite && this.compensation.defaultPkg == keywords.onsite) {
      this.invoiceDetails.expenses[index].amount = +this.invoiceDetails.expenses[index].amountcal
    }

    //Calculating overtime based on Onshore and offshore
    if (this.invoiceDetails.expenses[index].checkbox == keywords.offshore && this.compensation.defaultPkg == keywords.offshore && this.invoiceDetails.expenses[index].name == "Overtime") {
      this.onHourChange(this.invoiceDetails.expenses[index].hours, index)
    } else if (this.invoiceDetails.expenses[index].checkbox == keywords.onsite && this.compensation.defaultPkg == keywords.offshore && this.invoiceDetails.expenses[index].name == "Overtime") {
      this.onHourChange(this.invoiceDetails.expenses[index].hours, index)
      // this.invoiceDetails.expenses[index].amount = +this.invoiceDetails.expenses[index].amount * this.invoiceDetails.currencyRate
    } else if (this.invoiceDetails.expenses[index].checkbox == keywords.offshore && this.compensation.defaultPkg == keywords.onsite && this.invoiceDetails.expenses[index].name == "Overtime") {
      this.onHourChange(this.invoiceDetails.expenses[index].hours, index)
      // this.invoiceDetails.expenses[index].amount = this.invoiceDetails.expenses[index].amount / this.invoiceDetails.currencyRate
    } else if (this.invoiceDetails.expenses[index].checkbox == keywords.onsite && this.compensation.defaultPkg == keywords.onsite && this.invoiceDetails.expenses[index].name == "Overtime") {
      this.onHourChange(this.invoiceDetails.expenses[index].hours, index)
    }
  }
  calculateAmmt() {
    if (this.compensation.defaultPkg == keywords.onsite) {
      this.invoiceDetails.invAmount = Math.round((this.onsitePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays));
    } else {
      this.invoiceDetails.invAmount = Math.round((this.offshorePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays));
    }


  }
  b64toBlob(b64Data) {
    this.loader.hide()
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: "application/pdf" });
    return blob;
  }

  //if particulars are same
  calculations() {
    // && this.invoiceDetails.invoiceMonth != null && isNaN(this.invoiceDetails.invoiceMonth)
    if (this.compensation?.effectiveFromDate != null && this.invoiceDetails.invoiceMonth != null && this.invoiceDetails.invoiceMonth != undefined && !isNaN(this.invoiceDetails.invoiceMonth)) {
      this.invoiceDetails.particulars = this.pageConfig?.employee.particular == keywords.onsite ? 'IT Consultancy Service (Onsite) for the period ' : 'IT Consultancy Service (Offshore) for the period ';
   
      if (+this.compensation?.effectiveFromDate < +this.compensation?.effectiveToDate) {
        let fromdate = new Date(new Date(this.selectedDateAndMonth).getFullYear() + '-' + this.invoiceDetails.invoiceMonth + '-' + this.compensation?.effectiveFromDate);
        let todate = new Date(new Date(this.selectedDateAndMonth).getFullYear(), this.invoiceDetails.invoiceMonth, 0)
        const date1Modified = new Date(fromdate);
        const date2Modified = new Date(todate);
        const time = date2Modified.getTime() - date1Modified.getTime();
        this.invoiceDetails.noOfDays = Math.round((date2Modified.getTime() - date1Modified.getTime()) / (1000 * 60 * 60 * 24));
        this.invoiceDetails.noOfDays = this.invoiceDetails.noOfDays + 1;
        this.noOfDaysCopy = this.invoiceDetails.noOfDays;
        //recalculate noOf days if there is offshore or onsite is selected
        this.invoiceService.subjectReset$.subscribe(d => {
          if (d == 'edit' || d == 'previous') {
            let count = this.invoiceDetails.deductions.map(t => t.name == keywords.offshore || t.name == keywords.onsite ? t.noOfDays : '').reduce((a, b) => +a + +b, 0);
            this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays - +count;
          }
        })
        this.invoiceDetails.effectiveFromDate = new Date(fromdate);
        this.invoiceDetails.effectiveToDate = new Date(todate);
        this.invoiceDetails.particulars = this.invoiceDetails.particulars + " " + this.datepipe?.transform(fromdate, keywords.formateDateOnly) + " to " + this.datepipe?.transform(todate, keywords.formateDateOnly)

      } else if (+this.compensation?.effectiveFromDate > + this.compensation?.effectiveToDate) {
        let fromdate = null;
        let todate = null;
        //This condition is for january of current year
        if (new Date(this.selectedDateAndMonth).getMonth() == 0 && new Date(this.selectedDateAndMonth).getFullYear() == new Date().getFullYear()) {
          fromdate = (new Date(this.invoiceDetails.submissionDate).getFullYear() - 1 + '-' + 12 + '-' + this.compensation?.effectiveFromDate);
          todate = (new Date(this.invoiceDetails.submissionDate).getFullYear() + '-' + this.invoiceDetails.invoiceMonth + '-' + this.compensation?.effectiveToDate);
        } 
        //previous year with january month
        else if (new Date(this.selectedDateAndMonth).getMonth() == 0 && new Date(this.selectedDateAndMonth).getFullYear() < new Date().getFullYear()) {
          fromdate = (new Date(this.selectedDateAndMonth).getFullYear() - 1 + '-' + 12 + '-' + this.compensation?.effectiveFromDate);
          todate = (new Date(this.selectedDateAndMonth).getFullYear() + '-' + this.invoiceDetails.invoiceMonth + '-' + this.compensation?.effectiveToDate);
        } 
        //previous year
        else if (new Date(this.selectedDateAndMonth).getFullYear()  < new Date().getFullYear()) {
          fromdate = (new Date(this.selectedDateAndMonth).getFullYear() + '-' + (this.invoiceDetails.invoiceMonth - 1) + '-' + this.compensation?.effectiveFromDate);
          todate = (new Date(this.selectedDateAndMonth).getFullYear() + '-' + this.invoiceDetails.invoiceMonth + '-' + this.compensation?.effectiveToDate);
        } else {
          fromdate = (new Date(this.invoiceDetails.submissionDate).getFullYear() + '-' + (this.invoiceDetails.invoiceMonth - 1) + '-' + this.compensation?.effectiveFromDate);
          todate = (new Date(this.invoiceDetails.submissionDate).getFullYear() + '-' + this.invoiceDetails.invoiceMonth + '-' + this.compensation?.effectiveToDate);
        }


        const date1Modified = new Date(fromdate);
        const date2Modified = new Date(todate);
        const time = date2Modified.getTime() - date1Modified.getTime();
        this.invoiceDetails.noOfDays = Math.round((date2Modified.getTime() - date1Modified.getTime()) / (1000 * 60 * 60 * 24));
        this.invoiceDetails.noOfDays = this.invoiceDetails.noOfDays + 1;
        this.noOfDaysCopy = this.invoiceDetails.noOfDays;
        this.invoiceService.subjectReset$.subscribe(d => {
          if (d == 'edit' || d == 'previous') {
            let count = this.invoiceDetails.deductions.map(t => t.name == keywords.offshore || t.name == keywords.onsite ? t.noOfDays : '').reduce((a, b) => +a + +b, 0);
            this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays - +count;
          }
        })
        this.invoiceDetails.effectiveFromDate = new Date(fromdate);
        this.invoiceDetails.effectiveToDate = new Date(todate);
        this.invoiceDetails.particulars = this.invoiceDetails.particulars + " " + this.datepipe?.transform(fromdate, keywords.formateDateOnly) + " to " + this.datepipe?.transform(todate, keywords.formateDateOnly)
      }
      if (this.onsitePkgAnnum != null && this.onsitePkgAnnum != '' && this.compensation.defaultPkg == keywords.onsite) {
        if (new Date(this.invoiceDetails.submissionDate).getFullYear() == new Date(this.pageConfig.employee?.dateOfJoining).getFullYear() && this.invoiceDetails.invoiceMonth == new Date(this.pageConfig.employee?.dateOfJoining).getMonth() + 1 && !isNaN(this.invoiceDetails.noOfDays)) {
          let fromdate = new Date(new Date(this.selectedDateAndMonth).getFullYear() + '-' + this.invoiceDetails.invoiceMonth + '-' + this.compensation?.effectiveFromDate);
          let todate = new Date(new Date(this.selectedDateAndMonth).getFullYear(), this.invoiceDetails.invoiceMonth, this.compensation?.effectiveToDate)
          const date1 = new Date(fromdate);
          const date2 = new Date(todate);
          const time = date2.getTime() - date1.getTime();
          let noOfDays = Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
          this.invoiceDetails.noOfDays = this.invoiceDetails.noOfDays + noOfDays;
          this.noOfDaysCopy = this.invoiceDetails.noOfDays;
          // this.invoiceDetails.invAmount = Math.round((this.onsitePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays));
        }
        this.fixedOrFloat == 'fixed' ? this.invoiceDetails.invAmount = Math.round((this.onsitePkgAnnum / 12)) : this.invoiceDetails.invAmount = Math.round((this.onsitePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays));
      } else if (this.offshorePkgAnnum != null && this.offshorePkgAnnum != '' && this.compensation.defaultPkg == keywords.offshore) {
        if (new Date(this.invoiceDetails.submissionDate).getFullYear() == new Date(this.pageConfig.employee?.dateOfJoining).getFullYear() && this.invoiceDetails.invoiceMonth == new Date(this.pageConfig.employee?.dateOfJoining).getMonth() + 1 && !isNaN(this.invoiceDetails.noOfDays)) {
          let fromdate = new Date(new Date(this.selectedDateAndMonth).getFullYear() + '-' + this.invoiceDetails.invoiceMonth + '-' + this.compensation?.effectiveFromDate);
          let todate = new Date(new Date(this.selectedDateAndMonth).getFullYear(), this.invoiceDetails.invoiceMonth, this.compensation?.effectiveToDate)
          const date1 = new Date(fromdate);
          const date2 = new Date(todate);
          const time = date2.getTime() - date1.getTime();
          let noOfDays = Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
          this.invoiceDetails.noOfDays = this.invoiceDetails.noOfDays + noOfDays;
          this.noOfDaysCopy = this.invoiceDetails.noOfDays;
          // this.invoiceDetails.invAmount = Math.round((this.onsitePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays));
        }
        this.fixedOrFloat == 'fixed' ? this.invoiceDetails.invAmount = Math.round((this.offshorePkgAnnum / 12)) : this.invoiceDetails.invAmount = Math.round((this.offshorePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays));
      } else if (this.offshorePkgAnnum == null && this.onsitePkgAnnum == null && this.perDiem != null) {
        if (new Date(this.invoiceDetails.submissionDate).getFullYear() == new Date(this.pageConfig.employee?.dateOfJoining).getFullYear() && this.invoiceDetails.invoiceMonth == new Date(this.pageConfig.employee?.dateOfJoining).getMonth() + 1 && !isNaN(this.invoiceDetails.noOfDays)) {
          let fromdate = new Date(new Date(this.selectedDateAndMonth).getFullYear() + '-' + this.invoiceDetails.invoiceMonth + '-' + this.compensation?.effectiveFromDate);
          let todate = new Date(new Date(this.selectedDateAndMonth).getFullYear(), this.invoiceDetails.invoiceMonth, this.compensation?.effectiveToDate)
          const date1 = new Date(fromdate);
          const date2 = new Date(todate);
          const time = date2.getTime() - date1.getTime();
          let noOfDays = Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
          this.invoiceDetails.noOfDays = this.invoiceDetails.noOfDays + noOfDays;
          this.noOfDaysCopy = this.invoiceDetails.noOfDays;
          // this.invoiceDetails.invAmount = Math.round((this.onsitePkgAnnum * this.invoiceDetails.noOfDays / +this.leapDays));
        }
        this.invoiceDetails.invAmount = 0;

      }
    }

  }

  getDateItem(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  }
  onValueChange(event) {
    if (event.length === undefined) {
      const date = this.getDateItem(event);

      const index = this.dateSelected.findIndex(item => {
        const testDate = this.getDateItem(item);
        return testDate === date;
      });


      if (index < 0) {
        this.dateSelected.push(event);
      }
      else {
        this.dateSelected.splice(index, 1);
      }
    }


    if (this.dateSelected.length > 0) {
      this.selectedClass = this.dateSelected.map(date => {
        return {
          date,
          classes: ['custom-selected-date']
        }
      })
    }
  }
  onDateSelect(event, index) {
    if (event.length > 0) {
      const date1Modified = new Date(event[0]);
      const date2Modified = new Date(event[1]);
      const time = date2Modified.getTime() - date1Modified.getTime();
      this.invoiceDetails.deductions[index].noOfDays = Math.round((date2Modified.getTime() - date1Modified.getTime()) / (1000 * 60 * 60 * 24));

      let dayAmt = +this.invoiceDetails.invAmount / +this.invoiceDetails.noOfDays;
      this.invoiceDetails.deductions[index].amount = Math.round(dayAmt * +this.invoiceDetails.deductions[index].noOfDays);
    }
  }

  deductionChange(particularName, index) {
    let filter = this.invoiceDetails?.expenses?.filter(f => f?.name == keywords.perDiem && f?.noOfDays != null && f?.noOfDays != 0)
    this.invoiceDetails.deductions[index].amount = 0;
    if (particularName == keywords.otherDeduction || particularName == keywords.otherAddition) {
      this.invoiceDetails.deductions[index].noOfDays = null;
      this.invoiceDetails.deductions[index].dates = null;
    }
    if (this.onlyPerdiemFlag && filter.length == 0) {
      this.toastr.error("Please first select perdiem days worked");
      this.invoiceDetails.deductions[index] = {
        particularId: null,
        name: '',
        amount: null,
        amountcal: null,
        noOfDays: 0,
        others: '',
        hours: 0,
        dates: [],
        comment: '',
        startDay: keywords.fromFull,
        endDay: keywords.toFull,
        particularType: 'deduction'
      };
    }
    else if (this.compensation.defaultPkg == keywords.offshore && (particularName == keywords.onSiteUnLeave || particularName == keywords.onsitePdLeave) && this.perDiem == null) {
      let offsiteIndex = this.invoiceDetails.deductions.findIndex(f => f.name == keywords.onsite);
      if (offsiteIndex == -1) {
        this.toastr.error("Please first select onsite days worked");
        this.invoiceDetails.deductions[index] = {
          particularId: null,
          name: '',
          amount: null,
          amountcal: null,
          noOfDays: 0,
          others: '',
          hours: 0,
          dates: [],
          comment: '',
          startDay: keywords.fromFull,
          endDay: keywords.toFull,
          particularType: 'deduction'
        };
      } else { // enabled dates 

        this.minDate1 = new Date(this.invoiceDetails.deductions[offsiteIndex].dates[0]);
        this.maxDate1 = new Date(this.invoiceDetails.deductions[offsiteIndex].dates[1]);

      }
    } else if (this.compensation.defaultPkg == keywords.offshore && (particularName == keywords.onSiteUnLeave || particularName == keywords.onsitePdLeave) && this.perDiem != null) {
      let offsiteIndex = this.invoiceDetails.expenses.findIndex(f => f.name == keywords.perDiem && f.noOfDays != null);
      if (offsiteIndex == -1) {
        this.toastr.error("Please first select perdiem days worked");
        this.invoiceDetails.deductions[index] = {
          particularId: null,
          name: '',
          amount: null,
          amountcal: null,
          noOfDays: 0,
          others: '',
          hours: 0,
          dates: [],
          comment: '',
          startDay: keywords.fromFull,
          endDay: keywords.toFull,
          particularType: 'deduction'
        };
      } else {
        this.minDate1 = new Date(this.invoiceDetails.expenses[offsiteIndex].dates[0]);
        this.maxDate1 = new Date(this.invoiceDetails.expenses[offsiteIndex].dates[1]);
      }
    } else if (this.compensation.defaultPkg == keywords.onsite && (particularName == keywords.offUnLeave || particularName == keywords.offPdLeave) && (this.offshorePkgAnnum != null || this.offshorePkgAnnum != 0 || this.offshorePkgAnnum != '')) {
      let offsiteIndex = this.invoiceDetails.deductions.findIndex(f => f.name == keywords.offshore);
      if (offsiteIndex == -1) {
        this.toastr.error("Please first select offshore days worked !");
        this.invoiceDetails.deductions[index] = {
          particularId: null,
          name: '',
          amount: null,
          amountcal: null,
          noOfDays: 0,
          others: '',
          hours: 0,
          dates: [],
          comment: '',
          startDay: keywords.fromFull,
          endDay: keywords.toFull,
          particularType: 'deduction'
        };
      }
      else {
        this.minDate1 = new Date(this.invoiceDetails.deductions[offsiteIndex].dates[0]);
        this.maxDate1 = new Date(this.invoiceDetails.deductions[offsiteIndex].dates[1]);
      }
    }
    else if (this.compensation.defaultPkg == keywords.onsite && (particularName == keywords.offUnLeave || particularName == keywords.onsitePdLeave) && (this.perDiem != null && this.perDiem != 0 && this.perDiem != "")) {
      let perDiemSelect = this.invoiceDetails.expenses.findIndex(f => f.name == 'Perdiem' && f.noOfDays != null)

      if (perDiemSelect == -1) {
        this.toastr.error("Please first select perdiem !");
        this.invoiceDetails.deductions[index] = {
          particularId: null,
          name: '',
          amount: null,
          amountcal: null,
          noOfDays: 0,
          others: '',
          hours: 0,
          dates: [],
          comment: '',
          startDay: keywords.fromFull,
          endDay: keywords.toFull,
          particularType: 'deduction'
        };
      } else {
        this.minDate1 = new Date(this.invoiceDetails.expenses[perDiemSelect].dates[0]);
        this.maxDate1 = new Date(this.invoiceDetails.expenses[perDiemSelect].dates[1]);
      }
    }
    else if (this.invoiceDetails.deductions[index].name != '' && (this.invoiceDetails.deductions[index].dates != undefined && this.invoiceDetails.deductions[index].dates.length > 0)) {
      this.invoiceDetails.deductions[index] = {
        particularId: null,
        name: '',
        amount: null,
        amountcal: null,
        noOfDays: 0,
        others: '',
        hours: 0,
        dates: [],
        comment: '',
        startDay: keywords.fromFull,
        endDay: keywords.toFull,
        particularType: 'deduction'
      };
    }

  }
  updateSeletedDate(event, index) {
    let dateRange = this.invoiceDetails?.deductions[index]?.dates?.length > 0 ? getDatesInRange(this.invoiceDetails?.deductions[index]?.dates[0], this.invoiceDetails?.deductions[index]?.dates[1], this.datepipe) : [];
    dateRange?.forEach(m => {
      this.offOrOnShoreDatesCopy.filter((f, i) => {
        this.datepipe.transform(m, keywords.formateDateOnly) == this.datepipe.transform(f, keywords.formateDateOnly) ? this.offOrOnShoreDatesCopy.splice(i, 1) : ''
      })
    })
  }
  onOffshore(event, index, selectedStr) {

    setTimeout(() => {
      if (event[0] != undefined && event[0] != null) {

        // let perDiemIndex = this.invoiceDetails.expenses.findIndex(f => f.name == 'Perdiem')
        // if (selectedStr == keywords.onsite || selectedStr == keywords.offshore || perDiemIndex > -1 || selectedStr == keywords.partialInvoice) {
        //   if (perDiemIndex > -1) {
        //     this.offOrOnShoreDates = getDatesInRange(this.invoiceDetails.expenses[perDiemIndex]?.dates[0], this.invoiceDetails.expenses[perDiemIndex]?.dates[1], this.datepipe);
        //   } else {
        //     this.offOrOnShoreDates = getDatesInRange(event[0], event[1], this.datepipe);
        //   }
        //   this.offOrOnShoreDates.forEach(m => this.offOrOnShoreDatesCopy.push(new Date(m)));
        // }
        // //primary package is offshore

        // if(selectedStr != keywords.onsite && selectedStr != keywords.offshore){
        //   this.count = this.count + 1;
        //   if(this.isBackOrEdit == false){
        //     let datesSelected = getDatesInRange(event[0], event[1], this.datepipe);
        //     let isSubset = datesSelected.filter(secondElement =>
        //       this.disabledDates.some(firstElement => this.datepipe.transform(firstElement, 'YYYY-MM-dd') === this.datepipe.transform(secondElement, 'YYYY-MM-dd'))
        //     )
        //     if (isSubset.length > 0) {
        //       this.toastr.error("This date range is already selected!");
        //       this.invoiceDetails.deductions[index].dates = []
        //       return;
        //     }
        //   }

        //   if(this.count == this.invoiceDetails.deductions.length ){
        //     this.isBackOrEdit = false;
        //     this.count = 0
        //   }
        //   this.disabledDatePop(event[0],event[1])
        //   this.disabledDatePush(event[0],event[1])
        // }
        if (this.compensation.defaultPkg == keywords.offshore && this.offshorePkgAnnum != null && this.offshorePkgAnnum != 0) {
          if (event.length > 0 && selectedStr == keywords.onsite) {
            let noOfDays = this.invoiceDetails.deductions[index].noOfDays;
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            let dayAmt = this.fixedOrFloat == keywords.fixed ? ((+this.onsitePkgAnnum / 12) / +this.noOfDaysCopy) : (+this.onsitePkgAnnum / this.leapDays);
            this.invoiceDetails.deductions[index].amount = Math.round((dayAmt * +this.invoiceDetails.deductions[index].noOfDays) * this.invoiceDetails.currencyRate);
            this.invoiceDetails.deductions[index].comment = "IT Consultancy Service (Onsite) for the period " + this.datepipe.transform(event[0], keywords.formateDateOnly) + ' to ' + this.datepipe.transform(event[1], keywords.formateDateOnly)
            this.calculateInvoiceAmount(noOfDays, this.invoiceDetails.deductions[index].noOfDays, this.offshorePkgAnnum);
          }
          else if (event.length > 0 && selectedStr == keywords.offPdLeave) {

            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            this.calculateNoOfDaysOnEdit(index);
            if (this.invoiceDetails.noOfDays < this.invoiceDetails.deductions[index].noOfDays) {
              // this.toastr.error("Your availabe offshore leave are "+ this.invoiceDetails.deductions[onsiteIndex].noOfDays)
            }
            this.invoiceDetails.deductions[index].amount = 0;
            //this.invoiceDetails.deductions[index].comment = keywords.offPaidLeaveCmt;
            // this.invoiceDetails.deductions[index].dates = this.checkDateSelected(event[0],event[1])
          }
          else if (event.length > 0 && selectedStr == keywords.onsitePdLeave) {
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            this.calculateNoOfDaysOnEdit(index);
            this.invoiceDetails.deductions[index].amount = 0;
            //  this.invoiceDetails.deductions[index].comment = 'Onsite Paid Leave';
            //this.checkDateSelected(event[0],event[1])
          }
          else if (event.length > 0 && selectedStr == keywords.onSiteUnLeave) {
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event)
            this.calculateNoOfDaysOnEdit(index);
            let dayAmt = this.fixedOrFloat == keywords.fixed ? ((+this.onsitePkgAnnum / 12) / this.noOfDaysCopy) : (+this.onsitePkgAnnum / this.leapDays);
            this.invoiceDetails.deductions[index].amount = Math.round((dayAmt * +this.invoiceDetails.deductions[index].noOfDays) * this.invoiceDetails.currencyRate);
            //this.invoiceDetails.deductions[index].comment = keywords.onSiteUnLeave;

            // this.checkDateSelected(event[0],event[1])
          }
          else if (event.length > 0 && selectedStr == keywords.offUnLeave) {
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            this.calculateNoOfDaysOnEdit(index);
            let dayAmt = this.fixedOrFloat == keywords.fixed ? ((+this.offshorePkgAnnum / 12) / this.noOfDaysCopy) : (+this.offshorePkgAnnum / this.leapDays);
            this.invoiceDetails.deductions[index].amount = Math.round((dayAmt * +this.invoiceDetails.deductions[index].noOfDays));
            //this.invoiceDetails.deductions[index].comment = keywords.offUnLeave;

          }

          //if an employee is join in mid month DedutionOther
          else if (event.length > 0 && selectedStr == keywords.partialInvoice) {
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            this.calculateNoOfDaysOnEdit(index);
            let dayAmt = this.fixedOrFloat == keywords.fixed ? ((+this.offshorePkgAnnum / 12) / this.noOfDaysCopy) : (+this.offshorePkgAnnum / this.leapDays);
            this.invoiceDetails.deductions[index].amount = Math.round((dayAmt * +this.invoiceDetails.deductions[index].noOfDays));
            //this.invoiceDetails.deductions[index].comment = 'Others';

          }
        }
        //if primary package is onsite
        else if (this.compensation.defaultPkg == keywords.onsite && this.onsitePkgAnnum != null) {
          if (event.length > 0 && selectedStr == keywords.offshore) {

            let invAmount = this.invoiceDetails.invAmount;
            let noOfDays = this.invoiceDetails.deductions[index].noOfDays;
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            let dayAmt = this.fixedOrFloat == keywords.fixed ? ((+this.offshorePkgAnnum / 12) / this.noOfDaysCopy) : (+this.offshorePkgAnnum / this.leapDays);
            this.invoiceDetails.deductions[index].amount = Math.round((dayAmt * +this.invoiceDetails.deductions[index].noOfDays) / this.invoiceDetails.currencyRate);
            this.invoiceDetails.deductions[index].comment = "IT Consultancy Service (Offshore) for the period " + this.datepipe.transform(event[0], keywords.formateDateOnly) + ' to ' + this.datepipe.transform(event[1], keywords.formateDateOnly)
            this.calculateInvoiceAmount(noOfDays, this.invoiceDetails.deductions[index].noOfDays, this.onsitePkgAnnum)
          }
          else if (event.length > 0 && selectedStr == keywords.offPdLeave) {
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            this.calculateNoOfDaysOnEdit(index);
            this.invoiceDetails.deductions[index].amount = 0;
            // this.invoiceDetails.deductions[index].comment = keywords.offPaidLeaveCmt;
          }
          else if (event.length > 0 && selectedStr == keywords.onsitePdLeave) {
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            this.calculateNoOfDaysOnEdit(index);
            this.invoiceDetails.deductions[index].amount = 0;
            //this.invoiceDetails.deductions[index].comment = 'Onsite Paid Leave';
          }
          else if (event.length > 0 && selectedStr == keywords.onSiteUnLeave) {
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            this.calculateNoOfDaysOnEdit(index);
            if (this.invoiceDetails.noOfDays < this.invoiceDetails.deductions[index].noOfDays) {
              this.toastr.error("Your available onsite unpaid leave balance is " + this.invoiceDetails.noOfDays)
              this.invoiceDetails.deductions[index].noOfDays = 0
            } else {
              let dayAmt = this.fixedOrFloat == keywords.fixed ? ((+this.onsitePkgAnnum / 12) / this.noOfDaysCopy) : (+this.onsitePkgAnnum / this.leapDays);
              this.invoiceDetails.deductions[index].amount = Math.round((dayAmt * +this.invoiceDetails.deductions[index].noOfDays));
              //this.invoiceDetails.deductions[index].comment = keywords.onSiteUnLeave;
              // this.calculateInvoiceAmount(noOfDays, invAmount, this.invoiceDetails.deductions[index].noOfDays, this.onsitePkgAnnum)
            }
          }
          else if (event.length > 0 && selectedStr == keywords.offUnLeave) {
            let offshoreIndex;
            let offshorePaidIndex;
            this.invoiceDetails.deductions.forEach(d => {
              if (d.name == keywords.offshore) {
                offshoreIndex = d
              } else if (d.name == keywords.offPdLeave) {
                offshorePaidIndex = d
              }
            })
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            this.calculateNoOfDaysOnEdit(index);
            offshorePaidIndex = offshorePaidIndex == undefined ? { name: '', noOfDays: 0 } : offshorePaidIndex;
            if (offshoreIndex != undefined && offshorePaidIndex != undefined) {
              if (offshoreIndex.noOfDays >= +offshorePaidIndex.noOfDays + +this.invoiceDetails.deductions[index].noOfDays) {
                let dayAmt = this.fixedOrFloat == keywords.fixed ? ((+this.offshorePkgAnnum / 12) / this.noOfDaysCopy) : (+this.offshorePkgAnnum / this.leapDays);
                this.invoiceDetails.deductions[index].amount = Math.round((dayAmt * +this.invoiceDetails.deductions[index].noOfDays) / this.invoiceDetails.currencyRate);
                //this.invoiceDetails.deductions[index].comment = keywords.offUnLeave;
              }
            }
          }
          //if an employee is join in mid month DedutionOther
          else if (event.length > 0 && selectedStr == keywords.partialInvoice) {
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            this.calculateNoOfDaysOnEdit(index);
            let dayAmt = this.fixedOrFloat == keywords.fixed ? ((+this.onsitePkgAnnum / 12) / this.noOfDaysCopy) : (+this.onsitePkgAnnum / this.leapDays);
            this.invoiceDetails.deductions[index].amount = Math.round((dayAmt * +this.invoiceDetails.deductions[index].noOfDays));
            //this.invoiceDetails.deductions[index].comment = "Others";

          }
        } else if (this.compensation.defaultPkg == keywords.onsite && (this.onsitePkgAnnum == null || this.onsitePkgAnnum == 0 || this.onsitePkgAnnum == '') && (this.offshorePkgAnnum == null || this.offshorePkgAnnum == 0 || this.offshorePkgAnnum == '') && (this.perDiem != null && this.perDiem != 0 && this.perDiem != "")) {
          if (event.length > 0 && selectedStr == keywords.onsitePdLeave) {
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            this.calculateNoOfDaysOnEdit(index);
            this.invoiceDetails.deductions[index].amount = 0;
            //this.invoiceDetails.deductions[index].comment = 'Onsite Paid Leave';
          } else if (event.length > 0 && selectedStr == keywords.offUnLeave) {
            this.invoiceDetails.deductions[index].noOfDays = this.calculateDifferentDays(event);
            let perdiemIndex = this.invoiceDetails.expenses.findIndex(f => f.name == 'Perdiem');
            // this.calculateNoOfDaysOnEdit(index);
            this.invoiceDetails.deductions[index].amount = Math.round((this.perDiem * +this.invoiceDetails.deductions[index].noOfDays));
            // this.invoiceDetails.deductions[index].comment = keywords.offUnLeave;
            // this.invoiceDetails.expenses[perdiemIndex].noOfDays = this.invoiceDetails.expenses[perdiemIndex].noOfDays - this.invoiceDetails.deductions[index].noOfDays;
            // this.invoiceDetails.expenses[perdiemIndex].amount =  Math.round((+this.invoiceDetails.expenses[perdiemIndex].amount - +this.invoiceDetails.deductions[index].amount));
          }
        }
      }
    }, 1000)
  }

  onHide(event, index) {
    let str = ''
    this.selectedClass?.forEach((elem) => {
      let date = this.datepipe.transform(new Date(elem.date), keywords.formateDateOnly)
      str = str == '' ? str + date : str + ',' + date;
      const input = (<HTMLInputElement>document.getElementById('deductDP')).value = str;

      let dayAmt = +this.invoiceDetails.invAmount / +this.invoiceDetails.noOfDays
      this.invoiceDetails.deductions[index].amount = Math.round(dayAmt * this.selectedClass.length);
      this.invoiceDetails.deductions[index].noOfDays = this.selectedClass.length;
      let date1 = []
      this.selectedClass?.forEach(fil => {
        date1.push(fil.date)
      });
      this.invoiceDetails.deductions[index].dates = date1
      //  var ArrayInText = document.createElement('input');
      // ArrayInText.value =  elem ;
      // document.body.appendChild(ArrayInText);
    });

  }
  isOpen: boolean = false
  onClick() {
    this.isOpen = true;
  }

  calculateDifferentDays(event) {
    const date1Modified = new Date(event[0]);
    const date2Modified = new Date(event[1]);
    const time = date2Modified.getTime() - date1Modified.getTime();
    return Math.round((date2Modified.getTime() - date1Modified.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  calculateInvoiceAmount(previousNoOfDays, days, salPackage) {
    if (this.fixedOrFloat == keywords.fixed) {
      if (previousNoOfDays == 0) {
        let totalDays = this.invoiceDetails.noOfDays;
        this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays - +days;
        this.invoiceDetails.invAmount = Math.round(((salPackage / 12 / totalDays) * this.invoiceDetails.noOfDays));
      } else {
        this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays + +previousNoOfDays;
        let totalDays = this.invoiceDetails.noOfDays;
        this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays - +days;
        this.invoiceDetails.invAmount = Math.round(((salPackage / 12 / totalDays) * this.invoiceDetails.noOfDays));
      }
    } else {
      if (previousNoOfDays == 0) {
        this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays - +days;
        this.invoiceDetails.invAmount = Math.round((salPackage * this.invoiceDetails.noOfDays / +this.leapDays));
      } else {
        this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays + +previousNoOfDays;
        // this.invoiceDetails.invAmount = priviousInvAmount;
        this.invoiceDetails.noOfDays = +this.invoiceDetails.noOfDays - +days;
        this.invoiceDetails.invAmount = Math.round((salPackage * this.invoiceDetails.noOfDays / +this.leapDays));
      }
    }

  }


  projectChange(event, selectOrDeselect) {
    if (selectOrDeselect == 'select') {
      // this.invoiceDetails.projectId = this.invoiceDetails.clientId;
      // this.projectList = [...this.invoiceDetails.clientId]
      let project = []
      this.invoiceDetails.clientId.map(m => {
        this.pageConfig.projectRelatedToEmp.forEach(f => {
          m.clientId == f.clientId ? project.push(f) : ''
        })
      })

      this.invoiceDetails.projectId = project;
      this.projectList = [...project]
    } else {
      this.invoiceDetails.projectId = this.invoiceDetails.clientId;
      if (this.invoiceDetails.clientId.length == 0) {
        this.projectList = this.pageConfig?.projectRelatedToEmp
      }
      else {
        // this.projectList = [...this.invoiceDetails.clientId]

        let project = []
        this.invoiceDetails.clientId.map(m => {
          this.pageConfig.projectRelatedToEmp.forEach(f => {
            m.clientId == f.clientId ? project.push(f) : ''
          })
        })

        //this.invoiceDetails.projectId = project;
        this.projectList = [...project]
      }

    }

  }

  selectOrDeselectAllProject(event, selectDeSelect) {
    if (selectDeSelect == 'select') {
      if (event != null && event != undefined && event.length > 0) {
        // this.invoiceDetails.projectId = event;
        // this.projectList = [...event];

        let project = []
        this.invoiceDetails.clientId.map(m => {
          this.pageConfig.projectRelatedToEmp.forEach(f => {
            m.clientId == f.clientId ? project.push(f) : ''
          })
        })

        this.invoiceDetails.projectId = project;
        this.projectList = [...project]
      }
    } else {
      this.invoiceDetails.projectId = event;
    }
  }

  onRadioChange(index, particular, demoStr) {
    //half day calculations

    if (demoStr == 'deduction') {
      let dateDiff = this.invoiceDetails.deductions[index].dates != undefined ? this.calculateDifferentDays(this.invoiceDetails.deductions[index].dates) : 0;
      //only perdiem case
      if ((this.offshorePkgAnnum == null || this.offshorePkgAnnum == 0) && (this.onsitePkgAnnum == null || this.onsitePkgAnnum == 0) && (this.perDiem != null && this.perDiem != 0 && this.perDiem != "")) {
        if (this.perDiem > 0 && dateDiff > 0) {
          if (this.datepipe.transform(this.invoiceDetails.deductions[index].dates[0], keywords.formateDateOnly) == this.datepipe.transform(this.invoiceDetails.deductions[index].dates[1], keywords.formateDateOnly) && (particular == keywords.onsitePdLeave || particular == keywords.offPaidLeave)) {
            if ((this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toFull)) {
              this.invoiceDetails.deductions[index].noOfDays = 1;
            } else if (this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toFull) {
              this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 0.5;
            }
          } else if (this.datepipe.transform(this.invoiceDetails.deductions[index].dates[0], keywords.formateDateOnly) == this.datepipe.transform(this.invoiceDetails.deductions[index].dates[1], keywords.formateDateOnly) && (particular == keywords.onSiteUnLeave || particular == keywords.offUnLeave)) {
            let amt = +this.perDiem / 8;
            if ((this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toFull)) {
              this.invoiceDetails.deductions[index].noOfDays = 1;
              this.invoiceDetails.deductions[index].amount = Math.round(+amt * 8)
            } else if (this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toFull) {
              this.invoiceDetails.deductions[index].noOfDays = 0.5;
              this.invoiceDetails.deductions[index].amount = Math.round(+amt * 4)
            }

          }
          // else if(particular != keywords.onsitePdLeave && particular != keywords.offPaidLeave){
          //   let amt = +this.perDiem / 8;
          //   this.invoiceDetails.deductions[index].amount = Math.round(+amt * 8 * +dateDiff)
          //   if ((this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toFull) || (this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toHalf)) {
          //     this.invoiceDetails.deductions[index].amount = Math.round(+this.invoiceDetails.deductions[index].amount - +amt * 4)
          //     this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 0.5;
          //   } else if (this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toHalf && particular != keywords.onsitePdLeave) {
          //     this.invoiceDetails.deductions[index].amount = Math.round(+this.invoiceDetails.deductions[index].amount - +amt * 8);
          //     this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 1;
          //   } else if ((this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toFull) || this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toHalf) {

          //     this.invoiceDetails.deductions[index].amount = Math.round(+this.invoiceDetails.deductions[index].amount - +amt * 4)
          //     this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 0.5;
          //   }
          // }
          else if (particular == keywords.onsitePdLeave || particular == keywords.offPaidLeave) {
            let amt = +this.perDiem / 8;
            // this.invoiceDetails.deductions[index].amount = Math.round(+amt * 8 * +dateDiff)
            if ((this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toFull) || (this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toHalf)) {
              //this.invoiceDetails.deductions[index].amount = Math.round(+this.invoiceDetails.deductions[index].amount - +amt * 4)
              this.invoiceDetails.deductions[index].noOfDays = dateDiff - 0.5;
            } else if (this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toFull) {
              this.invoiceDetails.deductions[index].noOfDays = dateDiff;
            } else if ((this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toHalf)) {
              this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 0.5;
            }
          }
        }
      } else {
        let salPkg = particular == keywords.offUnLeave || particular == keywords.offPdLeave ? this.offshorePkgAnnum : particular == keywords.onSiteUnLeave || particular == keywords.onsitePdLeave ? this.onsitePkgAnnum : 0;
        this.invoiceDetails.deductions[index].noOfDays = dateDiff;
        //for offshore employe who have perdiem , this condition is wriiten because salPkg is null 
        if (salPkg == null && (this.offshorePkgAnnum != null && this.offshorePkgAnnum != 0) && (this.onsitePkgAnnum == null || this.onsitePkgAnnum == 0) && (this.perDiem != null || this.perDiem != 0) && this.invoiceDetails.deductions[index].name == keywords.onsitePdLeave) {
          if ((this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toFull) || this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toHalf) {
            this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 0.5;
          } else if (this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toFull) {
            this.invoiceDetails.deductions[index].noOfDays = dateDiff;
          } else if (this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toHalf) {
            this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 1;
          }
        }
        else if (salPkg > 0 && dateDiff > 0) {

          if (this.datepipe.transform(this.invoiceDetails.deductions[index].dates[0], keywords.formateDateOnly) == this.datepipe.transform(this.invoiceDetails.deductions[index].dates[1], keywords.formateDateOnly) && (particular == keywords.onsitePdLeave || particular == keywords.offPaidLeave)) {
            if ((this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toFull)) {
              this.invoiceDetails.deductions[index].noOfDays = 1;
            } else if (this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toFull) {
              this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 0.5;
            }

          } else {
            let amt = this.fixedOrFloat == keywords.fixed ? (+salPkg / 12 / this.noOfDaysCopy) / 8 : (+salPkg / this.leapDays) / 8;
            this.invoiceDetails.deductions[index].amount = Math.round(+amt * 8 * +dateDiff)

            if ((this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toFull) || this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toHalf) {
              this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 0.5;
              if (this.invoiceDetails.deductions[index].name == keywords.onSiteUnLeave && this.compensation.defaultPkg == keywords.offshore) {
                this.invoiceDetails.deductions[index].amount = Math.round((+this.invoiceDetails.deductions[index].amount - +amt * 4) * this.invoiceDetails.currencyRate)
              } else if (this.invoiceDetails.deductions[index].name == keywords.offUnLeave && this.compensation.defaultPkg == keywords.onsite) {
                this.invoiceDetails.deductions[index].amount = Math.round((+this.invoiceDetails.deductions[index].amount - +amt * 4) / this.invoiceDetails.currencyRate)
              }
              //  else if (this.invoiceDetails.deductions[index].name == keywords.offPaidLeave && this.compensation.defaultPkg == keywords.onsite) {
              //   this.invoiceDetails.deductions[index].amount = 0  //change
              // } 
              else if (this.invoiceDetails.deductions[index].name == keywords.offPaidLeave || this.invoiceDetails.deductions[index].name == keywords.onsitePdLeave) {
                this.invoiceDetails.deductions[index].amount = 0;
              } else if (this.invoiceDetails.deductions[index].name == keywords.offUnLeave || this.invoiceDetails.deductions[index].name == keywords.onSiteUnLeave) {
                this.invoiceDetails.deductions[index].amount = Math.round(+this.invoiceDetails.deductions[index].amount - +amt * 4)
              }
            } else if (this.invoiceDetails.deductions[index].startDay == keywords.fromFull && this.invoiceDetails.deductions[index].endDay == keywords.toFull) {
              this.invoiceDetails.deductions[index].noOfDays = dateDiff;
              if (this.invoiceDetails.deductions[index].name == keywords.onSiteUnLeave && this.compensation.defaultPkg == keywords.offshore) {
                this.invoiceDetails.deductions[index].amount = Math.round(+amt * 8 * +dateDiff * this.invoiceDetails.currencyRate)
              } else if (this.invoiceDetails.deductions[index].name == keywords.offUnLeave && this.compensation.defaultPkg == keywords.onsite) {
                this.invoiceDetails.deductions[index].amount = Math.round(+amt * 8 * +dateDiff / this.invoiceDetails.currencyRate)
              }
              // else if (this.invoiceDetails.deductions[index].name == keywords.offPaidLeave && this.compensation.defaultPkg == keywords.onsite) {
              //   this.invoiceDetails.deductions[index].amount = 0
              // }
              else if (this.invoiceDetails.deductions[index].name == keywords.offPaidLeave || this.invoiceDetails.deductions[index].name == keywords.onsitePdLeave) {
                this.invoiceDetails.deductions[index].amount = 0;
              } else if (this.invoiceDetails.deductions[index].name == keywords.offUnLeave || this.invoiceDetails.deductions[index].name == keywords.onSiteUnLeave) {
                this.invoiceDetails.deductions[index].amount = Math.round(+amt * 8 * +dateDiff)
              }
            } else if (this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toHalf) {
              this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 1;
              if (this.invoiceDetails.deductions[index].name == keywords.onSiteUnLeave && this.compensation.defaultPkg == keywords.offshore) {
                this.invoiceDetails.deductions[index].amount = Math.round((+this.invoiceDetails.deductions[index].amount - +amt * 8) * this.invoiceDetails.currencyRate);
              } else if (this.invoiceDetails.deductions[index].name == keywords.offUnLeave && this.compensation.defaultPkg == keywords.onsite) {
                this.invoiceDetails.deductions[index].amount = Math.round((+this.invoiceDetails.deductions[index].amount - +amt * 8) / this.invoiceDetails.currencyRate)
              }
              // else if (this.invoiceDetails.deductions[index].name == keywords.offPaidLeave && this.compensation.defaultPkg == keywords.onsite) {
              //   this.invoiceDetails.deductions[index].amount = 0
              // }
              else if (this.invoiceDetails.deductions[index].name == keywords.offPaidLeave || this.invoiceDetails.deductions[index].name == keywords.onsitePdLeave) {
                this.invoiceDetails.deductions[index].amount = 0;
              } else if (this.invoiceDetails.deductions[index].name == keywords.offUnLeave || this.invoiceDetails.deductions[index].name == keywords.onSiteUnLeave) {
                this.invoiceDetails.deductions[index].amount = Math.round(+this.invoiceDetails.deductions[index].amount - +amt * 8)
              }
            }
          }
        }
      }
    } else if (demoStr == 'expenses') {
      this.calculateoffOrOnsite('', index)
    }

    // this.invoiceDetails.deductions.forEach(d => {
    //   let range = getDatesInRange(d?.dates[0], d?.dates[1], this.datepipe)
    //   if (d.startDay == keywords.fromHalf) {
    //     let customDate = { date: new Date(d.dates[0]), classes: ['halfDayColor'] };
    //     let index = this.dateCustomClasses.findIndex(ind => this.datepipe.transform(new Date(ind.date), keywords.formateDateOnly) == this.datepipe.transform(new Date(d.dates[0]), keywords.formateDateOnly))

    //     index == -1 ? this.dateCustomClasses.push(customDate) : '';
    //   } if (d.endDay == keywords.toHalf) {
    //     let customDate = { date: new Date(d.dates[1]), classes: ['halfDayColor'] };
    //     let index = this.dateCustomClasses.findIndex(ind => this.datepipe.transform(new Date(ind.date), keywords.formateDateOnly) == this.datepipe.transform(new Date(d.dates[1]), keywords.formateDateOnly))
    //     index == -1 ? this.dateCustomClasses.push(customDate) : '';
    //   } if (d.startDay == keywords.fromFull) {
    //     let index = this.dateCustomClasses.findIndex(ind => this.datepipe.transform(new Date(ind.date), keywords.formateDateOnly) == this.datepipe.transform(new Date(d.dates[0]), keywords.formateDateOnly))
    //     index > -1 ? this.dateCustomClasses.splice(index, 1) : '';
    //   } if (d.endDay == keywords.toFull) {
    //     let index = this.dateCustomClasses.findIndex(ind => this.datepipe.transform(new Date(ind.date), keywords.formateDateOnly) == this.datepipe.transform(new Date(d.dates[1]), keywords.formateDateOnly))
    //     index > -1 ? this.dateCustomClasses.splice(index, 1) : '';
    //   }
    // })
  }

  calculateNoOfDaysOnEdit(index) {
    if (this.invoiceDetails.deductions[index].startDay == keywords.fromHalf && this.invoiceDetails.deductions[index].endDay == keywords.toHalf) {
      this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 1;
    } else if (this.invoiceDetails.deductions[index].startDay == keywords.fromHalf || this.invoiceDetails.deductions[index].endDay == keywords.toHalf) {
      this.invoiceDetails.deductions[index].noOfDays = this.invoiceDetails.deductions[index].noOfDays - 0.5;
    }
  }

  onKeyPress(event) {
    return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57
  }

  checkDateSelected(fromDate, toDate) {
    let datesArray = getDatesInRange(fromDate, toDate, this.datepipe);
    let index = [];
    datesArray.forEach(d => {
      this.disabledDates.filter((f, i) => this.datepipe.transform(new Date(d), keywords.formateDateOnly) == this.datepipe.transform(new Date(f), keywords.formateDateOnly) ? index.push(f) : '');
    })
    if (index.length > 0) {
      this.toastr.error('Date already selected');
      return [];
    } else {
      return [new Date(fromDate), new Date(toDate)]
    }
  }


  disabledDatePush(fromDate, toDate) {
    let datesArray = getDatesInRange(fromDate, toDate, this.datepipe);
    datesArray.forEach(d => {
      let index = this.disabledDates.findIndex((f, i) => this.datepipe.transform(new Date(d), keywords.formateDateOnly) == this.datepipe.transform(new Date(f), keywords.formateDateOnly))
      index == -1 ? this.disabledDates.push(new Date(d)) : ''
    })
  }

  disabledDatePop(fromDate, toDate) {
    // let datesArray = getDatesInRange(fromDate, toDate, this.datepipe);
    // datesArray.forEach(d => {
    //   this.disabledDates.findIndex((f,i) => this.datepipe.transform(new Date(d),keywords.formateDateOnly) == this.datepipe.transform(new Date(f),keywords.formateDateOnly) ? this.disabledDates.splice(i,1) : '')
    // })
    this.disabledDates = []
    this.invoiceDetails.deductions.forEach((d, i) => {
      if (d?.dates?.length > 0 && d?.name != keywords.onsite && d?.name != keywords.offshore) {
        this.disabledDatePush(d?.dates[0], d?.dates[1])
      }
    })
  }

  setMinMax(particularName) {
    if (this.compensation.defaultPkg == keywords.offshore && (particularName == keywords.onSiteUnLeave || particularName == keywords.onsitePdLeave) && this.perDiem == null) {
      let offsiteIndex = this.invoiceDetails.deductions.findIndex(f => f.name == keywords.onsite);
      this.minDate1 = new Date(this.invoiceDetails.deductions[offsiteIndex].dates[0]);
      this.maxDate1 = new Date(this.invoiceDetails.deductions[offsiteIndex].dates[1]);

    } else if (this.compensation.defaultPkg == keywords.offshore && (particularName == keywords.onSiteUnLeave || particularName == keywords.onsitePdLeave) && this.perDiem != null) {
      let offsiteIndex = this.invoiceDetails.expenses.findIndex(f => f.name == keywords.perDiem && f.noOfDays != null);
      this.minDate1 = new Date(this.invoiceDetails.expenses[offsiteIndex].dates[0]);
      this.maxDate1 = new Date(this.invoiceDetails.expenses[offsiteIndex].dates[1]);

    } else if (this.compensation.defaultPkg == keywords.onsite && (particularName == keywords.offUnLeave || particularName == keywords.offPdLeave) && (this.offshorePkgAnnum != null || this.offshorePkgAnnum != 0 || this.offshorePkgAnnum != '')) {
      let offsiteIndex = this.invoiceDetails.deductions.findIndex(f => f.name == keywords.offshore);
      this.minDate1 = new Date(this.invoiceDetails.deductions[offsiteIndex]?.dates[0]);
      this.maxDate1 = new Date(this.invoiceDetails.deductions[offsiteIndex]?.dates[1]);
    }
    else if (this.compensation.defaultPkg == keywords.onsite && (particularName == keywords.offUnLeave || particularName == keywords.onsitePdLeave) && (this.perDiem != null && this.perDiem != 0 && this.perDiem != "")) {
      let perDiemSelect = this.invoiceDetails.expenses.findIndex(f => f.name == 'Perdiem' && f.noOfDays != null)
      this.minDate1 = new Date(this.invoiceDetails.expenses[perDiemSelect].dates[0]);
      this.maxDate1 = new Date(this.invoiceDetails.expenses[perDiemSelect].dates[1]);
    }
  }


  otherDeduction($event, index) {
    this.invoiceDetails.deductions[index].amount = this.invoiceDetails.deductions[index].amountcal
  }

  particularCurrencyChange(index) {
    if(this.invoiceDetails.expenses[index].expCurrency == 'Other'){
      this.invoiceDetails.expenses[index].amount = this.invoiceDetails.expenses[index].amountcal;
    }else{
      
    let invoiceCurrency = null;
     if(this.invoiceDetails.particulars.includes(keywords.offshore)){
       invoiceCurrency = this.compensation?.currency ? this.compensation?.currency.split(' ')[0] : null;
     }else{
       invoiceCurrency = this.compensation?.onsiteCurrency ? this.compensation?.onsiteCurrency.split(' ')[0] : null;
     }
     
     let currency = this.invoiceDetails.expenses[index].expCurrency.split(' ')[0];
     currency = currency == "PAK" ? 'PKR' : currency;
     invoiceCurrency = invoiceCurrency == "PAK" ? 'PKR' : invoiceCurrency;
     let url1 = `https://open.er-api.com/v6/latest/${currency}`;
     this.restApi.getCurrency(url1).subscribe(d => {
       if (d && d.rates && d.rates[currency] !== undefined) {
         this.invoiceDetails.expenses[index].expCurrencyRate = d.rates[invoiceCurrency];

         this.invoiceDetails.expenses[index].amount = this.invoiceDetails.expenses[index].amountcal *  this.invoiceDetails.expenses[index].expCurrencyRate;
       } else {
         console.error(`Currency rate for ${currency} not found.`);
         this.toastr.error(`Currency rate for ${currency} not found.`);
       }
     }, error => {
       console.error('Error fetching currency rate:', error);
       this.toastr.error('Error fetching currency rate. Please try again later.');
     });
 
    }
  }


  calculateCurrecncyRate(index) {
    if(this.invoiceDetails.expenses[index].expCurrency == 'Other'){
      this.invoiceDetails.expenses[index].amount = this.invoiceDetails.expenses[index].amountcal;
    }else{
    this.invoiceDetails.expenses[index].amount = this.invoiceDetails.expenses[index].amountcal *  this.invoiceDetails.expenses[index].expCurrencyRate;
    }
  }
}
