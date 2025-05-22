import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { InvoiceService } from '../pages/invoice-details/invoice.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
url;
invoiceData=null;
  constructor(public router: Router, private _invoiceService:InvoiceService) { 
    _invoiceService.selectedSub$.subscribe(data => this.invoiceData = data);
  }

  navigateTo(url: any) {
    this.url =url;
   // console.log("Url",url)
    if(this.invoiceData != null && (this.url != 'dwc/inv/createinvoice' || this.url == '/dwc/inv/createinvoice?pageId=RES002')){
      if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
       // console.log(true)
        this._invoiceService.setdocument(null)
        this.router.navigateByUrl(url); 
      }
    }
    else{
      this.router.navigateByUrl(url);
    }
  }

  // navigateByUrl(url: string) {
  //   this.router.navigateByUrl(url);
  // }
}
