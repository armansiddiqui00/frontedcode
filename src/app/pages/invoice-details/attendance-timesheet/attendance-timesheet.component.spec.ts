import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceTimesheetComponent } from './attendance-timesheet.component.ts';

describe('AttendanceTimesheetComponent', () => {
  let component: AttendanceTimesheetComponent;
  let fixture: ComponentFixture<AttendanceTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceTimesheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
