import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SettingsRoutingModule } from "./settings-routing.module";
import { SettingsComponent } from "./settings.component";
import { SharedModule } from "./shared.module";

@NgModule({
    declarations: [SettingsComponent],
    imports: [
      CommonModule,
      SettingsRoutingModule,
      SharedModule
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
  })
  export class SettingsModule { }