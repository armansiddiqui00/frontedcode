
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from 'src/app/components/confirmation-dialog/confirmation-dialog.service';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { ApiPaths, csaAgreement, csaCopy, decrypt, decryptUsingAES256, deepClone, delay, encryptUsingAES256, removeNullUndefinedEmpty } from 'src/app/shared/util';
import { ReviewService } from '../../review-invoice/review-invoice-modal/review.service';
import { InvoiceService } from '../../invoice-details/invoice.service';
import { forEach, head, indexOf } from 'lodash';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { AuthenticationService } from 'src/app/_services';
import { NgForm } from '@angular/forms';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { error } from 'jquery';
import { SignatureService } from 'src/app/services/SignatureService';
import { Title } from '@angular/platform-browser';
import { SharedService } from 'src/app/services/shared.service';
type AOA = any[][];
@Component({
  selector: 'app-manage-employee',
  templateUrl: './manage-employee.component.html',
  styleUrls: ['./manage-employee.component.scss']
})
export class ManageEmployeeComponent {
  @Output() saveOrUpdate = new EventEmitter();
  @Output() getFilter = new EventEmitter();
  @Input() pageConfig;
  @Input() dataSource;
  @Input() headerConfig;
  multiselect = {
    currencyType: ['INR (₹)', 'SAR ( ر.س)', 'USD ($)', 'PAK (PKR)', 'EUR (€)'],
    currencyCountry: ['Afghanistan','Albania','Algeria','Andorra','Angola','Antigua & Deps','Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bermuda','Bhutan','Bolivia','Bosnia Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina','Burundi','Cambodia','Cameroon','Canada','Cape Verde','Central African Rep','Chad','Chile','China','Colombia','Comoros','Congo','Congo (Democratic Rep)','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','East Timor','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland (Republic)','Israel','Italy','Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Korea North','Korea South','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Macedonia','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russian Federation','Rwanda','St Kitts & Nevis','St Lucia','Saint Vincent & the Grenadines','Samoa','San Marino','Sao Tome & Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Tonga','Trinidad & Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
  ]   

  }
  accountNo: any;
  data = {
    id: null,
    empId: { key: null, value: 'Select Employee' },
    firstName: null,
    lastName: '',
    emailId: '',
    mobileNumber: null,
    cpdId: null,
    clientAddress: null,
    clientId: null,
    invoiceDueDate: null,
    invoiceDueDays:null,
    address: '',
    employmentStatus: null,
    empPassword: null,
    particular: null,
    password: null,
    reportingId: null,
    reportingManagerName: null,
    roleName: null,
    companyName: null,
    companyAddr: null,
    executionDate: null,
    bankEntity: {
      ebId: null,
      accountHolderName : null,
      accountNumber: null,
      bankName: null,
      ifscCode: null,
      swiftCode: null,
      bankAddress: null,
    },

    compEntity: {
      compId: null,
      onsitePkgAnnum: null,
      offshorePkgAnnum: null,
      perDiem: null,
      currency: null,
      onsiteCurrency : null,
      effectiveFromDate: null,
      effectiveToDate: null,
      packageType: "",
      transferCurrency: null,
      transferCountry: null,
      defaultPkg: null,
      status:'active',
    },
    vendor:{
      id:null,
      vendorName : null,
      consultantName : null
    }
  }

  // some code here to get the data from the server and assign it to the datas object 
  // rRemove bill cycle to dropdown and 
  // keep bill cycle in single dropdown in range for example 25-26 and 1 to 10 


  datas = {
    compEntity: {
      billCycleRange: null, // Initialize the selected range
    },
  };

  onBillCycleRangeChange(event: any) {
    const values=  event.split('-');
    console.log('Bill cycle range changed to:', event);
    console.log("split values", values);
    if (values.length === 2) {
        this.data.compEntity.effectiveFromDate = values[0];
        this.data.compEntity.effectiveToDate = values[1];
    }
  }




  manageProjectPageInfo: any;
  userDetails: any;

  fromNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  toNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  fromAccount: boolean = false;
  bankShow = false;
  csaShow = false;

  offPkg = '*****';
  onSitePkg = '*****';
  perDiem = '*****';
  userPassword = "*****";
  projectList = [];
  clientAddrList = [];
  clientList = [];
  passwordFrom:any;
  routerurl;
  showFileButton:any;
  pageId:any;
  viewrelHistory = false
  sessionTimeout = true
  actionSignature;
  editFlag = false;
  constructor(private authenticationService: AuthenticationService, private service: RestApiService, private lodder: LoaderService, private toastr: ToastrService, private store: StoreService, private datepipe: DatePipe, private invoiceService:InvoiceService,
    private signatureService : SignatureService,private titleService:Title,private activeRoute:ActivatedRoute
  ) {

    this.authenticationService.currentUser.subscribe(data => { 
      this.userDetails = data?.loginUserDetails;
      if(this.userDetails != null){
        this.actionSignature = signatureService.signPayload(this.userDetails?.userEmailId);
      }
     });
    activeRoute.queryParams.subscribe(a => this.pageId = a?.pageId)
  }
  ngOnInit() {
    this.service.getSession(keywords.checkStatus,this.userDetails?.userEmailId,this.actionSignature).subscribe(o =>{
      if(o?.isValid){
        this.clientList = this.pageConfig?.allProjects?.filter((obj1, i, arr) => 
          arr.findIndex(obj2 => (obj2.clientId === obj1.clientId)) === i
        )
        this.invoiceService.gridView.subscribe(e => this.showFileButton = e)
        this.projectList = this.pageConfig?.allProjects;
        this.clientAddrList = this.pageConfig?.allProjects
        this.applyFilters();
        let state = history.state;
    
        if (state.fromAccount == true) {
         
          this.fromAccount = state?.fromAccount;
          this.titleService.setTitle("Edit Profile");
          
          if (this.fromAccount) {
            this.pageConfig.employee.compEntity[0].effectiveFromDate = this.pageConfig?.employee?.compEntity[0]?.effectiveFromDate == '1' ? '01' : this.pageConfig?.employee?.compEntity[0]?.effectiveFromDate;
            this.datas.compEntity.billCycleRange = this.pageConfig?.employee?.compEntity[0]?.effectiveFromDate + '-' + this.pageConfig?.employee?.compEntity[0]?.effectiveToDate;
            let empObj = this.pageConfig?.employee;
            let compObj = this.pageConfig?.employee?.compEntity[0];
            let bankObj = this.pageConfig?.employee?.bankEntity.filter(f => f.status == "active");
           bankObj = bankObj[0];
            bankObj.accountHolderName = decrypt(bankObj?.accountHolderName);
            bankObj.accountNumber = decrypt(bankObj?.accountNumber);
            bankObj.bankAddress = decrypt(bankObj?.bankAddress);
            bankObj.bankName = decrypt(bankObj?.bankName);
            this.passwordFrom = empObj?.password != null ? decryptUsingAES256(empObj?.password) : empObj?.password;
          
            this.data = {
              id: 1,
              empId: { key: empObj?.empId, value: empObj?.firstName },
              firstName: empObj?.firstName,
              lastName: empObj?.lastName,
              emailId: empObj?.emailId,
              mobileNumber: empObj?.mobileNumber,
              cpdId: empObj?.cpdId,
              clientAddress: empObj.clientAddress,
              clientId: empObj?.clientId,
              //  billCycle : [new Date(compObj?.effectiveFromDate),new Date(compObj?.effectiveToDate)],
              invoiceDueDate: empObj?.invoiceDueDate,
              invoiceDueDays:empObj?.invoiceDueDays,
              address: empObj?.address,
              employmentStatus: empObj?.employmentStatus,
              empPassword: empObj?.empPassword,
              particular: empObj?.particular,
              password: empObj?.password != null ? decryptUsingAES256(empObj?.password) : empObj?.password,
              reportingId: empObj?.reportingId,
              reportingManagerName: empObj?.reportingManagerName,
                roleName: empObj?.roleName,
              companyName: empObj?.companyName,
              companyAddr: null,
              executionDate: null,
              
              vendor:{
                id:empObj?.vendor?.id,
                vendorName : empObj?.vendor?.vendorName,
                consultantName : empObj?.vendor?.consultantName,
              },
              bankEntity: {
                //empId: bankObj?.empId,
                ebId: bankObj?.ebId,
                accountHolderName: bankObj?.accountHolderName,
                accountNumber: bankObj?.accountNumber,
                bankName: bankObj?.bankName,
                ifscCode: bankObj?.ifscCode,
                swiftCode: bankObj?.swiftCode,
                bankAddress: bankObj?.bankAddress,
              },
    
              compEntity: {
                //empId: compObj?.empId,
                compId: compObj?.compId,
                onsitePkgAnnum: compObj?.onsitePkgAnnum  != null ? decryptUsingAES256(compObj?.onsitePkgAnnum) : compObj?.onsitePkgAnnum,
                offshorePkgAnnum: compObj?.offshorePkgAnnum != null ? decryptUsingAES256(compObj?.offshorePkgAnnum) : compObj?.offshorePkgAnnum,
                perDiem: compObj?.perDiem != null ? decryptUsingAES256(compObj?.perDiem) : compObj?.perDiem,
               // currency: compObj?.currency == null && (compObj?.onsitePkgAnnum != null || compObj?.perDiem != null) ? 'SAR ( ر.س)' : compObj?.currency,
                currency: compObj?.currency,
                onsiteCurrency : compObj?.onsiteCurrency,
                effectiveFromDate: compObj?.effectiveFromDate,
                effectiveToDate: compObj?.effectiveToDate,
                packageType: compObj?.packageType,
                transferCurrency: compObj?.transferCurrency,
                transferCountry: compObj?.transferCountry,
                defaultPkg: compObj?.defaultPkg,
                status: compObj?.status,
              },
              // vendor:{
              //   id:null,
              //   vendorName : null,
              //   consultantName : null
              // }
            }
          }
          let projectSplit = this.data?.cpdId?.includes(',') ? this.data?.cpdId.split(',') : [this.data?.cpdId];
          let selectedProject = []
          this.pageConfig?.allProjects?.forEach(s => {
            projectSplit.forEach(f => {
              if (s.cpdId == f) {
                selectedProject.push(s);
              }
            })
          })
          this.data.cpdId = selectedProject
    
         
          let clientSplit = this.data?.clientId?.includes(',') ? this.data?.clientId.split(',') : [this.data?.clientId];
          let selectedClient = []
          this.pageConfig?.allProjects?.forEach(s => {
            clientSplit.forEach(f => {
              if (s.clientId == f) {
                selectedClient.push(s)
              }
    
            })
          })
        
          this.data.clientId = selectedClient;
    
          
        }
    
        //assigning grid data to local variable while editing from grid
        this.store.gridRowData.subscribe(d => {
          this.editFlag = true
          if (d != null) {
            this.lodder.show();
            setTimeout(() => {
              this.lodder.hide();
              this.passwordFrom = d?.password != null ? decryptUsingAES256(d?.password) : d?.password;
              d.compEntity[0].effectiveFromDate = d?.compEntity[0]?.effectiveFromDate == '1' ? '01' : d?.compEntity[0]?.effectiveFromDate;
            
              this.datas.compEntity.billCycleRange = d?.compEntity[0]?.effectiveFromDate + '-' + d?.compEntity[0]?.effectiveToDate;
              this.data = {
                id: 1,
                empId: { key: d?.empId, value: d.firstName },
                firstName: d?.firstName,
                lastName: d?.lastName,
                emailId: d?.emailId,
                mobileNumber: d?.mobileNumber,
                cpdId: d?.cpdId,
                clientAddress: d?.clientAddress,
                clientId: d?.clientId,
                // billCycle : [new Date(d?.compEntity?.effectiveFromDate),new Date(d?.compEntity?.effectiveToDate)],
                invoiceDueDate: d?.invoiceDueDate,
                invoiceDueDays:d?.invoiceDueDays,
                address: d?.address,
                employmentStatus: d?.employmentStatus,
                empPassword: d?.empPassword,
                particular: d?.particular,
                password:d?.password != null || d?.password != '' ? decryptUsingAES256(d?.password) : null,
                reportingId: d?.reportingId,
                reportingManagerName: d?.reportingManagerName,
                roleName: d?.roleName,
                companyName: d?.companyName,
                companyAddr: null,
                executionDate: null,
               
               // vendorName:d?.vendor?.vendorName,
                bankEntity: {
                  //empId: d?.empId,
                  ebId: d?.bankEntity[0]?.ebId,
                  accountHolderName:  d?.bankEntity?.length >0 && (d?.bankEntity[0]?.accountHolderName != null || d?.bankEntity[0]?.accountHolderName != '' )? decrypt(d?.bankEntity[0]?.accountHolderName) : null,
                  accountNumber: d?.bankEntity[0] && (d?.bankEntity[0]?.accountNumber != null || d?.bankEntity[0]?.accountNumber != '') ? decrypt(d?.bankEntity[0]?.accountNumber) : null,
                  bankName: d?.bankEntity[0] && (d?.bankEntity[0]?.bankName != null || d?.bankEntity[0]?.bankName != '') ? decrypt(d?.bankEntity[0]?.bankName) : null ,
                  ifscCode: d?.bankEntity[0]?.ifscCode,
                  swiftCode: d?.bankEntity[0]?.swiftCode,
                  bankAddress: d?.bankEntity[0] && (d?.bankEntity[0]?.bankAddress != null || d?.bankEntity[0]?.bankAddress != '') ? decrypt(d?.bankEntity[0]?.bankAddress) : null,
                },
    
                compEntity: {
                 // empId: d?.compEntity?.empId,
                  compId: d?.compEntity[0]?.compId,
                  onsitePkgAnnum: d?.compEntity.length > 0 && d?.compEntity[0]?.onsitePkgAnnum  != null ? decryptUsingAES256(d?.compEntity[0]?.onsitePkgAnnum) : null,
                  offshorePkgAnnum:d?.compEntity.length > 0 && d?.compEntity[0]?.offshorePkgAnnum != null ? decryptUsingAES256(d?.compEntity[0]?.offshorePkgAnnum) : null,
                  perDiem:d?.compEntity.length > 0  && d?.compEntity[0]?.perDiem != null ? decryptUsingAES256(d?.compEntity[0]?.perDiem) : null,
                  currency: d?.compEntity[0]?.currency || null,
                  onsiteCurrency : d?.compEntity[0]?.onsiteCurrency || null,
                  effectiveFromDate: d?.compEntity[0]?.effectiveFromDate || null,
                  effectiveToDate: d?.compEntity[0]?.effectiveToDate || null,
                  packageType: d?.compEntity[0]?.packageType || null,
                  transferCurrency: d?.compEntity[0]?.transferCurrency || null,
                  transferCountry: d?.compEntity[0]?.transferCountry || null,
                  defaultPkg: d?.compEntity[0]?.defaultPkg || null,
                  status: d?.compEntity[0]?.status || null,
                },
                vendor:{
                  id:d?.vendor?.id,
                  vendorName : d?.vendor?.vendorName,
                  consultantName : d?.vendor?.consultantName,
                }
    
              }
    
              let projectSplit = this.data?.cpdId?.includes(',') ? this.data?.cpdId.split(',') : [this.data?.cpdId];
              let selectedProject = []
              this.pageConfig?.allProjects?.forEach(s => {
                projectSplit.forEach(f => {
                  if (s.cpdId == f) {
                    selectedProject.push(s);
                  }
                })
              })
              this.data.cpdId = selectedProject.filter((obj1, i, arr) => 
                arr.findIndex(obj2 => (obj2.cpdId === obj1.cpdId)) === i
              )
              this.projectList = [...this.data.cpdId];
    
              let clientSplit = this.data?.clientId?.includes(',') ? this.data?.clientId.split(',') : [this.data?.clientId];
              let selectedClient = []
              this.pageConfig?.allProjects?.forEach(s => {
                clientSplit.forEach(f => {
                  if (s.clientId == f) {
                    selectedClient.push(s)
                  }
                })
              })
              this.data.clientId = selectedClient.filter((obj1, i, arr) => 
                arr.findIndex(obj2 => (obj2.clientId === obj1.clientId)) === i
              )
             // this.data.clientId = selectedClient;
    
             
            }, 2500)
    
          }
        })
      }
    })
   
  }

  ngOnChanges() {

    this.dataSource?.forEach(d =>{
      let index = this.pageConfig.dwcEmployeeList?.findIndex(o => o.empId == d.empId)

      index > -1 ? this.pageConfig?.dwcEmployeeList?.splice(index,1) : ''
    })
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
      classes: this.fromAccount == true ? 'validation' : '',
      position: 'bottom', autoPosition: false
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getClientsSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: keywords.selectAllClient,
      primaryKey: 'clientId',
      labelKey: 'clientName',
      classes: this.fromAccount == true ? 'validation' : '',
      position: 'bottom',
      autoPosition: false
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getSupervisorSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: 'Select All Supervisors',
      primaryKey: 'id',
      labelKey: 'name',
      classes: this.fromAccount == true ? 'validation' : ''
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getclientAddSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: 'Select All Client Address',
      primaryKey: 'clientAddress',
      labelKey: 'clientAddress',
      classes: 'clientclass',
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getclientlocSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: 'Select All Client Location',
      primaryKey: 'clientLocationValue',
      labelKey: 'clientLocationName',
      classes: 'clientclass',
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getBillingSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: 'Select All Billing',
      primaryKey: 'billingValue',
      labelKey: 'billingName',
      classes: 'clientclass',
    }
    return Object.assign(commonSettings, specificSetting);
  }

  //setting the default package based on particular selection
  particularChange() {
    this.data.compEntity.defaultPkg = this.data.particular == keywords.offshore ? keywords.offshore : keywords.onsite;
  }
  key: any = null
  save(employeeForm: NgForm) {
    if (employeeForm.invalid || this.data?.empId.key == null) {
      this.toastr.error(toastrMsg.mandatoryMsg)
      return
    } else if ((this.data?.bankEntity?.swiftCode == null || this.data?.bankEntity?.swiftCode == "") && (this.data?.bankEntity?.ifscCode == null || this.data?.bankEntity?.ifscCode == '')) {
      this.toastr.error(toastrMsg.ifscOrSwiftMsg)
      return
    } else if (this.data.particular == keywords.onsite && (!this.data.compEntity.onsitePkgAnnum && !this.data.compEntity.perDiem)) {
      this.toastr.error('Onsite package or per diem is required when particular is onsite');
      return;
    } else if (this.data.particular == keywords.offshore && !this.data.compEntity.offshorePkgAnnum) {
      this.toastr.error('Offshore package is required when particular is offshore.');
      return;
    } else if (this.data.compEntity.offshorePkgAnnum && !this.data.compEntity.currency) {
      this.toastr.error('Offshore currency is required when offshore package is filled.');
      return;
    } else if (this.data.compEntity.onsiteCurrency && !this.data.compEntity.onsitePkgAnnum && !this.data.compEntity.perDiem) {
      this.toastr.error('Perdiem or onsite package is required when onsite currency is selected');
      return;
    } else if ((this.data.compEntity.perDiem || this.data.compEntity.onsitePkgAnnum) && !this.data.compEntity.onsiteCurrency) {
      this.toastr.error('Onsite currency is required when perdiem or onsite package is selected.');
      return;
    }  else if (this.data.compEntity.onsitePkgAnnum && this.data.compEntity.perDiem && this.data.compEntity.onsiteCurrency) {
      this.toastr.error('Onsite and Perdiem cannot be selected at the same time.');
      return;
    }
     else if (this.data.compEntity.currency && !this.data.compEntity.offshorePkgAnnum) {
      this.toastr.error('Offshore package is required when offshore currency is selected.');
      return;
      }else if(this.fromAccount){
        this.service.getSession(keywords.checkStatus,this.userDetails?.userEmailId,this.actionSignature).subscribe(d =>{
          if(d?.isValid){
            let body =  {
              empId:this.data.empId.key,
              password : this.data?.password != null && this.data?.password != "" ?  encryptUsingAES256(this.data.password) : encryptUsingAES256(this.passwordFrom),
              address : this.data.address
            }
            this.lodder.show()
            let payload = {
              passwordPayload : JSON.parse(this.signatureService.stringifyWithSortedKeys(body)),
              signature : this.signatureService.signPayload(body)
            }
            let config = {
              'request-type': 'update',
              'page-name' : 'Edit Porfile'
          }
          let headerConfig = deepClone(this.headerConfig)
          Object.assign(headerConfig, config)
            // this.headerConfig["request-type"] ='update';
            //  this.headerConfig["page-name"] ='Edit Profile';
            this.service.saveData(ApiPaths.updatePassword, payload,config).subscribe(o => {
              this.lodder.hide()
              o?.status == keywords.SUCCESS ?  this.toastr.success(o?.message) : this.toastr.error(o?.message)
            },(err)=>{
              this.toastr.error(toastrMsg.errMsg)
            });
          }else{
            this.authenticationService.logoutThroughAngular();
            this.toastr.error(d?.message);
          }
        },(err) => this.toastr.error(toastrMsg.errMsg))
      } 
      else {
        this.data.clientId = [...new Set(this.data.clientId)];
        let preparedFilters1 = JSON.parse(JSON.stringify(this.data))
        // preparedFilters1.empPassword = 
        Object.keys(preparedFilters1).forEach(o => {
          let obj = preparedFilters1[o];
          if (Array.isArray(obj)) {
            preparedFilters1[o] = obj.map(d => o == 'clientId' ? d['clientId'] : o == 'clientAddress' ? d['clientAddress'] : d[o] || d['name']);
          }
        })     // if (this.data.id == null) {
  
        let employee = preparedFilters1;
       
       if(employee?.vendor?.vendorName != null && employee?.vendor?.vendorName != ""){
        employee.vendor = {id:employee?.vendor?.id == null ? 0 : this.data?.vendor?.id,vendorName:employee?.vendor?.vendorName,consultantName:employee?.firstName+" "+employee?.lastName}
       }else{
        employee.vendor = null
       }
       employee.vendor == null && employee.vendor?.vendorName == null ? delete employee?.vendor : null;
       delete employee.id;
        let firstName = this.data.firstName.replace(/\s/g, '');
        let str = this.data?.bankEntity?.accountNumber.substr(this.data?.bankEntity?.accountNumber.length - 4);
      
        employee.empId = this.data.empId.key;
        //employee.createdBy = this.userDetails?.firstName;
        //employee.createdDate = this.data.id == null ? this.datepipe.transform(new Date(), keywords.formateDateOnly) : this.data.createdDate;
       // employee.updatedBy = this.data.id == null ? null : this.userDetails?.firstName;
        //employee.updatedDate = this.data.id != null ? this.datepipe.transform(new Date(), keywords.formateDateOnly) : this.data.updatedDate;
        employee.cpdId = employee.cpdId.toString();
        employee.clientId = employee.clientId.toString();
        employee.empPassword = encryptUsingAES256(str);
       // employee.password = encryptUsingAES256(this.data.password);
       employee.password = this.data?.password != null && this.data?.password != "" ?  encryptUsingAES256(this.data.password) : encryptUsingAES256(this.passwordFrom),
        employee.particular = this.data.particular;
        employee.clientAddress = "";
        employee.bankEntity.status = 'active'
        employee.compEntity.offshorePkgAnnum = this.data.compEntity.offshorePkgAnnum != null && this.data.compEntity.offshorePkgAnnum != '' && this.data.compEntity.offshorePkgAnnum != 0? encryptUsingAES256(this.data.compEntity.offshorePkgAnnum.toString()) : null;
        employee.compEntity.onsitePkgAnnum = this.data.compEntity.onsitePkgAnnum != null &&  this.data.compEntity.onsitePkgAnnum != '' && this.data.compEntity.onsitePkgAnnum != 0? encryptUsingAES256(this.data.compEntity.onsitePkgAnnum.toString()) : null;
        employee.compEntity.perDiem = this.data.compEntity.perDiem != null && this.data.compEntity.perDiem != '' && this.data.compEntity.perDiem != 0 ? encryptUsingAES256(this.data.compEntity.perDiem.toString()) : null;
       // employee.compEntity.currency = this.data.compEntity.currency == 'SAR ( ر.س)' && this.data.particular == keywords.offshore ? 'SAR ( ر.س)' : this.data.compEntity.currency == 'SAR ( ر.س)' && this.data.particular == keywords.onsite ? null : employee.compEntity.currency;
        employee.compEntity.currency = this.data.compEntity.currency 
        employee.compEntity.onsiteCurrency = this.data.compEntity.onsiteCurrency;
        employee.compEntity.packageType = this.data.compEntity.packageType
        delete employee.billCycle;
        //employee.id = employee.id == null ? 0 : employee.id;
        employee.bankEntity.ebId = employee.bankEntity.ebId == null ? 0 : employee.bankEntity.ebId;
        employee.compEntity.compId = employee.compEntity.compId == null ? 0 : employee.compEntity.compId;
       // employee?.vendorName == null || employee?.vendorName == '' || employee?.vendorName == undefined ? delete employee?.vendorName : ''
        
       removeNullUndefinedEmpty(employee);
       removeNullUndefinedEmpty(employee?.bankEntity);
       removeNullUndefinedEmpty(employee?.compEntity);
        employee.compEntity = [JSON.parse(this.signatureService.stringifyWithSortedKeys(employee.compEntity))]
        employee.bankEntity =[ JSON.parse(this.signatureService.stringifyWithSortedKeys(employee.bankEntity))];
       
        let employeeBody = {
          employeePayload : employee,
          signature : this.signatureService.signPayload(employee)
        }
        this.lodder.show();
        this.headerConfig["request-type"] = this.data?.id == null ? 'save' : 'update';
        this.service.getSession(keywords.checkStatus,this.userDetails?.userEmailId,this.actionSignature).subscribe(o =>{

          if(o?.isValid){
            this.service.saveData(ApiPaths.saveEmployee, employeeBody,this.headerConfig).subscribe(d => {
              this.lodder.hide();
              this.invoiceService.gridView.next(false);
              d?.status == keywords.ERROR ? this.toastr.error(d.message) : this.toastr.success(d.message);
              this.applyFilters();
            // }
          },(err) =>{
            this.lodder.hide();
            this.toastr.error(err);
          })
    
          
         this.reset()
          }else{
            this.lodder.hide();
            this.toastr.error(o?.message);
            this.authenticationService.logoutThroughAngular()
          }
        })
       
      }
   // }

  }

  applyFilters() {
    if(this.userDetails?.roleName == "HR"){
      this.getFilter.emit();
   }
    
  }

  reset() {
    this.service.getSession(keywords.checkStatus,this.userDetails?.userEmailId,this.actionSignature).subscribe(o =>{
      if(o?.isValid){
        this.data = {
          id: null,
          empId: { key: null, value: 'Select Employee' },
          firstName: null,
          lastName: '',
          emailId: '',
          mobileNumber: null,
          cpdId: null,
          clientAddress: null,
          clientId: null,
          invoiceDueDate: null,
          invoiceDueDays:null,
          address: '',
          employmentStatus: null,
          empPassword: null,
          particular: null,
          password: null,
          reportingId: null,
          reportingManagerName: null,
          roleName: null,
          companyName: null,
          companyAddr: null,
          executionDate: null,
          
          bankEntity: {
           // empId: null,
            ebId: null,
            accountHolderName: null,
            accountNumber: null,
            bankName: null,
            ifscCode: null,
            swiftCode: null,
            bankAddress: null
          },
    
          compEntity: {
          //  empId: null,
            compId: null,
            onsitePkgAnnum: null,
            offshorePkgAnnum: null,
            perDiem: null,
            currency: null,
            onsiteCurrency : null,
            effectiveFromDate: null,
            effectiveToDate: null,
            packageType: '',
            transferCurrency: null,
            transferCountry: null,
            defaultPkg: null,
            status:'active',
          },
          vendor:{
            id:null,
            vendorName : null,
            consultantName : null,
          }
    
        }
        this.datas.compEntity.billCycleRange = null;
        this.fromAccount = false;
        this.dataSource?.forEach(d =>{
          let index = this.pageConfig.dwcEmployeeList?.findIndex(o => o.empId == d.empId)
          index > -1 ? this.pageConfig?.dwcEmployeeList?.splice(index,1) : ''
        })
      }else{
        this.toastr.error(o?.message);
        this.authenticationService.logoutThroughAngular()
      }
    })
    
  }

  dateRangeChange(rangedate) {
    //let utilFun = changeDateRange(rangedate, this.searchFilters.fromDate, this.searchFilters.toDate, this.latestDateRange, this.latestTime, this.timeChange,this.datepipe)
    this.data.compEntity.effectiveFromDate = this.datepipe.transform(rangedate[0], keywords.formateDateOnly);
    this.data.compEntity.effectiveToDate = this.datepipe.transform(rangedate[1], keywords.formateDateOnly);
  }

  //Selecting employee will auto populate all the data
  onEmpChange(e, selectedValue) {
    this.data.empId = { key: selectedValue, value: e.target.innerHTML }
    let flag = false;
    if (this.dataSource != null && this.dataSource.length != 0) {
      this.dataSource?.forEach(d => {
        if (d.empId == this.data.empId.key && this.data.id == null) {
          this.data.empId = { key: null, value: "Select Employee" }
          flag = true;
        } else {
          //flag = false;
          this.pageConfig?.dwcEmployeeList.forEach((d, index) => {
            if (d.empId == this.data?.empId.key) {
              this.data.firstName = this.pageConfig?.dwcEmployeeList[index].firstName;
              this.data.lastName = this.pageConfig?.dwcEmployeeList[index].lastName;
              this.data.address = this.pageConfig?.dwcEmployeeList[index].address;
              this.data.mobileNumber = this.pageConfig?.dwcEmployeeList[index].mobileNumber;
              this.data.emailId = this.pageConfig?.dwcEmployeeList[index].emailId;
              this.data.reportingId = this.pageConfig?.dwcEmployeeList[index].reportingId;
              this.data.reportingManagerName = this.pageConfig?.dwcEmployeeList[index].reportingManagerName;
              this.data.vendor.vendorName = this.pageConfig?.dwcEmployeeList[index].vendorName != null || this.pageConfig?.dwcEmployeeList[index].vendorName != undefined ? this.pageConfig?.dwcEmployeeList[index].vendorName : null;
              this.data.address = this.pageConfig?.dwcEmployeeList[index].address;
              this.data.roleName = this.pageConfig?.dwcEmployeeList[index].roleName;
              this.data.bankEntity.accountHolderName = decrypt(this.pageConfig?.dwcEmployeeList[index]?.beneficiaryName);
              this.data.bankEntity.accountNumber = decrypt(this.pageConfig?.dwcEmployeeList[index].accountNumber)
              this.data.bankEntity.bankName = decrypt(this.pageConfig?.dwcEmployeeList[index].bankName);
              this.data.bankEntity.bankAddress = decrypt(this.pageConfig?.dwcEmployeeList[index].branchName);
              this.data.bankEntity.swiftCode = this.pageConfig?.dwcEmployeeList[index].swiftCode;
              this.data.bankEntity.ifscCode = this.pageConfig?.dwcEmployeeList[index].ifscCode;
              this.data.compEntity.offshorePkgAnnum = this.pageConfig?.dwcEmployeeList[index].offshorePkgAnnum != null ? decryptUsingAES256(this.pageConfig?.dwcEmployeeList[index].offshorePkgAnnum) : null;
              this.data.compEntity.onsitePkgAnnum = this.pageConfig?.dwcEmployeeList[index].onsitePkgAnnum != null ? decryptUsingAES256(this.pageConfig?.dwcEmployeeList[index].onsitePkgAnnum) : null;
            }
          })

        }
      })
    }
    if (flag) {
      this.data.empId = { key: null, value: "Select Employee" }
      this.data.firstName = 
      this.data.lastName = ''
      this.data.address = ''
      this.data.mobileNumber = ''
      this.data.emailId = ''
      this.data.reportingId = ''
      this.data.reportingManagerName = ''
      this.data.address = ''
      this.data.roleName = '';
      this.data.bankEntity.accountHolderName = '';
      this.data.bankEntity.accountNumber = '';
      this.data.bankEntity.bankName = '';
      this.data.bankEntity.bankAddress = '';
      this.data.bankEntity.swiftCode = '';
      this.data.bankEntity.ifscCode = '';
      this.data.compEntity.offshorePkgAnnum = '';
      this.data.compEntity.onsitePkgAnnum = '';
      this.toastr.error(toastrMsg.empAllCreated);
    } else {
      this.pageConfig?.dwcEmployeeList.forEach((d, index) => {
        if (d.empId == this.data?.empId.key) {
          this.data.firstName = this.pageConfig?.dwcEmployeeList[index].firstName;
          this.data.lastName = this.pageConfig?.dwcEmployeeList[index].lastName;
          this.data.address = this.pageConfig?.dwcEmployeeList[index].address;
          this.data.emailId = this.pageConfig?.dwcEmployeeList[index].emailId;
          this.data.reportingId = this.pageConfig?.dwcEmployeeList[index].reportingId;
          this.data.reportingManagerName = this.pageConfig?.dwcEmployeeList[index].reportingManagerName;
          this.data.roleName = this.pageConfig?.dwcEmployeeList[index].roleName;
        }
      })
    }
  }


  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      this.toastr.error(toastrMsg.onlyNoAllowed)
      return false;
    }
    return true;

  }

  //Populate dropdown based on clients selection
  onClose(e) {
   if(this.data?.id == null){
    this.projectList = []
    if (this.data.clientId != null && this.data.clientId?.length != 0) {  
     let project = []
     this.data.clientId.map(m =>{
      this.pageConfig.allProjects.forEach(f =>{
        m.clientId == f.clientId ? project.push(f) : ''
      })
     })

    // project = [...new Set(project)]
    
     project = project.filter((obj1, i, arr) => 
      arr.findIndex(obj2 => (obj2.cpdId === obj1.cpdId)) === i
    )
      this.projectList = [...project];
     this.data.cpdId = []; // there was
    }else{
      this.data.cpdId = [];
      this.data.clientAddress = [];
      this.projectList = this.pageConfig?.allProjects;
    }
   }else{
    this.projectList = []
    if (this.data.clientId != null && this.data.clientId?.length != 0) {  
      let project = []; 
      let projectId = []
      this.data.clientId.map(m =>{
       this.pageConfig.allProjects.forEach(f =>{
         m.clientId == f.clientId ? project.push(f) : ''
       })
      })

      this.data.cpdId.map(m =>{
        project.forEach(f =>{
          m.cpdId == f.cpdId ? projectId.push(f) : ''
        })
       })
 
     // project = [...new Set(project)]
     
    //   project = project.filter((obj1, i, arr) => 
    //    arr.findIndex(obj2 => (obj2.cpdId === obj1.cpdId)) === i
    //  )
       this.projectList = [...project];
       this.data.cpdId = [...projectId];
     }
   }
  }



  showDetails(str) {
    if (str == 'bank') {
      this.bankShow = !this.bankShow
    }
  }

  download() {
    let str = ''
    let htmlelement = atob(str)
    var doc = new DOMParser().parseFromString(csaCopy, "text/html");
    var pdf = new jsPDF('p', 'pt', 'a4');
    var imgData = keywords.rootwareLogo
    // doc.html.style.zoom = 0.55
    let element = document.createElement("div");
    element.innerHTML = csaCopy;
    //  pdf.html(element)
    //  pdf.text("testing" ,10, 20);
    //  pdf.save("csa.pdf")
    let date = element.querySelectorAll('.executionDate');
      date.forEach(d => d.innerHTML = this.datepipe.transform("JAN 24 2022", 'MMM dd YYYY'));

      // let completionDate = doc.querySelector('.completionDate');
      // var expireDate = new Date(this.data.executionDate);
      // expireDate.setFullYear(expireDate.getFullYear() + 1);
      // expireDate.setDate(expireDate.getDate() - 1);
      // completionDate.innerHTML = this.datepipe.transform(expireDate, 'MMM dd YYYY');
      // let company = doc.querySelectorAll('.company');
      // company.forEach(c => c.innerHTML = employee.companyName);
      // let companyAddr = doc.querySelectorAll('.companyAddr');
      // companyAddr.forEach(c => c.innerHTML = employee.companyAddr);

      // let name = doc.querySelectorAll('.name');
      // name.forEach(n => n.innerHTML = employee.firstName + employee.lastName);
      // let address = doc.querySelectorAll('.address');
      // address.forEach(a => a.innerHTML = employee.address);
      // let clientName = doc.querySelector('.clientName');
      // clientName.innerHTML = employee.clientId.toString();
      // let projectLocation = doc.querySelector('.projectLocation');
      // projectLocation.innerHTML = employee.clientAddress.toString();
      // let consultantName = doc.querySelectorAll('.consultantName');
      // consultantName.forEach(o => o.innerHTML = employee.firstName + ' ' + employee?.lastName);
      // let phone = doc.querySelector('.phone');
      // phone.innerHTML = '8374747474';
      // let email = doc.querySelector('.email');
      // email.innerHTML = employee.emailId;
      // let compensationD = doc.querySelector('.compensation');
      // compensationD.innerHTML = employee.particular;
      // let bankName = doc.querySelector('.bankName');
      // bankName.innerHTML = employee.bankEntity.bankName;
      // let variant = doc.querySelector('.variant');
      // variant.innerHTML = "SAVING";
      // // let bankAddr = doc.querySelector('.bankAddress');
      // // bankAddr.innerHTML = employee.bankEntity.bankAddress;
      // let accHolderName = doc.querySelector('.accontHolderName');
      // accHolderName.innerHTML = employee.bankEntity.accountHolderName;
      // let accountNo = doc.querySelector('.accountNo');
      // accountNo.innerHTML = employee.bankEntity.accountNumber;
      // let ifscCode = doc.querySelector('.ifsc');
      // ifscCode.innerHTML = employee.bankEntity.swiftCode;
    pdf.addImage(imgData, 5, 5, 50, 20);
   
    pdf.html(element.innerHTML, {
      margin: [40, 30, 40, 30],
      callback: function (pdf) {
        pdf.save("csa.pdf");
      }
    });

  }

  excelData: AOA = [[1, 2], [3, 4]];
  excelDataSave = []
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';
  selectedFileName =''
  onFileChange(evt: any) {
    this.service.getSession(keywords.checkStatus,this.userDetails?.userEmailId,this.actionSignature).subscribe(d =>{
      if(d?.isValid){
        const allowedMimeTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!allowedMimeTypes.includes(evt.target.files[0].type)) {
          this.toastr.error('Only Excel files are allowed.');
          return;
        }
        this.selectedFileName = evt.target.files[0].name;
    this.excelDataSave = []
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.excelData = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      this.excelData.forEach((d, i) => {
        if (i > 0 && d.length > 0) {
          let date = this.datepipe.transform(new Date((d[10] - 25569) * 86400000), keywords.formateDateOnly)
         let empId = d[1] != null && d[1] != "" ? d[1].toString().replace(/\s+/g, "") : d[1].toString();
          let emp = { id: "0", empId: empId, firstName: d[2], lastName: d[3], mobileNumber: d[4] != null && d[4] != ''? d[4].toString() : d[4], address: d[5], emailId: d[6], reportingId: d[7], reportingManagerName: d[8], designation: d[9], dateOfJoining: date, bankName: d[11], ifscCode: d[12], accountNumber: d[13] != null && d[13] != ''? d[13].toString() : d[13], branchName: d[14], swiftCode: d[15], iban: d[16], roleName: d[17], beneficiaryName:d[18] != undefined && d[18] != "" && d[18] != null ? d[18] : '',vendorName:d[19] != undefined && d[19] != "" && d[19] != null ? d[19].toString() : '' }
          this.excelDataSave.push(JSON.parse(this.signatureService.stringifyWithSortedKeys(emp)))
         
        }
      })

      // return this.http.post<any>('http://localhost:8071/api/upload',this.excelDataSave)
      let signature = this.signatureService.signPayload(this.excelDataSave)
      let uploadData = {
        dwcPayload:this.excelDataSave,
        signature : signature
      }
      this.lodder.show();
      this.headerConfig["request-type"] = 'save';
      this.service.saveData(ApiPaths.upload, uploadData,this.headerConfig).subscribe(d => {
        this.lodder.hide();
        d.status == keywords.SUCCESS ? this.toastr.success(d?.message) : this.toastr.error(d?.message);
        this.service.getPageConfig({empId:this.userDetails?.empId,pageId:this.pageId,roleName:this.userDetails?.roleName}).subscribe(d => {
          this.pageConfig = d;
         d?.message?.status == keywords.SUCCESS ?  this.applyFilters() : '';
        });
        (<HTMLInputElement>document.querySelector('#fileUpload')).value = "";
        this.selectedFileName =''
      },(err) =>{
        this.lodder.hide();
        this.toastr.error(toastrMsg.errMsg);
        (<HTMLInputElement>document.querySelector('#fileUpload')).value = "";
        this.selectedFileName =''
      })

    };
    reader.readAsBinaryString(target.files[0]);
      }else{
        this.authenticationService.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))


  }

  showPassword(fieldName){
    if(fieldName == keywords.onsite){
      this.onSitePkg = this.onSitePkg == '*****' ? this.data.compEntity.onsitePkgAnnum : '*****';
    }else if(fieldName == keywords.offshore){
      this.offPkg = this.offPkg == '*****' ? this.data.compEntity.offshorePkgAnnum : '*****';
    }else if(fieldName == keywords.perdiem){
      this.perDiem = this.perDiem == '*****' ? this.data.compEntity.perDiem : '*****';
    }else if(fieldName == 'Password'){
      this.userPassword = this.userPassword == '*****' ? this.data?.password : '*****'
    }
  }


  onManagerChange(){
    let name = this.pageConfig?.managerList.filter(f => f.reportingId == this.data.reportingId);
    if(name){
      this.data.reportingManagerName = name[0]?.reportingManagerName;
    }
  }

  withoutSpace(e: ClipboardEvent,fieldName){
    let clipboardData = e.clipboardData ;
    let pastedText = clipboardData.getData('text');
    if(/[a-z]/i.test(pastedText)){
      //e.preventDefault();
    }else{
      this.data[fieldName] = null;
    }
  }

  numberValid(e: ClipboardEvent,fieldName){
    let event = e.clipboardData.getData('text');
    //allow paste only number values
    if (!Number(event)) {
      fieldName == "mobileNumber" ? this.data[fieldName] = null : (fieldName == "onsitePkgAnnum" || fieldName == "offshorePkgAnnum" || fieldName == "perDiem") ? this.data.compEntity[fieldName] = null : this.data.bankEntity[fieldName] = null
      e.preventDefault();
    }
  }

  numberAndAlpValid(e: ClipboardEvent, fieldName) {
    let clipboardData = e.clipboardData;
    let pastedText = clipboardData.getData('text');
    if (!/^[A-Za-z0-9]+$/.test(pastedText)) {
      e.preventDefault();
    } else {
      //this.data[fieldName] = null;
    }
  }

  //based on currency employee country is selected
  selectCountry() {
    this.data.compEntity.transferCountry = this.data?.compEntity?.transferCurrency == 'USD ($)' ? 'United State' : this.data?.compEntity?.transferCurrency == 'PAK (PKR)' ? 'Pakistan' : this.data?.compEntity?.transferCurrency == 'INR (₹)' ? 'India' : this.data?.compEntity?.transferCurrency == 'EUR (€)' ? '' : '';
  }

  viewHistory() {
    this.viewrelHistory = !this.viewrelHistory;
  }

  // // Using HostListener to listen for click events globally
  // @HostListener('document:click', ['$event'])
  // handleDocumentClick(event: MouseEvent) {
  //   this.authenticationService.logout(keywords.checkStatus);
  // }
}

