export class TaskModel {
    taskId2 :  number;
    taskName2: string;
    taskDescription2: string;
    taskCreatedDate2 = new Date(new Date())
  }

  export class EmpProjMapModel{
    empProjectId2 : number = null;
    empId2 : number = null;
    projectId2 : string = null;
    projectAssignStartDate2 = new Date(new Date());
    projectAssignEndDate2 = new Date(new Date());
    isActive2 : boolean = null;
  }

  export class TaskProjectModel{
    projectTaskId2 :number;
    projectId2:string = null;
    taskId2:string = null;
    createdDate2 = new Date(new Date())
  }