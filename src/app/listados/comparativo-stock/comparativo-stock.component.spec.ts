import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparativoStockComponent } from './comparativo-stock.component';

describe('ComparativoStockComponent', () => {
  let component: ComparativoStockComponent;
  let fixture: ComponentFixture<ComparativoStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComparativoStockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparativoStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
