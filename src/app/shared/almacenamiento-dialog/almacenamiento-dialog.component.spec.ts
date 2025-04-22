import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmacenamientoDialogComponent } from './almacenamiento-dialog.component';

describe('AlmacenamientoDialogComponent', () => {
  let component: AlmacenamientoDialogComponent;
  let fixture: ComponentFixture<AlmacenamientoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmacenamientoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmacenamientoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
