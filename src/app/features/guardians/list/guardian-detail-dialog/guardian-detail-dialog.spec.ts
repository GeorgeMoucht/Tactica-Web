import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianDetailDialog } from './guardian-detail-dialog';

describe('GuardianDetailDialog', () => {
  let component: GuardianDetailDialog;
  let fixture: ComponentFixture<GuardianDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianDetailDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianDetailDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
