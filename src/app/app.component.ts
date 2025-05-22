import { ChangeDetectorRef, Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './_services';
import { User, Role } from './_models';
import { StoreService } from './services/store.service';
import { LoaderService } from './services/loader.service';
import { BehaviorSubject } from 'rxjs';
import { RestApiService } from './services/rest-api.service';

@Component({ selector: 'app', templateUrl: 'app.component.html', styleUrls:['app.component.scss'] })
export class AppComponent implements OnInit {
    //currentUser: User;
    menuOpen: boolean;
    currentUser: User;
    loader: boolean;
    userId:any
    
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        public store: StoreService,
        public userService: User,
        public loaderService: LoaderService,
        private service: RestApiService,
        private ref: ChangeDetectorRef
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        // this.userId=this.currentUser?.loginUserDetails?.userId
        
        // this.service.changeMessage(this.userId);


        if(this.currentUser != null || this.currentUser != undefined ){
         
         this.userId=this.currentUser?.loginUserDetails
         
         this.service.changeMessage(this.userId);
          }
         
      }
    
    ngOnInit(){    
      this.loaderService.loader.subscribe(status => this.loader = status);
     this.store.sideMenu.subscribe(sideMenu => {
      this.menuOpen = sideMenu != null ? sideMenu?.menuOpen : false;
    });
     

    }

    ngAfterContentChecked() {
      this.ref.detectChanges();
    }
    // get isHR() {
    //     return this.currentUser && this.currentUser.role === Role.HR;
    // }
    // get isManager() {
    //     return this.currentUser && this.currentUser.role === Role.Manager;
    // }
    // get isAgent() {
    //     return this.currentUser && this.currentUser.role === Role.agent;
    // }

    logout() {
      localStorage.removeItem('currentUser')
        this.authenticationService.logout('logout');
        this.router.navigate(['/login']);
    }
}