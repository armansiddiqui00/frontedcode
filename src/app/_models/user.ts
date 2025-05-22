import { Role } from "./role";

export class User {
    [x: string]: any;
    id: any;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    token?: string;
    status:boolean;
 
}

export class User1 {
    userId:number;
    userEmailId:string;
    userName:string;
    userRole:string;
    reportingManagerId:number;
    menus:any
}


export class PassportModel{
    passportId2:number=null;
    passportType2:string = null;
    countryCode2:string = null;
    passportNo2:string = null;
    surname2:string = null;
    givenName2:string = null;
    nationality2:string = null;
    sex2:string = null;
    dateOfBirth2:Date = null;
    placeOfBirth2:string = null;
    placeOfIssue2:string = null;
    dateOfIssue2:Date = null;
    dateOfExpiry2:Date = null;
    empId2:number=null;
}