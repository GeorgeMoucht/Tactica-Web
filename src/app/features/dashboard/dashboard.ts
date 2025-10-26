// src/app/features/dashboard/dashboard.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

import {
  DashboardStats,
  Session,
  WeeklyInstructorHours,
  Discipline
} from '../../core/models/school.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, CardModule, TableModule, ButtonModule, TagModule, SkeletonModule, DividerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private api = inject(DashboardService);

  loadingStats = signal(true);
  loadingSessions = signal(true);
  loadingHours = signal(true);

  stats = signal<DashboardStats | null>(null);
  sessions = signal<Session[]>([]);
  hours = signal<WeeklyInstructorHours[]>([]);

  ngOnInit() {
    this.api.stats().subscribe({
      next: s => this.stats.set(s),
      complete: () => this.loadingStats.set(false)
    });
    this.api.sessionsToday().subscribe({
      next: s => this.sessions.set(s),
      complete: () => this.loadingSessions.set(false)
    });
    this.api.weeklyInstructorHours().subscribe({
      next: h => this.hours.set(h),
      complete: () => this.loadingHours.set(false)
    });
  }

  // Your model uses 'canceled' (one L). Support both just in case.
  statusSeverity(s: Session['status'] | 'cancelled') {
    return s === 'scheduled' ? 'info'
         : s === 'completed' ? 'success'
         : 'danger';
  }

  disciplineLabel(d: Discipline) {
    return d === 'painting' ? 'Ζωγραφική'
         : d === 'ceramics' ? 'Κεραμική'
         : 'Σχέδιο'; // drawing
  }

  // Helper because templates can't use arrow functions
  names(list?: Array<{ name: string }> | null): string {
    return list?.map(x => x.name).join(', ') ?? '—';
  }

  getLearnerNames(s: Session | any): string {
    const list = s?.lerners ?? s?.learners;
    return this.names(list);
  }

  getInstructorName(row: WeeklyInstructorHours | any): string {
    return row?.intructor_name ?? row?.instructor_name ?? '—';
  }
}
