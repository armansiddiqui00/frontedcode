import { Component, HostListener, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../invoice.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal'
import { ToastrService } from 'ngx-toastr';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { ReviewService } from '../../review-invoice/review-invoice-modal/review.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthenticationService } from 'src/app/_services';
import { RestApiService } from 'src/app/services/rest-api.service';
import * as CryptoJS from 'crypto-js'
import { StoreService } from 'src/app/services/store.service';
import { ApiPaths, decryptUsingAES256, encryptUsingAES256, getDatesInRange, removeNullUndefinedEmpty } from 'src/app/shared/util';
import { LoaderService } from 'src/app/services/loader.service';
import * as planer from "planer";
import { first } from 'rxjs/operators';
import { SignatureService } from 'src/app/services/SignatureService';
import PostalMime from 'postal-mime';
@Component({
  selector: 'app-attendance-timesheet',
  templateUrl: './attendance-timesheet.component.html',
  styleUrls: ['./attendance-timesheet.component.scss']
})
export class AttendanceTimesheetComponent {
  key = CryptoJS.enc.Utf8.parse('1203199320052021');
  iv = CryptoJS.enc.Utf8.parse('1203199320052021');

  modalRef?: BsModalRef;
  data: any;
  copyData: any;
  userData
  totalAmount = '*****';
  password = null;
  pageConfig: any;
  actionSignature;
  submitted = false;
  constructor(private router: Router, private invoiceService: InvoiceService, private modalService: BsModalService, private toastr: ToastrService, private activeRoute: ActivatedRoute, private datePipe: DatePipe,
    private authenticateService: AuthenticationService, private restApi: RestApiService, private _decimalPipe: DecimalPipe, private store: StoreService, private loader: LoaderService, private signatureService: SignatureService) {
    this.authenticateService.currentUser.subscribe(data => this.userData = data?.loginUserDetails)
    this.actionSignature = signatureService.signPayload(this.userData?.userEmailId)
  }

  attendenceDetailsCopy = [];
  attendenceDetails = [];
  attendanceObj = {
    attId: null,
    dateOfMonth: '',
    noOfHoursWorked: null,
    overTimeHours: 0,
    totalHours: 0,
    remarks: '',
    createdDate: '',
    createdBy: '',
    updatedDate: '',
    updatedBy: ''
  }

  particular1 = "*****";


  gridView: boolean = false
  expense: any
  flag: boolean = false;
  showPdf = '';
  showImage = '';
  pdfOrNot = "";
  showMail: any;
  count = 0;
  ngOnInit() { //localStorage.removeItem('todo');
    this.restApi.getSession(keywords.checkStatus, this.userData?.userEmailId, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        // this.activeRoute.data.subscribe(d => {
        //   this.pageConfig = d.config;
        // })


        this.invoiceService.selectedSub$.pipe(first()).subscribe(val => {

          if (val != null) {
            this.invoiceService.gridView.subscribe(g => {
              this.gridView = g;
              
            })
            this.pageConfig = val?.pageConfig;
            delete val.pageConfig;
            this.copyData = val;
            this.data = JSON.parse(JSON.stringify(this.copyData));
            this.attendenceDetailsCopy = this.copyData.attendenceDetails;
            let overtimeObj = this.copyData?.expenses.filter(f => f.name == keywords.overTime)

            this.copyData.attendenceDetails?.forEach((a, i) => a?.overTimeHours != 0 && a?.overTimeHours != "" ? this.copyData.attendenceDetails[i].overTimeHours = +a?.overTimeHours : a?.overTimeHours)
            this.copyData.attendenceDetails?.forEach((a, i) => {
              if (overtimeObj.length > 0 && (a?.overTimeHours == 0 || a?.overTimeHours == "")) {
                this.copyData.attendenceDetails[i].remarks = ''
              } else if (overtimeObj.length > 0 && (a?.overTimeHours > 0 || a?.overTimeHours != "")) {
                this.copyData.attendenceDetails[i].remarks = a.remarks
              } else {
                this.copyData.attendenceDetails[i].remarks = '';
                this.copyData.attendenceDetails[i].overTimeHours = 0
              }
            })

            let project = []
            let client = []

            this.copyData.projectId?.forEach(f => {
              project.push(f)
            })
            this.copyData.clientId?.forEach(f => {
              client.push(f)
            })

            this.data.projectId = project.toString();
            this.data.clientId = client.toString();

            // this.data.invAmount = "*****";
            // this.data.totalAmt = "*****";
            // this?.data?.expenses?.forEach((e, index) => this.data.expenses[index].amount = "*****");
            // this?.data?.deductions?.forEach((e, index) => this.data.deductions[index].amount != null ? this.data.deductions[index].amount = "*****" : this.data.deductions[index].amount)

            let allComent = [];
            let halfDayArray = [];
            if (this.copyData.invId == null) {
              this.copyData.deductions?.forEach(f => {
                if (f.dates != null && f.dates?.length > 0) {
                  if (f.comment != '' && f.comment != null && f.name != keywords.onsite && f.name != keywords.offshore) {
                    let commentObj = { comment: f.comment, dateRange: this.getDatesInRange(f.dates[0], f.dates[1]) }
                    allComent.push(commentObj);
                  }

                  if (f.startDay == keywords.fromHalf) {
                    halfDayArray.push(this.datePipe.transform(f.dates[0], keywords.formateDateOnly))
                  }

                  if (f.endDay == keywords.toHalf) {
                    halfDayArray.push(this.datePipe.transform(f.dates[1], keywords.formateDateOnly))
                  }
                }
              })


              // perdiem date and comments
              this.copyData.expenses?.forEach(f => {
                if (f.comment != '' && f.comment != null && f.name == keywords.perDiem) {
                  let commentObj = { comment: f.comment, dateRange: this.getDatesInRange(f.dates[0], f.dates[1]) }
                  allComent.push(commentObj);
                }
              })
              let toDate = new Date(this.copyData?.effectiveToDate);
              this.copyData?.effectiveFromDate < this.copyData?.effectiveToDate ? toDate.setDate(toDate.getDate()) : toDate.setDate(toDate.getDate() + 1);
              // this.copyData?.effectiveToDatetoDate.setDate(toDate.getDate());

              var daylist = this.getDaysArray(new Date(this.copyData?.effectiveFromDate), new Date(toDate));
              daylist.map((v) => v.toISOString().slice(0, 10)).join("")
              daylist?.forEach(day => {
                this.attendanceObj = {
                  attId: null,
                  dateOfMonth: '',
                  noOfHoursWorked: null,
                  overTimeHours: 0,
                  totalHours: 0,
                  remarks: '',
                  createdDate: '',
                  createdBy: '',
                  updatedDate: '',
                  updatedBy: ''
                }


                this.attendanceObj.dateOfMonth = this.datePipe.transform(day, keywords.formateDateOnly);
                let halfDay = halfDayArray.filter(f => f == this.attendanceObj.dateOfMonth);
                if (halfDay.length > 0) {
                  this.attendanceObj.noOfHoursWorked = 4;
                  this.attendanceObj.totalHours = 4;
                }
                else {
                  if (this.attendenceDetailsCopy.length > 0) {
                    let index1 = this.attendenceDetailsCopy.findIndex(f => f.dateOfMonth == this.datePipe.transform(this.attendanceObj.dateOfMonth, keywords.formateDateOnly))
                    if (index1 > -1) {
                      let half = halfDay.length > 0 ? halfDay[0] : null
                      let hDate = this.attendenceDetailsCopy[index1].dateOfMonth == half ? true : false;
                      this.attendanceObj.noOfHoursWorked = hDate ? 4 : (this.attendenceDetailsCopy[index1].noOfHoursWorked > 0 && this.attendenceDetailsCopy[index1].noOfHoursWorked == 4 && this.attendenceDetailsCopy[index1].remarks != '') ? 4 : (this.attendenceDetailsCopy[index1].noOfHoursWorked > 0 && this.attendenceDetailsCopy[index1].noOfHoursWorked != 4) ? this.attendenceDetailsCopy[index1].noOfHoursWorked : (this.attendenceDetailsCopy[index1].noOfHoursWorked != 'weekend' && this.attendenceDetailsCopy[index1].noOfHoursWorked !== '') ? 8 : this.attendenceDetailsCopy[index1].noOfHoursWorked == 'weekend' ? 'weekend' : this.attendenceDetailsCopy[index1].noOfHoursWorked === '' ? '' : 0;
                      this.attendanceObj.totalHours = this.attendanceObj.noOfHoursWorked === '' ? 0 : this.attendanceObj.noOfHoursWorked == 4 ? 4 : this.attendanceObj.noOfHoursWorked != 'weekend' ? 8 : 0;
                    }
                  }
                  else {
                    this.attendanceObj.noOfHoursWorked = this.weekend(this.attendanceObj.dateOfMonth);
                    this.attendanceObj.totalHours = this.attendanceObj.noOfHoursWorked == 'weekend' ? 0 : 8;
                  }
                }

                let overtime = this.attendenceDetailsCopy.filter(f => f.dateOfMonth == this.datePipe.transform(day, keywords.formateDateOnly))
                if (overtime.length > 0) {
                  this.attendanceObj.overTimeHours = overtime[0].overTimeHours;
                  this.attendanceObj.totalHours = this.attendanceObj.totalHours + +this.attendanceObj.overTimeHours;
                  // this.attendanceObj.totalHours = this.attendanceObj.totalHours;
                  this.attendanceObj.remarks = overtime[0].remarks
                }
                if (this.attendenceDetailsCopy.length > 0) {
                  let half = halfDay.length > 0 ? halfDay[0] : null
                  let demo = this.attendenceDetailsCopy?.find(f => (f?.dateOfMonth == this.attendanceObj?.dateOfMonth) && f.remarks != '' && f.totalHours != 0 && (half == this.attendanceObj?.dateOfMonth));
                  this.attendanceObj.remarks = demo != undefined ? demo.remarks : this.attendanceObj.remarks;
                }
                this.attendenceDetails.push(this.attendanceObj);
              })

              let perdiemRange = allComent.filter(f => f.comment == 'Onsite-Perdiem');
              let otherRange = allComent.filter(f => f.comment != 'Onsite-Perdiem');
              otherRange?.filter(f => {
                f.dateRange.forEach(o => {
                  let index = perdiemRange[0]?.dateRange.findIndex(e => o == e);
                  index > -1 ? perdiemRange[0]?.dateRange.splice(index, 1) : ''
                })
              })
              // if(this.copyData.perdiemFlag){
              //   this.attendenceDetails?.forEach((o,i) =>{
              //     this.attendenceDetails[i].noOfHoursWorked = this.attendenceDetails[i].noOfHoursWorked != 'weekend' ? 0 : 'weekend';
              //         this.attendenceDetails[i].totalHours = 0;
              //   })
              // }
              this.attendenceDetails?.forEach((f, index) => {
                allComent?.forEach((o, i) => {
                  o.dateRange.forEach(m => {
                    if (f.dateOfMonth == m && o.comment != 'Onsite-Perdiem') {
                      let halfDay = halfDayArray.filter(m => m == f.dateOfMonth);
                      this.attendenceDetails[index].remarks = o.comment;
                      this.attendenceDetails[index].noOfHoursWorked = (this.weekend(this.attendenceDetails[index].dateOfMonth) == 'weekend') ? 'weekend' : halfDay.length > 0 && halfDay.length > 0 ? 4 : 0;
                      this.attendenceDetails[index].totalHours = (this.weekend(this.attendenceDetails[index].dateOfMonth) == 'weekend') ? 0 : halfDay.length > 0 ? 4 : 0;
                    } else if (f.dateOfMonth == m && o.comment == 'Onsite-Perdiem') {
                      this.attendenceDetails[index].remarks = o.comment;
                      this.attendenceDetails[index].noOfHoursWorked = this.attendenceDetails[index].noOfHoursWorked != 'weekend' ? 8 : 'weekend';
                      this.attendenceDetails[index].totalHours = this.attendenceDetails[index].noOfHoursWorked != 'weekend' ? 8 : 0;
                    }
                  })
                })

              })
              //if there is only perdiem consultant the date which are not selected theirs noOfHours should be 0

              if (this.copyData?.onlyPerdiemFlag) {
                let perdiemObj = this.copyData.expenses?.filter(p => p.name == keywords.perDiem);
                perdiemObj?.forEach(p => {
                  this.attendenceDetails.forEach((f, i) => {
                    if (this.datePipe.transform(f.dateOfMonth, keywords.formateDateOnly) >= this.datePipe.transform(p.dates[0], keywords.formateDateOnly) && this.datePipe.transform(f.dateOfMonth, keywords.formateDateOnly) <= this.datePipe.transform(p.dates[1], keywords.formateDateOnly)) {

                    } else {
                      this.attendenceDetails[i].noOfHoursWorked = 0;
                      this.attendenceDetails[i].totalHours = 0;
                    }
                  })
                })
              }
            } else {
              this.attendenceDetails = this.attendenceDetailsCopy;
              this.copyData.deductions?.forEach(f => {
                if (f.dates != null && f.dates?.length > 0) {
                  if (f.comment != '' && f.comment != null && f.name != keywords.onsite && f.name != keywords.offshore) {
                    let commentObj = { comment: f.comment, dateRange: this.getDatesInRange(f.dates[0], f.dates[1]) }
                    allComent.push(commentObj);
                  }
                  if (f.startDay == keywords.fromHalf) {
                    halfDayArray.push(this.datePipe.transform(f.dates[0], keywords.formateDateOnly))
                  }

                  if (f.endDay == keywords.toHalf) {
                    halfDayArray.push(this.datePipe.transform(f.dates[1], keywords.formateDateOnly))
                  }
                }
              })
              // perdiem date and comments
              this.copyData.expenses?.forEach(f => {
                if (f.comment != '' && f.comment != null && f.name == keywords.perDiem) {
                  let commentObj = { comment: f.comment, dateRange: this.getDatesInRange(f.dates[0], f.dates[1]) }
                  allComent.push(commentObj);
                }
              })
              // overtime remarks
              // perdiem date and comments
              this.copyData.attendenceDetails?.forEach(f => {
                if (f.overTimeHours > 0 && f.overTimeHours != "" && f.remarks != "") {
                  let commentObj = { comment: f.remarks, dateRange: this.getDatesInRange(f.dateOfMonth, f.dateOfMonth) }
                  allComent.push(commentObj);
                }
              })
              let perdiemRange = allComent.filter(f => f.comment == 'Onsite-Perdiem');
              let otherRange = allComent.filter(f => f.comment != 'Onsite-Perdiem');
              otherRange?.filter(f => {
                f.dateRange.forEach(o => {
                  let index = perdiemRange[0]?.dateRange.findIndex(e => o == e);
                  index > -1 ? perdiemRange[0]?.dateRange.splice(index, 1) : ''
                })
              })
              if (this.copyData.perdiemFlag) {
                this.attendenceDetails?.forEach((o, i) => {
                  this.attendenceDetails[i].noOfHoursWorked = this.attendenceDetails[i].noOfHoursWorked != 'weekend' ? 0 : 'weekend';
                  this.attendenceDetails[i].totalHours = 0;
                })
              }
              this.attendenceDetails?.forEach((f, index) => {
                allComent?.forEach((o, i) => {
                  o.dateRange.map(m => {
                    if (f.dateOfMonth == m && o.comment != 'Onsite-Perdiem') {
                      let halfDay = halfDayArray.filter(m => m == f.dateOfMonth);
                      this.attendenceDetails[index].remarks = o.comment;
                      let overtimeObj = f?.overTimeHours > 0 ? true : false;
                      this.attendenceDetails[index].noOfHoursWorked = (this.weekend(this.attendenceDetails[index].dateOfMonth) == 'weekend') && overtimeObj ? +f?.overTimeHours : (this.weekend(this.attendenceDetails[index].dateOfMonth) != 'weekend') && overtimeObj && halfDay.length > 0 ? 4 : (this.weekend(this.attendenceDetails[index].dateOfMonth) != 'weekend') && overtimeObj && halfDay.length == 0 ? 8 : (this.weekend(this.attendenceDetails[index].dateOfMonth) == 'weekend') ? 'weekend' : halfDay.length > 0 && halfDay.length > 0 ? 4 : 0;
                      this.attendenceDetails[index].totalHours = (this.weekend(this.attendenceDetails[index].dateOfMonth) == 'weekend') && overtimeObj ? +f?.overTimeHours : (this.weekend(this.attendenceDetails[index].dateOfMonth) != 'weekend') && overtimeObj ? +f?.overTimeHours + +this.attendenceDetails[index].noOfHoursWorked : (this.weekend(this.attendenceDetails[index].dateOfMonth) == 'weekend' && this.attendenceDetails[index].overTimeHours > 0) ? +this.attendenceDetails[index].overTimeHours : (this.weekend(this.attendenceDetails[index].dateOfMonth) == 'weekend') ? 0 : halfDay.length > 0 ? 4 : 0;
                    } else if (f.dateOfMonth == m && o.comment == 'Onsite-Perdiem') {
                      this.attendenceDetails[index].remarks = o.comment;
                      this.attendenceDetails[index].noOfHoursWorked = this.attendenceDetails[index].noOfHoursWorked != 'weekend' ? this.attendenceDetails[index].noOfHoursWorked : 'weekend';
                      this.attendenceDetails[index].totalHours = this.attendenceDetails[index].noOfHoursWorked != 'weekend' ? this.attendenceDetails[index].totalHours : 0;
                    }
                  })
                })
              })


              let filt = this.attendenceDetails.filter(o => o.noOfHoursWorked != 'weekend' && o.totalHours < 8);
              allComent.forEach(f => {
                f.dateRange.map(m => {
                  filt.filter((t, i) => t.dateOfMonth == m ? filt.splice(i, 1) : '');
                })
              })
              filt.forEach(a => {
                let index = this.attendenceDetails.findIndex(i => a.attId == i.attId);
                if (index > -1) {
                  this.attendenceDetails[index].remarks = '';
                  this.attendenceDetails[index].noOfHoursWorked = 8;
                  this.attendenceDetails[index].totalHours = 8;
                } else {

                }
              })
            }

            //if there is only perdiem consultant the date which are not selected theirs noOfHours should be 0

            if (this.copyData?.onlyPerdiemFlag) {
              let perdiemObj = this.copyData.expenses?.filter(p => p.name == keywords.perDiem);
              perdiemObj?.forEach(p => {
                this.attendenceDetails.forEach((f, i) => {
                  if (this.datePipe.transform(f.dateOfMonth, keywords.formateDateOnly) >= this.datePipe.transform(p.dates[0], keywords.formateDateOnly) && this.datePipe.transform(f.dateOfMonth, keywords.formateDateOnly) <= this.datePipe.transform(p.dates[1], keywords.formateDateOnly)) {

                  } else {
                    this.attendenceDetails[i].noOfHoursWorked = 0;
                    this.attendenceDetails[i].totalHours = 0;
                  }
                })
              })
            }
            // this.gridView=true
          } else {
            //this.previous();
          }

        })
        this.store.gridRowData.subscribe(d => {
          if (d != null && d.attId == null) {
            //   this.attendenceDetails = d;
            this.gridView = true
          }
        })
        this.invoiceService.selectedSubReset$.subscribe(val => {
          if (val == 'update') {
            //  this.gridView = true
            this.flag = true
          } else if (val == null) {
            this.flag = false
          }
        })
        this.sumOfIncome()
      } else {
        this.loader.hide();
        this.authenticateService.logoutThroughAngular();
        this.toastr.error(o?.message)
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg));
  }

  amountInWords: any
  copyAmountInWords = '*****';
  require: any
  sumOfIncome() {
    const numWords = require('num-words')
    // this.completeTotalOfRows= this.invoiceDetails.expenses.map(t => t.amounts).reduce((a , b) => +a + +b, 0);

    this.amountInWords = numWords(Math.round(this.copyData?.totalAmt));
    this.amountInWords = this.amountInWords.charAt(0).toUpperCase() + this.amountInWords.slice(1) + ' only';

    return  //this.invoiceDetails.totalAmt= +this.completeTotalOfRows + this.invoiceDetails.amount


  }


  submit(template: TemplateRef<any>) {
    this.restApi.getSession(keywords.checkStatus, this.userData?.userEmailId, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        let sum = 0;
        this.attendenceDetails?.forEach(f => {
          sum = +sum + +f.overTimeHours
        })
        let overtime = 0
        this.data.expenses.filter(fil => { overtime = +overtime + +fil.hours })
        let emptyNoOfHours = []
        this.attendenceDetails.filter(f => {

          if ((f.noOfHoursWorked === null || f.noOfHoursWorked === "")) {
            emptyNoOfHours.push(f)
          }
        });
        let greaterNoOfHours = this.attendenceDetails.filter(f => f.noOfHoursWorked > 8);
        let overTimeRemark = this.attendenceDetails.filter(f => f.overTimeHours > 0 && (f.remarks == "" || f.remarks == null));
        if (overtime == sum && this.gridView && emptyNoOfHours.length == 0 && greaterNoOfHours.length == 0 && overTimeRemark.length == 0) {
          this.modalRef = this.modalService.show(template);

        } else if (sum > overtime) {
          this.toastr.error("The overtime hours in timesheet is greater than the overtime filled")
        } else if (sum < overtime) {
          this.toastr.error("The overtime hours in timesheet is less than the overtime filled")
        } else if (!this.gridView) {
          this.toastr.error("Please generate timesheet")
        } else if (emptyNoOfHours.length > 0) {
          this.toastr.error("No. of worked hours is empty!");
        } else if (greaterNoOfHours.length > 0) {
          this.toastr.error("No. of worked hours is greater than 8!");
        } else if (overTimeRemark.length > 0) {
          this.toastr.error("Kindly provide your comments regarding the overtime.");
        }
      } else {
        this.loader.hide();
        this.authenticateService.logoutThroughAngular();
        this.toastr.error(o?.message)
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg));
  }

  previous() {
    this.restApi.getSession(keywords.checkStatus, this.userData?.userEmailId, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        this.copyData.attendenceDetails = this.attendenceDetails
        this.invoiceService.selectedSubReset$.subscribe(reset => { reset != 'edit' ? this.invoiceService.reset('previous') : '' })
        this.invoiceService.setdocument(this.copyData)
        this.router.navigate(['/dwc/inv/createinvoice'], { queryParams: { pageId: "RES002" } })
      } else {
        this.loader.hide();
        this.authenticateService.logoutThroughAngular();
        this.toastr.error(o?.message)
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg));
  }

  generateAttendance() {
    this.restApi.getSession(keywords.checkStatus, this.userData?.userEmailId, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        this.gridView = true;
        this.invoiceService.gridView.next(true);
      } else {
        this.authenticateService.logoutThroughAngular();
        this.toastr.error(o?.message);
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))

  }

  successfull() {
    this.restApi.getSession(keywords.checkStatus, this.userData?.userEmailId, this.actionSignature).subscribe(o => {
      if (o?.isValid) {
        let date = new Date(this.copyData?.submissionDate)
        let preparedFilters1 = {
          attendance:[],
          clientId: this.data.clientId,
          compEntity: {
            compId: this.copyData?.compEntity?.compId,
          },
          
          consultantName: this.copyData?.consultantName,
          cpdId: this.data?.projectId,
          createdBy: this.copyData?.consultantName,
          createdDate: this.datePipe.transform(new Date(), "YYYY-MM-dd"),
          empId: this.pageConfig?.employee?.empId,
          eur: this.copyData.eur,
          inr: this.copyData.inr,
          invAmount: encryptUsingAES256(this.copyData.invAmount.toString()),
          invId: this.copyData.invId,
          invNum: this.copyData.invoiceNo,
          invoiceMonth: (new Date(this.copyData.effectiveToDate).getMonth() + 1).toString(),
          invParticulars:[],
          invoiceStatus: this.copyData.invId == null ? keywords.underReview : this.copyData?.invoiceStatus,
          invoiceYear: this.copyData?.invoiceYear,
          invSubmittedCurr : this.copyData?.compEntity.defaultPkg == 'Onsite' ? this.copyData?.compEntity?.onsiteCurrency : this.copyData?.compEntity?.currency,
          noOfDays: this.copyData?.noOfDays,
          particulars: this.copyData.particulars,
          paymentStatus: this.copyData.paymentStatus,
          pkr: this.copyData.pkr,
          reportingId: this.data?.reportingId,
          reportingManagerName: this.data?.reportingManagerName,
          reviewer01Status: this.copyData.invId == null ? 'Pending' : this.copyData.reviewer01Status,
          reviewer02Status: this.copyData.invId == null ? 'Pending' : this.copyData.reviewer02Status,
          sar: this.copyData.sar,
          status: 'active',
          submissionDate: this.datePipe.transform(date, "YYYY-MM-dd"),
          totalAmount: encryptUsingAES256(this.copyData.totalAmount.toString()),
          transferCountry: this.copyData?.transferCountry,
          transferCurrency: this.copyData?.transferCurrency,
          vendor: this.copyData?.vendor,
          updatedBy: this.copyData.invId == null ? '' : this.copyData.consultantName,
          updatedDate: this.copyData.invId == null ? '' : this.datePipe.transform(new Date(), "YYYY-MM-dd"),
          usd: this.copyData.usd,
        }

        preparedFilters1.vendor == null ? delete preparedFilters1.vendor : preparedFilters1.vendor
        let attendance = []
        let particular = [];
        let forSignedParticular = []
        // this.restApi.saveData(ApiPaths.saveOrUpdateinvoice, invoiceBody).subscribe(inv => {
        this.attendenceDetails?.forEach(att => {
          let preparedFilters2 = {
            attId: att.attId,
            // createdBy: this.copyData.consultantName,
            // createdDate: att.attId == null ? this.datePipe.transform(new Date(), "YYYY-MM-dd") : att.createdDate,
            dateOfMonth: att.dateOfMonth,
            //invId: preparedFilters1.invId == null ? null : preparedFilters1.invId,
            invNum: preparedFilters1?.invNum,
            noOfHoursWorked: att.noOfHoursWorked,
            overTimeHours: att.overTimeHours,
            remarks: att?.remarks,
            totalHours: att.totalHours,
            // updatedBy: att.attId == null ? null : this.copyData.consultantName,
            // updatedDate: att.attId == null ? null : this.datePipe.transform(new Date(), "YYYY-MM-dd")
        }
        
          attendance.push(preparedFilters2)
        })


        this.copyData?.deductions?.forEach((p, index) => {
          if (p.name != '') {
            let preparedFilters3 = {
              amount: p?.amount != null ? encryptUsingAES256(p?.amount?.toString()) : '',
              amountcal: p?.amount != null ? encryptUsingAES256(p?.amountcal?.toString()) : '',
              comment: p?.comment?.toString(),
              // createdBy: this.copyData.consultantName,
              // createdDate: p.particularId == null ? this.datePipe.transform(new Date(), "YYYY-MM-dd") : p?.createdDate,
              deductionDate: p?.dates?.toString(),
              endDay: p?.endDay,
              hours: p.hours == '' ? '' : p.hours.toString(),
             // invId: preparedFilters1.invId == null ? null : preparedFilters1.invId,
              name: p?.name,
              noOfDays: p?.noOfDays,
              others: p?.others,
              particularId: p.particularId,
              particularType: 'deduction',
              startDay: p?.startDay,
              // updatedBy: p.particularId == null ? null : this.copyData.consultantName,
              // updatedDate: p.particularId == null ? null : this.datePipe.transform(new Date(), "YYYY-MM-dd")
          }
          
            particular.push(preparedFilters3)
            forSignedParticular.push(preparedFilters3)
          }
        })

        this.copyData?.expenses?.forEach((p, index) => {
          let amountcal = p?.amountcal != null ? encryptUsingAES256(p?.amountcal.toString()) : '';
          let amount = p?.amount != null ? encryptUsingAES256(p?.amount.toString()) : '';
          let forSignedPP: any;
          if (p.name != '') {
            let preparedFilters3 = {
              amount: p?.amount != null ? amount : '',
              amountcal: p?.amountcal != null ? amountcal : '',
              attachment: [],
              checkbox: p?.checkbox,
              comment: p?.comment?.toString(),
              // createdBy: this.copyData.consultantName,
              // createdDate: p.particularId == null ? this.datePipe.transform(new Date(), "YYYY-MM-dd") : p?.createdDate,
              deductionDate: p.dates?.toString(),
              //invId: preparedFilters1.invId == null ? null : preparedFilters1.invId,
              expCurrency: p?.expCurrency?.toString(),
              expCurrencyRate:p?.expCurrencyRate.toString(),
              hours:  isNaN(p.hours) || p.hours == '' ? '' : p.hours.toString(),
              name: p?.name,
              noOfDays: +p?.noOfDays,
              others: p?.others,
              particularId: p.particularId,
              particularType: 'expenses',
              otHourlyRate: isNaN(p.otHourlyRate) || p.otHourlyRate == '' ? '' : p.otHourlyRate.toString(),
              // updatedBy: p.particularId == null ? null : this.copyData.consultantName,
              // updatedDate: p.particularId == null ? null : this.datePipe.transform(new Date(), "YYYY-MM-dd")
            }

            forSignedPP = {
              amount: p?.amount != null ? amount : '',
              amountcal: p?.amountcal != null ? amountcal : '',
              attachment: [],
              checkbox: p?.checkbox,
              comment: p?.comment?.toString(),
              // createdBy: this.copyData.consultantName,
              // createdDate: p.particularId == null ? this.datePipe.transform(new Date(), "YYYY-MM-dd") : p?.createdDate,
              deductionDate: p.dates?.toString(),
              expCurrency: p?.expCurrency?.toString(),
              expCurrencyRate:p?.expCurrencyRate.toString(),
              hours:  isNaN(p.hours) || p.hours == '' ? '' : p.hours.toString(),
              
              //invId: preparedFilters1.invId == null ? null : preparedFilters1.invId, // This line is commented, make sure to uncomment if needed
              name: p?.name,
              noOfDays: +p?.noOfDays,
              others: p?.others,
              particularId: p.particularId,
              particularType: 'expenses',
              otHourlyRate:  isNaN(p.otHourlyRate) || p.otHourlyRate == '' ? '' : p.otHourlyRate.toString(),
              // updatedBy: p.particularId == null ? null : this.copyData.consultantName,
              // updatedDate: p.particularId == null ? null : this.datePipe.transform(new Date(), "YYYY-MM-dd"),
            }

            p.attachment?.forEach(f => {
              if (preparedFilters1.invId == null) {
                var base64: any;
                if (f.fileType == 'message') {
                  f.file = window.btoa(f.file)
                  base64 = f?.file
                  // f.file = encode(f.file)
                }
                else {
                  var parts = f.file.split(";base64,");
                  var contentType = parts[0].replace("data:", "");
                  base64 = parts[1];

                  f.file = this.base64ToArrayBuffer(base64);
                }
                // let demo = {file:f}
                preparedFilters3.attachment.push(f)
                let file = { file: base64, fileId: f.fileId == null ? 0 : f.fileId, fileType: f.fileType };
                forSignedPP.attachment.push(file)
              } else {
                var base64: any;
                if (f.fileType == 'message' && f.fileId == null) {
                  f.file = window.btoa(f.file)
                  base64 = f?.file
                  // f.file = encode(f.file)
                }
                else {
                  var parts = f.file.includes(",") ? f.file.split(";base64,") : f.file;
                  if (Array.isArray(parts)) {
                    base64 = parts[1];
                  } else {
                    base64 = parts;
                  }
                }

                f.file = this.base64ToArrayBuffer(base64);
                preparedFilters3.attachment.push(f)
                let file = { file: base64, fileId: f.fileId == null ? 0 : f.fileId, fileType: f.fileType };
                forSignedPP.attachment.push(file)
              }
            })
            // preparedFilters3.attachment = p?.file;
            particular.push(preparedFilters3);
            forSignedParticular.push(forSignedPP)
          }
        })

        
        let attendBody = {
          attendPayload: attendance,
          signature: this.signatureService.signPayload(attendance)
        }
        // this.restApi.saveData(ApiPaths.saveOrUpdateAttendance, attendBody).subscribe(s => { })

        if (particular.length > 0) {
          let particularBody = {
            particularPayload: particular,
            signature: this.signatureService.signPayload(particular)
          }
          this.loader.show();
          // this.restApi.saveData(ApiPaths.saveOrUpdateInvoiceParticular, particularBody).subscribe(s => {
          //   this.loader.hide()
          // })

        }
        //this.copyData.invId == null ? this.toastr.success("Invoice submitted successfully") : this.toastr.success("Invoice updated successfully")
        // })

        if (preparedFilters1.invId == null) {
          preparedFilters1.invId = 0;
          preparedFilters1.sar = preparedFilters1.sar.toString();
          preparedFilters1.inr = preparedFilters1.inr.toString();
          preparedFilters1.usd = preparedFilters1.usd.toString();
          preparedFilters1.eur = preparedFilters1.eur.toString();
          preparedFilters1.pkr = preparedFilters1.pkr.toString();
          delete preparedFilters1.updatedBy;
          delete preparedFilters1.updatedDate
          // preparedFilters1.noOfDays = preparedFilters1.noOfDays?.toString();
        }
        attendance.forEach((a, i) => {
          if (a.attId == null) {
            attendance[i].attId = 0;
           // attendance[i].invId = 0;
            attendance[i].noOfHoursWorked = attendance[i].noOfHoursWorked.toString();
            attendance[i].overTimeHours = attendance[i].overTimeHours.toString();
            attendance[i].totalHours = attendance[i].totalHours.toString();
          } else {
            attendance[i].noOfHoursWorked
            attendance[i].noOfHoursWorked = attendance[i].noOfHoursWorked.toString();
            attendance[i].overTimeHours = attendance[i].overTimeHours.toString();
            attendance[i].totalHours = attendance[i].totalHours.toString();
          }
        })

        particular?.forEach((p, i) => {
          if (p.particularId == null || p.particularId == 0) {
         //   particular[i].invId = preparedFilters1.invId == null || preparedFilters1.invId == 0 ? "0" : particular[i].invId.toString();
          //  particular[i].comment = particular[i].comment == "" || particular[i].comment == null ? delete particular[i].comment : String(particular[i].comment);
            //particular[i].comment = String(particular[i].comment)
            particular[i].particularId = 0
            particular[i].noOfDays = particular[i].noOfDays == null ? '0' : String(particular[i].noOfDays);
            
          } else {
            particular[i].noOfDays = particular[i]?.noOfDays == "null" ? '0' : String(particular[i].noOfDays);
         //   particular[i].invId = particular[i]?.invId?.toString();
            particular[i].noOfDays = String(particular[i].noOfDays);
          }
        })

        forSignedParticular?.forEach((p, i) => {
          if (p.particularId == null || p.particularId == 0) {

            //forSignedParticular[i].invId = preparedFilters1.invId == null || preparedFilters1.invId == 0 ? "0" : forSignedParticular[i].invId?.toString();
            // forSignedParticular[i].comment = forSignedParticular[i].comment == "" || forSignedParticular[i].comment == null ? delete forSignedParticular[i].comment : String(forSignedParticular[i].comment);
            // forSignedParticular[i].comment = String(forSignedParticular[i].comment)
            forSignedParticular[i].particularId = 0
            forSignedParticular[i].noOfDays = forSignedParticular[i].noOfDays == null ? '0' : String(forSignedParticular[i].noOfDays);
           
          } else {
            forSignedParticular[i].noOfDays = forSignedParticular[i].noOfDays == "null" ? '0' : String(forSignedParticular[i].noOfDays);
           // forSignedParticular[i].invId = forSignedParticular[i].invId?.toString();
            forSignedParticular[i].noOfDays = String(forSignedParticular[i].noOfDays);
          }
        })

        particular?.forEach((f, i) => {
          removeNullUndefinedEmpty(f)
        })

        attendance?.forEach((f, i) => {
          removeNullUndefinedEmpty(f)
        })
        forSignedParticular?.forEach((f, i) => {
          removeNullUndefinedEmpty(f)
        })

        //assign particulars to invoice object
        preparedFilters1.invParticulars = particular;
        preparedFilters1.attendance = attendance

        const copiedObject = JSON.parse(JSON.stringify(preparedFilters1));
        copiedObject.invParticulars = forSignedParticular
        let invoiceWithSign = {
          invPayload: preparedFilters1,
          signature: this.signatureService.signPayload(copiedObject)
        }
        let config = keywords.config;
        config["request-type"] = preparedFilters1.invId == null || preparedFilters1.invId == 0 ? 'save' : 'update';
        this.submitted = true;
        this.restApi.saveData(ApiPaths.saveOrUpdateinvoice, invoiceWithSign, config).subscribe(inv => {
          inv.status == "ERROR" ? this.toastr.error(inv.message) : this.toastr.success(inv.message);
          this.submitted = false;
          this.loader.hide();
        }, (err) => {
          this.toastr.error(toastrMsg.errMsg);
          this.submitted = false;
        })
        setTimeout(() => {
          if (this.flag == true) {
            this.router.navigate(['/dwc/inv/invoicehistory'])

          } else if (this.flag == false) {

            this.router.navigate(['/dwc/inv/createinvoice'], { queryParams: { pageId: "RES002" } })
          }
        }, 3000)
        //  this.invoiceService.goToPrivious.next(true)
        this.invoiceService.reset('resetA');
        //this.invoiceService.reset(null);
        this.invoiceService.setdocument(null)
        this.store.gridRowData.next(null);
        //this.attendenceDetails = []
      } else {
        this.loader.hide();
        this.authenticateService.logoutThroughAngular();
        this.toastr.error(o?.message)
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg));
  }


  openReasonModal(template: TemplateRef<any>, index, fileIndex) {
    this.restApi.getSession(keywords.checkStatus, this.userData?.userEmailId, this.actionSignature).subscribe(async d => {
      if (d?.isValid) {
        for (let i = 0; i < this.data.expenses[index].attachment.length; i++) {
          this.showPdf = '';
          this.showImage = '';
          this.showMail = ''
          this.pdfOrNot = this.data.expenses[index].attachment[fileIndex].fileType;
          if (this.pdfOrNot == 'pdf') {
            if (this.data.invId == null) {
              let split = this.data.expenses[index].attachment[fileIndex].file.includes(',') ? this.data.expenses[index].attachment[fileIndex].file.split(',') : this.data.expenses[index].attachment[fileIndex].file;

              if (Array.isArray(split)) {
                var blob = this.b64toBlob(split[1]);
              } else {
                var blob = this.b64toBlob(this.data.expenses[index].attachment[fileIndex].file);
              }

            } else {
              let split = this.data.expenses[index].attachment[fileIndex].file.includes(',') ? this.data.expenses[index].attachment[fileIndex].file.split(',') : this.data.expenses[index].attachment[fileIndex].file;
              // this.loader.show();
              if (Array.isArray(split)) {
                this.loader.show();
                var blob = this.b64toBlob(split[1]);
              } else {
                this.loader.show();
                var blob = this.b64toBlob(this.data.expenses[index].attachment[fileIndex].file);
              }
            }

            this.showPdf = window.URL.createObjectURL(blob);
            this.modalRef = this.modalService.show(template);
          } else if (this.pdfOrNot == 'message') {
            if (this.data?.invId == null) {
              //this.showMail = await PostalMime.parse(this.data?.expenses[index].attachment[fileIndex].file);
              if (this.data?.expenses[index].attachment[fileIndex].file.startsWith('data:')) {
                const base64Data = this.data?.expenses[index].attachment[fileIndex].file.split(',')[1];
                const decodedData = atob(base64Data);
                this.showMail = await PostalMime.parse(decodedData);
              } else {
                this.showMail = await PostalMime.parse(this.data?.expenses[index].attachment[fileIndex].file);
              }
              this.modalRef = this.modalService.show(template);
            } else {
              if (this.data?.expenses[index].attachment[fileIndex].fileId == null || this.data?.expenses[index].attachment[fileIndex].fileId == 0 || this.data?.expenses[index].attachment[fileIndex].fileId == "") {
                this.showMail = await PostalMime.parse(this.data?.expenses[index].attachment[fileIndex].file);
              } else {
                let decode = atob(this.data?.expenses[index].attachment[fileIndex].file);
                this.showMail = await PostalMime.parse(decode);
              }
              this.modalRef = this.modalService.show(template);
            }
            // if (this.data?.invId == null) {
            //   //  let mail = new DOMParser().parseFromString(this.data?.expenses[index].attachment[fileIndex].file, "text/html");
            //   this.showMail = await PostalMime.parse(this.data?.expenses[index].attachment[fileIndex].file);
            //   this.modalRef = this.modalService.show(template);
            // } else {
            //   let decode = atob(this.data?.expenses[index].attachment[fileIndex].file);
            //   this.showMail = planer.extractFrom(decode, 'text/html', window.document);
            //   this.modalRef = this.modalService.show(template);
            // }

          } else {
            if (this.data.invId == null) {
              this.pdfOrNot == ''
              this.showImage = this.data?.expenses[index].attachment[fileIndex].file;
            } else {
              if (this.data?.expenses[index].attachment[fileIndex].file.includes('data:image/png;base64,')) {
                this.showImage = this.data?.expenses[index].attachment[fileIndex].file
              } else {
                this.showImage = 'data:image/png;base64,' + this.data?.expenses[index].attachment[fileIndex].file;
              }

              if (this.data?.expenses[index].attachment[fileIndex].file.includes('data:image/jpeg;base64,')) {
                this.showImage = this.data?.expenses[index].attachment[fileIndex].file
              } else if (!this.showImage.includes('data:image/png;base64,')) {
                this.showImage = 'data:image/jpeg;base64,' + this.data?.expenses[index].attachment[fileIndex].file;
              }
            }
            this.modalRef = this.modalService.show(template);
          }
        }
      } else {
        this.authenticateService.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))
  }


  getDaysArray(start, end) {
    end = (this.pageConfig.employee?.compEntity[0].effectiveFromDate > this.pageConfig.employee?.compEntity[0].effectiveToDate && end.getMonth() == 0)
      || (this.pageConfig.employee?.compEntity[0].effectiveFromDate < this.pageConfig.employee?.compEntity[0].effectiveToDate && (end.getMonth() == 9 || end.getMonth() == 10 || end.getMonth() == 11)) ? end.setDate(end.getDate() + 1) : end;
    for (var arr = [], dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
      arr.push(new Date(dt));
    }
    return arr;
  }

  //to get weekend between dates
  weekend(date1) {
    var dt = new Date(date1);

    if (dt.getDay() == 5 || dt.getDay() == 6) {
      return "weekend";
    }
    else {
      return 8;
    }

  }


  overtimeChange(event, index) {
    if (this.attendenceDetails[index].noOfHoursWorked != 'weekend') {
      this.attendenceDetails[index].totalHours = +event + +this.attendenceDetails[index].noOfHoursWorked
    } else {
      this.attendenceDetails[index].totalHours = +event
    }

    if (this.attendenceDetails[index].overTimeHours == 0) {
      this.attendenceDetails[index].remarks = ''
    }
  }
  noOfWorkedChange(event, index) {
    let week = isNaN(this.attendenceDetails[index].noOfHoursWorked);
    week ? this.attendenceDetails[index].noOfHoursWorked = 'weekend' : this.attendenceDetails[index].noOfHoursWorked;
    if (this.attendenceDetails[index].noOfHoursWorked != 'weekend' && this.attendenceDetails[index].noOfHoursWorked > 8) {
      //  this.attendenceDetails[index].noOfHoursWorked = null;
      this.toastr.error("No of worked hours is greater than 8");
      return;
    }
    else {
      if (this.attendenceDetails[index].noOfHoursWorked != 'weekend') {
        this.attendenceDetails[index].totalHours = +event + +this.attendenceDetails[index].overTimeHours
      } else {
        this.attendenceDetails[index].totalHours = 0
      }
    }

  }
  cancelImage(index, fileIndex) {

    this.data.expenses[index].attachment.splice(fileIndex, 1);
  }
  hideModal() {
    this.modalService.hide()
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


  base64ToArrayBuffer(base64String) {
    const byteCharacters = atob(base64String);
    var binaryString = base64String;
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return byteNumbers;
  }

  toBytes(text: string) {
    const buffer = Buffer.from(text, 'utf8');
    const result = Array(buffer.length);
    for (let i = 0; i < buffer.length; ++i) {
      result[i] = buffer[i];
    }
    return result;
  };


  encryptAndDecrypt(template: TemplateRef<any>) {
    this.password = null;
    this.modalRef = this.modalService.show(template);

    // totalAmount == '*****' ? this.totalAmount = this.data?.totalAmt : this.totalAmount = '*****';
  }

  decript() {

    if (this.password.toLowerCase() == decryptUsingAES256(this.pageConfig.employee.empPassword).toLowerCase()) {

      this.data.totalAmt = this.data.totalAmt == '*****' ? this.copyData?.totalAmt : '*****';
      this.data.invAmount = this.data?.invAmount == '*****' ? +this.copyData?.invAmount : '*****';
      this.data?.expenses?.forEach((e, i) => {

        this.data.expenses[i].amount = this.data.expenses[i].amount == '*****' ? +this.copyData.expenses[i].amount : '*****';
        //   setTimeout(()=>{
        // this.copyAmountInWords =  this.copyAmountInWords == "*****" ? this.amountInWords : '*****';
        // },1000)
        this.copyAmountInWords = this.amountInWords;
      })
      this.data?.deductions?.forEach((e, i) => {

        this.data.deductions[i].amount = this.data.deductions[i].amount == '*****' ? +this.copyData.deductions[i].amount : '*****';
        //  this.copyAmountInWords =   this.amountInWords;
      })
    } else {
      this.toastr.error("Password is incorrect!");
    }
  }

  getDatesInRange(startDate, endDate) {
    return getDatesInRange(startDate, endDate, this.datePipe)
  }

}
