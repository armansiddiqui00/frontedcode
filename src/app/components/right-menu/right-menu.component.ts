import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services';
import { ReleasedModal } from 'src/app/pages/review-invoice/released-note/release-note-modal.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SharedService } from 'src/app/services/shared.service';
import { SignatureService } from 'src/app/services/SignatureService';
import { keywords, toastrMsg } from 'src/app/shared/constant';
import { ApiPaths } from 'src/app/shared/util';
@Component({
  selector: 'app-right-menu',
  templateUrl: './right-menu.component.html',
  styleUrls: ['./right-menu.component.scss']
})
export class RightMenuComponent {

  releasedData;
  menuData = [];
  userEmailId;
  constructor(private restapi : RestApiService, private releasedService : ReleasedModal,private auth:AuthenticationService, private signatureService:SignatureService, private toastr : ToastrService){
    auth.currentUser.subscribe(d => this.userEmailId = d?.loginUserDetails?.userEmailId)
  }

  ngOnInit(){
    this.restapi.getSession(keywords.checkStatus,this.userEmailId,this.signatureService.signPayload(this.userEmailId)).subscribe(async d =>{
      if(d?.isValid){
        let signature = this.signatureService.signPayload(this.userEmailId)
        this.releasedData = await this.restapi.getReleasedData(ApiPaths.releasedNote+"?userName="+this.userEmailId+"&signature=" + signature);
        if(this.releasedData != null && this.releasedData != ""){
         // this.releasedData = this.releasedData?.__zone_symbol__value
         this.releasedData.forEach(f =>{
          let obj = {version:f.version,releasedDate:f?.relasedDetails?.releasedDate}
          if(this.menuData.length == 0){
            this.menuData.push(obj);
          }else{
            let index = this.menuData.findIndex(i => i?.version == f?.version);
            if(index == -1){
              this.menuData.push(obj);
            }
          }
         })
          this.menuData = this.menuData.reverse();
        }
      }else{
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))

   
  }
  
  toggleRightMenu() {
    this.restapi.getSession(keywords.checkStatus,this?.userEmailId,this.signatureService.signPayload(this.userEmailId)).subscribe(d =>{
      if(d?.isValid){
        
    const menu = document.getElementById('rightMenu');
    const isOpen = menu?.style?.right === '0px';
    if (isOpen) {
      menu.style.right = '-250px';
    } else {
      menu.style.right = '0';
    }
      }else{
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))
  }

  onVersion(version:string){
    this.restapi.getSession(keywords.checkStatus,this?.userEmailId,this.signatureService.signPayload(this.userEmailId)).subscribe(d =>{
      if(d?.isValid){
        let data = this.releasedData.filter(f => f?.version == version);
        this.releasedService.open(data)
      }else{
        this.auth.logoutThroughAngular();
        this.toastr.error(d?.message);
      }
    },(err) => this.toastr.error(toastrMsg.errMsg))
  }

}
