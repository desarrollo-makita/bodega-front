import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmInventarioDialogComponent } from './confirm-inventario-dialog.component';

describe('ConfirmInventarioDialogComponent', () => {
  let component: ConfirmInventarioDialogComponent;
  let fixture: ComponentFixture<ConfirmInventarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmInventarioDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmInventarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
