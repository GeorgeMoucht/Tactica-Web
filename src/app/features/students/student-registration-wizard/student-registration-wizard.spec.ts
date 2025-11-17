import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRegistrationWizard } from './student-registration-wizard';

describe('StudentRegistrationWizard', () => {
  let component: StudentRegistrationWizard;
  let fixture: ComponentFixture<StudentRegistrationWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentRegistrationWizard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentRegistrationWizard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
