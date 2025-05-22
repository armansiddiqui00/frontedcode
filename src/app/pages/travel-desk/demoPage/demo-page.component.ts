import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { keywords } from 'src/app/shared/constant';
import { DatePipe } from '@angular/common';
import { RestApiService } from 'src/app/services/rest-api.service';

@Component({
    selector: 'app-demo-page',
    templateUrl: './demo-page.component.html',
    styleUrls: ['./demo-page.component.scss']
  })

  export class DemoPageComponent{

  }