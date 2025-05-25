import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EulerComponent } from './euler.component';

describe('EulerComponent', () => {
  let component: EulerComponent;
  let fixture: ComponentFixture<EulerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EulerComponent]
    });
    fixture = TestBed.createComponent(EulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
