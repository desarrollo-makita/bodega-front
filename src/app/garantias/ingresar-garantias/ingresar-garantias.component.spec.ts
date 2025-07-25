import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarGarantiasComponent } from './ingresar-garantias.component';

describe('IngresarGarantiasComponent', () => {
  let component: IngresarGarantiasComponent;
  let fixture: ComponentFixture<IngresarGarantiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngresarGarantiasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarGarantiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
