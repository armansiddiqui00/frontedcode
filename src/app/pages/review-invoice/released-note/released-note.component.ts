import { Component } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ReleasedModal } from './release-note-modal.service';

@Component({
  selector: 'app-released-note',
  templateUrl: './released-note.component.html',
  styleUrls: ['./released-note.component.scss']
})
export class ReleasedNoteComponent {

  releasedData;;
  constructor(private service:RestApiService, private releasedService : ReleasedModal){

    // setTimeout(async () =>{
    //   this.releasedData = await this.service.getReleasedData('releasedNote',{releasedDate : '4-12-2024'})
    //   if(this.releasedData != null && this.releasedData != ""){
    //     this.releasedData?.forEach((d,i) =>{
    //       d?.relasedDetails?.forEach((o,j) =>{
    //         console.log("this.releasedNoteData",this.releasedData[i].relasedDetails[j].fixes)
    //         this.releasedData[i].relasedDetails[j].feature = this.releasedData[i].relasedDetails[j]?.feature.includes("#sep#") ? this.releasedData[i].relasedDetails[j]?.feature.split("#sep#") : this.releasedData[i].relasedDetails[j]?.feature;
    //        // this.releasedData[i].relasedDetails[j].fixes = this.releasedData[i].relasedDetails[j]?.fixes.includes("#sep#") ? this.releasedData[i].relasedDetails[j]?.fixes.split("#sep#") : this.releasedData[i].relasedDetails[j]?.fixes;
    //       })
    //     })
    //     // this.releasedData.feature = this.releasedData?.feature.split('#sep#');
    //     // this.releasedData.fixes = this.releasedData?.fixes.split('#sep#');
    //   }
    //  },2000)
  }

  ngOnInit(){
    this.releasedData = this.releasedService.releasedData;
    if(this.releasedData != null && this.releasedData != ""){
      this.releasedData?.forEach((d,i) =>{
          this.releasedData[i].featureName =  this.releasedData[i].featureName.includes("#sep#") ? this.releasedData[i].featureName.split("#sep#") : this.releasedData[i].featureName;
          this.releasedData[i].relasedDetails.feature = this.releasedData[i].relasedDetails?.feature.includes("#sep#") ? this.releasedData[i].relasedDetails?.feature.split("#sep#") : this.releasedData[i].relasedDetails?.feature;
          this.releasedData[i].relasedDetails.fixes = this.releasedData[i].relasedDetails?.fixes.includes("#sep#") ? this.releasedData[i].relasedDetails?.fixes.split("#sep#") : this.releasedData[i].relasedDetails?.fixes;
          this.releasedData[i].relasedDetails.impNote = this.releasedData[i].relasedDetails?.impNote.includes("#sep#") ? this.releasedData[i].relasedDetails?.impNote.split("#sep#") : this.releasedData[i].relasedDetails?.impNote;
          this.releasedData[i].relasedDetails.knownIssue = this.releasedData[i].relasedDetails?.knownIssue.includes("#sep#") ? this.releasedData[i].relasedDetails?.knownIssue.split("#sep#") : this.releasedData[i].relasedDetails?.knownIssue;    
      })
    }
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }
  close(){
    this.releasedService.close()
  }
}
