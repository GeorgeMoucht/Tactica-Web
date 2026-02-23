import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

import { AttendanceService } from '../../../core/services/attendance.service';
import { TodaySession } from '../../../core/models/attendance.models';

@Component({
  selector: 'app-today-sessions',
  standalone: true,
  imports: [CardModule, ButtonModule, TagModule, SkeletonModule],
  templateUrl: './today-sessions.html',
  styleUrl: './today-sessions.scss'
})
export class TodaySessions implements OnInit {
  private attendanceService = inject(AttendanceService);
  private router = inject(Router);

  sessions = signal<TodaySession[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.attendanceService.todaySessions().subscribe({
      next: s => this.sessions.set(s),
      complete: () => this.loading.set(false)
    });
  }

  openRoster(sessionId: number) {
    this.router.navigate(['/attendance', sessionId]);
  }
}
