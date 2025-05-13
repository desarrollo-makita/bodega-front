import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioBateriasComponent } from './inventario-baterias.component';

describe('InventarioBateriasComponent', () => {
  let component: InventarioBateriasComponent;
  let fixture: ComponentFixture<InventarioBateriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventarioBateriasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventarioBateriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
