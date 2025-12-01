import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianTable } from './guardian-table';

describe('GuardianTable', () => {
  let component: GuardianTable;
  let fixture: ComponentFixture<GuardianTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
