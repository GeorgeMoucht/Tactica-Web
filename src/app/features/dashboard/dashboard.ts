// src/app/features/dashboard/dashboard.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

import { TodaySessions } from '../attendance/today-sessions/today-sessions';

import {
  DashboardStats,
  WeeklyInstructorHours
} from '../../core/models/school.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, TableModule, ButtonModule, TagModule, SkeletonModule, DividerModule, TodaySessions],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private api = inject(DashboardService);

  loadingStats = signal(true);
  loadingHours = signal(true);

  stats = signal<DashboardStats | null>(null);
  hours = signal<WeeklyInstructorHours[]>([]);

  ngOnInit() {
    this.api.stats().subscribe({
      next: s => this.stats.set(s),
      complete: () => this.loadingStats.set(false)
    });
    this.api.weeklyInstructorHours().subscribe({
      next: h => this.hours.set(h),
      complete: () => this.loadingHours.set(false)
    });
  }

  getInstructorName(row: WeeklyInstructorHours | any): string {
    return row?.intructor_name ?? row?.instructor_name ?? '—';
  }
}
