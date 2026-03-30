// src/app/features/dashboard/dashboard.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { GuardianService } from '../../core/services/guardian.service';
import { StudentService } from '../../core/services/student.service';
import { DataChangedService } from '../../core/services/data-changed.service';
import { GuardianDetail } from '../../core/models/guardian.models';
import { StudentDetail } from '../../core/models/student.models';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabsModule } from 'primeng/tabs';

import { TodaySessions } from '../attendance/today-sessions/today-sessions';
import { GuardianDetailDialog } from '../guardians/list/guardian-detail-dialog/guardian-detail-dialog';
import { StudentDetailDialog } from '../students/list/student-detail-dialog/student-detail-dialog';

import {
  DashboardWidgets,
  DashboardFinancials,
  ClassCapacityInfo,
  WeeklyInstructorHours
} from '../../core/models/school.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe,
    CardModule, TableModule, ButtonModule, TagModule,
    SkeletonModule, DividerModule, ProgressBarModule, TabsModule,
    TodaySessions,
    GuardianDetailDialog,
    StudentDetailDialog
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {
  private api = inject(DashboardService);
  private guardianApi = inject(GuardianService);
  private studentApi = inject(StudentService);
  private dataChanged = inject(DataChangedService);
  private router = inject(Router);

  private changeSub?: Subscription;

  outstandingHidden = signal(true);
  financialHidden = signal(true);
  loadingHours = signal(true);
  loadingWidgets = signal(true);
  loadingFinancials = signal(true);

  hours = signal<WeeklyInstructorHours[]>([]);
  widgets = signal<DashboardWidgets | null>(null);
  financials = signal<DashboardFinancials | null>(null);

  guardianDialogVisible = signal(false);
  selectedGuardian = signal<GuardianDetail | null>(null);

  studentDialogVisible = signal(false);
  selectedStudent = signal<StudentDetail | null>(null);

  ngOnInit() {
    this.fetchAll();

    this.changeSub = this.dataChanged.onAny().subscribe(domain => {
      if (['payment', 'expense'].includes(domain)) {
        this.fetchFinancials();
        this.fetchWidgets();
      } else {
        this.fetchWidgets();
      }
    });
  }

  ngOnDestroy() {
    this.changeSub?.unsubscribe();
  }

  private fetchAll() {
    this.fetchWidgets();
    this.fetchFinancials();
    this.api.weeklyInstructorHours().subscribe({
      next: h => this.hours.set(h),
      complete: () => this.loadingHours.set(false)
    });
  }

  private fetchWidgets() {
    this.api.widgets().subscribe({
      next: w => this.widgets.set(w),
      complete: () => this.loadingWidgets.set(false)
    });
  }

  private fetchFinancials() {
    this.api.financials().subscribe({
      next: f => this.financials.set(f),
      complete: () => this.loadingFinancials.set(false)
    });
  }

  getInstructorName(row: WeeklyInstructorHours | any): string {
    return row?.intructor_name ?? row?.instructor_name ?? '—';
  }

  capacityColor(item: ClassCapacityInfo): string {
    if (item.percentage > 90) return 'red';
    if (item.percentage >= 70) return 'orange';
    return 'green';
  }

  goToRegistrations() {
    this.router.navigate(['/registrations']);
  }

  goToInstructors() {
    this.router.navigate(['/instructors']);
  }

  goToExpenses() {
    this.router.navigate(['/expenses']);
  }

  openGuardian(id: number | null) {
    if (!id) return;
    this.guardianApi.get(id).subscribe({
      next: (g) => {
        this.selectedGuardian.set(g);
        this.guardianDialogVisible.set(true);
      }
    });
  }

  closeGuardianDialog() {
    this.guardianDialogVisible.set(false);
    this.selectedGuardian.set(null);
  }

  openStudent(id: number) {
    this.studentApi.get(id).subscribe({
      next: (s) => {
        this.selectedStudent.set(s);
        this.studentDialogVisible.set(true);
      }
    });
  }

  closeStudentDialog() {
    this.studentDialogVisible.set(false);
    this.selectedStudent.set(null);
  }
}
