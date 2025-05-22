import { Component, EventEmitter, Input, Output } from '@angular/core';
import { data } from 'jquery';
import { AuthenticationService } from 'src/app/_services';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { dropdownSetting } from 'src/app/shared/constant';
import { ApiPaths, deepClone, getOrDeleteData } from 'src/app/shared/util';

@Component({
  selector: 'app-reviewer-setting',
  templateUrl: './reviewer-setting.component.html',
  styleUrls: ['./reviewer-setting.component.scss']
})
export class ReviewerSettingComponent {
  @Output() filterEvent = new EventEmitter();
  editGridDataa;
  counter = 1;
  searchFilters = {
    id2:null,
    approverUserId2:null,
    approvyUserId2:null,
    reviewerUserId2:null,
    reviewyUserId2:null
  }

  approveeList:any;
approverList:any;
reviwerList2:any;
reviweeList2:any;
approvyDropList = [];
reviewvyDropList = [];
getRevieweeSetting ={
  singleSelection: false,
    selectAllText: dropdownSetting.selectAllText,
    unSelectAllText: dropdownSetting.unSelectAllText,
    enableSearchFilter: true,
    badgeShowLimit: 1, 
    primaryKey: dropdownSetting.empId, 
    labelKey: dropdownSetting.empName,
    searchPlaceholderText: dropdownSetting.search,
    //classes : this.searchFilters.reviewerUserId2 == null ? 'pointer-none' : ''
}
getApproveeSetting() {
  let commonSettings = deepClone(this.getRevieweeSetting);
  let specificSetting = {
    text: dropdownSetting.selectApprovee,
    primaryKey: dropdownSetting.empId,
    labelKey: dropdownSetting.empName,
  //  classes : this.searchFilters.approverUserId2 == null ? 'pointer-none' : ''
  }
  return Object.assign(commonSettings,specificSetting);
}

constructor(private store:StoreService, private restApi:RestApiService,private loader : LoaderService,private authenticationService:AuthenticationService){
}
ngOnInit(){
 this.restApi.getOrDeleteData(ApiPaths.getEmployeeList,null,null).subscribe(data=>{
  this.approveeList = data;
  this.approverList = this.approveeList;
  this.reviwerList2 = this.approveeList;
  this.reviweeList2 = this.approveeList;
  });
 //console.log("app",this.approverList)
 
  // this.restApi.getOrDeleteData(ApiPaths.getAppReviewerList,null).subscribe(data=>{
  //   this.loader.hide();
  //     if(data != null && data != undefined){
  //       this.store.dataSourceSubject.next(data);
  //     }
  //     this.store.refreshGrid.next();
  // })
  //console.log("list",this.reviweeList2)
  getOrDeleteData(this.store,this.restApi,this.loader,ApiPaths.getAppReviewerList)
  this.store.gridRowData.subscribe(data=>{
    this.editGridDataa = data != null && data != undefined ? data : null;
    if(data != null && data != undefined){

      //Select the checkboxes base  on value recieved
      data.approvyUserId = data.approvyUserId.split(",")
      this.approveeList.forEach(el=>{
        data.approvyUserId.filter(o=>{
          el.empId == o ?  this.approvyDropList.push(el) : null
        })
      })
      
      data.reviewyUserId = data.reviewyUserId.split(",")
      this.reviweeList2.forEach(el=>{
        data.reviewyUserId.filter(o=>{
        //  console.log("reviweeList2",el.empId,o,el)
          el.empId == o ?  this.reviewvyDropList.push(el) : null
        })
      })

      this.searchFilters.id2 = data.id;
      this.searchFilters.approverUserId2 = +data.approverUserId;
      this.searchFilters.approvyUserId2 = this.approvyDropList;
      this.searchFilters.reviewerUserId2 = +data.reviewerUserId;
      this.searchFilters.reviewyUserId2 = this.reviewvyDropList;
    }
   // console.log("edit",this.searchFilters)
  })

 
}
// ngOnChanges(){
// let demo = this.approverList.filter(fil=> fil.name == this.editGridDataa?.approverUserId);
// let reviewerDemo =this.reviwerList2.filter(fil=> fil.name == this.editGridDataa?.reviewerUserId);
//   if(this.editGridDataa != undefined && this.editGridDataa != null){
//     this.searchFilters = {
//       id2:this.editGridDataa.id,
//       approverUserId2: demo[0].value,
//       approvyUserId2:[{value:'103',name:'Tanzeela Shaikh'},{value:'104',name:'Shaziya Shaikh'}],
//       reviewerUserId2:reviewerDemo[0].value,
//       reviewyUserId2:[{value:'103',name:'Tanzeela Shaikh'},{value:'104',name:'Shaziya Shaikh'}]
     
//     }
    
//   }
//   console.log('eit',this.searchFilters)
// }
submit(){
 // if(this.searchFilters.id2 == null){
    //this.searchFilters.id2 = this.searchFilters.id2 == null?  ("Str"+this.counter++ ): this.searchFilters.id2;
    //console.log("search",this.searchFilters)
    let preparedFilter = {
      id: this.searchFilters.id2,
      // approverUserId: this.approverList.filter(fil=> fil.value == this.searchFilters.approverUserId2 ? fil.name : ''),
      // approvyUserId: this.searchFilters.approvyUserId2,
      // reviewerUserId: this.reviwerList2.filter(fil=> fil.value == this.searchFilters.reviewerUserId2 ? fil.name : ''),
      // reviewyUserId: this.searchFilters.reviewyUserId2,
      approverUserId : this.searchFilters.approverUserId2,
      approvyUserId : this.searchFilters.approvyUserId2,
      reviewerUserId : this.searchFilters.reviewerUserId2,
      reviewyUserId: this.searchFilters.reviewyUserId2,
      url: this.searchFilters.id2 == undefined || this.searchFilters.id2 == null ? ApiPaths.saveAppReviewer : ApiPaths.updateAppReviewer
    };
    Object.keys(preparedFilter).forEach(o=>{
     // o = o.replace(/[0-9]/g, '');
      let obj = preparedFilter[o];
      if (Array.isArray(obj)) {
        preparedFilter[o] = obj.map(d =>  d.empId);
      }
    })
    //console.log(" preparedFilter.approvyUserId", preparedFilter.approvyUserId,preparedFilter.reviewyUserId)
    preparedFilter.approvyUserId = preparedFilter.approvyUserId.toString();
    preparedFilter.reviewyUserId = preparedFilter.reviewyUserId.toString();
    preparedFilter.approverUserId = preparedFilter.approverUserId.toString();
    preparedFilter.reviewerUserId = preparedFilter.reviewerUserId.toString()
    //delete preparedFilter.id
    this.filterEvent.emit(preparedFilter);
    this.searchFilters = {
      id2:null,
      approverUserId2:null,
      approvyUserId2:null,
      reviewerUserId2:null,
      reviewyUserId2:null,
    }
  // }
  // else{
    this.editGridDataa = null;
  // }
}
cancel(){
  this.searchFilters = {
    id2:null,
    approverUserId2:null,
    approvyUserId2:null,
    reviewerUserId2:null,
    reviewyUserId2:null
  }
  this.filterEvent.emit({reset : true});
}

appoverSelected(dropdownName){
  if(dropdownName == "approver"){
    this.approveeList = this.approverList;
    this.approveeList = this.approveeList.filter(list=>this.searchFilters.approverUserId2 != list.empId)
   // console.log('selected',this.approveeList)
  }
  else if(dropdownName == 'reviwer'){
    if(this.searchFilters.approverUserId2 == this.searchFilters.reviewerUserId2){
    //  let approweeUserId = this.searchFilters.approvyUserId2.map(fil=>fil.value)
      this.reviweeList2 = this.reviweeList2.filter(item => this.searchFilters.approvyUserId2.indexOf(item) === -1);
      this.reviweeList2 = this.reviweeList2.filter(list=>this.searchFilters.reviewerUserId2 != list.empId);
     // console.log("reviwe",this.reviweeList2)
    }
    else{
      this.reviweeList2 = this.approverList;
    this.reviweeList2 = this.reviweeList2.filter(list=>this.searchFilters.reviewerUserId2 != list.empId)
    }
  }
  
}
}
