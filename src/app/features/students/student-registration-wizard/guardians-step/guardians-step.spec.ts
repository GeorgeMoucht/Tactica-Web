import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardiansStep } from './guardians-step';

describe('GuardiansStep', () => {
  let component: GuardiansStep;
  let fixture: ComponentFixture<GuardiansStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardiansStep]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardiansStep);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
