import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthenticationService } from '../_services';
import { ActivatedRoute } from '@angular/router';
import { keywords } from '../shared/constant';
import { delay } from 'rxjs/operators';
import { RouteService } from '../services/router.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    
    userData = null;
    resourceId;
    page = new BehaviorSubject<any>(null);
    pages = [{resourceId:"RES002", pageName:"Create Invoice"},
        {resourceId:"RES003", pageName:"Review Invoice"},
        {resourceId:"RES004", pageName:"Invoice History"},
        {resourceId:"RES006", pageName:"Manage Employee"},
        {resourceId:"RES007", pageName:"Manage Project"},
        {resourceId:"RES009", pageName:"Attendance"},
        {resourceId:"RES010", pageName:"Process Invoices"}
    ]
    constructor(private authenticationService: AuthenticationService, private activatedRoute: ActivatedRoute) { 
        this.authenticationService.currentUser.subscribe(data => { this.userData = data?.loginUserDetails });
        this.activatedRoute.queryParams.subscribe(params => {
            this.resourceId = params['pageId'];
            this.page.next(this.pages.filter(p => p.resourceId == this.resourceId));
        });
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> { 
        const excludedUrls = [
            'https://open.er-api.com/v6/latest'
        ];
        const shouldExclude = excludedUrls.some(url => request.url.includes(url));
        if (shouldExclude) {
            const currentUser = this.authenticationService.currentUserValue;
            const isLoggedIn = currentUser && currentUser.token;
            const isApiUrl = request.url.startsWith(environment.apiUrl);
            if (isLoggedIn && isApiUrl) {
                request = request.clone({});
            }
            request.headers.delete(request.headers.get('headers'))
            return next.handle(request);
        } else {
            let user = 'PpAa!S@D#$!_user';  //user server cred
            let pass = 'PpAa!S@D#$!!';      //user server cred

            const currentUser = this.authenticationService.currentUserValue;
            const isLoggedIn = currentUser && currentUser.token;
            const isApiUrl = request.url.startsWith(environment.apiUrl);
            let pageName = null;
            this.page.subscribe(data => {
                pageName = data;
            });

            let headers = request.headers.set('Content-Type', 'application/json');
            if (this.userData != null && this.userData != undefined) {
                headers = headers.set('email-id', this.userData?.userEmailId);
                headers = headers.set('user-name', this.userData?.firstName + " " + this.userData?.lastName);
                headers = headers.set('roleName', this.userData?.roleName);
                

                if (!request.url.includes('getPageConfig')) {
                    headers = this.resourceId != undefined ? headers.set('resource-id', this.resourceId) : headers.set('resource-id', "");
                    headers = pageName?.length > 0 ? headers.set('page-name', pageName[0]?.pageName) : headers.set('page-name', "");
                    headers = headers.set('loggingDateTime', new Date().toDateString());
                }
            }

            headers = headers.set('Authorization', 'Basic' + ' ' + btoa(user + ":" + pass));
            request = request.clone({
                headers: headers
            });

            return next.handle(request);
        }
    }
}
