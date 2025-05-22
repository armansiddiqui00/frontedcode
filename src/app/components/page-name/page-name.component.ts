import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';
import { PageName } from './page-name';

@Component({
  selector: 'app-page-name',
  templateUrl: './page-name.component.html',
  styleUrls: ['./page-name.component.scss']
})
export class PageNameComponent implements OnInit {

  public pageName: PageName;

  constructor(public store: StoreService) {
    store.pageName.subscribe(pageName => {
      this.pageName = pageName;
    });
  }

  ngOnInit() {
  }

}
