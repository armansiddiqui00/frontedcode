import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SharedService } from 'src/app/services/shared.service';
import { StoreService } from 'src/app/services/store.service';
import { keywords } from 'src/app/shared/constant';
import { ApiPaths } from 'src/app/shared/util';

@Component({
  selector: 'data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent {
  @Input() dataSource;
  @Input() settingsPageInfo;
  @Input() gridHead;
  @Input() serviceNotResponded;
  columns = [];
  showFilterRow: boolean;
  deleteRow:Function;
  actionClick:Function;
  constructor(private http:HttpClient, private restApi:RestApiService,private store:StoreService,private sharedSerivce:SharedService){
    this.deleteCellTemplate = this.deleteCellTemplate.bind(this);
    this.editCellTemplate = this.editCellTemplate.bind(this);
    this.deleteRow= (data) => this.onDeleteClick(data);
    this.actionClick = (data) => this.onActionClick(data);
    this.showFilterRow = true;

    
  }
  ngOnInit(){ 
    this.setGridColumns()
  }

  setGridColumns(){ 
   // console.log('data',this.dataSource,this.heading);
    // this.dataSource.forEach(key=>{
    //   Object.keys(key).forEach(o=>{
    //     this.columns.push({dataField: o, caption : this.heading[o],adaptive: true, visible:true })
    //   })
    //   this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.editCellTemplate });
    //   this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.deleteCellTemplate });      
    // })
    Object.entries(this.gridHead).forEach(col=>{
      this.columns.push({dataField: col[0], caption : col[1],adaptive: true})
     })
     this.columns.push({ dataField: '', caption: '',alignment: keywords.center, adative: true, cellTemplate: this.editCellTemplate });
     this.columns.push({ dataField: '', caption: '',alignment: keywords.center, adative: true, cellTemplate: this.deleteCellTemplate }); 
  }

  deleteCellTemplate(container,options){
    let div =document.createElement('div'); 
    let a = document.createElement('a');
    a.style.fontSize = '20px';
    a.style.color = 'red'
    let html = '<i class="fa fa-trash"></i>'
    a.innerHTML = html;
   a.onclick = () => this.deleteRow(options.key)
    div.append(a);  
    return div;
  }

  editCellTemplate(container,options){
    let div =document.createElement('div'); 
    let a = document.createElement('a');
    a.classList.add('color-blue')
    let html = '<i class="fa fa-edit"></i>'
    a.innerHTML = html;
    a.onclick = () => this.actionClick(options.key)
    div.append(a);  
    return div;
  }
  onDeleteClick(data){
    this.openConfirmationDialog(data)
  }
  openConfirmationDialog(data){
    const response = confirm("Are you sure, you want to delete?");
    if(response){
      let params={
        id:data.id
      }
       this.restApi.getOrDeleteData(ApiPaths.deleteAppReviewerById, params,null).subscribe(data=>{
        this.sharedSerivce.refreshGrid.next(true);
      })
 
    }
  }
  onActionClick(data){
   // let index = this.dataSource.findIndex(find=>data.id == find.id);
    //this.dataSource
    //console.log("edit",data)
  //  console.log("edit grid",data)
    this.store.gridRowData.next(data);
  }
}
