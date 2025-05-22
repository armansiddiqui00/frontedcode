import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { DatePipe } from '@angular/common';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ApiPaths } from 'src/app/shared/util';
import { LoaderService } from 'src/app/services/loader.service';
import { Router } from '@angular/router';
import { TravelDeskService } from '../travel-desk-modal/travel-desk.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-travel-expense',
    templateUrl: './travel-expense.component.html',
    styleUrls: ['./travel-expense.component.scss']
  })

  export class TravelExpenseComponent{

    @Output() newItemEvent = new EventEmitter();
    @Output() getItemEvent = new EventEmitter();

    travelExpenseHeader:any
    count = [0]
    arr=[1]
    time:any=new Date()
    showNoRecords:boolean;

    addEditFlag:boolean=false


    expenseData={
      empId:null,
      employeName:null,
      travelId:null,
      travelOrign:null,
      travelPurpose:null,
      addedBy:null,
      addedTime:null,
      modifiedBy:null,
      modifiedTime:null,
      description:null,
      date:null,
      ticket:null,
      loding:null,
      boarding:null,
      phone:null,
      localConveyance:null,
      incidentals:null,
      others:null,
      currency:null,
    }

    row = [
        {
          desc : '',
          date: '',
          ticket: '',
          loding:'',
          boarding:'',
          phone:'',
          local:'',
          incidentals:'',
          others:'',
          currency:''
        },
      ];
    gridFLag:boolean=false
    requestData:any
    empName:any
    travelID:any
    purposeOFVisit:any;
    placeOfVisit:any
    constructor(private datepipe:DatePipe,private service:RestApiService,private lodder:LoaderService,private router:Router,private travelDeskService:TravelDeskService,private toastr:ToastrService){
      //let url = ApiPaths.getTravelExpense+'/empId?empId=4'
    let url = ApiPaths.getTravelExpense
    //  console.log(url)
      this.lodder.show()
      this.service.getTravelProcess(url).subscribe(data=>{
        if(!data){
          this.showNoRecords = null
          this.getItemEvent.emit(this.showNoRecords);
        }else{
         // console.log('getRequestBy ID',data)
          this.getItemEvent.emit(data);
        }
       
        this.lodder.hide();
      },
      err=>{
        if(err){ //console.log('err',err)
          this.lodder.hide();
          this.showNoRecords = null
          this.getItemEvent.emit(this.showNoRecords);
          this.toastr.success(toastrMsg.errMsg)
        }
      })
    }

    ngOnInit(){
       this.travelExpenseHeader=keywords.travelExpenseHeader
       this.time=this.datepipe.transform(this.time,'MM/dd/yyyy hh:mm:ss')

       this.service.selectedSubject$.subscribe((val:any)=>{
        this.requestData=val;
      //  this.empName=this.requestData.employeeName
      //  this.expenseData.empName=this.requestData.employeeName
        // this.expenseData.empId=this.requestData.empId
        // this.expenseData.purposeOfVisit=this.requestData.travelPurpose
        // this.expenseData.plaveOFVisit=this.requestData.travelDestination

       // console.log('requestData',this.requestData)
      });
    }

    onChange(){ //console.log('event',this.expenseData.empId);

    if( this.expenseData.employeName != null){
        
        this.requestData.forEach(res=>{ //console.log('res',res)
            this.expenseData.travelOrign=res.travelDestination
            this.expenseData.travelPurpose=res.travelPurpose
            
           // this.gridFLag=true
        })
        //console.log('placeofVisit',this.requestData.destination)
       
        this.expenseData.travelId='TravelID1'
        //console.log('expenseData',this.expenseData)
    }
    
    //document.getElementById("demo").innerHTML = "You selected: " + x;
    }
 
    increment(){
       
     const obj = {
        desc : '',
        date: '',
        ticket: '',
        loding:'',
        boarding:'',
        phone:'',
        local:'',
        incidentals:'',
        others:'',
        currency:''
      };
      

      this.row.push(obj)
     // console.log('row',this.row)
       
    }

    decrement(){
        this.row.forEach(res=>{
         //   console.log('res',res)
            this.row.pop()
        })
    }

    datagrid=[]
    submit(){
      //  console.log('expenseData',this.expenseData)
        this.gridFLag=true
       let body={
           empId:this.expenseData.empId,
           employeName:this.expenseData.employeName,
           travelId:this.expenseData.travelId,
           travelOrigin:this.expenseData.travelOrign,
           travelPurpose:this.expenseData.travelPurpose,
           addedBy:this.expenseData.employeName,
           addedTime:this.time,
           modifiedBy:this.expenseData.employeName,
           modifiedTime:this.time,
           description:this.expenseData.description,
           date:'12',
           ticket:this.expenseData.ticket,
           loding:this.expenseData.loding,
           boarding:this.expenseData.boarding,
           phone:this.expenseData.phone,
           localConveyance:this.expenseData.localConveyance,
           incidentals:this.expenseData.incidentals,
           others:this.expenseData.others,
           currency:this.expenseData.currency
        }
        let data =[body]
        body.date=this.datepipe.transform(body.date,'MM/dd/yyyy hh:mm:ss')
      //  console.log('body',body)
        //console.log('count',this.row)
    

        //this.newItemEvent.emit(body);
        this.row.forEach(res=>{
            res.date=this.datepipe.transform(res.date,'MM/dd/yyyy hh:mm:ss')
        })
    }

    reset(){
        this.gridFLag=false
        this.expenseData={
          empId:null,
          employeName:null,
          travelId:null,
          travelOrign:null,
          travelPurpose:null,
          addedBy:null,
          addedTime:null,
          modifiedBy:null,
          modifiedTime:null,
          description:null,
          date:null,
          ticket:null,
          loding:null,
          boarding:null,
          phone:null,
          localConveyance:null,
          incidentals:null,
          others:null,
          currency:null,
         }
         this.datagrid=[]
         this.newItemEvent.emit();
         
    }

    addNewRecod(){
        // this.gridFLag=false
        // this.expenseData={
        //   empId:null,
        //   employeName:null,
        //   travelId:null,
        //   travelOrign:null,
        //   travelPurpose:null,
        //   addedBy:null,
        //   addedTime:null,
        //   modifiedBy:null,
        //   modifiedTime:null,
        //   description:null,
        //   date:null,
        //   ticket:null,
        //   loding:null,
        //   boarding:null,
        //   phone:null,
        //   localConveyance:null,
        //   incidentals:null,
        //   others:null,
        //   currency:null,
        //  }
        //  this.row=[{
        //     desc : '',
        //     date: '',
        //     ticket: '',
        //     loding:'',
        //     boarding:'',
        //     phone:'',
        //     local:'',
        //     incidentals:'',
        //     others:'',
        //     currency:''
        //   }]
        //this.addEditFlag=true
       // let add = "addEdit"
      //  this.newItemEvent.emit(add);
      let action = null
      this.travelDeskService.setdocument(action)
      this.router.navigate(['/rims/emp/travelExpenseEdit'])
    }

    newItemEventt(e){
      //console.log('e',e)
      this.addEditFlag=e
    }

  }