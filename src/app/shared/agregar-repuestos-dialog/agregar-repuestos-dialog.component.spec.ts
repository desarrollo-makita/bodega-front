import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarRepuestosDialogComponent } from './agregar-repuestos-dialog.component';

describe('AgregarRepuestosDialogComponent', () => {
  let component: AgregarRepuestosDialogComponent;
  let fixture: ComponentFixture<AgregarRepuestosDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarRepuestosDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarRepuestosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
