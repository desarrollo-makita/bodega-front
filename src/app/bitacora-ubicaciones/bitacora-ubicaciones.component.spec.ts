import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitacoraUbicacionesComponent } from './bitacora-ubicaciones.component';

describe('BitacoraUbicacionesComponent', () => {
  let component: BitacoraUbicacionesComponent;
  let fixture: ComponentFixture<BitacoraUbicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BitacoraUbicacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BitacoraUbicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
