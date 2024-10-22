import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceTemporaryKeyComponent } from './replace-temporary-key.component';

describe('ReplaceTemporaryKeyComponent', () => {
  let component: ReplaceTemporaryKeyComponent;
  let fixture: ComponentFixture<ReplaceTemporaryKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReplaceTemporaryKeyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplaceTemporaryKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
