import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PageName } from 'src/app/components/page-name/page-name';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { ApiPaths, deepClone } from 'src/app/shared/util';
import { InvoiceService } from '../invoice-details/invoice.service';
import { AuthenticationService } from 'src/app/_services';
import { SignatureService } from 'src/app/services/SignatureService';
import { keywords, url, urlAndPageNames } from 'src/app/shared/constant';

@Component({
  selector: 'app-employee-settings',
  templateUrl: './employee-settings.component.html',
  styleUrls: ['./employee-settings.component.scss']
})
export class EmployeeSettingsComponent {

  managePageInfo : any;
  dataSource = null;
  pageConfig = null;
  showNoRecords:boolean = false;
  showNoService:boolean = false;
  filters:any;
  userDetails = null;
  headerConfig;
  constructor(private apiService:RestApiService,private loader :LoaderService,private route:ActivatedRoute,private toastr:ToastrService,private store :StoreService,private authenticationService:AuthenticationService,private signature:SignatureService){
    this.authenticationService.currentUser.subscribe(data => { this.userDetails = data?.loginUserDetails });
  }
  ngOnInit(){
    this.route.data.subscribe(data => {
      this.pageConfig = data.config;
    })
    this.headerConfig = keywords.config;
    this.getPageConfig();
  }

  getPageConfig(){
    this.store.gridRowData.next(null);
    let obj = {
      url : null,
      pageName : null,
      groupEnabled : false
    }
    if(location.href.indexOf(url.manageemployeeUrl) > -1){
      obj.url = ApiPaths.getDWCEmployeeList;
      obj.pageName = keywords.manageemployee;
    }

    if(location.href.indexOf(url.manageproject) > -1){
      obj.url = ApiPaths.getProjectDetails;
      obj.pageName = keywords.manageproject
    }

    this.managePageInfo = obj;
    //this.invoiceService.gridView.next(false)
  }


  getFilter(){
    // if(filter != null){
     // this.filters = deepClone(filter)
      this.loader.show();
      let params=null;
      //if(this.managePageInfo.url ="getProjectDetails"){
        let empId=this.userDetails.empId;
       let sig=this.signature.signPayload(empId);
            params={empId:empId, signature:sig}
            this.headerConfig["request-type"] = 'search';
      this.apiService.getOrDeleteData(this.managePageInfo.url,params,this.headerConfig).subscribe(o=>{
        this.loader.hide();
      if(o == null || o == undefined || o.length == 0){
        this.dataSource = null;
        this.showNoRecords = true;
        this.showNoService = false;
      }else if(o[0]?.message?.status == keywords.ERROR){
       this.toastr.error(o[0].message.message)
      }else{
        this.dataSource = o?.data;
        this.showNoRecords = false;
        this.showNoService = false;
      }
    },(err) => {
      this.loader.hide();
      this.showNoRecords = false;
      this.showNoService = true;

      })
    // }
  }
}
