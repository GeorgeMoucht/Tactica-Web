import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentStep } from './student-step';

describe('StudentStep', () => {
  let component: StudentStep;
  let fixture: ComponentFixture<StudentStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentStep]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentStep);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
