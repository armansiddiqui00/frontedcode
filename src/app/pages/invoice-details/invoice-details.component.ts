import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from 'src/app/services/store.service';
import { DatePipe } from '@angular/common';
import { InvoiceService } from './invoice.service';

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent {

invoiceDetailsPageInfo:any

constructor(private invoiceService:InvoiceService) {
  
    
}
  ngOnInit(): void {
      this.getPageAPIInfo();
  }

 

  getPageAPIInfo() {
    let obj = {
      urlPageName: null,
      groupingEnabled: false,
      url: null,

    }
  
  if (location.href.indexOf('/dwc/inv/createinvoice') > -1) {
    obj.urlPageName = 'createinvoice';
  //  obj.url = ApiPaths.travelExpense

 }
 if (location.href.indexOf('/attendanceTimesheet-component') > -1) {
  obj.urlPageName = 'attendanceTimesheet';
 // obj.url = ApiPaths.travelExpense

}

    this.invoiceDetailsPageInfo = obj
   }
}
