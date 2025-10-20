import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobarOfertaVentaComponent } from './aprobar-oferta-venta.component';

describe('AprobarOfertaVentaComponent', () => {
  let component: AprobarOfertaVentaComponent;
  let fixture: ComponentFixture<AprobarOfertaVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AprobarOfertaVentaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprobarOfertaVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
