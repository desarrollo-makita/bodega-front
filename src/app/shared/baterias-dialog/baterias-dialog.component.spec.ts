import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BateriasDialogComponent } from './baterias-dialog.component';

describe('BateriasDialogComponent', () => {
  let component: BateriasDialogComponent;
  let fixture: ComponentFixture<BateriasDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BateriasDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BateriasDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
