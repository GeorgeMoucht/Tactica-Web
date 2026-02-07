import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ClassService } from '../../../core/services/class.service';
import { TeacherService, TeacherOption } from '../../../core/services/teacher.service';
import { ClassDetail, ClassListRow } from '../../../core/models/class.models';
import { ClassDetailDialog } from './class-detail-dialog/class-detail-dialog';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    CardModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    SkeletonModule,
    TooltipModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    ConfirmDialogModule,
    ToastModule,
    ClassDetailDialog
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class ClassesList {
  private api = inject(ClassService);
  private teacherApi = inject(TeacherService);
  private confirmService = inject(ConfirmationService);
  private toast = inject(MessageService);

  @ViewChild('dt') table!: Table;

  q = signal('');
  total = signal(0);

  loading = signal(false);
  initialized = signal(false);  // Track if first load is complete
  rows = signal<ClassListRow[]>([]);
  teachers = signal<TeacherOption[]>([]);

  // Store last lazy load event for reloading
  private lastEvent: any = { first: 0, rows: 10 };

  dialogVisible = signal(false);
  dialogMode = signal<'view' | 'create'>('view');
  selected = signal<ClassDetail | null>(null);

  ngOnInit() {
    // Don't call load() here - the table's lazy load event will handle the initial load
    this.loadTeachers();
  }

  load() {
    if (this.loading()) {
      return;
    }

    const event = this.lastEvent;
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    const pageSize = event.rows ?? 10;

    // Extract filters from event - PrimeNG v14+ uses arrays for filters
    const filters = event.filters ?? {};
    const type = this.getFilterValue(filters['type']);
    const active = this.getFilterValue(filters['active']);
    const dayOfWeek = this.getFilterValue(filters['day_of_week']);
    const teacherId = this.getFilterValue(filters['teacher.id']);

    this.loading.set(true);
    this.api.list({
      query: this.q(),
      page,
      pageSize,
      type,
      active,
      day_of_week: dayOfWeek,
      teacher_id: teacherId,
      sortField: event.sortField,
      sortOrder: event.sortOrder ?? 1
    }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.total.set(res.meta.total);
        this.loading.set(false);
        this.initialized.set(true);  // Mark as initialized after first successful load
      },
      error: () => {
        this.loading.set(false);
        this.initialized.set(true);  // Also mark as initialized on error to show empty table
      }
    });
  }

  // Helper to extract filter value - handles both old format and new array format
  private getFilterValue(filter: any): any {
    if (!filter) return undefined;
    // New PrimeNG format: array of constraints
    if (Array.isArray(filter)) {
      const firstConstraint = filter[0];
      return firstConstraint?.value ?? undefined;
    }
    // Old format: single object with value
    return filter.value ?? undefined;
  }

  loadTeachers() {
    this.teacherApi.list().subscribe({
      next: (list) => this.teachers.set(list)
    });
  }

  search() {
    // Reset to first page when searching
    this.lastEvent = { ...this.lastEvent, first: 0 };
    this.load();
  }

  onLazyLoad(event: any) {
    // Store event for reload purposes
    this.lastEvent = event;
    this.load();
  }

  clearFilters() {
    this.q.set('');
    // table.clear() resets filters/sorting and triggers onLazyLoad
    this.table.clear();
  }

  openClass(id: number) {
    this.api.get(id).subscribe({
      next: (detail) => {
        this.selected.set(detail);
        this.dialogMode.set('view');
        this.dialogVisible.set(true);
      }
    });
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.dialogMode.set('view');
    this.selected.set(null);
  }

  openCreate() {
    this.selected.set(null);
    this.dialogMode.set('create');
    this.dialogVisible.set(true);
  }

  onDialogSaved() {
    this.load();
  }

  deleteClass(row: ClassListRow) {
    this.confirmService.confirm({
      message: `Θέλετε σίγουρα να διαγράψετε το "${row.title}";`,
      header: 'Επιβεβαίωση Διαγραφής',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Διαγραφή',
      rejectLabel: 'Ακύρωση',
      accept: () => {
        this.api.delete(row.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Διαγράφηκε' });
            this.load();
          },
          error: (err) => {
            this.toast.add({
              severity: 'error',
              summary: 'Σφάλμα',
              detail: err?.error?.message ?? 'Αποτυχία διαγραφής'
            });
          }
        });
      }
    });
  }

  dayLabel(d?: number | null) {
    const map: Record<number, string> = {
      1: 'Δευτέρα', 2: 'Τρίτη', 3: 'Τετάρτη', 4: 'Πέμπτη',
      5: 'Παρασκευή', 6: 'Σάββατο', 7: 'Κυριακή'
    };
    return d ? (map[d] ?? String(d)) : '—';
  }

  timeRange(r: ClassListRow) {
    if (!r.starts_time || !r.ends_time) {
      return '-'
    }
    const s = r.starts_time.slice(0, 5);
    const e = r.ends_time.slice(0, 5);
    return `${s}-${e}`;
  }

  // Filter options
  typeOptions = [
    { label: 'Εβδομαδιαίο', value: 'weekly' },
    { label: 'Workshop', value: 'workshop' }
  ];

  activeOptions = [
    { label: 'Ενεργό', value: true },
    { label: 'Ανενεργό', value: false }
  ];

  dayOptions = [
    { label: 'Δευτέρα', value: 1 },
    { label: 'Τρίτη', value: 2 },
    { label: 'Τετάρτη', value: 3 },
    { label: 'Πέμπτη', value: 4 },
    { label: 'Παρασκευή', value: 5 },
    { label: 'Σάββατο', value: 6 },
    { label: 'Κυριακή', value: 7 }
  ];
}
