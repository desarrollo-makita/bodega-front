import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarCapturadorComponent } from './asignar-capturador.component';

describe('AsignarCapturadorComponent', () => {
  let component: AsignarCapturadorComponent;
  let fixture: ComponentFixture<AsignarCapturadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignarCapturadorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarCapturadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
