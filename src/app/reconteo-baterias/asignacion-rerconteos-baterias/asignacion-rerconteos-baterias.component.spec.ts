import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionRerconteosBateriasComponent } from './asignacion-rerconteos-baterias.component';

describe('AsignacionRerconteosBateriasComponent', () => {
  let component: AsignacionRerconteosBateriasComponent;
  let fixture: ComponentFixture<AsignacionRerconteosBateriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignacionRerconteosBateriasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignacionRerconteosBateriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
