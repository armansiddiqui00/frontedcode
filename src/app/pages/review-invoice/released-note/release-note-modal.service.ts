import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReleasedNoteComponent } from './released-note.component';

@Injectable({
  providedIn: 'root'
})

export class ReleasedModal {

    releasedData;
    constructor(private modalService:NgbModal){}
    open(data){
            this.releasedData = data;
          this.modalService.open(ReleasedNoteComponent,{ modalDialogClass: 'modal-dialog-scrollable travel', centered: true, size: 'lg'})
    }
    close(){
        this.modalService.dismissAll();
    }
  
  }