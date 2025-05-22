import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { TravelDeskService } from '../travel-desk-modal/travel-desk.service';
import ContextMenu from "devextreme/ui/context_menu";
import { ActivatedRoute, Router } from '@angular/router';
import { ApiPaths } from 'src/app/shared/util';
import { RestApiService } from 'src/app/services/rest-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from 'src/app/components/confirmation-dialog/confirmation-dialog.service';
import { StoreService } from 'src/app/services/store.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal'
import { template } from 'lodash';
import { DxTooltipComponent } from 'devextreme-angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent {
  @Input() dataSource;
  @Input() gridHeader;
  @Input() travelDeskPageInfo;
  @Input() showNoRecords;
  @Input() newRecord;
  @ViewChild(DxTooltipComponent) tooltip: DxTooltipComponent;
  header:any;
  columns=[];
  actionClick: Function;
  editClick:Function;
  editTravelRequest:Function;
  deleteRow:Function;
  editDropDownMenu:any;
  menuInstance;
  pageId:any;
  modalRef?: BsModalRef;
  focusedRowKey;
  focus:boolean=false
  reqCreatedDate:any
  date:any=new Date();
  highlight:boolean=false
  constructor(private travelDeskService:TravelDeskService,private router:Router,private activeRoute:ActivatedRoute,private service:RestApiService,private lodder:LoaderService,private toastr:ToastrService,private confirmationDialogService:ConfirmationDialogService,private modalService: BsModalService,private store:StoreService,private datepipe:DatePipe){
   this.editAndSaveButtonTemplate = this.editAndSaveButtonTemplate.bind(this);
   this.editAndSaveButtonTemplateForViewTravelRequest = this.editAndSaveButtonTemplateForViewTravelRequest.bind(this);
   this.deleteButtonTemplate = this.deleteButtonTemplate.bind(this);
   this.deleteTravelRequestButtonTemplate=this.deleteTravelRequestButtonTemplate.bind(this);
   this.editButtonTemplate = this.editButtonTemplate.bind(this)
   this.editTravelRequestTemplate=this.editTravelRequestTemplate.bind(this)
   this.visaDetailsTemplate=this.visaDetailsTemplate.bind(this);
   this.passportDetailsTemplate = this.passportDetailsTemplate.bind(this)
   this.travelExpenseTemplate = this.travelExpenseTemplate.bind(this)
   this.highlightTemplate = this.highlightTemplate.bind(this)
    this.actionClick = (action,options) => this.onActionClick(action,options);
    this.deleteRow=(data)=> this.onDeleteClick(data);
    this.editClick=(data)=>this.onEdit(data)
    this.editTravelRequest=(data)=>this.onEditTravelRequest(data);
  }
  ngOnInit(){// console.log('dataSource',this.dataSource)
    this.travelDeskService.getDataource(this.dataSource);
    this.header =  this.travelDeskPageInfo.urlPageName == 'visaDetails' ? keywords.visaHeader : this.travelDeskPageInfo.urlPageName == 'travelRequest' ? keywords.travelReqHeader : this.travelDeskPageInfo.urlPageName == 'travelExpense'? keywords.travelExpenseHeader2:this.travelDeskPageInfo.urlPageName == 'viewTravelReqStatus'?keywords.viewTravelReqHeader:'';
   // this.setColoumns();
  // let reqCreatedDate
   this.dataSource.forEach(val=>{
   // console.log('dataSoure',val)
    // this.reqCreatedDate=val.travelProcessDetailsEntity[0]?.reqCreatedDate
    // this.reqCreatedDate=this.datepipe.transform(this.reqCreatedDate,'MM/dd/yyyy');
    // this.date=this.datepipe.transform(this.date,'MM/dd/yyyy');
    // if(this.reqCreatedDate == this.date){
    //     console.log('res',val.reqId)
    //     val.employeName+'(new)'

    // }
    
   })
   //let date:any=new Date();
   
  
    setTimeout(() => {
      this.columns = [];
      this.setColoumns();
    }, 10);
    this.activeRoute.queryParams.subscribe(data=> this.pageId = data.pageId);
  }

  setColoumns(){
   // this.dataSource?.forEach(source=>{  console.log('source',source)
      //Object.keys(source).forEach(keys=>{ console.log('keys',keys)
        this.header.filter((filter:any)=>{ //console.log('filter',filter)
       // keys == filter.id?
      // console.log('reqCreated ...',this.reqCreatedDate)
       if(this.travelDeskPageInfo.urlPageName == 'viewTravelReqStatus' && filter.id=='employeName' && this.newRecord==true){
        this.columns.push({dataField:filter.id, alignment: 'left',cssClass:'highlight', caption:filter.name, adaptive:true,cellTemplate:this.highlightTemplate})
        }else{
        this.columns.push({dataField:filter.id, alignment: 'left', caption:filter.name, adaptive:true})
       }
       
    //  })
    //  })
    })
    if(this.travelDeskPageInfo.urlPageName == 'travelRequest'){
      this.columns.push({dataField:'', caption:'Action', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.editAndSaveButtonTemplate})
    }else if(this.travelDeskPageInfo.urlPageName == 'travelExpense'){
      this.columns.push({dataField:'', caption:'Action', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.deleteButtonTemplate})
      this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.editButtonTemplate})
      this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.travelExpenseTemplate})
    }else if(this.travelDeskPageInfo.urlPageName == 'viewTravelReqStatus'){
      this.columns.push({dataField:'', caption:'Action', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.deleteTravelRequestButtonTemplate})
      this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.editTravelRequestTemplate})
      this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.editAndSaveButtonTemplateForViewTravelRequest})
      this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.visaDetailsTemplate})
      this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.passportDetailsTemplate})
    
    }else if(this.travelDeskPageInfo.urlPageName == 'visaDetails' ){
      this.columns.push({dataField:'', caption:'Action', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.visaDetailsTemplate})
      this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.passportDetailsTemplate})
      this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.editButtonTemplate})
    }

  //   let sticky = document.getElementById(keywords.gridContainer).children[0].children[4];
  // sticky.classList.add(keywords.fixedHeaders); 
  }

 
    onCellPrepared (e:any) { console.log('e',e)
        // if (e.rowType === "data") {
        //     if (e.column.dataField === "employeName" && e.data.employeName.endsWith('(new record)') ) {
        //       //  e.cellElement.style.cssText = "color: red";
        //        // e.data.employeName.endsWith('(new record)').style.cssText="color: red"
        //       //e.displayValue =  e.displayValue.slice('',-12);
        //       const row = document.createElement('div');
        //       row.classList.add('stringColor');
        //       let edit = document.createElement('a');
        //       let html=`<span>(new recordw)</span>`;
        //       edit.innerHTML=html;
        //       e.cellElement=edit.innerHTML
        //       //return row;
        //     }
        // }
      
    }

    highlightTemplate(container,options){ console.log('option highlight',options)
      let div = document.createElement('DIV');
      div.setAttribute("data-toggle","tooltip");
      div.setAttribute("data-placement","top");
      div.setAttribute("title",options?.key);
      let a = document.createElement('A')
     let req=options.key.travelProcessDetailsEntity[0]?.reqCreatedDate
     req=this.datepipe.transform(req,'MM/dd/yyyy');
     this.date=this.datepipe.transform(this.date,'MM/dd/yyyy');
       let html = req == this.date?'<span>' + options.key.employeName+'</span><span class="spanning">(new record)</span>':'<span>' + options.key.employeName+'</span>';
      //  a.style.color = '#000000'
      //  a.style.pointerEvents = "all"
      a.innerHTML = html
       a.onclick = () => {
       // this.transactionIdEvent.emit(options.key);
       }
      
      div.append(a);
      return div;
    }

    // transactionIdCellTemplate(container,options){
    //   let div = document.createElement('DIV');
    //   div.setAttribute("data-toggle","tooltip");
    //   div.setAttribute("data-placement","top");
    //   div.setAttribute("title",options?.key);
    //   let a = document.createElement('A')
    //    let html = '<span>' + options.key+'</span>'
    //   //  a.style.color = '#000000'
    //   //  a.style.pointerEvents = "all"
    //   a.innerHTML = html
    //    a.onclick = () => {
    //     this.transactionIdEvent.emit(options.key);
    //    }
      
    //   div.append(a);
    //   return div;
    // }



  editAndSaveButtonTemplate(container,options){ //console.log('options',options)
    const row = document.createElement('div');
    row.classList.add('row');
    const col1 = document.createElement('div');
    col1.classList.add('col-md-6','col-sm-6');
    let edit = document.createElement('a');
    let html = `<i class="fa fa-edit"></i>`;
    edit.innerHTML = html;
    edit.onclick = () => this.actionClick('edit',options);
    const col2 = document.createElement('div');
    col2.classList.add('col-md-6','col-sm-6');
    let view = document.createElement('a');
    let viewHtml = `<i class="fa fa-eye"></i>'`;
    view.innerHTML = viewHtml;
    view.onclick = () => this.actionClick('view',options);
    col1.appendChild(edit);
    col2.appendChild(view);
    row.appendChild(col1);
    row.appendChild(col2);
    return row;
  }



  editAndSaveButtonTemplateForViewTravelRequest(container,options){ console.log('optionsssss',options.data)
  const row = document.createElement('div');
  row.classList.add('row');
  const col1 = document.createElement('div');
  col1.classList.add('col-md-6','col-sm-6');
  let edit = document.createElement('a');
  let html = `<i class="fa fa-edit"></i>`;
  edit.innerHTML = html;
  edit.onclick = () => this.onActionClickView('edit',options);
  const col2 = document.createElement('div');
  col2.classList.add('col-md-6','col-sm-6');
  let view = document.createElement('a');
  let viewHtml = `<i class="fa fa-eye"></i>'`;
  view.innerHTML = viewHtml;
  view.onclick = () => this.onActionClickView('view',options);
  col1.appendChild(edit);
  col2.appendChild(view);
  row.appendChild(col1);
  row.appendChild(col2);
  return row;
}

  deleteButtonTemplate(container,options){ //console.log('options',options.key.expenseId)
  let div =document.createElement('div'); 
  let a = document.createElement('a');
  a.classList.add('color-blue')
  let html = '<img src="assets/icons/icon-delete.svg" atl="delete">'
  a.innerHTML = html;
  a.onclick = () =>{console.log('options',options.key.expenseId)
  this.deleteRow(options.key);
    // let url = ApiPaths.getTravelExpense+'/'+options.key.expenseId
    // console.log('url',url)
    // //this.lodder.show()
    //   this.service.deleteTravelProcess(url).subscribe(data=>{
    //  //   this.lodder.hide();
    //     if(data != null){
    //       this.deleteRow(options.key);
    //       this.dataSource=data
    //       this.toastr.success(toastrMsg.deletedSuccessfully)
    //       console.log('getRequestBy ID',this.dataSource)
    //     }
        
    //   })
  } 
  div.append(a);  
  return div;
  }

  deleteTravelRequestButtonTemplate(container,options){ //console.log('options',options.key.expenseId)
  let div =document.createElement('div'); 
  let a = document.createElement('a');
  a.classList.add('color-blue')
  let html = '<img src="assets/icons/icon-delete.svg" atl="delete">'
  a.innerHTML = html;
  a.onclick = () =>{console.log('options',options.key.expenseId)
  this.deleteRow(options.key);
    // let url = ApiPaths.deleteTravelRequest+'/'+options.key.reqId
    // console.log('url',url)
    // this.lodder.show()
    // this.deleteRow(options.key);
    //   this.service.deleteTravelProcess(url).subscribe(data=>{
    //   this.lodder.hide();
    //     if(data != null){
         
    //       this.dataSource=data
    //       this.toastr.success(toastrMsg.deletedSuccessfully)
    //       console.log('getRequestBy ID',this.dataSource)
    //     }
        
    //   })
  } 
  div.append(a);  
  return div;
  }

  editButtonTemplate(container,options){ //console.log('options',options)
  
  let div =document.createElement('div'); 
  let a = document.createElement('a');
  a.classList.add('color-blue')
  let html = '<i class="fa fa-edit"></i>'
  a.innerHTML = html;
  a.onclick = () => {
    if(this.travelDeskPageInfo.urlPageName == 'travelExpense'){
      this.editClick(options.key)
    }
    else if(this.travelDeskPageInfo.urlPageName == 'visaDetails'){
     // console.log("visaDetails container",container,options)
      this.actionClick(options.data)
    }
  }
  div.append(a);  
  return div;
  }

  editTravelRequestTemplate(container,options){ //console.log('options',options)
  
    let div =document.createElement('div'); 
    let a = document.createElement('a');
    a.classList.add('color-blue')
    let html = '<i class="fa fa-edit"></i>'
    a.innerHTML = html;
    a.onclick = () => this.editTravelRequest(options.key);
    div.append(a);  
    return div;
    }

    visaDetailsTemplate(container,options){//console.log('options',options)
      let div =document.createElement('div'); 
     let a = document.createElement('a');
     a.classList.add('color-blue')
     let html = '<i class="fa fa-eye"></i>'
     a.innerHTML = html;
     a.onclick = () => {
   //   this.lodder.show();
      this.service.getOrDeleteData("api/getVisaDetails/"+options?.data?.empId,null,null).subscribe(data=>{
       // this.lodder.hide()
        this.onVisaDetails(options,data)
      },(error)=>{
     //   this.lodder.hide();
      })
     }
     div.append(a);  
     return div;
    }

    travelExpenseTemplate(container,options){//console.log('options',options)
      let div =document.createElement('div'); 
     let a = document.createElement('a');
     a.classList.add('color-blue')
     let html = '<i class="fa fa-eye"></i>'
     a.innerHTML = html;
     a.onclick = () => this.onTravelExpense(options)
     div.append(a);  
     return div;
    }


    passportDetailsTemplate(container,options){
    let div =document.createElement('div'); 
   let a = document.createElement('a');
   a.classList.add('color-blue')
   let html = '<i class="fa fa-eye"></i>'
   a.innerHTML = html;
   //console.log("option",options)
   a.onclick = () => {
    this.lodder.show();
    if(this.travelDeskPageInfo.urlPageName == 'visaDetails'){
      this.service.getOrDeleteData("api/getPassportDetails/"+options?.data?.passportNo,null,null).subscribe(data=>{
        this.lodder.hide()
        this.onPassportDetails(options,data)
      },(error)=>{
        this.lodder.hide();
      })
    }else{
      this.service.getOrDeleteData("api/getPassportDetailsByEmpId",{empId:options?.data?.empId},null).subscribe(data=>{
        this.lodder.hide()
        this.onPassportDetails(options,data)
      },(error)=>{
        this.lodder.hide();
      })
    }
   //console.log("visaNumber",options)
   
    
   }
   div.append(a);  
   return div;
  }
  
  onActionClick(action,options) { 
   
  if(options != undefined){
    let reqId=options.data.reqId;
    let id
    let reqType=options.data.typeOFRequest
    if(options.data.travelProcessDetailsEntity != null){
     id =options.data.travelProcessDetailsEntity[0]?.id
    }
    this.travelDeskService.open(action,reqId,id,reqType);
  }
    else{
    //  console.log('click id',action)
      this.store.gridRowData.next(action)
    }
   
  }

  onActionClickView(action,options){
    let reqId=options.data.reqId;
    let id
    let reqType=options.data.typeOFRequest
    if(options.data.travelProcessDetailsEntity.length != 0){
     id =options.data.travelProcessDetailsEntity[0]?.id
     console.log('click id',id)
    }
    this.travelDeskService.open(action,reqId,id,reqType);
  }
  
  onEdit(action){
    //console.log('action',action)
    this.travelDeskService.setdocument(action)
    this.router.navigate(['/rims/emp/travelExpenseEdit'])
  }

  onVisaDetails(action,inputData){ console.log('action',action)
  let data ;
    if(action.data.visaDetailsEntityModel){
      data = action.data.visaDetailsEntityModel;
    }
    else{
      data = [action.data]
    }
    this.travelDeskService.open('visaDetails',data,null,null)
    this.travelDeskService.setdocument('visaDetails')
  }

  onEditTravelRequest(action){
    this.travelDeskService.editTravelRequest(action)
    this.router.navigate(['/rims/emp/travelRequest'])
  }

  onPassportDetails(action,data){
    action.data.projectEntityModel=null;
    if(data && action.data?.empId == data?.empId){
     // console.log("Passport",action,data)
      action.data["projectEntityModel"] = data;
      this.travelDeskService.open('passportDetails',action.data.projectEntityModel,null,null)
      this.travelDeskService.setdocument('passportDetails')
    }else{
      this.travelDeskService.open('passportDetails',action.data.projectEntityModel,null,null)
      this.travelDeskService.setdocument('passportDetails')
    }
  }
  onTravelExpense(action){ //console.log('action',action)
   // console.log('action',action)
    this.travelDeskService.open('travelExpense',action.data,null,null)
    this.travelDeskService.setdocument('travelExpense')
  }
  onDeleteClick(data){
    this.openConfirmationDialog(data)
  }
  openConfirmationDialog(data){
   // const response = confirm("Are you sure you want to delete?");
    // if(response){
    //   let index = this.dataSource.findIndex(find=> data.id == find.id);
    //   this.dataSource.splice(index,1)
    // }
    //console.log("data",data)
    let url = this.travelDeskPageInfo.urlPageName == 'travelExpense' ? ApiPaths.getTravelExpense+'/'+data.expenseId : ApiPaths.deleteTravelRequest+'/'+data.reqId;
    this.confirmationDialogService.confirm(keywords.delete, "Are you sure, you want to delete?")
    .then((confirm)=>{
      if(confirm){
       // this.lodder.show();
       this.toastr.success(toastrMsg.deletedSuccessfully)
        this.service.deleteTravelProcess(url).subscribe(data=>{
         // console.log("data",data)
         // this.lodder.hide();
        })
        if(this.travelDeskPageInfo.urlPageName == 'viewTravelReqStatus'){
          let index = this.dataSource.findIndex(find=> data.reqId == find.reqId);
          this.dataSource.splice(index,1)
        }else if(this.travelDeskPageInfo.urlPageName == 'travelExpense'){
          let index = this.dataSource.findIndex(find=> data.expenseId == find.expenseId);
          this.dataSource.splice(index,1)
        }
      }
    })
  }

  customizeColumns(cols) {// console.log('cols',cols)
    cols.forEach(col => cols.caption = cols.dataField);
   
  }

  editDetails(e){
    //this.editDropDownMenu = ['Exit Date','Entry Date','Document Status','Return Date','Onsite Days','Visa Status','More']
  }

content:any='tooltip'
TooltipTarget:any;
isVisible:boolean= false;
ToolTipText :string = '';
onCellHoverChanged(event){
  if(this.travelDeskPageInfo.urlPageName == 'viewTravelReqStatus'){
    if (event.rowType == 'data' && event.columnIndex > 6) {
      this.TooltipTarget = event.cellElement;
      if (event.eventType === 'mouseover') {
       //console.log(this.ToolTipText);
       event.columnIndex == 12? this.ToolTipText = 'Passport Details':event.columnIndex == 11?this.ToolTipText = 'Visa Details':event.columnIndex == 10?this.ToolTipText = 'Process Status':event.columnIndex == 9?this.ToolTipText = 'Edit Request':event.columnIndex == 8?this.ToolTipText = 'Delete Request':'';
       this.isVisible = true;
      }
     }else{
      this.TooltipTarget = event.cellElement;
      if (event.eventType === 'mouseover') {
       this.isVisible = false;
      }
     }
  }
  if(this.travelDeskPageInfo.urlPageName == 'visaDetails'){
    if (event.rowType == 'data' && event.columnIndex > 11) {
      this.TooltipTarget = event.cellElement;
      if (event.eventType === 'mouseover') {
       event.columnIndex == 12? this.ToolTipText = 'Visa Details':event.columnIndex == 13?this.ToolTipText = 'Passport Details':event.columnIndex == 14?this.ToolTipText = 'Edit Passport Details':'';
       this.isVisible = true;
      }
     }else{
      this.TooltipTarget = event.cellElement;
      if (event.eventType === 'mouseover') {
       this.isVisible = false;
      }
     }
  }
  

   
  }
  onFocusedCellChanging(e) {  
    e.isHighlighted = true;
  }

  
  onFocusedRowChanging(e) { console.log('e',e)
  this.focusedRowKey=e.newRowIndex

  //console.log('focus e',e)
    
  }



  onFocusedRowChanged(e) {console.log('e',e)
   
}

// onRightClick(e) {
//   if (e.target == 'content' && e.column != undefined) {
//       e.items = [{
//         text: 'copy',
//         onItemClick:  ()=> {  
//         // this.clipboard.copy(e?.targetElement.innerHTML);
//         }
//    } ]
//   }
}

