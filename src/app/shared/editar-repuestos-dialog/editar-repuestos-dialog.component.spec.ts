import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarRepuestosDialogComponent } from './editar-repuestos-dialog.component';

describe('EditarRepuestosDialogComponent', () => {
  let component: EditarRepuestosDialogComponent;
  let fixture: ComponentFixture<EditarRepuestosDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarRepuestosDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarRepuestosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
