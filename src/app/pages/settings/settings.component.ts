import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { url, urlAndPageNames } from 'src/app/shared/constant';
import { ApiPaths, deepClone, getOrDeleteData } from 'src/app/shared/util';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent {
  settingsPageInfo:any;
  dataSource=null;
  showNoRecords:boolean = false;
  gridHead = {id:'Id',approverUserId:"Approver Name", approvyUserId: "Approvee Name",reviewerUserId:'Reviewer Name',reviewyUserId:"Reviewee Name"};
  serviceNotResponded:boolean=false;
  constructor(private http: HttpClient,private restApi:RestApiService,private loader :LoaderService,private notification:NotificationService,private store:StoreService){}
  ngOnInit(){
    this.store.dataSourceSubject.subscribe(data=>{
      this.dataSource = data;
    })
   // console.log("pageinfo",location.href.indexOf(url.reviwerSettingUrl) )
    this.getSettingsPageInfo();
  }
  getSettingsPageInfo(){
    let obj ={
      urlPageName : null,
      groupingEnabled:false,
      url : null
    }

    if (location.href.indexOf(url.reviwerSettingUrl) > -1) {
      obj.urlPageName = urlAndPageNames.reviewSettings;
      obj.url = ApiPaths.saveAppReviewer
    }
    if (location.href.indexOf(url.approvalSettingUrl) > -1) {
      obj.urlPageName = urlAndPageNames.approvalSetting;
    }
    this.settingsPageInfo = obj;
  }
  approvedOrReview(filter:any){

    if(filter.reset){
      this.dataSource = null;
      return;
    }
   // this.filters = deepClone(filter);  
   if(filter.url == this.settingsPageInfo.url){
    delete filter.url;
    delete filter.id
    this.loader.show();
    this.restApi.saveData(this.settingsPageInfo.url,filter,null).subscribe(data=>{
      this.loader.hide();
      data.status == "SUCCESS" ? this.notification.showSuccess(data.message) :  data.status == "ERROR" || data.status == 500? this.notification.showError(data.message) : ""
    }),(err)=>{this.loader.hide();
      this.serviceNotResponded = true;
    }
}
else{
    this.restApi.updateData(filter.url,filter).subscribe(data=> {
    //  this.sharedSerivce.refreshGrid.next();
      this.loader.hide();
      data.status == "SUCCESS" ? this.notification.showSuccess(data.message) :  data.status == "ERROR" || data.status == 500? this.notification.showError(data.message) : ""
    }),
    (err)=>{this.loader.hide()};
}

// this.restApi.getOrDeleteData(ApiPaths.getAppReviewerList,null).subscribe(data=>{
//   this.loader.hide();
//     this.dataSource = data != null && data != undefined ? data : null;
//     console.log("data",data.status)
//     this.store.refreshGrid.next();
//     data.status == "SUCCESS" ? this.notification.showSuccess(data.message) :  data.status == "ERROR" || data.status == 500? this.notification.showError(data.message) : ""
//     console.log("datasource",this.dataSource)
// })
getOrDeleteData(this.store,this.restApi,this.loader,ApiPaths.getAppReviewerList)
  }
}

