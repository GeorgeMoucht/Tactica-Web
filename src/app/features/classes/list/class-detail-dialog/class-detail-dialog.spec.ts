import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassDetailDialog } from './class-detail-dialog';

describe('ClassDetailDialog', () => {
  let component: ClassDetailDialog;
  let fixture: ComponentFixture<ClassDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassDetailDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassDetailDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
