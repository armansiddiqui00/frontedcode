import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SignatureService } from 'src/app/services/SignatureService';
import { StoreService } from 'src/app/services/store.service';
import { keywords } from 'src/app/shared/constant';
import { decrypt } from 'src/app/shared/util';

@Component({
  selector: 'app-detail-grid',
  templateUrl: './detail-grid.component.html',
  styleUrls: ['./detail-grid.component.scss']
})
export class DetailGridComponent {
  @Input() key;
  @Input() headerConfig;
  @Input() pageConfig;
  @Input() pageName;  
  columns = [];
  loading:boolean;
  showNoDetailRecords : boolean = false;
  serviceNotRespond: boolean = false;
  dataSource = null;
  header = keywords.empBakHead
  constructor(private restApiService: RestApiService, private storeService: StoreService,private loader:LoaderService,private signatureService:SignatureService) {
  }
  ngOnInit(){
    this.loading=true;
    this.loader.show()
    let sign = this.signatureService.signPayload(this.key);
    let encode = encodeURIComponent(sign);
    this.loader.hide()
    let inActiveBank;
    if (this.pageName == 'reviewinvoice' || this.pageName == 'processinvoices') {
      let employee = this.pageConfig?.employeeList.filter(e => e.empId == this.key);
      inActiveBank = employee[0]?.bankEntity.filter(f => f?.status == 'inactive')
    } else {
      inActiveBank = this.pageConfig?.employee?.bankEntity.filter(f => f?.status == 'inactive')
    }

    if (inActiveBank != null) {
      this.loading = true;
      let bankDataArr = [];
      inActiveBank?.forEach((d, i) => {
        let bankObj = {
          accountHolderName: decrypt(inActiveBank[i]?.accountHolderName),  
          accountNumber: decrypt(inActiveBank[i]?.accountNumber),
          bankAddress: decrypt(inActiveBank[i]?.bankAddress),
          bankName: decrypt(inActiveBank[i]?.bankName),
	  ifscCode: inActiveBank[i]?.ifscCode,
	  swiftCode: inActiveBank[i]?.swiftCode,
        //  empId: employee[0]?.empId,
          status: inActiveBank[i]?.status
        }

        bankDataArr.push(bankObj);
        // inActiveBank[i].accountHolderName = inActiveBank[i]?.accountHolderName && typeof inActiveBank[i]?.accountHolderName === 'string' && isNaN(Number(inActiveBank[i]?.accountHolderName)) // Check if it looks like an encrypted string
        //   ? decrypt(inActiveBank[i]?.accountHolderName) : inActiveBank[i]?.accountHolderName;
        // inActiveBank[i].accountNumber = isNaN(inActiveBank[i]?.accountNumber) ? decrypt(inActiveBank[i]?.accountNumber) : inActiveBank[i]?.accountNumber;
        // inActiveBank[i].bankAddress = inActiveBank[i]?.bankAddress && typeof inActiveBank[i]?.bankAddress === 'string' && isNaN(Number(inActiveBank[i]?.bankAddress)) // Check if it looks like an encrypted string
        //   ? decrypt(inActiveBank[i]?.bankAddress) : inActiveBank[i]?.bankAddress;
        // inActiveBank[i].bankName = inActiveBank[i]?.bankName && typeof inActiveBank[i]?.bankName === 'string' && isNaN(Number(inActiveBank[i]?.bankName))// Check if it looks like an encrypted string
        //   ? decrypt(inActiveBank[i]?.bankName) : inActiveBank[i]?.bankName;

        // inActiveBank[i].accountHolderName = decrypt(inActiveBank[i].accountHolderName);
        // inActiveBank[i].accountNumber = decrypt(inActiveBank[i].accountNumber)
        // inActiveBank[i].bankAddress = decrypt(inActiveBank[i].bankAddress)
        // inActiveBank[i].bankName = decrypt(inActiveBank[i].bankName)
      })

      let dataSource = bankDataArr;
      this.columns = [];
      this.setColumns(dataSource);
      dataSource != null && dataSource != undefined && dataSource.length > 0? this.showNoDetailRecords = false : this.showNoDetailRecords = true
      }
   
  }

  setColumns(dataSource) {
    this.header.filter((filter:any)=>{ 
       
      
      this.columns.push({dataField:filter.id, alignment: 'left', caption:filter.name, adaptive:true})

  })
        this.dataSource = new DataSource({
          store: new ArrayStore({
            data: dataSource
          }),
          // filter: ['EmployeeID', '=', this.key],
        });
  }
}
