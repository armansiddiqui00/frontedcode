import { Component, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NgForm } from '@angular/forms';
import { StoreService } from 'src/app/services/store.service';
import { ToastrService } from 'ngx-toastr';
import { dailyChangeTS, dateFormat, keywords, timeKey, timesheetSummaryEntity, toastrMsg } from 'src/app/shared/constant';
import { ApiPaths, deepClone, getOrDeleteData } from 'src/app/shared/util';
import { AuthenticationService } from 'src/app/_services';
import { RestApiService } from 'src/app/services/rest-api.service';
import { DatePipe } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';
@Component({
  selector: 'app-daily-timesheet',
  templateUrl: './daily-timesheet.component.html',
  styleUrls: ['./daily-timesheet.component.scss']
})
export class DailyTimesheetComponent {
  @Output() newItemEvent = new EventEmitter();
  @ViewChild('dailyForm',{static: true}) dailyForm: NgForm;
  dailySheetRow=[1];
  count = 1;
  daily:boolean=true;
  dailyDataArray=[];
  displayTableArray=[];
  weeks=keywords.week;
  dailyTableHeader=keywords.dailyTableHeader;
  weeklyDataArray = [];
  weeklyTableHeader = keywords.weeklyTableHeader;
  weeklyTableDataObj= null;
  totalHours = 0;
  totalMin = 0;
  row=[0,1,2,3,4,5,6];
  sunday:any=[];
  monday:any=[];
  tuesday:any=[];
  wednesday:any=[];
  thursday:any=[];
  friday:any=[];
  saturday:any=[];
  invalidFlag:boolean=false;
  weeklyDate = null;
 // editFlag:boolean=false;
  idDate = new Date().getTime();
  editIndex:any;
  editRow:any;
  tsStaus = 'Pending';
  dropdownList:any;
  hours:any;
  minutes:any;
  saveStatus={
    status: keywords.FAILED,
    message:''
  };
  navigateData:any;
  navEditFlag:boolean=false;
  userId:any;
  userDetails:any;
  tempHours:any;
  tempMin:any;
  maxDate = new Date()
  commonStr = 'Save';
  tempTime = []
  weekly2 = [
    {day:keywords.week[0], projectName:null,taskName:null,fromHours:null,toHours:null, taskStatus:null,comment:null,id:null},
    {day:keywords.week[1], projectName:null,taskName:null,fromHours:null,toHours:null, taskStatus:null,comment:null,id:null},
    {day:keywords.week[2], projectName:null,taskName:null,fromHours:null,toHours:null, taskStatus:null,comment:null,id:null},
    {day:keywords.week[3], projectName:null,taskName:null,fromHours:null,toHours:null, taskStatus:null,comment:null,id:null},
    {day:keywords.week[4], projectName:null,taskName:null,fromHours:null,toHours:null, taskStatus:null,comment:null,id:null},
    {day:keywords.week[5], projectName:null,taskName:null,fromHours:null,toHours:null, taskStatus:null,comment:null,id:null},
    {day:keywords.week[6], projectName:null,taskName:null,fromHours:null,toHours:null, taskStatus:null,comment:null,id:null},
  ]
  dailyTS={
    tsMode:'Daily',
    id:new Date().getTime(),
    projectId:null,
    taskId:null,
    timesheetDate:this.displayTableArray.length > 0 ? new Date(this.displayTableArray[0].timesheetDate2) : new Date(),
   // timesheetDate:new Date(),
    fromTime:null,
    toTime:null,
    taskCategory:null,
    categoryId:null,
    taskStatus:null,
    timesheetStatus:'Pending',
    comment:null,
    timesheetId:0
   // id:null
  }

  
 newObj = {};
 time = timeKey.time
 tSstoreData:any;
  constructor(private toastr:ToastrService,private store:StoreService,private authenticationService:AuthenticationService,
    private restApiService:RestApiService,private datepipe:DatePipe,private loader : LoaderService){ 

    this.authenticationService.currentUser.subscribe(data=>{this.userDetails = data});
    this.restApiService.getOrDeleteData('api/getListForTimesheet',{empId:this.userDetails.loginUserDetails?.userId},null).subscribe(data=>{
      this.dropdownList = data;
    })
    //console.log("this.dropdownList",this.dropdownList)
  }
   ngOnInit(){
    this.dailyTS.timesheetDate = this.displayTableArray[0] != null && this.displayTableArray[0] != undefined? this.displayTableArray[0].timesheetDate2:this.dailyTS.timesheetDate;
    let state = history.state;
    this.navigateData = state.TimeSheetDate;
    this.navEditFlag = state.navEditFlag;
    
    this.userId=this.userDetails?.loginUserDetails?.userId;
    if(this.navEditFlag){
      this.dailyTS.timesheetDate = new Date(this.navigateData.timesheetDate);
      this.loader.show()
      this.restApiService.getTimeSheetDetails(this.navigateData.timesheetId,ApiPaths.getTimesheetDetailsByTimesheetId,this.userId).subscribe(data=>{
        this.loader.hide();
        
        if(data.length > 0){
          this.displayServiceData(data);
          this.time.filter(timeData=>{
            this.dailyDataArray.find(find=>{
              timeData.key >= find.fromTime && timeData.key < find.toTime ? this.tempTime.push(timeData.key):''
            })
          })
        //  console.log("ngOninit",this.tempTime)
          this.saveStatus.status = keywords.FAILED;
         }
      });
    
    }
    else{
      this.loader.show();
      this.restApiService.getTimeSheetDetails(this.datepipe.transform(this.dailyTS.timesheetDate,'YYYY-MM-dd'),ApiPaths.getTimeSheetDetails,this.userId).subscribe(ngUser=>{
        if(ngUser.length > 0){
        this.displayServiceData(ngUser);
        this.saveStatus.status = keywords.SUCCESS;
        this.tsStaus = 'Submitted'
       }
        this.loader.hide();
      })
    }
  }

 
  addRow(){
    this.dailySheetRow.push(+this.count++);
  }
  saveDailyTS(dailyform:NgForm,){  
    if(this.commonStr == 'edit'){
      this.updateTs(this.editIndex,this.editRow); 
      return;
    } 
   else{
    this.dailyTS.timesheetDate = this.displayTableArray[0] != null && this.displayTableArray[0] != undefined? this.displayTableArray[0].timesheetDate2:this.dailyTS.timesheetDate;
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]; 
    let day = weekday[new Date(this.dailyTS.timesheetDate).getDay()];
    let dailyChangeTS={
     empId2:this.userDetails?.loginUserDetails?.userId,
      tsMode2:'Daily',
      id2:new Date().getTime(),
      projectId2:null,
      projectName2:null,
      projectTaskId2:null,
      taskName2:null,
     // date2: null,
      fromTime2:null,
      toTime2:null,
      taskCategory2:null,
      categoryId2:null,
      taskStatus2:null,
      comment2:'',
      hours2:null,
      timesheetId2:this.navEditFlag?this.navigateData.timesheetId:0,
      workDay2:day,
      lastUpdatedEmpId2:this.userId,
      lastUpdatedEmpName2:'',
      lastUpdatedDatetime2:'',
      approvalDatetime2:'',
      approvalEmpId2:this.userDetails.loginUserDetails.reportingManagerId,
      approvalEmpName2:'',
      timesheetStatus2:'Pending',
      timesheetDate2:dateFormat(new Date()),
      submitedDatetime2:dateFormat(new Date()),
      hrId2:1006,
      billable2: true,
		  typeOf2: "Any",
    }
    if(dailyform.invalid){
      this.invalidFlag = true
      return
    }
    else if(this.dailyTS.fromTime == this.dailyTS.toTime){
      this.toastr.error(toastrMsg.fromToSameDate);
      return
    }
    else if(+this.tempHours > 1441){
      this.toastr.error('Timesheet hours is more than 24 hours')
      return
    }
    else {
      this.time.forEach(timeData=>{
        timeData.key >= this.dailyTS.fromTime && timeData.key < this.dailyTS.toTime ? this.tempTime.push(timeData.key):''
      })
     // console.log("before",this.tempTime)
      this.invalidFlag = false;
      this.incrementTime(this.dailyTS.fromTime,this.dailyTS.toTime);
      dailyChangeTS.tsMode2 = this.dailyTS.tsMode
      dailyChangeTS.id2=this.dailyTS.id
      dailyChangeTS.projectId2=+this.dailyTS.projectId
      dailyChangeTS.projectTaskId2=+this.dailyTS.taskId;
     // dailyChangeTS.date2 = dateFormat(this.dailyTS.date);
      dailyChangeTS.fromTime2=this.dailyTS.fromTime;
      dailyChangeTS.toTime2=this.dailyTS.toTime;
      dailyChangeTS.taskStatus2=this.dailyTS.taskStatus;
      dailyChangeTS.categoryId2=+this.dailyTS.categoryId;
      dailyChangeTS.comment2=this.dailyTS.comment;
      dailyChangeTS.hours2 =  this.hours +"."+ this.minutes;
      dailyChangeTS.timesheetDate2 = this.datepipe.transform(this.dailyTS.timesheetDate,'YYYY-MM-dd');
      this.dropdownList.projectList.map(map=>{+this.dailyTS.projectId == map.projectId?dailyChangeTS.projectName2 = map.projectName:''});
      this.dropdownList.taskCatogry.map(map=>{+this.dailyTS.categoryId == map.category_id?dailyChangeTS.taskCategory2 = map.category_name:''});
      this.dropdownList.taskList.map(map=>{+this.dailyTS.taskId == map.taskId?dailyChangeTS.taskName2 = map.taskName:''});
      // timesheetSummaryEntity.projectId = timesheetSummaryEntity.projectId + this.dailyTS.projectId + ',';
      // timesheetSummaryEntity.projectTaskId = timesheetSummaryEntity.projectTaskId + this.dailyTS.taskId + ',';
      // timesheetSummaryEntity.projectName = timesheetSummaryEntity.projectName + dailyChangeTS.projectName2 + ',';
      // timesheetSummaryEntity.taskName = timesheetSummaryEntity.taskName + dailyChangeTS.taskName2 + ',';
      // timesheetSummaryEntity.taskCategory = timesheetSummaryEntity.taskCategory + dailyChangeTS.taskCategory2 + ','
      // timesheetSummaryEntity.dailyHours = this.totalHours + "." + this.totalMin;
      // timesheetSummaryEntity.empId = this.userId;
      // timesheetSummaryEntity.timesheetDate = this.datepipe.transform(this.dailyTS.timesheetDate,'YYYY-MM-dd');
      // timesheetSummaryEntity.submittedBy = this.dropdownList.loginUserDetails.userName;
      // timesheetSummaryEntity.approvalEmpId=this.dropdownList.loginUserDetails.reportingManagerId,
 timesheetSummaryEntity.approvalEmpName=this.userDetails.loginUserDetails.reportingManagerName,
      //dailyChangeTS.tsMode2;
      delete dailyChangeTS.id2;
      const newHashmap = Object.entries(dailyChangeTS).reduce((acc, [key, value]) => ({
        ...acc,
        [`${key.replace('2','')}`]: value,
      }), {});
    this.dailyDataArray?.push(newHashmap);
   this.displayTableArray?.push(dailyChangeTS);
    this.dailyDataArray = this.removeDuplicates(this.dailyDataArray);
    this.displayTableArray = this.removeDuplicates(this.displayTableArray);
    this.store.dailyTSObj.next(this.dailyDataArray)
    this.newItemEvent.emit(this.displayTableArray)
   
    this.dailyDataArray.length>0 ? '':''
    this.dailyTS={
      tsMode:'Daily',
      projectId:null,
      taskId:null,
      timesheetDate:this.displayTableArray.length > 0 ? new Date(this.displayTableArray[0].timesheetDate2) : new Date(),
      fromTime:null,
      toTime:null,
      taskStatus:null,
      taskCategory:null,
      categoryId:null,
      comment:null,
      timesheetStatus:'',
      id:new Date().getTime(),
      timesheetId:0
    }
  }
   }
  }
  deleteDailyRow(index,obj){
    this.minusTime(obj.fromTime2,obj.toTime2);
    this.displayTableArray.splice(index,1);
    this.dailyDataArray.splice(index,1);
    let timeIndex = [];
    this.tempTime.forEach((tim,index)=> {
      tim >= obj.fromTime2 && tim < obj.toTime2 ? timeIndex.push(index):'';
    })
   timeIndex.forEach((temp,i)=>{
      delete this.tempTime[temp];
    })


    // timesheetSummaryEntity.projectId = "";
    // timesheetSummaryEntity.projectTaskId = "";
    // timesheetSummaryEntity.taskCategory = "";
    // timesheetSummaryEntity.projectName = "";
    // timesheetSummaryEntity.taskName = ""
    // this.dailyDataArray.forEach(deleteD=>{
    // timesheetSummaryEntity.projectId = timesheetSummaryEntity.projectId + deleteD.projectId + ",";
    // timesheetSummaryEntity.projectTaskId = timesheetSummaryEntity.projectTaskId + deleteD.projectTaskId + ",";
    // timesheetSummaryEntity.taskCategory = timesheetSummaryEntity.taskCategory + deleteD.taskCategory + ",";
    // timesheetSummaryEntity.projectName = timesheetSummaryEntity.projectName + deleteD.projectName + ",";
    // timesheetSummaryEntity.taskName = timesheetSummaryEntity.taskName + deleteD.taskName + ",";
    // })
  }
  editDailyRow(index,obj){
    let timeIndex = [];
    this.tempTime.forEach((tim,index)=> {
      tim >= obj.fromTime2 && tim < obj.toTime2 ? timeIndex.push(index):'';
    })
   timeIndex.forEach((temp,i)=>{
      delete this.tempTime[temp];
    })


    this.commonStr='edit';
    this.editIndex = index;
    this.dailyTS.projectId = obj.projectId2;
    this.dailyTS.taskId = obj.projectTaskId2;
    this.dailyTS.taskStatus = obj.taskStatus2;
    this.dailyTS.fromTime = obj.fromTime2;
    this.dailyTS.toTime = obj.toTime2;
    this.dailyTS.categoryId = obj.categoryId2;
    this.dailyTS.timesheetDate = new Date(obj.timesheetDate2);
    this.dailyTS.comment = obj.comment2;

    this.minusTime(this.dailyTS.fromTime,this.dailyTS.toTime)
  }


  updateTs(index,rowData){
    //console.log('Update',this.tempTime)
   this.tempTime = this.tempTime.filter(item => {return item !== undefined});
   this.time.forEach(timeData=>{
    timeData.key >= this.dailyTS.fromTime && timeData.key < this.dailyTS.toTime ? this.tempTime.push(timeData.key):''
  })
    //console.log("after",this.tempTime)
    let changes = dailyChangeTS;
    this.displayTableArray[index].projectId2 = +this.dailyTS.projectId;
    this.displayTableArray[index].projectTaskId2 = +this.dailyTS.taskId;
    this.displayTableArray[index].timesheetDate2 = this.datepipe.transform(this.dailyTS.timesheetDate,'YYYY-MM-dd');
    this.displayTableArray[index].fromTime2 = this.dailyTS.fromTime;
    this.displayTableArray[index].toTime2 = this.dailyTS.toTime;
    this.displayTableArray[index].categoryId2 = +this.dailyTS.categoryId;
    this.displayTableArray[index].taskStatus2 = this.dailyTS.taskStatus;
    this.displayTableArray[index].comment2 = this.dailyTS.comment;
    this.displayTableArray[index].lastUpdatedDatetime2 = dateFormat(new Date());
    this.displayTableArray[index].lastUpdatedEmpId2 = this.dropdownList?.loginUserDetails?.userId;
    this.displayTableArray[index].lastUpdatedEmpName2 = this.dropdownList?.loginUserDetails?.userName;
    this.displayTableArray[index].hours2 = this.hours + ',' + this.minutes;
    this.displayTableArray[index].timesheetStatus2 = 'Pending'
    this.dropdownList.projectList.forEach(proj=>{ proj.projectId == this.dailyTS.projectId ? this.displayTableArray[index].projectName2 = proj.projectName :''});
    this.dropdownList.taskList.forEach(task=>{ task.taskId == this.dailyTS.taskId ? this.displayTableArray[index].taskName2 = task.taskName :''});
    this.dropdownList.taskCatogry.forEach(cat=>{ cat.categoryId == this.dailyTS.categoryId ? this.displayTableArray[index].taskCategory2 = cat.categoryName :''});
    this.incrementTime(this.dailyTS.fromTime,this.dailyTS.toTime)
  // timesheetSummaryEntity.dailyHours = this.totalHours + "." + this.totalMin;
  // timesheetSummaryEntity.empId = this.userId;
  // timesheetSummaryEntity.timesheetDate = this.datepipe.transform(this.dailyTS.timesheetDate,'YYYY-MM-dd');
  // timesheetSummaryEntity.submittedBy = this.dropdownList.loginUserDetails.userName;
  // timesheetSummaryEntity.timesheetId = this.displayTableArray[index].timesheetId2;
  // timesheetSummaryEntity.dailyHours = this.totalHours + "." + this.totalMin;
  // timesheetSummaryEntity.lastUpdatedDatetime = dateFormat(new Date());
  // timesheetSummaryEntity.lastUpdatedEmpId = this.dropdownList.loginUserDetails.empId;
  // timesheetSummaryEntity.lastUpdatedEmpName = this.dropdownList.loginUserDetails.userName;
  // timesheetSummaryEntity.timesheetStatus="Pending"
 
this.dailyDataArray[index].projectId = this.dailyTS.projectId;
this.dailyDataArray[index].projectTaskId = this.dailyTS.taskId;
this.dailyDataArray[index].timesheetDate = this.datepipe.transform(this.dailyTS.timesheetDate,'YYYY-MM-dd');;
this.dailyDataArray[index].fromTime = this.dailyTS.fromTime;
this.dailyDataArray[index].toTime = this.dailyTS.toTime;
this.dailyDataArray[index].categoryId = +this.dailyTS.categoryId;
this.dailyDataArray[index].taskStatus = this.dailyTS.taskStatus;
this.dailyDataArray[index].comment = this.dailyTS.comment;
this.dailyDataArray[index].lastUpdatedDatetime = dateFormat(new Date());
this.dailyDataArray[index].lastUpdatedEmpId = this.userDetails?.loginUserDetails?.userId;
this.dailyDataArray[index].lastUpdatedEmpName = this.userDetails?.loginUserDetails?.userName;
this.dailyDataArray[index].timesheetStatus = 'Pending'
this.dropdownList.projectList.forEach(proj=>{ proj.project_id == this.dailyTS.projectId ? this.dailyDataArray[index].projectName = proj.project_name :''});
this.dropdownList.taskList.forEach(task=>{ task.taskId == this.dailyTS.taskId ? this.dailyDataArray[index].taskName = task.taskName :''});
this.dropdownList.taskCatogry.forEach(cat=>{ cat.category_id == this.dailyTS.categoryId ? this.dailyDataArray[index].taskCategory = cat.category_name :''});

// timesheetSummaryEntity.projectName = "";
// timesheetSummaryEntity.taskName = "";
// timesheetSummaryEntity.taskCategory = "";
// timesheetSummaryEntity.projectId = "";
// timesheetSummaryEntity.projectTaskId = "";
// this.displayTableArray?.forEach(x=>{
//   timesheetSummaryEntity.projectName = timesheetSummaryEntity.projectName + x.projectName2 + ",";
//    timesheetSummaryEntity.taskName = timesheetSummaryEntity.taskName  + x.taskName2 + ",";
//    timesheetSummaryEntity.taskCategory = timesheetSummaryEntity.taskCategory+ x.taskCategory2 + ",";
//    timesheetSummaryEntity.projectId = timesheetSummaryEntity.projectId+ x.projectId2 + ",";
//    timesheetSummaryEntity.projectTaskId = timesheetSummaryEntity.projectTaskId + x.projectTaskId2 + ","
//})
//this.restApiService.saveTimeSheet(ApiPaths.saveTimesheet,)
this.dailyTS={
  tsMode:'Daily',
  id:new Date().getTime(),
  projectId:null,
  taskId:null,
  timesheetDate:this.displayTableArray.length > 0 ? new Date(this.displayTableArray[0].timesheetDate2) : new Date(),
  fromTime:null,
  toTime:null,
  taskCategory:null,
  categoryId:null,
  taskStatus:null,
  timesheetStatus:'Pending',
  comment:null,
  timesheetId:0
}
  this.store.dailyTSObj.next(this.dailyDataArray);
 // this.editFlag = false;
  //this.navEditFlag = false;
  this.newItemEvent.emit(this.dailyDataArray);
    this.commonStr = 'Save'
  }
  cancelDailyTs(){
    this.tempTime = []
    this.invalidFlag = false
    this.dailyDataArray = [];
    this.displayTableArray = [];
    this.tempTime = []
    this.totalHours = 0;
    this.totalMin = 0;
    this.dailyTS={
      tsMode:'Daily',
      id:new Date().getTime(),
      projectId:null,
      taskId:null,
      timesheetDate:new Date(),
     // timesheetDate:new Date(),
      fromTime:null,
      toTime:null,
      taskCategory:null,
      categoryId:null,
      taskStatus:null,
      timesheetStatus:'Pending',
      comment:null,
     // id:null
     timesheetId:0
    }
    this.tsStaus = 'Pending'
  }
  saveWeekTs(day,index,weeklyfrom:NgForm){
    let weekFromTime;
    let weekToTime;
    if(weeklyfrom.invalid){
      let colName = index==0?'#sunWeek':index==1?'#monWeek':index==2?'#tueWeek':index==3?'#wedWeek':index==4?'#thurWeek':index==5?'#friWeek':index==6?'#satWeek':''
      let id =  document.querySelectorAll(colName);
      id?.forEach((data:any)=>{
        data.value == 'null' ? data.classList.add('redBorder'):''
      });
      return
    }
    else{
      this.weekly2?.forEach(weekData=>{
        if(weekData.fromHours != null){
          weekFromTime = weekData.fromHours
        }
        if(weekData.toHours != null){
          weekToTime = weekData.toHours ;
        }
        weekData.id = index == 0 ? 'sun'+this.sunday.length:index == 1 ? 'mon'+this.monday.length:
        weekData.id = index == 2 ? 'tue'+this.tuesday.length:index == 3 ? 'wed'+this.wednesday.length:
        weekData.id = index == 4 ? 'thur'+this.thursday.length:index == 5 ? 'fri'+this.friday.length:
        weekData.id = index == 6 ? 'sat'+this.saturday.length:'';
  
        let copyData = deepClone(weekData)
        copyData.day == day && index == 0 && copyData.projectName != null? this.sunday.push(copyData) && this.weeklyDataArray.push(copyData) && this.removeData(index):
        copyData.day == day && index == 1 && copyData.projectName != null? this.monday.push(copyData) && this.weeklyDataArray.push(copyData) && this.removeData(index):
        copyData.day == day && index == 2 && copyData.projectName != null? this.tuesday.push(copyData) && this.weeklyDataArray.push(copyData) && this.removeData(index):
        copyData.day == day && index == 3 && copyData.projectName != null? this.wednesday.push(copyData) && this.weeklyDataArray.push(copyData) && this.removeData(index):
        copyData.day == day && index == 4 && copyData.projectName != null? this.thursday.push(copyData) && this.weeklyDataArray.push(copyData) && this.removeData(index):
        copyData.day == day && index == 5 && copyData.projectName != null? this.friday.push(copyData) && this.weeklyDataArray.push(copyData) && this.removeData(index):
        copyData.day == day && index == 6 && copyData.projectName != null? this.saturday.push(copyData)&& this.weeklyDataArray.push(copyData) && this.removeData(index):'';
        
      })
      this.incrementTime(weekFromTime,weekToTime)
    
     }
  }

  deleteRow(day,objid,index1,obj){
    this.minusTime(obj.fromHours,obj.toHours)
   if(day == keywords.week[0]){
      this.sunday.splice(index1,1);
   }  
   else  if(day == keywords.week[1]){
      this.monday.splice(index1,1);
   }
   else  if(day == keywords.week[2]){
      this.tuesday.splice(index1,1);
   }
   else  if(day == keywords.week[3]){
      this.wednesday.splice(index1,1);
   }
   else  if(day == keywords.week[4]){
      this.thursday.splice(index1,1);
   }  
   else  if(day == keywords.week[5]){
      this.friday.splice(index1,1);
   }
   else  if(day == keywords.week[6]){
      this.friday.splice(index1,1);
   }

   let deleteIndex = this.weeklyDataArray.findIndex(find=>{
      return find.id == objid;
   });
   this.weeklyDataArray.splice(deleteIndex,1);
  }

  
  removeData(index){
  this.weekly2[index].projectName = null;
  this.weekly2[index].taskName = null;
  this.weekly2[index].fromHours = null;
  this.weekly2[index].toHours = null;
  this.weekly2[index].taskStatus = null;
  this.weekly2[index].comment = null;
  }
  submitDailyTs(dailyForm:NgForm){
    timesheetSummaryEntity.projectId = '';
      timesheetSummaryEntity.projectTaskId = '';
      timesheetSummaryEntity.projectName = '';
      timesheetSummaryEntity.taskName = '';
      timesheetSummaryEntity.taskCategory = '';
    this.dailyDataArray.forEach(find=>{
      timesheetSummaryEntity.projectId = timesheetSummaryEntity.projectId + find.projectId + ',';
      timesheetSummaryEntity.projectTaskId = timesheetSummaryEntity.projectTaskId + find.projectTaskId + ',';
      timesheetSummaryEntity.projectName = timesheetSummaryEntity.projectName + find.projectName + ',';
      timesheetSummaryEntity.taskName = timesheetSummaryEntity.taskName + find.taskName + ',';
      timesheetSummaryEntity.taskCategory = timesheetSummaryEntity.taskCategory + find.taskCategory + ','
      timesheetSummaryEntity.dailyHours = this.totalHours + "." + this.totalMin;
      timesheetSummaryEntity.empId = this.userId;
      timesheetSummaryEntity.timesheetDate = find.timesheetDate;
      timesheetSummaryEntity.submittedBy = this.userDetails.loginUserDetails.userName;
      timesheetSummaryEntity.approvalEmpId=this.userDetails.loginUserDetails.reportingManagerId;
      timesheetSummaryEntity.timesheetId = this.navEditFlag?this.navigateData.timesheetId:0;
      timesheetSummaryEntity.lastUpdatedDatetime = this.navEditFlag?dateFormat(new Date()):'';
      timesheetSummaryEntity.lastUpdatedEmpName = this.navEditFlag?this.userDetails?.loginUserDetails?.userName:'';
      timesheetSummaryEntity.lastUpdatedEmpId = this.navEditFlag?this.userDetails?.loginUserDetails?.userId:'';
    })
   let statusCheck = false;
   this.dailyDataArray.filter(filter=>filter.timesheetStatus == 'Rejected'? statusCheck = true:'')
    if(this.dailyTS.projectId != null && this.dailyTS.taskId != null)
    {
      this.toastr.error(toastrMsg.saveDataFirst);
      return;
    }
    else if(statusCheck){
      this.toastr.error("Please edit the rejected timesheet");
      return;
    }
    else if(this.totalHours){
      const response = confirm("Are you sure, you want to submit the invoice?");
      if(response){
        let body = {
          "timeSheetRequestModel":this.dailyDataArray,
          "timesheetSummaryEntity":timesheetSummaryEntity
        }
        body.timeSheetRequestModel.forEach(e=>{
          e.submitedDatetime=this.datepipe.transform(e.submitedDatetime,'YYYY-MM-dd hh:mm:ss');
        })
       // body.timeSheetRequestModel[0].submitedDatetime =this.datepipe.transform(body.timeSheetRequestModel[0].submitedDatetime,'YYYY-MM-dd hh:mm:ss');
        body.timesheetSummaryEntity.submittedDate =this.datepipe.transform(body.timesheetSummaryEntity.submittedDate,'YYYY-MM-dd hh:mm:ss');
        this.loader.show()
        this.restApiService.saveTimeSheet(ApiPaths.saveTimesheet,body).subscribe(data=>{
          this.saveStatus.status=data.status;
          this.saveStatus.message=data.message;
          //this.toastr.success(this.saveStatus.message)
          this.loader.hide();
          this.dailyTS.timesheetDate = this.navigateData !=null && this.navigateData != undefined? new Date(this.navigateData.timesheetDate):new Date();
          this.newItemEvent.emit(null);
          this.store.dailyTSObj.next(null)
        },(err)=>{this.loader.hide()})
        this.tsStaus = 'Submitted'
        this.dailyTS.timesheetDate = new Date(this.navigateData.timesheetDate)
        this.navEditFlag = false;
        this.tempTime = [];
      }
    }
   else{
    this.toastr.info(toastrMsg.mandatoryMsg)
   }
  //  timesheetSummaryEntity.projectId = '';
  //     timesheetSummaryEntity.projectTaskId = '';
  //     timesheetSummaryEntity.projectName = '';
  //     timesheetSummaryEntity.taskName = '';
  //     timesheetSummaryEntity.taskCategory = '';
  }

  submitWeeklyTs(){
    this.weeklyDataArray=[]
    this.weekly2?.forEach(data=>{
     if( data.projectName != null && data.taskName != null && data.fromHours != null && data.toHours != null &&
      data.taskStatus != null ){
        this.toastr.error(toastrMsg.saveDataFirst);
        return;
      }
    })
  }
  onChangeToggle(event){
    if(event.target.checked == true){
      this.daily = true;
    }
    else{
      this.daily = false;
    }
  }

  calculateTime(fromTime,toTime){
    const [startHour, startMins] = fromTime != null && fromTime != undefined ?fromTime.split(":"):'';
    const [endHour, endMins] = toTime != null && toTime != undefined ?toTime.split(":"):'';
    const diffHour = endHour - startHour;
    const diffMins = endMins - startMins;
  
    const isSameHour = diffHour === 0;
    if (isSameHour) return endMins - startMins;
  
    const diffHourIntoMins = diffHour * 60;
    return diffHourIntoMins + diffMins;
  
  }
  onValueChange(index){
    let colName = index==0?'#sunWeek':index==1?'#monWeek':index==2?'#tueWeek':index==3?'#wedWeek':index==4?'#thurWeek':index==5?'#friWeek':index==6?'#satWeek':''
    
    let id =  document.querySelectorAll(colName);
      id?.forEach((data:any)=>{
        data.value != 'null' ? data.classList.remove('redBorder'):'';
      });
  }

  minusTime(fromHours,toHours){
   
    let totalmins = this.calculateTime(fromHours,toHours);
    let hours = Math.floor(totalmins/60);
    let mins = totalmins%60;
    this.totalHours = this.totalHours - hours;
    if(this.totalMin <= 0){
      let hTom = this.totalHours * 60;
      this.totalHours = Math.floor((hTom - mins) / 60)
      this.totalMin = mins
    }
    else{
      this.totalMin = this.totalMin - mins;
    }
  }
  incrementTime(fromTime,toTime){
    let totalMinutes = this.calculateTime(fromTime,toTime);
      
    this.hours = Math.floor(totalMinutes/60);
    this.minutes = totalMinutes % 60;
    //this.totalMin = this.totalMin + mins;
    this.totalHours = this.totalHours + this.hours;
    if(this.totalHours){
      if(this.totalMin +  this.minutes > 59){
        let hours = Math.floor((this.totalMin +  this.minutes) /60);
        this.totalHours = this.totalHours + hours
        this.totalMin = (this.totalMin +  this.minutes) % 60;
      }
      else{
        this.totalMin = this.totalMin +  this.minutes;
      }
    }
    else{
      return;
    }
  }

  removeDuplicates(arr) {
    let unique = [];
    arr.forEach(element => {
        if (!unique.includes(element)) {
            unique.push(element);
        }
    });
    return unique;
}

timeCalculate(fromTime,toTime){
  let min = this.calculateTime(fromTime,toTime);
  let hours = Math.floor(min/60);
  let minutes = min % 60;

  this.tempHours = Math.floor(this.totalHours*60) + +min + this.totalMin;

  // for(let i of this.tempTime){
  //   if(i == this.dailyTS.fromTime){
  //     this.dailyTS.fromTime = null;

  //     console.log("if cond")
  //   }
  //   else{
  //     console.log("else",i)
  //   }
  // }

  if(this.dailyTS.fromTime > this.dailyTS.toTime){
    this.toastr.error("From time should be less than To time");
    this.dailyTS.fromTime = null;
    const ele = document.querySelector('.fromDate') as HTMLSelectElement;
    ele != null && ele != undefined ? ele.selectedIndex = 0:'';
  }
  
  this.tempTime.forEach(time=>{
    if(this.dailyTS.fromTime == time){
      this.dailyTS.fromTime = null;
      this.toastr.error("This time slot is already selected");
       const ele = document.querySelector('.fromDate') as HTMLSelectElement;
       ele != null && ele != undefined ? ele.selectedIndex = 0:'';
    }
    if(this.dailyTS.toTime == time){
      this.dailyTS.toTime = null;
      this.toastr.error("This time slot is already selected");
       const ele = document.querySelector('.toDate') as HTMLSelectElement;
       ele != null && ele != undefined ? ele.selectedIndex = 0:'';
    }
  })
}

displayServiceData(data){
  this.displayTableArray =[];
  this.dailyDataArray = [];
  this.totalHours = 0;
  this.totalMin = 0;
  // timesheetSummaryEntity.projectName = '';
  // timesheetSummaryEntity.taskCategory = '';
  // timesheetSummaryEntity.taskName = '';
  data?.forEach((find,index)=>{
    let dailyChangeTS={
      empId2:0,
       tsMode2:'Daily',
       projectId2:null,
       projectName2:null,
       projectTaskId2:null,
       taskName2:null,
      // date2: null,
       fromTime2:null,
       toTime2:null,
       taskCategory2:null,
       categoryId2:null,
       taskStatus2:null,
       comment2:'',
       hours2:null,
       timesheetId2:this.navEditFlag?this.navigateData.timesheetId:0,
       workDay2:"",
       lastUpdatedEmpId2:"",
       lastUpdatedEmpName2:'',
       lastUpdatedDatetime2:'',
       approvalDatetime2:'',
       approvalEmpId2:"",
       approvalEmpName2:'',
       timesheetStatus2:'Pending',
       timesheetDate2:null,
       submitedDatetime2:"",
       hrId2:1006,
       billable2: true,
       typeOf2: "Any",
       timesheetDetailsId2:0,
     }
  //console.log("find",find.empId)
   dailyChangeTS.empId2 = find.empId;
   dailyChangeTS.projectId2 = find.projectId;
   dailyChangeTS.projectName2 = find.projectName;
   dailyChangeTS.projectTaskId2 = find.projectTaskId;
   dailyChangeTS.taskName2 = find.taskName;
   dailyChangeTS.categoryId2 = find.categoryId;
   dailyChangeTS.taskCategory2 = find.taskCategory;
   dailyChangeTS.taskStatus2 = find.taskStatus;
   dailyChangeTS.fromTime2 = find.fromTime;
   dailyChangeTS.toTime2 = find.toTime;
   dailyChangeTS.timesheetDate2 = find.timesheetDate;
   dailyChangeTS.submitedDatetime2 = find.submitedDatetime;
   dailyChangeTS.approvalDatetime2 = find.approvalDatetime;
   dailyChangeTS.approvalEmpId2 = find.approvalEmpId;
   dailyChangeTS.approvalEmpName2 = find.approvalEmpName;
   dailyChangeTS.lastUpdatedDatetime2 = find.lastUpdatedDatetime;
   dailyChangeTS.lastUpdatedEmpId2 = find.lastUpdatedEmpId2;
   dailyChangeTS.lastUpdatedEmpName2 = find.lastUpdatedEmpName;
   dailyChangeTS.workDay2 = find.workDay;
   dailyChangeTS.submitedDatetime2 = find.submitedDatetime;
   dailyChangeTS.hrId2 = find.hrId;
   dailyChangeTS.hours2 = find.hours;
   dailyChangeTS.timesheetDetailsId2 = find.timesheetDetailsId;
   dailyChangeTS.timesheetId2 = find.timesheetId;
   dailyChangeTS.comment2 = find.description;
   dailyChangeTS.timesheetStatus2 = find.timesheetStatus;
   this.incrementTime(find.fromTime,find.toTime)
    this.displayTableArray.push(dailyChangeTS);
    const newHashmap = Object.entries(dailyChangeTS).reduce((acc, [key, value]) => ({
      ...acc,
      [`${key.replace('2','')}`]: value,
    }), {});
     this.dailyDataArray.push(newHashmap)
     this.dailyDataArray = this.removeDuplicates(this.dailyDataArray);
     this.displayTableArray = this.removeDuplicates(this.displayTableArray);
    // console.log("displayTableArray",this.displayTableArray)
     this.navEditFlag? this.newItemEvent.emit(this.dailyDataArray):this.newItemEvent.emit(null);
   })
    
}
onDateChange(e){
 this.navEditFlag == false ? this.navigateData = null:''
  if(this.displayTableArray.length > 0 && this.saveStatus.status == keywords.FAILED){
    const response = confirm(toastrMsg.lostDataMsg);
    if(response){
      this.dailyDataArray = [];
      this.displayTableArray = [];
      this.loader.show();
      this.restApiService.getTimeSheetDetails(this.datepipe.transform(this.dailyTS.timesheetDate,'YYYY-MM-dd'),ApiPaths.getTimeSheetDetails,this.userId).subscribe(ngUser=>{
        if(ngUser.length > 0){
          this.displayServiceData(ngUser);
          this.saveStatus.status = keywords.SUCCESS;
          this.tsStaus = 'Submitted';
         } 
         else{
          this.displayServiceData(null);
          this.saveStatus.status = keywords.FAILED;
          this.tsStaus = 'Pending';
         }
        this.loader.hide();
      })
    }
    else{
      this.dailyTS.timesheetDate = new Date(this.dailyDataArray[0].timesheetDate);
    }
  }
 else{
  this.loader.show();
  this.restApiService.getTimeSheetDetails(this.datepipe.transform(this.dailyTS.timesheetDate,'YYYY-MM-dd'),ApiPaths.getTimeSheetDetails,this.userId).subscribe(ngUser=>{
    if(ngUser.length > 0){
      this.displayServiceData(ngUser);
      this.saveStatus.status = keywords.SUCCESS;
      this.tsStaus = 'Submitted';
     } 
     else{
      this.displayServiceData(null);
      this.saveStatus.status = keywords.FAILED;
      this.tsStaus = 'Pending';
     }
    this.loader.hide();
  })
 }
}

onChange(){
  this.restApiService.getOrDeleteData(ApiPaths.getProjectTaskList,{projectId:this.dailyTS.projectId},null).subscribe(data=>{
    this.dropdownList['taskList'] = data.taskList;
  })
}

@HostListener('window:beforeunload', ['$event'])
unloadNotification($event: any) {
    if (this.dailyForm.dirty) {
        $event.returnValue =true;
    }
}

}
