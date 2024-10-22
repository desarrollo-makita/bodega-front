import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaMantenedorComponent } from './area-mantenedor.component';

describe('AreaMantenedorComponent', () => {
  let component: AreaMantenedorComponent;
  let fixture: ComponentFixture<AreaMantenedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AreaMantenedorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaMantenedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
