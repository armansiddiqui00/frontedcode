import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGirdComponent } from './data-gird.component';

describe('DataGirdComponent', () => {
  let component: DataGirdComponent;
  let fixture: ComponentFixture<DataGirdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataGirdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataGirdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
