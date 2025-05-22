import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from './store.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, shareReplay, take, timeout } from 'rxjs/operators';
import { ApiPaths } from '../shared/util';
import { AuthenticationService } from '../_services';
import { LoaderService } from './loader.service';
import { SignatureService } from './SignatureService';
import { keywords } from '../shared/constant';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {
  userId: number = null;
  resourceId: string = null;
  params: any;
  apiUrl = environment.apiUrl
  userID:any

  private messageSource = new BehaviorSubject<string>("default message");
    currentMessage = this.messageSource.asObservable();

    private subject$ = new  BehaviorSubject<any>({});
    selectedSubject$ = this.subject$.asObservable();

  constructor(private http:HttpClient,private toastr:ToastrService, private activatedRoute:ActivatedRoute,private loader:LoaderService,
    private signatureService:SignatureService
  ) { 
      let tempData;
      // this.authService.currentUser.subscribe(data=>{tempData = data});
      // console.log("tempdata is isisisisi ",tempData)
      // this.userId = tempData?.loginUserDetails?.userId
    this.activatedRoute.queryParams.subscribe(params=>{this.resourceId = params.pageId})
  }

  saveTimeSheet(url,body): Observable<any>{
    return this.http.post<any>(this.apiUrl + url,body)
    .pipe(catchError(this.handleError))
  }

  setdocument(value: any) { //console.log('api service',value)
    this.subject$.next(value);
  }

obj:any
  changeMessage(message: any) {
    this.messageSource.next(message)
    this.obj=message?.userId
   // console.log('message',this.obj)
    this.userID=this.obj;
    
  }
    
  getTimeSheetDetails(val,url,userId): Observable<any> {
    let queryParams = new HttpParams();
    this.userId=userId;
    if(url==ApiPaths.getTimeSheetDetails){
      queryParams = queryParams.append("empId",this.userId);
     // queryParams = queryParams.append("empId",'1000');
      queryParams = queryParams.append("timesheetDate",val);
    }else if(url==ApiPaths.getTimeSheetByTimesheetId){
      queryParams = queryParams.append('timesheetId',val)
    }else if(url==ApiPaths.getTimesheetDetailsByTimesheetId){
      queryParams = queryParams.append('timesheetId',val)
    }
    else{
      //queryParams = queryParams.append("empApprovalId",this.userID);
      queryParams = queryParams.append("empApprovalId",this.userId);
     // queryParams = queryParams.append("empApprovalId",'1001');
      queryParams = queryParams.append("timesheetDate",val);
    }
   
    return this.http.get<any>(this.apiUrl + url, {params: queryParams})
        .pipe(
            catchError(this.handleError)
        )
  }


  getTimeSsummaryByUserIdDate(val,url,userId): Observable<any> {
    let queryParams = new HttpParams();
    this.userId=userId;
   // console.log("User id found",this.userId);
    queryParams = queryParams.append("empId",this.userId);
    queryParams = queryParams.append("timesheetDate",val);
   
    return this.http.get<any>(this.apiUrl + url, {params: queryParams})
        .pipe(
            catchError(this.handleError)
        )
  }

  approveRejectTimesheet(url,body): Observable<any>{
   // console.log('body',body)
    return this.http.post<any>(this.apiUrl + url,body,{observe: 'response'})
    .pipe(
        catchError(this.handleError)
    )
}

getOrDeleteData(url,params,config): Observable<any> {
 // console.log("config",config)
  let headers = new HttpHeaders();
  if(config != null && config != undefined){
    Object?.keys(config)?.forEach(el => {
      headers = headers.set(el, config[el]);
  });
  }
  return this.http.get<any>(this.apiUrl + url,{ headers: headers, params: params})
  .pipe(
    catchError(this.handleError)
  )
}

deleteData(url,params,config): Observable<any> {
  let headers = new HttpHeaders();
  Object.keys(config).forEach(el => {
      headers = headers.set(el, config[el]);
  });
  return this.http.get<any>(this.apiUrl + url,{ headers: headers})
  .pipe(
    catchError(this.handleError)
  )
}
getCurrency(url): Observable<any> {
  return this.http.get<any>(url)
  .pipe(
    catchError(this.handleError)
  )
}
saveData(url,body,config): Observable<any>{
  let headers = new HttpHeaders();
  Object?.keys(config).forEach(el => {
      headers = headers.set(el, config[el]);
  });
  return this.http.post<any>(this.apiUrl + url,body,{ headers: headers})
  .pipe(
    catchError(this.handleError)
  )
}

savePatchData(url,body,config): Observable<any>{
  let headers = new HttpHeaders();
  Object?.keys(config).forEach(el => {
      headers = headers.set(el, config[el]);
  });
  return this.http.patch<any>(this.apiUrl + url,body,{ headers: headers})
  .pipe(
    catchError(this.handleError)
  )
}

getBankData(url,body): Promise<any>{
  return this.http.post<any>(this.apiUrl + url,body).toPromise()
  // .pipe(
  //   catchError(this.handleError)
  // )
}

getReleasedData(url): Promise<any>{
  let headers = new HttpHeaders();
  headers = headers.set("request-type","search")
  AuthenticationService
  return this.http.get<any>(this.apiUrl + url,{  headers: headers}).toPromise()
}
saveData1(url,param,config): Promise<any>{
  let headers = new HttpHeaders();
  headers.set("request-type","search")
  return this.http.get<any>(this.apiUrl + url,{  headers: headers,params: param })
  .pipe(
    catchError(this.handleError)
  ).toPromise()
}

getSession(checkStatus, userName,signature):Observable<any>{
  let headers = new HttpHeaders();
  headers = headers.set("request-type","search")
  const params = new HttpParams()
      .set('userName', userName)
      .set('actionType', checkStatus);
  return this.http.get<any>(this.apiUrl + ApiPaths.action + "?signature="+signature,{  headers: headers,params: params })
  .pipe(
    catchError(this.handleError)
  )
}
updateData(url, body):Observable<any>{
  delete body.url;
  return this.http.put<any>(this.apiUrl + url, body)
  .pipe(
    catchError(this.handleError)
  )
}



saveTravelRequest(url,body?): Observable<any>{ //console.log('service Body',body)
 return this.http.post<any>(this.apiUrl + url,body)
//.pipe(catchError(this.handleError))
}

getTravelProcess(url):Observable<any>{
  let queryParams = new HttpParams();
  return this.http.get<any>(this.apiUrl + url,{params: queryParams})
  .pipe(
      catchError(this.handleError)
  )
}

deleteTravelProcess(url):Observable<any>{
  let queryParams = new HttpParams();
  let apiUrl= this.apiUrl+url
 // console.log('apiUrl',apiUrl)
return this.http.delete<any>(apiUrl)
  // .pipe(
  //     catchError(this.handleError)
  // )
}
sendSimpleMail(url):Observable<any>{
  let queryParams = new HttpParams();
  let apiUrl= 'http://72.182.209.93:9098/rimssrv'
  return this.http.get<any>(apiUrl + url,{params: queryParams})
  // .pipe(
  //     catchError(this.handleError)
  // )
}


getPageConfig(params): Observable<any> {
  //console.log("params",params)
  let sign = this.signatureService.signPayload(params);
  let payload = {
    pagePayload : params,
    signature : sign
  }

  return this.http.post<any>(this.apiUrl + ApiPaths.getPageConfig,payload)
    .pipe(timeout(20000),
        catchError(this.handleError)
    )
}

   // Error handling 
   handleError(error) {
    let errorMessage;
    if (error.headers) {
        errorMessage = error.headers.get('reason-pharse');
    }
    if (!errorMessage) {
        errorMessage = 'Unknown error, please try in sometime.';
    }
   // this.loader.hide();
  //  this.toastr?.error(errorMessage);
    return throwError(errorMessage);
}

handleError2(error) {
  let errorMessage;
  if (error.headers) {
      errorMessage = error.headers.get('reason-pharse');
  }if(error == "OK"){

  }
  else if (!errorMessage) {
      errorMessage = 'Unknown error, please try in sometime.';
  }
// this.loader.hide();
//  this.toastr?.error(errorMessage);
  return throwError(errorMessage);
}
}
