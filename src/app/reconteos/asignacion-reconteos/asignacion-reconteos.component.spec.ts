import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionReconteosComponent } from './asignacion-reconteos.component';

describe('AsignacionReconteosComponent', () => {
  let component: AsignacionReconteosComponent;
  let fixture: ComponentFixture<AsignacionReconteosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignacionReconteosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignacionReconteosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
