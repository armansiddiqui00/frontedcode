import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../_services';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { ApiPaths, encryptUsingAES256 } from '../shared/util';
import { ToastrService } from 'ngx-toastr';
import { keywords, url } from '../shared/constant';
import { LoaderService } from '../services/loader.service';
import { StoreService } from '../services/store.service';
// import * as CryptoJS from 'crypto-js';

import * as CryptoJS from 'crypto-js'
import { Title } from '@angular/platform-browser';
import { SignatureService } from '../services/SignatureService';
@Component({selector:'app-login', styleUrls:['login.component.scss'], templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
  @ViewChild('googlebutton') gbutton: ElementRef = new ElementRef({});

    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';
    socialUser!: SocialUser;
    isLoggedin:boolean;
    accessToken:any;
    showOtpTB = 'hide';
    GoogleLoginProvider = GoogleLoginProvider;
    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        public authenticationService: AuthenticationService,
        private socialAuthService: SocialAuthService,
        private authService:AuthenticationService,
        private toastr : ToastrService,
        private loader : LoaderService,
        private store : StoreService,
        private titleService:Title,
        private signatureService : SignatureService
    ) { 
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) { 
          //  this.router.navigate(['/']);
          // this.router.navigate(['/dwc/inv/createinvoice']);
        }
    }
    getAccessToken(): void {
        this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then(accessToken => this.accessToken = accessToken);
      }

      refreshToken(): void {
        this.socialAuthService.refreshAccessToken(GoogleLoginProvider.PROVIDER_ID);
      }
    ngOnInit() {
    this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
            otp: ['']
        });
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }
    ngAfterViewInit() {
    //   setTimeout(()=>{
    //  // @ts-ignore
    //  window.google.accounts.id.initialize({
    //    client_id: "974596587527-kjic913pv3c34paf35il047lk4pc4qvj.apps.googleusercontent.com",
    //    callback: this.handleCredentialResponse.bind(this),
    //    itp_support: true,
    //  });
    //  // @ts-ignore
    //  window.google.accounts.id.renderButton(this.gbutton.nativeElement, {
    //   type: 'standard',
    //    theme: "outline", 
    //    size: "large", 
    //    width: "100%" 
    //  });
    //  // @ts-ignore
    //  google.accounts.id.prompt();
    //  var buttonnt=document.getElementsByClassName("nsm7Bb-HzV7m-LgbsSe jVeSEe i5vt6e-Ia7Qfc uaxL4e-RbRzK");
    //  buttonnt[0]["style"].widh=506;
    //   },500)
     }
    async handleCredentialResponse(response: any) {
      //   // Here will be your response from Google.
      //   let use=this.decodeJwtResponse(response.credential);
      //  // this.authService.loginwithGoogleAuth(use);
      //  let body ={
      //   userName:use.email
      //  }
      //  this.loader.show()
      //  this.authService.getUserDetailByEmailId(ApiPaths.getUserDetailsByEmailId,body).subscribe(data=>{
      //   if( this.authenticationService.isUserValid == 'true'){
      //       
      //       this.router.navigate([url.submittimesheetUrl]);
      //       //this.toastr.success(this.authenticationService.userMsg)
      //   }
      //   else{
      //       
      //      // this.toastr.error(this.authenticationService.userMsg)
      //   }
      //  })
        
      }



     decodeJwtResponse(token) {
        var base64Url = token.split(".")[1];
        var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        var jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
    
        return JSON.parse(jsonPayload);
      }
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;
        if(this.showOtpTB == 'show' && (this.f?.otp?.value == null || this.f?.otp?.value == "")){
          this.toastr.info("Please provide OTP!")
          return ;
        }
        let userLoginDetails;
      this.store.user.subscribe(data=>userLoginDetails=data)
        if (this.loginForm.invalid) {
            return;
        }
        this.loader.show();
        
        let body ={
            userName : encryptUsingAES256(this.f.username.value),
            password : encryptUsingAES256(this.f.password.value),
            otp : encryptUsingAES256(this.f.otp.value)
        }

        let headerConfig = keywords.config;
        let signature=  this.signatureService.signPayload(body);
        let topBody={payload:body,signature:signature};
        this.authenticationService.login(ApiPaths.getLoginDetails,topBody,headerConfig).subscribe(data=>{
          this.showOtpTB = this.authenticationService?.showOtpTB;
          this.loader.hide();
         // console.log("this.f in service response",data)
            if( this.authenticationService.isUserValid == 'true' && userLoginDetails.menus != null){
                
                this.router.navigate(['/dwc/inv/createinvoice'],{queryParams : {pageId : "RES002"}});
                this.titleService.setTitle("Create Invoice")
               // this.toastr.success(this.authenticationService.userMsg)
            }else if(this.authenticationService.isUserValid == 'true' && userLoginDetails.menus == null){
              
              this.router.navigate(['/dwc/inv/createinvoice'],{queryParams : {pageId : "RES002"}});
              this.titleService.setTitle("Create Invoice")
              sessionStorage.clear()
              sessionStorage.removeItem('currentUser')
         //   this.toastr.success(this.authenticationService.userMsg)
            }
            else{
                
               // this.router.navigate(['/rims/emp/dwcproject']);
            //   console.log("Inside elee condition",this.authenticationService.userMsg  );
                sessionStorage.removeItem('currentUser')
                if(this.authenticationService.userMsg == keywords.otpSend){
                  this.toastr.success(this.authenticationService.userMsg)
                }else {
                //  console.log("Inside elee condition",this.authenticationService.userMsg  );
                  this.toastr.error(this.authenticationService.userMsg);
                  this.loader.hide();
                }
               
            }
            
        },(err)=>{
            this.toastr.error(err);
            this.loader.hide();
          //  this.loading = false;
        })
           
    }
    resendOtp(){
      this.loader.show();
        
        let body ={
            userName : encryptUsingAES256(this.f.username.value),
            password : encryptUsingAES256(this.f.password.value),
            otp : encryptUsingAES256(null)
        }
        let signature=  this.signatureService.signPayload(body);
        let topBody={payload:body,signature:signature};
        let headerConfig = keywords.config;
      this.authenticationService.login(ApiPaths.getLoginDetails,topBody,headerConfig).subscribe(data=>{
        console.log("login",data)
        this.showOtpTB = this.authenticationService?.showOtpTB
        this.toastr.success(keywords.otpSend)
    },(err) =>{
      this.toastr.error(err);
      this.loader.hide();
      
    })
  }
}
