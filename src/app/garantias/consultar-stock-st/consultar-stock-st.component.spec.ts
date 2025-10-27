import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarStockStComponent } from './consultar-stock-st.component';

describe('ConsultarStockStComponent', () => {
  let component: ConsultarStockStComponent;
  let fixture: ComponentFixture<ConsultarStockStComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultarStockStComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarStockStComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
