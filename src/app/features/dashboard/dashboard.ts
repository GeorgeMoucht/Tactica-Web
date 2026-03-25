// src/app/features/dashboard/dashboard.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabsModule } from 'primeng/tabs';

import { TodaySessions } from '../attendance/today-sessions/today-sessions';

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
    TodaySessions
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private api = inject(DashboardService);
  private router = inject(Router);

  outstandingHidden = signal(true);
  financialHidden = signal(true);
  loadingHours = signal(true);
  loadingWidgets = signal(true);
  loadingFinancials = signal(true);

  hours = signal<WeeklyInstructorHours[]>([]);
  widgets = signal<DashboardWidgets | null>(null);
  financials = signal<DashboardFinancials | null>(null);

  ngOnInit() {
    this.api.weeklyInstructorHours().subscribe({
      next: h => this.hours.set(h),
      complete: () => this.loadingHours.set(false)
    });
    this.api.widgets().subscribe({
      next: w => this.widgets.set(w),
      complete: () => this.loadingWidgets.set(false)
    });
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
}
