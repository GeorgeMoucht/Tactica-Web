import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AttendanceSummary, StudentAttendanceSummary } from '../../../../core/models/attendance-history.models';

@Component({
  selector: 'app-summary-tab',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ProgressBarModule],
  template: `
    @if (loading()) {
      <div class="text-center p-4">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      </div>
    } @else {
      <div class="flex align-items-center gap-3 mb-3 p-3 surface-50 border-round">
        <i class="pi pi-chart-bar text-primary" style="font-size: 1.25rem"></i>
        <span class="font-semibold">Σύνολο sessions: {{ summary()?.total_sessions ?? 0 }}</span>
      </div>

      <p-table
        [value]="students()"
        styleClass="p-datatable-sm p-datatable-striped"
        [sortField]="'attendance_rate'"
        [sortOrder]="-1"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="student_name">
              Μαθητής <p-sortIcon field="student_name"></p-sortIcon>
            </th>
            <th pSortableColumn="total_present" style="text-align: center; width: 120px;">
              Παρόντες <p-sortIcon field="total_present"></p-sortIcon>
            </th>
            <th pSortableColumn="total_absent" style="text-align: center; width: 120px;">
              Απόντες <p-sortIcon field="total_absent"></p-sortIcon>
            </th>
            <th pSortableColumn="attendance_rate" style="width: 220px;">
              Ποσοστό <p-sortIcon field="attendance_rate"></p-sortIcon>
            </th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-student>
          <tr>
            <td>{{ student.student_name }}</td>
            <td style="text-align: center">
              <p-tag [value]="'' + student.total_present" severity="success"></p-tag>
            </td>
            <td style="text-align: center">
              <p-tag [value]="'' + student.total_absent" severity="danger"></p-tag>
            </td>
            <td>
              <div class="flex align-items-center gap-2">
                <p-progressBar
                  [value]="student.attendance_rate"
                  [showValue]="false"
                  [style]="{ height: '8px', flex: '1' }"
                  [color]="rateColor(student.attendance_rate)"
                ></p-progressBar>
                <span class="font-semibold" style="min-width: 45px; text-align: right;">
                  {{ student.attendance_rate }}%
                </span>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="4" class="text-center text-600 p-4">
              Δεν βρέθηκαν δεδομένα
            </td>
          </tr>
        </ng-template>
      </p-table>
    }
  `
})
export class SummaryTab implements OnInit, OnChanges {
  @Input() classId!: number;
  @Input() from?: string;
  @Input() to?: string;

  private attendanceService = inject(AttendanceService);

  summary = signal<AttendanceSummary | null>(null);
  students = signal<StudentAttendanceSummary[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['from'] || changes['to']) {
      this.loadData();
    }
  }

  rateColor(rate: number): string {
    if (rate >= 80) return 'var(--green-500, #22c55e)';
    if (rate >= 50) return 'var(--yellow-500, #f59e0b)';
    return 'var(--red-500, #ef4444)';
  }

  private loadData() {
    this.loading.set(true);
    this.attendanceService.summary(this.classId, {
      from: this.from,
      to: this.to
    }).subscribe({
      next: (res) => {
        this.summary.set(res);
        this.students.set(res.students);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
