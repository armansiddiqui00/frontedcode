import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleasedNoteComponent } from './released-note.component';

describe('ReleasedNoteComponent', () => {
  let component: ReleasedNoteComponent;
  let fixture: ComponentFixture<ReleasedNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleasedNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleasedNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
