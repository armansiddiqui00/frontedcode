import { Component } from "@angular/core";
import { User1 } from "src/app/_models";
import { StoreService } from "src/app/services/store.service";
import { keywords, url, urlAndPageNames } from "src/app/shared/constant";

@Component({
    selector:'app-timesheet',
    templateUrl:'./timesheet.component.html',
})

export class TimeSheetComponent{
    timesheetPageInfo;
    gridHeader = [];
    dataSource = null;
    user:any=User1;
    constructor(public store: StoreService){
        this.store.user.subscribe(usr=>{
            this.user=usr;
        })
     
    }
   ngOnInit(): void {
    this.getPageAPIInfo();
   }
   getPageAPIInfo(){
    let obj ={
        urlPageName : null,
        groupingEnabled:false,
    }
    if (location.href.indexOf(url.viewTSUrl) > -1) {
        obj.urlPageName = urlAndPageNames.viewtimesheet;
    }
    if (location.href.indexOf(url.submittimesheetUrl) > -1) {
       obj.urlPageName = urlAndPageNames.submittimesheet;
    }
    if (location.href.indexOf(url.inboxUrl) > -1) {
       obj.urlPageName = urlAndPageNames.inbox;
    }
    this.timesheetPageInfo = obj
 
   }
   addItem(e){
   // console.log("dataSource",e)
    this.dataSource = e;
    
    this.store.dailyTSObj.next(this.dataSource);
    this.gridHeader = keywords.dailyTableHeader;
    // headerObj?.forEach(header=>{
    //     let heading =header.split(/(?=[A-Z])/); 
    //      heading[0] = heading[0].charAt(0).toUpperCase() + heading[0].slice(1);
    //      let str = heading.join(' ');
    //      this.gridHeader.push(str);
    // });
  
   }
}