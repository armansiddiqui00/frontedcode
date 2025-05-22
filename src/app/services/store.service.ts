import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
//import { Header } from '../components/header/header';
import { SideMenu } from '../components/side-menu/side-menu';
import { PageName } from '../components/page-name/page-name';
import { Header } from '../components/header/header';
import { User1 } from '../_models';
//import { CallBox } from '../components/call-box/call-box';
//import { Table } from '../components/table/table';
//import { CookieService } from 'ngx-cookie-service';
//import { User } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  public header = new BehaviorSubject<Header>(new Header());

  public sideMenu = new BehaviorSubject<SideMenu>(new SideMenu());

  public user = new BehaviorSubject<User1>(new User1());

  public pageName = new BehaviorSubject<PageName>(new PageName());

  public dailyTSObj = new BehaviorSubject<any>(null);

  public weeklyTSObj = new BehaviorSubject<any>(null)

  public gridRowData = new BehaviorSubject<any>(null);

  public dataSourceSubject = new BehaviorSubject<any>(null);

//  public sessionOut = new Subject<any>();

}
