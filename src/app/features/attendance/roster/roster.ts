import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { AttendanceService } from '../../../core/services/attendance.service';
import {
  AttendanceEntry,
  AttendanceStatus,
  DebtSummaryItem,
  RosterStudent,
  SessionInfo,
  TeacherOption
} from '../../../core/models/attendance.models';

@Component({
  selector: 'app-attendance-roster',
  standalone: true,
  imports: [CardModule, TableModule, ButtonModule, TagModule, SkeletonModule, ToastModule, SelectModule, FormsModule],
  providers: [MessageService],
  templateUrl: './roster.html',
  styleUrl: './roster.scss'
})
export class AttendanceRoster implements OnInit {
  private attendanceService = inject(AttendanceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(MessageService);

  session = signal<SessionInfo | null>(null);
  students = signal<RosterStudent[]>([]);
  debtSummary = signal<DebtSummaryItem[]>([]);
  teachers = signal<TeacherOption[]>([]);
  selectedConductor = signal<number | null>(null);
  loading = signal(true);
  saving = signal(false);

  attendanceMap = signal<Map<number, AttendanceStatus>>(new Map());

  private sessionId!: number;

  ngOnInit() {
    this.sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));
    this.loadRoster();
  }

  loadRoster() {
    this.loading.set(true);
    this.attendanceService.roster(this.sessionId).subscribe({
      next: roster => {
        this.session.set(roster.session);
        this.students.set(roster.students);
        this.debtSummary.set(roster.debt_summary);
        this.teachers.set(roster.teachers);
        this.selectedConductor.set(roster.session.conducted_by ?? roster.session.teacher_id);

        // Populate attendanceMap from existing statuses
        const map = new Map<number, AttendanceStatus>();
        for (const s of roster.students) {
          if (s.attendance_status) {
            map.set(s.student_id, s.attendance_status);
          }
        }
        this.attendanceMap.set(map);
      },
      complete: () => this.loading.set(false)
    });
  }

  setStatus(studentId: number, status: AttendanceStatus) {
    this.attendanceMap.update(m => new Map(m).set(studentId, status));
  }

  getStatus(studentId: number): AttendanceStatus | null {
    return this.attendanceMap().get(studentId) ?? null;
  }

  save() {
    const entries: AttendanceEntry[] = [];
    this.attendanceMap().forEach((status, studentId) => {
      entries.push({ student_id: studentId, status });
    });

    if (entries.length === 0) {
      this.toast.add({
        severity: 'warn',
        summary: 'Προσοχή',
        detail: 'Δεν έχετε σημειώσει καμία παρουσία',
        life: 3000
      });
      return;
    }

    if (!this.selectedConductor()) {
      this.toast.add({
        severity: 'warn',
        summary: 'Προσοχή',
        detail: 'Επιλέξτε διδάσκοντα',
        life: 3000
      });
      return;
    }

    this.saving.set(true);
    this.attendanceService.store(this.sessionId, { conducted_by: this.selectedConductor()!, attendances: entries }).subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'Επιτυχία',
          detail: 'Οι παρουσίες αποθηκεύτηκαν',
          life: 3000
        });
        this.loadRoster();
      },
      error: () => {
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail: 'Αποτυχία αποθήκευσης παρουσιών',
          life: 3000
        });
        this.saving.set(false);
      },
      complete: () => this.saving.set(false)
    });
  }

  goBack() {
    this.router.navigate(['/attendance']);
  }
}
