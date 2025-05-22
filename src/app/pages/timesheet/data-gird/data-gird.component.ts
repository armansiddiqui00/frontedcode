import { Component, Input } from '@angular/core';

@Component({
  selector: 'data-grid',
  templateUrl: './data-gird.component.html',
  styleUrls: ['./data-gird.component.scss']
})
export class DataGirdComponent {
  @Input() dataSource;
  @Input() gridHeader;
  @Input() timesheetPageInfo;
  columns = [];
  primaryKey:any;
  deleteRow:Function;
  actionClick:Function;
  constructor(){
    this.deleteCellTemplate = this.deleteCellTemplate.bind(this);
    this.editCellTemplate = this.editCellTemplate.bind(this)
    this.deleteRow= (data) => this.onDeleteClick(data);
    this.actionClick = (data) => this.onActionClick(data);
  }
    ngOnInit(){
      this.setGridColumns();
    }
    setGridColumns(){
      // header?.map(head=>{
      //   let caption;
      //   this.gridHeader.find(columnName=>{
      //     caption = columnName.split(" ").join("").toLowerCase();
      //     if(head.toLowerCase() == caption){
      //       this.columns.push({ dataField:head , caption: columnName,  adaptive: true,})
      //     }
      //   });
      // });    
      // console.log("columns",this.columns,this.dataSource)
      // this.dataSource = [this.dataSource]
      // this.primaryKey = this.columns[0].dataField;
        this.dataSource?.forEach((ds)=>{
          let header = Object.keys(ds);
          header.map(map=>{
            this.columns.push({ dataField:map , caption: map,  adaptive: true,})
          })
          this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.deleteCellTemplate });
          this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.editCellTemplate })
          
        })
      //console.log('columns',this.gridHeader,this.dataSource)
     
      
    }
    deleteCellTemplate(container,options){
      let div =document.createElement('div'); 
      let a = document.createElement('a');
      a.classList.add('color-blue')
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
        let index = this.dataSource.findIndex(find=> data.id == find.id);
        this.dataSource.splice(index,1)
      }
    }
    onActionClick(data){
      let index = this.dataSource.findIndex(find=>data.id == find.id);
      //this.dataSource
     // console.log("edit",data,index)
    }
}
