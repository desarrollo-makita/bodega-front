import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GarantiaDetalleDialogComponent } from './garantia-detalle-dialog.component';

describe('GarantiaDetalleDialogComponent', () => {
  let component: GarantiaDetalleDialogComponent;
  let fixture: ComponentFixture<GarantiaDetalleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GarantiaDetalleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GarantiaDetalleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
