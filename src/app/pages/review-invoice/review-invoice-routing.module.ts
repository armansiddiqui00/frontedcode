import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReviewInvoiceComponent } from './review-invoice.component';


const routes: Routes = [{path:'',component:ReviewInvoiceComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewInvoiceRoutingModule { }
