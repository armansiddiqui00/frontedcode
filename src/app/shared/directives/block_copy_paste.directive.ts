import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { event } from 'jquery';

@Directive({
  selector: '[appBlockCopyPaste]'
})
export class BlockCopyPasteDirective {
 
  @HostListener('paste', ['$event']) blockPaste(e: ClipboardEvent) {
   
    let clipboardData = e.clipboardData ;
    //console.log("clipboardData",clipboardData)
    let pastedText = clipboardData.getData('text');
    if(/^[A-Za-z ]+$/.test(pastedText)){
      console.log("true",pastedText)
     // return true;
    }else{
      //console.log("false",pastedText)
       e.preventDefault();
    }
    
    
   
  }

//   @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
//     e.preventDefault();
//   }

//   @HostListener('cut', ['$event']) blockCut(e: KeyboardEvent) {
//     e.preventDefault();
//   }
}