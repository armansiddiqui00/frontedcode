import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";
import { LoaderService } from "./loader.service";
import { RestApiService } from "./rest-api.service";
import { AuthenticationService } from "../_services";
import { deepClone } from "../shared/util";
import { keywords } from "../shared/constant";

@Injectable()
export class PageConfigService {
   
    user=null;
    constructor(private loaderService:LoaderService,private service:RestApiService,private authenticationService :AuthenticationService,private router: Router ){
        this.authenticationService.currentUser.subscribe(data => { this.user = data?.loginUserDetails });
    }
    resolve( 
        route: ActivatedRouteSnapshot,
    ): Observable<any> | Promise<any> | any {
       //console.log("user user new log",this.user)
       //this.loaderService.show();
       this.user == undefined?this.loaderService.hide():this.loaderService.show()
      // console.log("user user new log 1",this.user)
        let params = {empId:this.user?.empId,isEdit:route?.queryParams?.isEdit,pageId:route?.queryParams?.pageId,roleName:this.user?.roleName}

        if(this.user.empId != null){
            let headerConfig = null
            if(params?.isEdit){
                let config = {
                    'request-type': 'update',
                    'page-name':'Edit Profile'
                }
                let headerConfig = deepClone(keywords.config)
                Object.assign(headerConfig, config)
            }
            this.loaderService.hide();
            return this.service.getPageConfig(params);
        }
    }
}
