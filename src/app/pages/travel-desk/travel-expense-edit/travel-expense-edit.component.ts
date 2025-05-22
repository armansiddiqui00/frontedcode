import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { ApiPaths } from 'src/app/shared/util';
import { TravelDeskService } from '../travel-desk-modal/travel-desk.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-travel-expense-edit',
  templateUrl: './travel-expense-edit.component.html',
  styleUrls: ['./travel-expense-edit.component.scss']
})
export class TravelExpenseEditComponent {

    @Output() newItemEvent = new EventEmitter();
    @Output() getItemEvent = new EventEmitter();

    travelExpenseHeader:any
    count = [0]
    arr=[1]
    time:any=new Date()
    completeTotalOfRows:any

    addEditFlag:boolean=false


    expenseData={

      empId:null,
      employeName:null,
      travelId:null,
      travelDestination:null,
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
          fromDesc:'',
          toDesc:'',
          flightTicket:'',
          hotel:'',
          food:'',
          cab:'',
          localTransport:'',
          others:'',
          reason:'',
          totalSum:'',
          completeTotalOfRows:''
        },
      ];
    gridFLag:boolean=false
    requestData:any
    empName:any
    travelID:any
    purposeOFVisit:any;
    placeOfVisit:any
    words: string[];
    dataSource:any;
    employeeList:any
    constructor(private datepipe:DatePipe,private service:RestApiService,private lodder:LoaderService,private route: ActivatedRoute,private travelDeskService:TravelDeskService,private router:Router,private toastr:ToastrService){
     // console.log(url)
    //   this.travelDeskService.selectedSub$.subscribe((val:any)=>{
    //         console.log('edit action',val)
    //   })
  //   this.service.selectedSubject$?.subscribe((val:any)=>{
  //   if(val != null){
  //       this.requestData=val;
  //       this.expenseData.empId=this.requestData[0].empId
  //       console.log('requestData add new ',this.requestData)
  //   }else{
  //      // this.expenseData.employeName=val.employeName;
  //      // this.expenseData.travelId=val.travelId;
  //   }
   
  // });

  this.travelDeskService.subjectEmpId$.subscribe((val:any)=>{
    if(val != null){
        this.expenseData.empId=val[0].empId;
       // console.log('empID',this.expenseData.empId)
    }
  })
   
    }

    request:any=[]
    data:any
    expenseId:any
    edit:boolean=false;
    rowId:any=''
    ngOnInit(){ console.log('requestData',this.requestData)
      let behaviour
       this.travelExpenseHeader=keywords.travelExpenseHeader
       this.time=this.datepipe.transform(this.time,'MM/dd/yyyy hh:mm:ss')
          this.travelDeskService.selectedSub$.subscribe((val:any)=>{ 
          this.data=val
          console.log('my behaviour subject',this.data)
          if(val != null){
            this.edit=true
            this.request.push(val)
            this.requestData=val; console.log('reqData',this.requestData)
            this.expenseData.travelDestination=val.travelDestination;
            this.expenseData.travelPurpose=val.travelPurpose;
            this.expenseData.empId=val.empId
            this.expenseId=val.expenseId
            this.expenseData.travelOrign=val.travelOrign
            this.expenseData.travelId=val.reqId
            this.time=val.addedTime;
            this.row=val.travelExpenseRowDetails;
           this.completeTotalOfRows=val.travelExpenseRowDetails[0]?.completeTotalOfRows
            
    //  console.log('val.travelExpenseRowDetails',val.travelExpenseRowDetails)
     // console.log('row',this.row)
      let url = ApiPaths.getTravelExpense
      this.lodder.show()
      this.service.getTravelProcess(url).subscribe(data=>{
        this.dataSource=data
       // console.log('getRequestBy ID',this.dataSource)
        this.dataSource.forEach((obj:any)=>{
         if(val.expenseId==obj.expenseId){
          //  console.log('obj',obj.expenseId)
            //obj.travelExpenseRowDetails=[];
            //delete obj.travelExpenseRowDetails
           // console.log('obj pop',obj)
         }
        })
        this.getItemEvent.emit(data);
        this.lodder.hide()
      },
      err=>{
          if(err){ //console.log('err',err)
            this.lodder.hide();
            this.toastr.success(toastrMsg.errMsg)
          }
        }
      )
             this.requestData=this.request
             console.log('my behaviour subject request data', this.requestData)
             this.requestData.forEach(key=>{// console.log(key.travelId)
                        this.expenseData.employeName=key.employeName
                    this.expenseData.travelId=key.travelId;
                     })
          }
            
           
          })

          if(this.data == null){
            this.edit=false
            let url=ApiPaths.getTravelRequest
            this.service.getTravelProcess(url).subscribe(data=>{ console.log('Add behaviour subject',data)
              this.requestData = data;
              console.log('requestData',this.requestData)
            })
          }
    
      
    }

   
   req:any
    onChange(){ //console.log('req',this.req[0].reqId);
  //  this.expenseData.travelId=this.req[0].reqId
      console.log('event',this.expenseData.travelId);
      this.gridFLag=false
   // this.expenseData.travelId=travelId
    if( this.expenseData.travelId != null){
        
        this.requestData.forEach(res=>{ console.log('res',res.reqId)
        if(this.expenseData.travelId == res.reqId){
          this.expenseData.empId=res.empId
          this.expenseData.travelDestination=res.travelDestination
          this.expenseData.travelPurpose=res.travelPurpose
          this.expenseData.travelId=res.reqId
          this.expenseData.employeName=res.employeName
          this.expenseData.travelOrign=res.travelOrign
          this.expenseId=res.travelDeskExpenseEntityModel[0]?.expenseId;

          console.log('travelOrigin',this.expenseData.travelOrign)

          if(res.travelDeskExpenseEntityModel.length > 0){
            this.row=res.travelDeskExpenseEntityModel[0]?.travelExpenseRowDetails

          }else{
            this.row=[
              {
                fromDesc:'',
                toDesc:'',
                flightTicket:'',
                hotel:'',
                food:'',
                cab:'',
                localTransport:'',
                others:'',
                reason:'',
                totalSum:'',
                completeTotalOfRows:''
              },
            ]
          }
          //this.expenseId=res.reqId
        }
          
            
           // this.gridFLag=true
        })
      //  console.log('placeofVisit',this.requestData.destination)
       
        
      //  console.log('expenseData',this.expenseData)
    }
    
    //document.getElementById("demo").innerHTML = "You selected: " + x;
    }
 
    increment(){
       
     const obj = {
      fromDesc:'',
      toDesc:'',
      flightTicket:'',
      hotel:'',
      food:'',
      cab:'',
      localTransport:'',
      others:'',
      reason:'',
      totalSum:'',
      completeTotalOfRows:''
      };
      

      this.row.push(obj)
    //  console.log('row',this.row)
       
    }

    decrement(){
        this.row.forEach(res=>{
          //  console.log('res',res)
            this.row.pop()
        })
    }

    datagrid:any
    submit(){ 
    //     let travelDeskExpenseEntityModel={
    //         expenseId:null
    //     }

    
    // //  console.log('expenseId',expenseId);
    //     this.row.forEach((key:any)=>{ 
    //         key.date=this.datepipe.transform(key.date,'MM/dd/yyyy hh:mm:ss')
    //         Object.assign(key,{travelDeskExpenseEntityModel})
    //       // key.travelDeskExpenseEntityModel.expenseId=val.expenseId
    //       //  key.travelDeskExpenseEntityModel.expenseId=expenseId
    //       console.log('key',key)
    //     })
   // this.expenseData.empId=this.requestData[0].empId
         let expenseId=this.expenseId
    //     console.log('expenseData',this.expenseData)
         this.gridFLag=true
       let body={
           expenseId: expenseId,
           empId:this.expenseData.empId,
           employeName:this.expenseData.employeName,
           travelId:this.expenseData.travelId,
           travelDestination:this.expenseData.travelDestination,
           travelOrign:this.expenseData.travelOrign,
           travelPurpose:this.expenseData.travelPurpose,
           addedBy:this.expenseData.employeName,
           addedTime:this.time,
           modifiedBy:this.expenseData.employeName,
           modifiedTime:this.time,
           traveldeskEntityModel:{
            reqId: this.expenseData.travelId
         }
          
        }
        body.travelDestination=this.expenseData.travelDestination
       // console.log('body',body);
        
       // console.log('row',this.row)
      
        this.row.forEach((key:any)=>{ 
           // key.date=this.datepipe.transform(key.date,'MM/dd/yyyy hh:mm:ss')
           // key.travelDeskExpenseEntityModel.expenseId=val.expenseId
           delete key.travelDeskExpenseEntityModel;
        // console.log(key)
        })
        //console.log('row',this.row)
        let url=ApiPaths.travelExpense;
        let url2=ApiPaths.travelExpenserow
        
    //    
         this.lodder.show()
         let data:any
         this.service.saveTravelRequest(url,body).subscribe(val=>{ //console.log('  data',val)
        if(val != null){
           data=val
           //console.log(data)
           let travelDeskExpenseEntityModel={
            expenseId:data.expenseId
        }

         let rowBody=[];
         let sum=[];
         this.row.forEach((key:any)=>{
         Object.assign(key,{travelDeskExpenseEntityModel})
        // console.log('key',key)
        //  key.totalSum= +key.flightTicket + +key.hotel + +key.food + +key.cab + +key.localTransport + +key.others
         
        sum.push(key.totalSum)
        var total = sum.reduce((acc, cur) => acc + cur, 0);
        // console.log('completeTotalOfRows',total)
       // console.log('totalSum',sum)
        this.completeTotalOfRows =  total
        key.completeTotalOfRows=this.completeTotalOfRows
       // console.log('completeTotalOfRows',key.completeTotalOfRows)
            rowBody.push(key);
           //delete key.rowId;
          })
       this.row.pop()
      // this.getTotalCost();
console.log('rowBody',rowBody)
this.service.saveTravelRequest(url2,rowBody).subscribe(val=>{
    //console.log('row data',val)
    this.datagrid=val
    this.lodder.hide()
},
err=>{
    if(err){ //console.log('err',err)
      this.lodder.hide();
      this.toastr.success(toastrMsg.errMsg)
    }
  }
)
        }else{
            data=null
        }

          
        },
        err=>{
            if(err){ //console.log('err',err)
              this.lodder.hide();
             
            }
          }
        )

        if(data != null){
          
        }
       
         

       // let data =[body]
       // body2.date=this.datepipe.transform(body2.date,'MM/dd/yyyy hh:mm:ss')
      //  console.log('body',body)
        //console.log('count',this.row)
    

        //this.newItemEvent.emit(body);
       
    }
   
    getBizServicesSetting() {
      let emp='employeName'
      let date='travelDate'
      let label=emp+date
      let specificSetting = {
        text: 'Select Employee',
        primaryKey: 'travelId',
        labelKey: 'employeName',
        classes:'custom-class',
        singleSelection: true,
        selectAllText: 'Select All',
        unSelectAllText: 'Remove All',
        enableSearchFilter: true,
        searchPlaceholderText: 'search'
      }
      return Object.assign(specificSetting);
    }
    
    totalSumFunction(){
     
      let sum=[]
      this.row.forEach((key:any)=>{
     
      //  console.log('key',key)
        key.totalSum= +key.flightTicket + +key.hotel + +key.food + +key.cab + +key.localTransport + +key.others
        
      //  sum.push(key.totalSum)
      //  var total = sum.reduce((acc, cur) => acc + cur, 0);
      //   console.log('completeTotalOfRows',total)
      //  console.log('totalSum',sum)
      //  this.completeTotalOfRows =  total
      //  key.completeTotalOfRows=this.completeTotalOfRows
      //  console.log('completeTotalOfRows',key.completeTotalOfRows)
          
          //delete key.rowId;
         })
    }

    rows = this.row.slice();
    getTotalCost() {
      //return this.row.map(t => t.totalSum).reduce((acc, value) => acc + value, 0);

     // return console.log('completeTotalOfRows',this.rows.map(sum => sum.totalSum).reduce((acc,value)=> +acc + +value, 0 ));
   
    }

    reset(){
        this.gridFLag=false
        this.expenseData={
          empId:null,
          employeName:null,
          travelId:null,
          travelDestination:null,
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
         const obj = {
          fromDesc:'',
          toDesc:'',
          flightTicket:'',
          hotel:'',
          food:'',
          cab:'',
          localTransport:'',
          others:'',
          reason:'',
          totalSum:'',
          completeTotalOfRows:''
          };
         this.row.pop();

    }

    navigatee:any=null;
    navigate(){
        this.navigatee="Go Back"
        this.router.navigate(['/rims/emp/travelExpense'])
    }

}