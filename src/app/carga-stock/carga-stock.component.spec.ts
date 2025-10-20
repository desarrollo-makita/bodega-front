import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaStockComponent } from './carga-stock.component';

describe('CargaStockComponent', () => {
  let component: CargaStockComponent;
  let fixture: ComponentFixture<CargaStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargaStockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargaStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
