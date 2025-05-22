import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TravelDeskComponent } from './travel-desk.component';

const routes: Routes = [
  {path:"",component:TravelDeskComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TravelDeskRoutingModule { }
