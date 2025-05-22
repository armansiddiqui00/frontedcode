import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { User } from '../_models';
import { StoreService } from '../services/store.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../services/loader.service';
import { Title } from '@angular/platform-browser';
import { RestApiService } from '../services/rest-api.service';
import { ApiPaths } from '../shared/util';
import { keywords } from '../shared/constant';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../services/shared.service';
import { SignatureService } from '../services/SignatureService';
import { InvoiceService } from '../pages/invoice-details/invoice.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    isUserValid;
    userMsg;
    showOtpTB;
    showResendBtn;
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;
    apiUrl = environment.apiUrl
    constructor(private http: HttpClient,private store:StoreService,private route:Router,private loader : LoaderService, private titleService:Title,
        private restApi : RestApiService, private toastr : ToastrService,private signature:SignatureService,private invoiceService:InvoiceService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')));
        //console.log("currentUser",this.currentUser)
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(url,body,config){
     let headers = new HttpHeaders();
     headers.set('loggingDateTime', new Date().toDateString());
     headers.set('page-name', "login")

     Object?.keys(config).forEach(el => {
         headers = headers.set(el, config[el]);
     });
     //return this.http.post<any>(this.apiUrl + url,body,{ headers: headers})
	     return this.http.post<any>(this.apiUrl + url,body,{ headers: headers}).pipe(map(user1 => {
           // console.log("login----",user1)
       //    console.log("Login method",user1)
            this.isUserValid = user1.loginStatus.isUserValid;
            this.userMsg = user1.loginStatus?.message;
            this.showOtpTB = user1.otp;
            if(this.showOtpTB == 'show'){
                var now = new Date(new Date().getTime() + 5*60000);;
              //  console.log("now",now)
            }
            this.isUserValid == 'true'? this.currentUserSubject.next(user1) :this.currentUserSubject.next(null);
          
            if(this.isUserValid){
               //console.log("Userflag",this.isUserValid)
                 this.route.navigate(['/dwc/inv/createinvoice']);
            }
            this.store.user.next(user1.loginUserDetails);
            //  localStorage.removeItem('currentUser');
            //  localStorage.setItem('currentUser', JSON.stringify(user1));
            sessionStorage.removeItem('currentUser');
            sessionStorage.setItem('currentUser', JSON.stringify(user1));
           // console.log('currentUserSubject',this.currentUserSubject)
           // console.log("login user",user1)
            this.loader.hide();
        }))
    }

    getUserDetailByEmailId(url,body){
        return this.http.post<any>(this.apiUrl + url,body).pipe(map(user => {
            this.isUserValid = user.loginStatus.isUserValid;
            this.userMsg = user.loginStatus.message;
            this.isUserValid == 'true'? this.currentUserSubject.next(user) :this.currentUserSubject.next(null)
            this.store.user.next(user.loginUserDetails);
            // localStorage.removeItem('currentUser');
            // localStorage.setItem('currentUser', JSON.stringify(user));
            sessionStorage.removeItem('currentUser');
            sessionStorage.setItem('currentUser', JSON.stringify(user));
           // console.log("login user",this.store.user.subscribe(data=>console.log("user by google",data)))
        }))
    }

    loginwithGoogleAuth(user:any) {
       //console.log('user,',user)
       
              if (user) {
                  //  console.log("Googleuser:::::::::::::::::::::::;",user);
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    // localStorage.removeItem('currentUser');
                    // localStorage.setItem('currentUser', JSON.stringify(user));
                    sessionStorage.removeItem('currentUser');
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                  //  console.log('localStorage current user',localStorage)
                }

                return user;
            }
    

     logout(emailId:string){
        //  this.currentUser.subscribe(async d => {
        //     if(d != null && d != "null" && Object.keys(d).length != 0 && d.constructor === Object){
                console.log("logout in")
                let signature =  this.signature.signPayload(emailId);
                this.restApi.getSession("logout",emailId,signature).subscribe(o =>{
                    if(!o?.isValid){
                        this.logoutThroughAngular();
                    }
                });
           // }

       // });
    }
    logoutThroughAngular() {       
        // remove user from local storage to log user out
       this.titleService.setTitle("DWC")
       sessionStorage.clear();
       sessionStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        //console.log('currentUserSubject',this.currentUserSubject)
        this.store.sideMenu.next(null);
        this.store.pageName.next(null);
        this.store.sideMenu.next(null);
        this.invoiceService.setdocument(null);
        this.store.gridRowData.next(false);
        this.route?.navigate(['/login'])
        this.isUserValid = 'false'
        
    }
}