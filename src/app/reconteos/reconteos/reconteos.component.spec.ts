import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconteosComponent } from './reconteos.component';

describe('ReconteosComponent', () => {
  let component: ReconteosComponent;
  let fixture: ComponentFixture<ReconteosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReconteosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReconteosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
