import { Component, OnInit, ViewChild } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';
import { SideMenuService } from 'src/app/services/side-menu.service';
import { Header } from './header';
import { SideMenu } from '../side-menu/side-menu';
import { User } from '../../_models';
import { AuthenticationService } from 'src/app/_services';
import { Router } from '@angular/router';
import { InvoiceService } from 'src/app/pages/invoice-details/invoice.service';
import { RightMenuComponent } from '../right-menu/right-menu.component';
import { SharedService } from 'src/app/services/shared.service';
import { ApiPaths } from 'src/app/shared/util';
import { SignatureService } from 'src/app/services/SignatureService';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ToastrService } from 'ngx-toastr';
import { keywords, toastrMsg } from 'src/app/shared/constant';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit { 
  //currentUser: User;
  public header: Header;
  public currentUser: User;
  public sideMenu: SideMenu;
  userEmail;
  constructor(
    public store: StoreService,
    private authenticationService: AuthenticationService,
    public sideMenuService: SideMenuService,
    private router: Router,
    private invoiceService:InvoiceService,
    private signature : SignatureService,
    private restapi : RestApiService,
    private toastr : ToastrService
  ) {
    this.store.header.subscribe(header => {
      this.header = header;
    });
    this.authenticationService.currentUser.subscribe(x => {this.currentUser = x, this.userEmail = x?.loginUserDetails?.userEmailId});

    if(this.currentUser != null || this.currentUser != undefined ){
     // console.log("current header",this.currentUser?.loginUserDetails?.userName)
     //this.userId=this.currentUser?.loginUserDetails
     
    // this.service.changeMessage(this.userId);
      }

    /* this.store.user.subscribe(user => {
      this.user = user;
    }); */
    this.store.sideMenu.subscribe(sideMenu => {
      this.sideMenu = sideMenu;
    })
     
  }

  ngOnInit() {
    
  }

  toggleMenu() {
   // console.log("test-------->");
    this.sideMenuService.toggleSideMenu();
  }
  
  toggleRightMenu() {
    this.restapi.getSession(keywords.checkStatus,this.userEmail,this.signature.signPayload(this.userEmail)).subscribe(d =>{
      if(d?.isValid){
        const menu = document.getElementById('rightMenu');
        const isOpen = menu?.style?.right === '0px';
        if (isOpen) {
          menu.style.right = '-250px';
        } else {
          menu.style.right = '0';
        }
      }else{
        this.authenticationService.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))
  }
  
  logout(){
    this.invoiceService.setdocument(null)
    this.invoiceService.reset(null)
    this.authenticationService.logout(this.userEmail);
    this.router.navigate(['/login']);

    
  }

  currentUserr(){
    this.invoiceService.currentUser(this.currentUser)
    //this.router.navigate(['/manage-employee-component']);
  }
  navigate(){
   // location.reload();
   this.invoiceService.gridView.next(true);
    this.router.navigate(["/dwc/master/manageemployee"],{state: { fromAccount: true},queryParams : {pageId : "RES006",isEdit:true}})
  }
}
