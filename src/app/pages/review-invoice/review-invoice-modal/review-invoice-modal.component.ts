import { Component, TemplateRef } from '@angular/core';
import { image, keywords, toastrMsg } from 'src/app/shared/constant';
import { RestApiService } from 'src/app/services/rest-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ApiPaths, decryptUsingAES256 } from 'src/app/shared/util';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal'
import { ReviewService } from './review.service';
import { ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthenticationService } from 'src/app/_services';
import { DecimalPipe } from '@angular/common';
import * as planer from "planer";
import PostalMime from 'postal-mime';
import { SignatureService } from 'src/app/services/SignatureService';
@Component({
  selector: 'app-review-invoice-modal',
  templateUrl: './review-invoice-modal.component.html',
  styleUrls: ['./review-invoice-modal.component.scss']
})
export class ReviewInvoiceModalComponent {
  modalRef?: BsModalRef;
  userData;
  columns = [];
  actionSignature;
  constructor(private toastr: ToastrService, private restApi: RestApiService, private modalService: BsModalService, public reviewService: ReviewService, private authService: AuthenticationService, private _decimalPipe: DecimalPipe,
    private signature: SignatureService
  ) {
    this.authService.currentUser.subscribe(user => this.userData = user?.loginUserDetails);
    this.actionSignature = signature.signPayload(this.userData?.userEmailId);
  }

  data: any;
  copyData: any;
  completeTotalOfRows: any;
  completeDeductOfRows: any;
  password = null;
  pageConfig = null;
  totalAmount = 0;
  totalAmountCopy: any;
  obj;
  showMail;
  header = [{ id: 'accountHolderName', name: 'Account Holder Name' }, { id: 'accountNumber', name: 'Account No.' }, { id: 'bankName', name: 'Bank Name' }, { id: 'bankAddress', name: 'Bank Address' }, { id: 'swiftCode', name: 'Swift Code' }, { id: 'status', name: 'Bank Account Status' }];
  bankDataGrid = true
  // pdfPassword = decryptUsingAES256(this.pageConfig.employee?.empPassword)
  // PdfVersionEnum = pdf.PdfVersion;
  // PdfPrintPermissionEnum = pdf.PdfPrintPermission;
  // //
  // opts: pdf.IPdfDocumentOptions = {
  //     userPassword: this.pdfPassword,
  //     ownerPassword: this.pdfPassword,
  //     version: pdf.PdfVersion.v1_3,
  //     permissions: {
  //         annotating: false,
  //         contentAccessibility: false,
  //         copying: false,
  //         documentAssembly: false,
  //         fillingForms: false,
  //         modifying: false,
  //         printing: pdf.PdfPrintPermission.NotAllowed
  //     }
  // };
  ngOnInit() {
    this.pageConfig = this.reviewService.pageConfig;
    if (this.reviewService.obj == 'invoice') {

  
      // this.reviewService.selectedDataSource$.subscribe(val=>{
      // })

      this.obj = this.reviewService.obj;
      this.copyData = this.reviewService.viewData;
      // this.copyData["clientName"] = null;

      this.data = JSON.parse(JSON.stringify(this.copyData));
      this.data.invoiceObj.invAmount = '*****';

      this.copyData.invoiceObj.invAmount = isNaN(this.copyData.invoiceObj.invAmount) ? decryptUsingAES256(this.copyData.invoiceObj.invAmount) : this.copyData.invoiceObj.invAmount
      this.copyData.invoiceObj.totalAmount = isNaN(this.copyData.invoiceObj.totalAmount) ? decryptUsingAES256(this.copyData.invoiceObj.totalAmount) : this.copyData.invoiceObj.totalAmount

      this.data?.invoiceObj?.invParticulars?.forEach((f, i) => {
        this.data.invoiceObj.invParticulars[i].amount = '*****'


      })
      setTimeout(() => {
        this.copyData?.invoiceObj?.invParticulars.forEach((f, i) => {
          this.copyData.invoiceObj.invParticulars[i].amount = isNaN(this.copyData.invoiceObj?.invParticulars[i].amount) ? decryptUsingAES256(this.copyData.invoiceObj.invParticulars[i].amount) : this.copyData.invoiceObj.invParticulars[i].amount

        })
        // this.sumOfIncome()
        this.totalAmountCopy = this.data?.invoiceObj?.totalAmount != null || this.data?.invoiceObj?.totalAmount != "" ? decryptUsingAES256(this.data?.invoiceObj?.totalAmount) : ""
        this.sumOfIncome()
      }, 500)

    } else {
      this.copyData = this.reviewService.viewData;
      this.header.filter((filter: any) => { 
        this.columns.push({ dataField: filter.id, alignment: 'left', caption: filter.name, adaptive: true })
      })
    }

  }

  close() {
    this.reviewService.close()
  }

  tabIndex: number = 0;
  tabClicked(index) {
    // if (index == 1) {
    // //  return;
    // this.tabIndex = 
    // }
    this.tabIndex = index;
  }
  showPdf = '';
  showImage = '';
  pdfOrNot = '';
  openReasonModal(template: TemplateRef<any>, attachment) {
    this.restApi.getSession(keywords.checkStatus, this?.userData?.userEmailId, this.actionSignature).subscribe(async d => {
      if (d?.isValid) {
        this.showPdf = '';
        this.showImage = '';
        this.showMail = '';
        this.showMail = '';
        this.pdfOrNot = attachment?.fileType;
        if (this.pdfOrNot == 'pdf') {
          var blob = this.b64toBlob(attachment.file);
          
          this.showPdf = window.URL.createObjectURL(blob);
        } else if (this.pdfOrNot == 'message') {
          let decode = atob(attachment?.file);
          this.showMail = await PostalMime.parse(decode);
          this.modalRef = this.modalService.show(template);
        } else {

          this.showImage = 'data:image/png;base64,' + attachment?.file;
        }

        this.modalRef = this.modalService.show(template);
      } else {
        this.authService.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))

  }

  amountInWords: any;
  copyAmountInWords = '*****';
  require: any


  sumOfIncome() {
    const numWords = require('num-words')
    this.amountInWords = numWords(isNaN(this.copyData.invoiceObj.totalAmount) ? decryptUsingAES256(this.copyData.invoiceObj.totalAmount) : this.copyData.invoiceObj.totalAmount)
    this.amountInWords = this.amountInWords.charAt(0).toUpperCase() + this.amountInWords.slice(1) + ' only';
    return this.amountInWords;
  }


  encryptAndDecrypt(template: TemplateRef<any>) {
    this.password = null
    this.modalRef = this.modalService.show(template);

    // totalAmount == '*****' ? this.totalAmount = this.data?.totalAmt : this.totalAmount = '*****';
  }

  decript() {
    let dbPassword = ''
    if (this.reviewService.pageName == 'reviewinvoice') {
      dbPassword = this.userData.empId.toLowerCase();
    } else if (this.reviewService.pageName == 'invoicehistory') {
      dbPassword = decryptUsingAES256(this.pageConfig.employee.empPassword).toLowerCase();
    }
    if (dbPassword != '') {
      setTimeout(() => {
        if (this.password?.toLowerCase() == dbPassword) {

          this.data.invoiceObj.invAmount = this.data.invoiceObj.invAmount == '*****' ? this.copyData?.invoiceObj.invAmount : '*****';
          if (this.totalAmountCopy == '*****') {
            this.totalAmountCopy = decryptUsingAES256(this.data.invoiceObj.totalAmount)
            this.copyAmountInWords = this.sumOfIncome();
          } else {
            this.totalAmountCopy = '*****';
            this.copyAmountInWords = '*****'
          }
       
          this.data?.invoiceObj?.invParticulars.forEach((e, i) => {
            this.data.invoiceObj.invParticulars[i].amount = this.data?.invoiceObj?.invParticulars[i].amount == '*****' ? +this.copyData?.invoiceObj?.invParticulars[i].amount : '*****';
          })
        } else {
          this.toastr.error("Password is incorrect!");
        }
      }, 500)
    }
  }

  b64toBlob(b64Data) {
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


  generatePdfDetailsList: any = [];
  generatePdfAttendence: any = [];
  pdfDataSource: any = [];

  downloadPDF() {
    this.restApi.getSession(keywords.checkStatus, this?.userData?.userEmailId, this.actionSignature).subscribe(d => {
      if (d?.isValid) {
        this.generatePdfDetailsList = this.copyData;
        let userPassword = '';
        let ownerPassword = ''
        if (this.reviewService.pageName == 'reviewinvoice') {
          userPassword = this.userData?.roleName == 'Finance' ? "" : this.userData.empId;
          ownerPassword = this.userData?.roleName == 'Finance' ? "" : this.userData.empId;
        } else if (this.reviewService.pageName == 'invoicehistory') {
          userPassword = decryptUsingAES256(this.pageConfig?.employee?.empPassword);
          ownerPassword = decryptUsingAES256(this.pageConfig?.employee?.empPassword);
        }
        const doc = new jsPDF({
          encryption: {
            userPassword: userPassword,
            ownerPassword: ownerPassword,
            userPermissions: ["print", "modify", "copy", "annot-forms"]
          }
        });
        let body = []
        let finlaLIst: any = []
        var tittle = 'Invoice'
        var summary = 'Consultant Details'
        var bankDetails = 'Bank Details';
        var details = 'Invoice Details'
        var status = 'Status :'
        let lengthOfIndex = 0
        // var NotoSansArabicBold=pdfArabicFonts.NotoSansArabicBold
        var invStatus = this.generatePdfDetailsList.invoiceObj.invoiceStatus;
        invStatus = invStatus == keywords.underReview ? keywords.underRevLabel : invStatus == keywords.paymentInitiated ? "Payment Initiated" : invStatus == keywords.paid ? "Paid" : invStatus;
        var color = this.generatePdfDetailsList.invoiceObj.invoiceStatus == 'Approved' || this.generatePdfDetailsList.invoiceObj.invoiceStatus == keywords.paid || this.generatePdfDetailsList.invoiceObj.invoiceStatus == keywords.paymentInitiated ? 'green' : this.generatePdfDetailsList.invoiceObj.invoiceStatus == 'Rejected' ? 'red' : 'orange'
        //  if(this.selectedLang == 'en'){

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
          } else if (element.name == keywords.offPaidLeave) {
            part = keywords.offPaidLeave + " (" + element.comment + ')'
          } else if (element.name == keywords.onsitePdLeave) {
            part = keywords.onsitePdLeave + " (" + element.comment + ')'
          }
          else if (element.name != '') {
            part = element.name
          }
          let amount = element.name == keywords.offUnLeave || element.name == keywords.onSiteUnLeave ? '- ' + element?.amount : element.amount;
          body.push(part, element.noOfDays, element.amount)
          finlaLIst.push(body)
        });
        finlaLIst.push([this.amountInWords, 'Total Amount:', isNaN(this.generatePdfDetailsList.invoiceObj.totalAmount) ? decryptUsingAES256(this.generatePdfDetailsList.invoiceObj.totalAmount) : this.generatePdfDetailsList.invoiceObj.totalAmount])
        finlaLIst.forEach(e => {
          // let minus = e[0].includes('Unpaid') ? '-' + e[2] : e[2];
          let num = this._decimalPipe.transform(e[2], '1.2-2');
          num = e[0]?.includes('Unpaid') || e[0]?.includes(keywords.partialInvoiceLabel) || e[0]?.includes(keywords.otherDeductionLabel) ? '- ' + num : num;
          e[2] = num
        })
        lengthOfIndex = finlaLIst.length - 1;
        let addr = this.generatePdfDetailsList.address


        let client = this.generatePdfDetailsList.clientName

        let client2 = this.generatePdfDetailsList.clientName.join().toString()
        var splitTitle = doc.splitTextToSize(client2, 100);

        let currency = this.generatePdfDetailsList.invoiceObj?.invSubmittedCurr == 'PAK (PKR)' ? '(PKR)' : this.generatePdfDetailsList.invoiceObj?.invSubmittedCurr == 'INR (₹)' ? 'INR' : this.generatePdfDetailsList.invoiceObj?.invSubmittedCurr == 'USD ($)' ? 'USD' : this.generatePdfDetailsList.invoiceObj?.invSubmittedCurr == 'EUR (€)' ? 'EUR' : this.generatePdfDetailsList.invoiceObj?.invSubmittedCurr == 'SAR ( ر.س)' ? 'SAR' : '' //this.generatePdfDetailsList.currency == 'INR (₹)' ? 'INR': ''
        let onsiteCurrency = this.generatePdfDetailsList?.onsiteCurrency == 'PAK (PKR)' ? '(PKR)' : this.generatePdfDetailsList?.onsiteCurrency == 'INR (₹)' ? 'INR' : this.generatePdfDetailsList?.onsiteCurrency == 'USD ($)' ? 'USD' : this.generatePdfDetailsList?.onsiteCurrency == 'EUR (€)' ? 'EUR' : this.generatePdfDetailsList?.onsiteCurrency == 'SAR ( ر.س)' ? 'SAR' : '' //this.generatePdfDetailsList.currency == 'INR (₹)' ? 'INR': ''
        let amountHead =  '(' + currency + ')'

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
          // doc.roundedRect(3, 65, 203, 130, 3, 3, 'FD');

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
          // splitTitle.length > 3?doc.text('Invoice Date', 10, 130):  doc.text('Invoice Date', 10, 145)

          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 150) : splitTitle.length > 3 ? doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 140) : doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 135)
          //splitTitle.length > 3?doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 140) :doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 155)

          doc.setFontSize(10),
            doc.setFont('helvetica', 'normal'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text('Consultant Address', 100, 140) : splitTitle.length > 3 ? doc.text('Consultant Address', 100, 130) : doc.text('Consultant Address', 100, 125)
          //splitTitle.length > 3?doc.text('Consultant Address', 100, 130) :doc.text('Consultant Address', 100, 145)

          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text(addr, 100, 150, { maxWidth: 100 }) : splitTitle.length > 3 ? doc.text(addr, 100, 140, { maxWidth: 100 }) : doc.text(addr, 100, 135, { maxWidth: 100 })
          //splitTitle.length > 3?doc.text(addr, 100, 140, { maxWidth: 100 }):doc.text(addr, 100, 155, { maxWidth: 100 })

          doc.setFontSize(10),
            doc.setFont('helvetica', 'normal'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text('Bill To ', 10, 172) : doc.text('Bill To ', 10, 152)
          //doc.text('Bill To ', 10, 172)

          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text('Rootware Technologies DWC-LLC Dated 4/26/2024 PO Box 712738 Dubai UAE', 10, 180, { maxWidth: 80 }) : doc.text('Rootware Technologies DWC-LLC Dated 4/26/2024 PO Box 712738 Dubai UAE', 10, 160, { maxWidth: 80 })
          //doc.text('Rootware Technologies DWC-LLC Dated 4/26/2024 PO Box 712738 Dubai UAE', 10, 180 ,  { maxWidth: 80 })
          // doc.text(this.generatePdfDetailsList.employee.address,100 ,125)
        }

        // if(bankDetails){
        //   doc.setFontSize(14),
        //   doc.setFont('helvetica','bold'),
        //   doc.setTextColor('black');
        //   doc.text(bankDetails,5 ,145)

        //   doc.setDrawColor('#ECEBEB'); 
        //   doc.setFillColor('#F6F8FA')
        //   doc.roundedRect(3,150,203,70, 3, 3, 'FD'); 

        //   doc.setFontSize(10),
        //   doc.setFont('helvetica','normal'),
        //   doc.setTextColor('black');
        //   doc.text('Account Holder Name',10 ,160)

        //   doc.setFontSize(14),
        //   doc.setFont('helvetica','bold'),
        //   doc.setTextColor('black');
        //   doc.text(this.generatePdfDetailsList.bank[0].accountHolderName,10 ,170)

        //   doc.setFontSize(10),
        //   doc.setFont('helvetica','normal'),
        //   doc.setTextColor('black');
        //   doc.text('Bank Account Number',100 ,160)

        //   doc.setFontSize(14),
        //   doc.setFont('helvetica','bold'),
        //   doc.setTextColor('black');
        //   doc.text(this.generatePdfDetailsList.bank[0].accountNumber,100 ,170)

        //   doc.setFontSize(10),
        //   doc.setFont('helvetica','normal'),
        //   doc.setTextColor('black');
        //   doc.text('Bank Name',10 ,180)

        //   doc.setFontSize(14),
        //   doc.setFont('helvetica','bold'),
        //   doc.setTextColor('black');
        //   doc.text(this.generatePdfDetailsList.bank[0].bankName,10 ,190)

        //   doc.setFontSize(10),
        //   doc.setFont('helvetica','normal'),
        //   doc.setTextColor('black');
        //   doc.text('Swift / IFSC Code',100 ,180)

        //   doc.setFontSize(14),
        //   doc.setFont('helvetica','bold'),
        //   doc.setTextColor('black');
        //   doc.text(this.generatePdfDetailsList.bank[0].swiftCode,100 ,190)

        //   doc.setFontSize(10),
        //   doc.setFont('helvetica','normal'),
        //   doc.setTextColor('black');
        //   doc.text('Bank Address',10 ,200)

        //   doc.setFontSize(14),
        //   doc.setFont('helvetica','bold'),
        //   doc.setTextColor('black');
        //   doc.text(this.generatePdfDetailsList.bank[0].bankAddress,10 ,210)
        // }

        if (details) {
          doc.setFontSize(14),

            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text(details, 5, 205) : doc.text(details, 5, 185)
          //doc.text(details, 5, 205)

          // doc.setFontSize(10),
          // doc.setFont('helvetica','normal'),
          // doc.setTextColor('#3498DB');
          // doc.text('['+' '+this.totalRecordsCount+' '+'records]',25 ,135)

        }
        autoTable(doc, {
          margin: { horizontal: 5 },
          bodyStyles: {},
          startY: splitTitle.length > 4 ? 210 : 190,
          // startY: 210,
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

        //  }
        // this.opts.ended = (sender: pdf.PdfDocument, args: pdf.PdfDocumentEndedEventArgs) => pdf.saveBlob(args.blob, 'Document.pdf');
        //       //
        //       let doc = new pdf.PdfDocument(this.opts);
        //       //
        //       doc.drawText('Demo page.');
        //       //
        //       doc.end();

        let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let year = this.generatePdfDetailsList.invoiceObj.invoiceYear.split('-');
        let pdfName = 'Invoice_sheet_' + this.generatePdfDetailsList?.invoiceObj?.consultantName + '_' + month[+this.generatePdfDetailsList.invoiceObj.invoiceMonth - 1] + '_' + year[1];

        doc.save(pdfName)
        //  this.downloadManagerService.setdocument(this.obj)
      } else {
        this.authService.logoutThroughAngular();
        this.toastr.error(d?.message);
        this.reviewService.close();
        this.modalRef?.hide()
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))
  }

  downloadAttendencePdf() {
    this.restApi.getSession(keywords.checkStatus, this?.userData?.userEmailId, this.actionSignature).subscribe(d => {
      if (d?.isValid) {
        this.generatePdfAttendence = this.copyData;
        let userPassword = '';
        let ownerPassword = ''
        if (this.reviewService.pageName == 'reviewinvoice') {
          userPassword = this.userData?.roleName == 'Finance' ? "" : this.userData.empId
          ownerPassword = this.userData?.roleName == 'Finance' ? "" : this.userData.empId
        } else if (this.reviewService.pageName == 'invoicehistory') {
          userPassword = decryptUsingAES256(this.pageConfig?.employee?.empPassword);
          ownerPassword = decryptUsingAES256(this.pageConfig?.employee?.empPassword);
        }
        const doc = new jsPDF({
          encryption: {
            userPassword: userPassword,
            ownerPassword: ownerPassword,
            userPermissions: ["print", "modify", "copy", "annot-forms"]
          }
        });

        let body = []
        let finlaLIst: any = []
        var tittle = 'Invoice'
        var summary = 'Consultant Details'
        var details = 'Timesheet Details'
        var status = 'Status :'

        var invStatus = this.generatePdfAttendence.invoiceObj.invoiceStatus;
        invStatus = invStatus == keywords.underReview ? keywords.underRevLabel : invStatus == keywords.paymentInitiated ? "Payment Initiated" : invStatus == keywords.paid ? "Paid" : invStatus;
        var color = this.generatePdfAttendence.invoiceObj.invoiceStatus == 'Approved' || this.generatePdfAttendence.invoiceObj.invoiceStatus == keywords.paid || this.generatePdfAttendence.invoiceObj.invoiceStatus == keywords.paymentInitiated ? 'green' : this.generatePdfAttendence.invoiceObj.invoiceStatus == 'Rejected' ? 'red' : 'orange'

        // var invStatus = this.generatePdfAttendence.invoiceObj.invoiceStatus
        // var color = this.generatePdfAttendence.invoiceObj.invoiceStatus == 'Approved' ? 'green' : this.generatePdfAttendence.invoiceObj.invoiceStatus == 'Rejected' ? 'red' : 'orange'
        //  if(this.selectedLang == 'en'){

        finlaLIst.push([this.generatePdfAttendence.invoiceObj?.attendance?.dateOfMonth, this.generatePdfAttendence.invoiceObj?.attendance?.noOfHoursWorked, this.generatePdfAttendence.invoiceObj?.attendance?.overTimeHours, this.generatePdfAttendence.invoiceObj?.attendance?.totalHours, this.generatePdfAttendence.invoiceObj?.attendance?.remarks]);

        this.generatePdfAttendence.invoiceObj?.attendance?.forEach(att => {
          body = []
          body.push(att.dateOfMonth, att.noOfHoursWorked, att.overTimeHours, att.totalHours, att.remarks)
          finlaLIst.push(body)
        });


        let addr = this.generatePdfAttendence?.address
        // for (let i = 0; i < this.generatePdfAttendence?.employee.address?.length; i++) {
        //   if (i == 38) {
        //     addr = addr + '\n'
        //   } else if (i == 70) {
        //     addr = addr + '\n'
        //   } else {
        //     addr = addr + this.generatePdfAttendence.employee.address.charAt(i)
        //   }

        // }
        let client = this.generatePdfAttendence.clientName
        //let consultantName =this.generatePdfAttendence?.invoiceObj?.consultantName
        let submissionDate = this.generatePdfAttendence?.invoiceObj?.submissionDate

        let client2 = this.generatePdfAttendence.clientName.join().toString()
        var splitTitle = doc.splitTextToSize(client2, 100);

        // for (let i = 0; i < this.generatePdfAttendence.clientName?.length; i++) {
        //  // client = i == 35 ? client + '\n' : i == 70 ? client + '\n' : i == 105 ? client + '\n' : client + this.generatePdfAttendence.clientName.charAt(i)
        //  client =  i == 40 ?  client + '\n': i ==80? client + '\n':i ==120? client + '\n':client + this.generatePdfDetailsList?.clientName?.toString().charAt(i)

        // }
        if (tittle) {
          doc.setFontSize(24),
            doc.setFont('helvetica', 'bold'),
            doc.setFillColor('#113132')
          doc.rect(0, 0, 210, 45, 'F')
          doc.setTextColor('white');
          doc.text(tittle, 5, 38),

            doc.addImage(image.rootImg, 5, 5, 80, 20);

          doc.setFontSize(10),
            doc.setFont('helvetica'),
            doc.setTextColor('gray');
          // doc.text('Invoice :',160 ,15)

          // doc.setFontSize(10),
          // doc.setFont('helvetica'),
          // doc.setTextColor('white');
          // doc.text(this.date,185 ,15)

          // doc.addImage(imgData, 5, 5, 80, 20);
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
          // doc.roundedRect(3, 65, 203, 130, 3, 3, 'FD');

          doc.setFontSize(10),
            doc.setFont('helvetica', 'normal'),
            doc.setTextColor('black');
          doc.text('Consultant/Company Name', 10, 75)

          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          doc.text(this.generatePdfAttendence?.invoiceObj?.vendor || this.generatePdfAttendence?.invoiceObj?.consultantName, 10, 85)


          doc.setFontSize(10),
            doc.setFont('helvetica', 'normal'),
            doc.setTextColor('black');
          doc.text('Manager Name', 100, 75)

          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          doc.text(this.generatePdfAttendence.invoiceObj.reportingManagerName, 100, 85)

          doc.setFontSize(10),
            doc.setFont('helvetica', 'normal'),
            doc.setTextColor('black');
          doc.text('Invoice Number', 10, 95)

          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          doc.text(this.generatePdfAttendence.invoiceObj.invNum, 10, 102)

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
          // splitTitle.length > 3?doc.text('Invoice Date', 10, 130):  doc.text('Invoice Date', 10, 145)

          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text(submissionDate, 10, 150) : splitTitle.length > 3 ? doc.text(submissionDate, 10, 140) : doc.text(submissionDate, 10, 135)
          //splitTitle.length > 3?doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 140) :doc.text(this.generatePdfDetailsList.invoiceObj.submissionDate, 10, 155)

          doc.setFontSize(10),
            doc.setFont('helvetica', 'normal'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text('Consultant Address', 100, 140) : splitTitle.length > 3 ? doc.text('Consultant Address', 100, 130) : doc.text('Consultant Address', 100, 125)
          //splitTitle.length > 3?doc.text('Consultant Address', 100, 130) :doc.text('Consultant Address', 100, 145)

          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text(addr, 100, 150, { maxWidth: 100 }) : splitTitle.length > 3 ? doc.text(addr, 100, 140, { maxWidth: 100 }) : doc.text(addr, 100, 135, { maxWidth: 100 })
          //splitTitle.length > 3?doc.text(addr, 100, 140, { maxWidth: 100 }):doc.text(addr, 100, 155, { maxWidth: 100 })

          doc.setFontSize(10),
            doc.setFont('helvetica', 'normal'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text('Bill To ', 10, 172) : doc.text('Bill To ', 10, 152)
          //doc.text('Bill To ', 10, 172)

          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text('Rootware Technologies DWC-LLC Dated 4/26/2024 PO Box 712738 Dubai UAE', 10, 180, { maxWidth: 80 }) : doc.text('Rootware Technologies DWC-LLC Dated 4/26/2024 PO Box 712738 Dubai UAE', 10, 160, { maxWidth: 80 })
          //doc.text('Rootware Technologies DWC-LLC Dated 4/26/2024 PO Box 712738 Dubai UAE', 10, 180 ,  { maxWidth: 80 })
          // doc.text(this.generatePdfDetailsList.employee.address,100 ,125)
        }

        if (details) {
          doc.setFontSize(14),

            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          splitTitle.length > 4 ? doc.text(details, 5, 205) : doc.text(details, 5, 185)
        }
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

          head: [['Date Of Month', 'No.Of Hours Worked', 'Overtime', 'Total Hours', 'Remark']],
          body: finlaLIst,
          showHead: "firstPage",
          alternateRowStyles: {

          },

          didDrawPage: function (data) {
            if (data.pageCount > 1) { }
          },
        });


        let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let year = this.generatePdfAttendence.invoiceObj.invoiceYear.split('-')
        let pdfName = 'Time_sheet_' + this.generatePdfAttendence?.invoiceObj?.consultantName + '_' + month[+this.generatePdfAttendence.invoiceObj.invoiceMonth - 1] + '_' + year[1];
        doc.save(pdfName)
      } else {
        this.authService.logoutThroughAngular();
        this.toastr.error(d?.message);
        this.hideModal()
      }
    }, (err) => this.toastr.error(toastrMsg.errMsg))
  }
  hideModal() {
    this.modalService.hide()
  }
}