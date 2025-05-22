import { Component, NgModule } from "@angular/core";
import { SettingsComponent } from "./settings.component";
import { RouterModule, Routes } from "@angular/router";


const routes: Routes = [
    {path:"",component:SettingsComponent}
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class SettingsRoutingModule { }