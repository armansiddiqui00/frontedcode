import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageHistoryComponent } from './package-history.component';

describe('PackageHistoryComponent', () => {
  let component: PackageHistoryComponent;
  let fixture: ComponentFixture<PackageHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
