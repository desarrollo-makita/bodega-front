import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CerrarInventarioDialogComponent } from './cerrar-inventario-dialog.component';

describe('CerrarInventarioDialogComponent', () => {
  let component: CerrarInventarioDialogComponent;
  let fixture: ComponentFixture<CerrarInventarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CerrarInventarioDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CerrarInventarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
