import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioListadoComponent } from './inventario-listado.component';

describe('InventarioListadoComponent', () => {
  let component: InventarioListadoComponent;
  let fixture: ComponentFixture<InventarioListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventarioListadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventarioListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
