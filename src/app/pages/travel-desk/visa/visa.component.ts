import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { ApiPaths, getOrDeleteData } from 'src/app/shared/util';

@Component({
  selector: 'app-visa',
  templateUrl: './visa.component.html',
  styleUrls: ['./visa.component.scss']
})
export class VisaComponent {
  @Output() newItemEvent = new EventEmitter();
  invalidFlag: boolean = false;
  maxDate = new Date();
  requestData: any;
  empId: any;
  visaDataSource: any;
  visaModel = {
    traveldeskEntityModel: {
      reqId: null
    },
    employeName: null,
    visaType: null,
    visaNo: null,
    validFrom: null,
    validUntill: null,
    passportNo: null,
    nationality: null,
    purpose: null,
    empId: null,
    //passportId: null,
    durationOfStay: null,
    placeOfIssue: null,
    entryType: null,
    occupation: null,
    visaId:null
  }
  visaDataArray = [];
  flag = false;
  minDate=new Date()
  constructor(private toastr: ToastrService, private service: RestApiService, private loader: LoaderService, private store: StoreService,private datePipe:DatePipe) { }

  ngOnInit() {
    let url = ApiPaths.getTravelRequest
    this.service.getTravelProcess(url).subscribe(data => {
      this.requestData = data;
     // console.log('requestData', this.requestData)
    })
    getOrDeleteData(this.store, this.service, this.loader, ApiPaths.getVisaDetails)
    this.store.dataSourceSubject.subscribe(data => this.visaDataSource = data)
    this.store.gridRowData.subscribe(data => {
     // console.log("datasource ",data)
      if(data != null && data != undefined){
        //this.service.getOrDeleteData(ApiPaths.getPassportDetails + '/' + data.empId, null).subscribe(passport => { this.visaModel.passportNo = passport.passportNumber})
        let id = this.requestData?.filter(f=> {return f?.visaDetailsEntityModel.length >0 &&f.empId == data.empId})
       // console.log("id",id)
        this.flag=false;
        this.visaModel.employeName = data.employeName;
        this.visaModel.visaType = data.visaType;
        this.visaModel.visaNo = data.visaNo;
        this.visaModel.validFrom = new Date(data.validFrom);
        this.visaModel.validUntill = new Date(data.validUntill);
        this.visaModel.passportNo = data.passportNo;
        this.visaModel.nationality = data.nationality;
        this.visaModel.purpose = data.purpose;
        this.visaModel.empId = data.empId;
        this.visaModel.durationOfStay = data.durationOfStay;
        this.visaModel.placeOfIssue = data.placeOfIssue;
        this.visaModel.entryType = data.entryType;
        this.visaModel.occupation = data.occupation;
        this.visaModel.visaId = data.visaId,
        this.visaModel.traveldeskEntityModel.reqId = id[0].reqId

      } 
    //  this.store.dataSourceSubject.next([ this.visaModel])
    })
  }

  submitVisaDetails(visaForm: NgForm) {

    this.requestData?.forEach(req => {
      if (this.visaModel.traveldeskEntityModel.reqId == req.reqId) {
        this.visaModel.employeName = req.employeName
      }
    })

    //console.log('reqId', this.visaModel.traveldeskEntityModel.reqId)

    if (visaForm.invalid) {
      this.toastr.error(toastrMsg.mandatoryMsg);
      return;
    }
    else {
      this.visaModel.validFrom = this.datePipe.transform(this.visaModel.validFrom,keywords.formateDateOnly)
      this.visaModel.validUntill = this.datePipe.transform(this.visaModel.validUntill,keywords.formateDateOnly)
      this.visaDataArray.push(this.visaModel);
     // console.log('visaModel', this.visaModel)
      this.newItemEvent.emit(this.visaModel);
     this.visaModel = {
      visaId:null,
        traveldeskEntityModel: {
          reqId: null
        },
        employeName: null,
        visaType: null,
        visaNo: null,
        validFrom: null,
        validUntill: null,
        passportNo: null,
        nationality: null,
        purpose: null,
        empId: null,
      //  passportId: null,
        durationOfStay: null,
        placeOfIssue: null,
        entryType: null,
        occupation: null
      }

    }
  }
  cancelVisaDetails() { 
    this.visaModel = {
      visaId:null,
        traveldeskEntityModel: {
          reqId: null
        },
        employeName: null,
        visaType: null,
        visaNo: null,
        validFrom: null,
        validUntill: null,
        passportNo: null,
        nationality: null,
        purpose: null,
        empId: null,
      //  passportId: null,
        durationOfStay: null,
        placeOfIssue: null,
        entryType: null,
        occupation: null
      }
  }
  onChange() {
    this.requestData.forEach(req => {
      if (this.visaModel.traveldeskEntityModel.reqId == req.reqId) {
        // this.empId=req.empId;
        this.visaModel.empId = req.empId;
      }
    })

    // this.visaDataSource.filter(fil=>{
    //   if(fil.empId == this.visaModel.empId){
    //      this.toastr.error("Visa Already Created !");
    //      this.visaModel.passportNumber = null;
    //      this.visaModel.nationality = null;
    //      return;
    //   }
    //   else{
    //     this.service.getOrDeleteData(ApiPaths.getPassportDetails+'/'+this.visaModel.empId,null).subscribe(data=>{
    //       if(data){
    //         console.log("PassportId",data,this.visaModel.passportNumber)
    //         this.visaModel.passportNumber=data.passportNumber;
    //         this.visaModel.nationality = data.nationality;
    //         this.visaModel.passportId = data.passportId;
    //       }else{
    //         this.visaModel.passportNumber=null;
    //         this.visaModel.nationality = null;
    //         this.visaModel.passportId = null;
    //       }
    //     })
    //   }
    //  })
    // this.requestData.filter(f=>{
   
      // this.visaDataSource.forEach(o=>{
      //   if(o.empId == this.visaModel.empId){
      //     this.toastr.error("Visa Already created for this employee !");
      //     this.flag=true;
      //     this.visaModel.passportNo = null;
      //     this.visaModel.nationality = null;
      //    // this.visaModel.passportId = null;
      //     return;
      //   }
      //   this.flag=false;
      // })
    // }) 
   // console.log('Add behaviour subject',this.flag)
    // if(!this.flag){
    //   this.service.getOrDeleteData(ApiPaths.getPassportDetails + '/' + this.visaModel.empId, null).subscribe(data => {
    //     if (data) {
    //       console.log("PassportId", data, this.visaModel.passportNo)
    //       this.visaModel.passportNo = data.passportNumber;
    //       this.visaModel.nationality = data.nationality;
    //     // this.visaModel.passportId = data.passportId;
    //     } else {
    //       this.visaModel.passportNo = null;
    //       this.visaModel.nationality = null;
    //      // this.visaModel.passportId = null;
    //     }
    //   })
    //   this.flag=false;
    // }
    this.service.getOrDeleteData(ApiPaths.getVisaDetails+'/' +  this.visaModel.empId, null, null).subscribe(data => {
      if(data){
        //this.newItemEvent.emit(data)
        this.toastr.error("Visa Already created for this employee !");
        this.flag=true;
        this.store.dataSourceSubject.next([data])
      }else{
        this.flag=false;
        this.store.dataSourceSubject.next(null)
      }
    })
  }
  dateRangeChange(date){
     let date1 = new Date(date)
  //  this.visaModel.validUntill = new Date(date1.setFullYear(date1.getFullYear() + 1))
    this.minDate = date1 
  }

}
