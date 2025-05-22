import { Component, Input, OnInit } from '@angular/core';
import { CommonModalService } from './common-modal.service';
import { StoreService } from 'src/app/services/store.service';
import { keywords } from 'src/app/shared/constant';
import { Route, Router } from '@angular/router';
import { ApiPaths } from 'src/app/shared/util';
import { RestApiService } from 'src/app/services/rest-api.service';

@Component({
  selector: 'app-common-modal',
  templateUrl: './common-modal.component.html',
  styleUrls: ['./common-modal.component.scss']
})
export class CommonModalComponent implements OnInit {
  tsData:any;
  //header=keywords.dailyTableHeader
  timesheetIdDataa:any
  header=keywords.summaryDetailsTableHeader;
@Input() public timesheetDetailsDetaa;
  constructor(private store:StoreService,private router:Router,private commonService:CommonModalService,private restApiService: RestApiService){}
 
  ngOnInit(): void{
    this.store.dailyTSObj.subscribe(data=>{this.tsData = data})
    this.tsData = this.commonService.tSData;
  this.timesheetIdDataa =this.timesheetDetailsDetaa //this.commonService.timesheetId
  //console.log('timeSheet data',this.timesheetDetailsDetaa)
  }
  resubmitTS(id){
    let url = this.router.navigate(['/timesheet/submittimsheet'],{state:{tsData: id}});
   // this.commonModalS.close();
  }

  close(){
    this.commonService.close()
  }
}
