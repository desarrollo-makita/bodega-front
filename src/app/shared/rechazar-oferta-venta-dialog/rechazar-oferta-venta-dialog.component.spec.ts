import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechazarOfertaVentaDialogComponent } from './rechazar-oferta-venta-dialog.component';

describe('RechazarOfertaVentaDialogComponent', () => {
  let component: RechazarOfertaVentaDialogComponent;
  let fixture: ComponentFixture<RechazarOfertaVentaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RechazarOfertaVentaDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechazarOfertaVentaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
