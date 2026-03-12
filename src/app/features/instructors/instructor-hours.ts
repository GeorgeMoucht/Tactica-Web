import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePickerModule } from 'primeng/datepicker';

import { InstructorService } from '../../core/services/instructor.service';
import { InstructorHoursDetail } from '../../core/models/school.models';

@Component({
  selector: 'app-instructor-hours',
  standalone: true,
  imports: [
    FormsModule,
    CardModule, TableModule, ButtonModule, SkeletonModule,
    DatePickerModule
  ],
  templateUrl: './instructor-hours.html',
  styleUrl: './instructor-hours.scss'
})
export class InstructorHours implements OnInit {
  private api = inject(InstructorService);

  loading = signal(true);
  rows = signal<InstructorHoursDetail[]>([]);
  dateRange = signal<Date[] | null>(null);

  totalHours = computed(() =>
    this.rows().reduce((sum, r) => sum + r.total_hours, 0)
  );

  totalSessions = computed(() =>
    this.rows().reduce((sum, r) => sum + r.session_count, 0)
  );

  ngOnInit() {
    this.load();
  }

  setThisWeek() {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    this.dateRange.set([monday, sunday]);
    this.load();
  }

  setThisMonth() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.dateRange.set([first, last]);
    this.load();
  }

  applyFilter() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const range = this.dateRange();
    const params: { from?: string; to?: string } = {};

    if (range && range[0]) {
      params.from = this.formatDate(range[0]);
    }
    if (range && range[1]) {
      params.to = this.formatDate(range[1]);
    }

    this.api.getHours(params).subscribe({
      next: data => this.rows.set(data),
      complete: () => this.loading.set(false)
    });
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
