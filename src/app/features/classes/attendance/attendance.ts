import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { DatePickerModule } from 'primeng/datepicker';
import { AttendanceService } from '../../../core/services/attendance.service';
import { HistoryTab } from './history-tab/history-tab';
import { SummaryTab } from './summary-tab/summary-tab';

@Component({
  selector: 'app-class-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TabsModule,
    DatePickerModule,
    HistoryTab,
    SummaryTab
  ],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss'
})
export class ClassAttendance implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private attendanceService = inject(AttendanceService);

  classId = 0;
  classTitle = signal('');
  activeTab = signal('0');

  fromDate: Date | null = null;
  toDate: Date | null = null;

  appliedFrom = signal<string | undefined>(undefined);
  appliedTo = signal<string | undefined>(undefined);

  ngOnInit() {
    this.classId = Number(this.route.snapshot.paramMap.get('classId'));
    this.loadClassTitle();
  }

  private loadClassTitle() {
    this.attendanceService.summary(this.classId).subscribe({
      next: (res) => this.classTitle.set(res.class_title)
    });
  }

  applyFilters() {
    this.appliedFrom.set(this.formatDate(this.fromDate));
    this.appliedTo.set(this.formatDate(this.toDate));
  }

  clearFilters() {
    this.fromDate = null;
    this.toDate = null;
    this.appliedFrom.set(undefined);
    this.appliedTo.set(undefined);
  }

  goBack() {
    this.router.navigate(['/classes']);
  }

  private formatDate(d: Date | null): string | undefined {
    if (!d) return undefined;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
