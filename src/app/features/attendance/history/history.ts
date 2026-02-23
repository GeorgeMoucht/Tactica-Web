import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ClassService } from '../../../core/services/class.service';
import { ClassListRow } from '../../../core/models/class.models';

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  template: `
    <div class="p-3">
      <div class="flex align-items-center gap-3 mb-4">
        <i class="pi pi-history" style="font-size: 1.5rem; color: var(--primary-color)"></i>
        <h2 class="m-0">Ιστορικό Παρουσιών</h2>
      </div>
      <p class="text-600 mb-4">Επιλέξτε τμήμα για να δείτε το ιστορικό παρουσιών.</p>

      <p-table
        [value]="classes()"
        [loading]="loading()"
        styleClass="p-datatable-sm p-datatable-striped"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Τμήμα</th>
            <th>Ημέρα</th>
            <th>Ωράριο</th>
            <th>Καθηγητής</th>
            <th style="width: 160px"></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-cls>
          <tr>
            <td>
              <span class="font-semibold">{{ cls.title }}</span>
            </td>
            <td>{{ dayLabel(cls.day_of_week) }}</td>
            <td>
              @if (cls.starts_time && cls.ends_time) {
                {{ cls.starts_time.slice(0,5) }} – {{ cls.ends_time.slice(0,5) }}
              } @else {
                —
              }
            </td>
            <td>{{ cls.teacher?.name || '—' }}</td>
            <td>
              <button pButton label="Ιστορικό" icon="pi pi-eye"
                      class="p-button-sm p-button-outlined"
                      (click)="goToHistory(cls.id)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center text-600 p-4">
              Δεν βρέθηκαν τμήματα
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class AttendanceHistory implements OnInit {
  private classService = inject(ClassService);
  private router = inject(Router);

  classes = signal<ClassListRow[]>([]);
  loading = signal(false);

  dayOptions = [
    { label: 'Δευτέρα', value: 1 },
    { label: 'Τρίτη', value: 2 },
    { label: 'Τετάρτη', value: 3 },
    { label: 'Πέμπτη', value: 4 },
    { label: 'Παρασκευή', value: 5 },
    { label: 'Σάββατο', value: 6 },
    { label: 'Κυριακή', value: 7 }
  ];

  ngOnInit() {
    this.loading.set(true);
    this.classService.list({ type: 'weekly', active: true, pageSize: 50 }).subscribe({
      next: (res) => {
        this.classes.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  dayLabel(d?: number | null): string {
    if (!d) return '—';
    return this.dayOptions.find(o => o.value === d)?.label ?? String(d);
  }

  goToHistory(classId: number) {
    this.router.navigate(['/classes', classId, 'attendance']);
  }
}
