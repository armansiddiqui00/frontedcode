import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PermissionDeniedRoutingModule } from './permission-denied-routing.module';
import { PermissionDeniedComponent } from './permission-denied.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    PermissionDeniedComponent
  ],
  imports: [
    CommonModule,
    PermissionDeniedRoutingModule,
    TranslateModule
  ],
  exports: [PermissionDeniedComponent]
})
export class PermissionDeniedModule { }
