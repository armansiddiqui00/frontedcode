import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PassportModel } from 'src/app/_models';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { keywords } from 'src/app/shared/constant';
import { ApiPaths, getOrDeleteData } from 'src/app/shared/util';

@Component({
  selector: 'app-passport-details',
  templateUrl: './passport-details.component.html',
  styleUrls: ['./passport-details.component.scss']
})
export class PassportDetailsComponent {
  @Output() newItemEvent = new EventEmitter();
  passportModel = new PassportModel();
  employeeList:any;
  submitFlag:boolean=false;
  disabled:boolean=false;
  constructor(private datePipe:DatePipe,private store:StoreService,private apiService:RestApiService,private lodder:LoaderService,private notification:NotificationService){}
  ngOnInit(){
   // console.log('passport',this.passportModel.dateOfExpiry2)
    this.apiService.getOrDeleteData(ApiPaths.getEmployeeList,null, null).subscribe(data=>{
      this.employeeList = data;
    })
    getOrDeleteData(this.store,this.apiService,this.lodder,ApiPaths.getPassportDetails);
    this.store.gridRowData.subscribe(data => {
    
      if(data != null && data != undefined){
        this.passportModel.passportId2 = data.passportId,
        this.passportModel.passportType2 = data.passportType,
        this.passportModel.countryCode2 = data.countryCode,
        this.passportModel.passportNo2 = data.passportNo,
        this.passportModel.surname2 = data.surname,
        this.passportModel.givenName2 = data.givenName,
        this.passportModel.nationality2 = data.nationality,
        this.passportModel.sex2 = data.sex,
        this.passportModel.dateOfBirth2 = new Date(data.dateOfBirth),
        this.passportModel.placeOfBirth2 = data.placeOfBirth,
        this.passportModel.placeOfIssue2 = data.placeOfIssue,
        this.passportModel.dateOfIssue2 = new Date(data.dateOfIssue),
        this.passportModel.dateOfExpiry2 = new Date(data.dateOfExpiry),
        this.passportModel.empId2 = data.empId
      }
    })
  }

  save(passportForm:NgForm){
   
    if(passportForm.invalid){
      this.submitFlag = true;
      return;
    }
    let preparedFilter = {
      passportId:this.passportModel.passportId2,
      passportType:this.passportModel.passportType2,
      countryCode:this.passportModel.countryCode2,
      passportNo:this.passportModel.passportNo2,
      surname:this.passportModel.surname2,
      givenName:this.passportModel.givenName2,
      nationality:this.passportModel.nationality2,
      sex: this.passportModel.sex2,
      dateOfBirth : this.datePipe.transform(this.passportModel.dateOfBirth2,keywords.formateDateOnly),
      placeOfBirth:this.passportModel.placeOfBirth2,
      placeOfIssue:this.passportModel.placeOfIssue2,
      dateOfIssue : this.datePipe.transform(this.passportModel.dateOfIssue2,keywords.formateDateOnly),
      dateOfExpiry:this.datePipe.transform(this.passportModel.dateOfExpiry2,keywords.formateDateOnly),
      empId:this.passportModel.empId2,
      url:this.passportModel.passportId2 == null ? ApiPaths.savePassportDetails : ApiPaths.updatePassportDetails
    }
    this.newItemEvent.emit(preparedFilter)
    this.submitFlag = false;
    this.passportModel = new PassportModel();
  }
  reset(){
    this.submitFlag = false;
    this.passportModel = new PassportModel();
    this.newItemEvent.emit({'reset':true})
  }
  onChange(){

    if(this.passportModel.countryCode2 != null){
      this.passportModel.nationality2 = "INDIAN"
    }
    this.employeeList.forEach(list=>{
      // let id
      // this.apiService.getOrDeleteData("api/getPassportDetails",{empId:this.passportModel.empId2}).subscribe(data=>{
      //   id = data[0].emp_id
      // })
    
      if(list.empId != null && list.empId == this.passportModel.empId2 ){
        this.disabled = false;
        this.passportModel.givenName2 = list.empFirstName;
        this.passportModel.surname2 = list.empLastName;
      //  console.log("givenName",this.passportModel.givenName2,list)
      }
    })
    this.store.dataSourceSubject.subscribe(data=>{
     // console.log("passport data",data)
     data.filter(fil=>{
      if(fil.empId == this.passportModel.empId2 && new Date(fil.dateOfExpiry) > new Date()){
        this.notification.showError("Passport detail already saved");
        this.submitFlag = false;
        this.disabled = true;
        return
      }
     })
    })
  }
  changeDate(date){
  //  console.log("date",date)
    let date1 = new Date(date)
    date1.setDate(date1.getDate()-1)
    this.passportModel.dateOfExpiry2 = new Date(date1.setFullYear(date1.getFullYear() + 10));
    //this.passportModel.dateOfExpiry2 = new Date(this.passportModel.dateOfExpiry2.getDate()-1)

  }
}
