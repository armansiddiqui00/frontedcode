import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';
import { SideMenuService } from 'src/app/services/side-menu.service';
import { SideMenu } from './side-menu';
import { AuthenticationService } from '../../_services';
import { User } from '../../_models';
import { Router } from '@angular/router';
import { TravelDeskService } from 'src/app/pages/travel-desk/travel-desk-modal/travel-desk.service';
import { InvoiceService } from 'src/app/pages/invoice-details/invoice.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit {

  public sideMenu: any = SideMenu;
  public user: any;

  constructor(
    public store: StoreService,
    public sideMenuService: SideMenuService,
    public authService:AuthenticationService,
    public invoiceService:InvoiceService,
  ) {
    // if(authService.isUserValid == 'true'){
      this.sideMenuService?.setMenu();
      this.store?.sideMenu?.subscribe(sideMenu => {
        this.sideMenu = sideMenu;
      });
    // }
    
  }

  ngOnInit() {
  }

  toggleSubMenu(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.sideMenuService.toggleSubMenu(index);
  }

  menuItemClick(index: number) {
    this.sideMenuService.menuItemClick(index);
  }
  subMenuClick(event, i: number, j: number) {
    event.stopPropagation();
    if (event.target.nodeName == 'DIV')
      this.sideMenuService.subMenuClick(i, j);
    this.invoiceService.gridView.next(false)
  }

  // downloadManagerClick() {
  //   this.downloadManagerService.isDownloading = false;
  //   this.downloadManagerService.open();
  // }

  //preparing context menu on sub menu link right click
  onRightClick(e, i: number, j: number) {
    e.preventDefault()
    let menu = document.getElementById('ctxmenu');
    if (menu) {
      menu.parentElement.removeChild(menu)
    }

    menu = document.createElement("div");
    menu.classList.add('ctxmenu')
    menu.id = "ctxmenu";
    menu.style.top = (e.pageY - 10) + 'px';
    menu.style.left = (e.pageX - 40) + 'px';
    menu.onmouseleave = () => menu.parentElement.removeChild(menu)
    document.body.onclick = () => menu.parentElement.removeChild(menu)

    let p = document.createElement('p');
    p.onclick = () => {
      this.sideMenuService.subMenuClick(i, j, true);
    };
    p.innerText = 'Open link in new tab';
    menu.append(p);
    e.target.parentElement.appendChild(menu);
  }
}
