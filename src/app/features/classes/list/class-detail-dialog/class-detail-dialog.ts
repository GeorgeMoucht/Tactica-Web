import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, FormsModule, Validators, FormControl } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';

import { Router } from '@angular/router';
import { ClassService } from '../../../../core/services/class.service';
import { TeacherService, TeacherOption } from '../../../../core/services/teacher.service';
import { EnrollmentService } from '../../../../core/services/enrollment.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { ClassDetail, ClassType, UpsertClassDTO } from '../../../../core/models/class.models';
import { Enrollment } from '../../../../core/models/enrollment.models';
import { AttendanceHistorySession } from '../../../../core/models/attendance-history.models';

@Component({
  selector: 'app-class-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    DividerModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DatePickerModule,
    ToggleSwitchModule,
    ToastModule,
    TableModule,
    TabsModule
  ],
  providers: [MessageService],
  templateUrl: './class-detail-dialog.html',
  styleUrl: './class-detail-dialog.scss'
})
export class ClassDetailDialog implements OnChanges {
  private fb = inject(FormBuilder);
  private api = inject(ClassService);
  private teacherApi = inject(TeacherService);
  private enrollmentService = inject(EnrollmentService);
  private attendanceService = inject(AttendanceService);
  private toast = inject(MessageService);
  private router = inject(Router);

  @Input() visible = false;
  @Input() classItem: ClassDetail | null = null;
  @Input() mode: 'view' | 'create' = 'view';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  editMode = signal(false);
  saving = signal(false);
  teachers = signal<TeacherOption[]>([]);

  // Recent attendance
  recentSessions = signal<AttendanceHistorySession[]>([]);
  loadingRecentAttendance = signal(false);

  // Enrolled students
  enrolledStudents = signal<Enrollment[]>([]);
  loadingEnrollments = signal(false);
  enrollmentMeta = signal<{ current: number; total: number; capacity: number | null }>({
    current: 0,
    total: 0,
    capacity: null
  });

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    type: ['weekly'],
    day_of_week: [null],
    starts_time: [''],
    ends_time: [''],
    capacity: [null],
    monthly_price: [null],
    teacher_id: [null],
    active: [true],
    sessions: this.fb.array([])
  });

  ctrl(path: string): FormControl {
    return this.form.get(path) as FormControl;
  }

  get sessionsArray(): FormArray {
    return this.form.get('sessions') as FormArray;
  }

  get typeValue(): ClassType {
    return this.form.get('type')?.value ?? 'weekly';
  }

  get dialogHeader(): string {
    if (this.mode === 'create') return 'Νέο Τμήμα / Workshop';
    return 'Λεπτομέρειες Τμήματος';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mode'] && this.mode === 'create' && this.visible) {
      this.initCreateMode();
    }
    if (changes['visible'] && this.visible && this.classItem && this.mode === 'view') {
      this.loadEnrolledStudents();
      this.loadRecentSessions();
    }
    if (changes['classItem'] && this.classItem && this.visible && this.mode === 'view') {
      this.loadEnrolledStudents();
      this.loadRecentSessions();
    }
  }

  private loadTeachers() {
    if (this.teachers().length > 0) return;
    this.teacherApi.list().subscribe({
      next: (list) => this.teachers.set(list)
    });
  }

  private initCreateMode() {
    this.editMode.set(true);
    this.loadTeachers();
    this.form.reset({
      title: '',
      description: '',
      type: 'weekly',
      day_of_week: null,
      starts_time: null,
      ends_time: null,
      capacity: null,
      monthly_price: null,
      teacher_id: null
    });
    this.sessionsArray.clear();
  }

  hide() {
    this.visible = false;
    this.editMode.set(false);
    this.visibleChange.emit(false);
    this.close.emit();
  }

  onShow() {
    if (this.mode === 'create') {
      this.initCreateMode();
    }
  }

  enterEdit() {
    if (!this.classItem) return;
    this.editMode.set(true);
    this.loadTeachers();

    this.form.reset({
      title: this.classItem.title ?? '',
      description: this.classItem.description ?? '',
      type: this.classItem.type ?? 'weekly',
      day_of_week: this.classItem.day_of_week ?? null,
      starts_time: this.timeStringToDate(this.classItem.starts_time),
      ends_time: this.timeStringToDate(this.classItem.ends_time),
      capacity: this.classItem.capacity ?? null,
      monthly_price: this.classItem.monthly_price ?? null,
      teacher_id: this.classItem.teacher?.id ?? null,
      active: this.classItem.active ?? true
    });

    // Populate sessions if workshop
    this.sessionsArray.clear();
    if (this.classItem.type === 'workshop' && this.classItem.sessions) {
      for (const s of this.classItem.sessions) {
        this.sessionsArray.push(this.fb.group({
          date: [s.date, Validators.required],
          starts_time: [this.timeStringToDate(s.starts_time), Validators.required],
          ends_time: [this.timeStringToDate(s.ends_time), Validators.required]
        }));
      }
    }
  }

  cancelEdit() {
    if (this.mode === 'create') {
      this.hide();
      return;
    }
    this.editMode.set(false);
  }

  addSession() {
    this.sessionsArray.push(this.fb.group({
      date: [null, Validators.required],
      starts_time: [null, Validators.required],
      ends_time: [null, Validators.required]
    }));
  }

  removeSession(index: number) {
    this.sessionsArray.removeAt(index);
  }

  /** Convert "HH:MM" string to Date object for DatePicker */
  private timeStringToDate(time: string | null | undefined): Date | null {
    if (!time) return null;
    const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /** Convert Date object to "HH:MM" string for backend */
  private dateToTimeString(date: Date | null | undefined): string | null {
    if (!date || !(date instanceof Date)) return null;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  save() {
    if (this.form.invalid) return;

    const raw = this.form.value;
    const type: ClassType = raw.type ?? 'weekly';

    if (this.mode === 'create') {
      this.saveCreate(raw, type);
    } else {
      this.saveUpdate(raw, type);
    }
  }

  private saveCreate(raw: any, type: ClassType) {
    const payload: UpsertClassDTO = {
      title: raw.title?.trim(),
      type,
      description: raw.description?.trim() || null,
      capacity: raw.capacity === '' ? null : raw.capacity,
      monthly_price: raw.monthly_price != null && raw.monthly_price !== '' ? Number(raw.monthly_price) : null,
      teacher_id: raw.teacher_id ?? null,
    };

    if (type === 'weekly') {
      payload.day_of_week = raw.day_of_week ?? null;
      payload.starts_time = this.dateToTimeString(raw.starts_time);
      payload.ends_time = this.dateToTimeString(raw.ends_time);
    } else {
      payload.sessions = (raw.sessions ?? []).map((s: any) => ({
        date: s.date,
        starts_time: this.dateToTimeString(s.starts_time),
        ends_time: this.dateToTimeString(s.ends_time)
      }));
    }

    this.saving.set(true);
    this.api.create(payload).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Δημιουργήθηκε' });
        this.saving.set(false);
        this.saved.emit();
        this.hide();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail: err?.error?.message ?? err?.message ?? 'Αποτυχία δημιουργίας'
        });
      }
    });
  }

  private saveUpdate(raw: any, type: ClassType) {
    if (!this.classItem) return;

    const payload: Partial<UpsertClassDTO> = {
      title: raw.title?.trim(),
      type,
      description: raw.description?.trim() || null,
      capacity: raw.capacity === '' ? null : raw.capacity,
      monthly_price: raw.monthly_price != null && raw.monthly_price !== '' ? Number(raw.monthly_price) : null,
      teacher_id: raw.teacher_id ?? null,
      active: raw.active ?? true
    };

    if (type === 'weekly') {
      payload.day_of_week = raw.day_of_week ?? null;
      payload.starts_time = this.dateToTimeString(raw.starts_time);
      payload.ends_time = this.dateToTimeString(raw.ends_time);
      payload.sessions = undefined;
    } else {
      payload.day_of_week = null;
      payload.starts_time = null;
      payload.ends_time = null;
      payload.sessions = (raw.sessions ?? []).map((s: any) => ({
        date: s.date,
        starts_time: this.dateToTimeString(s.starts_time),
        ends_time: this.dateToTimeString(s.ends_time)
      }));
    }

    this.saving.set(true);
    this.api.update(this.classItem.id, payload).subscribe({
      next: (updated) => {
        this.classItem = updated;
        this.saving.set(false);
        this.toast.add({ severity: 'success', summary: 'Αποθηκεύτηκε' });
        this.editMode.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail: err?.error?.message ?? err?.message ?? 'Αποτυχία αποθήκευσης'
        });
      }
    });
  }

  dayOptions = [
    { label: 'Δευτέρα', value: 1 },
    { label: 'Τρίτη', value: 2 },
    { label: 'Τετάρτη', value: 3 },
    { label: 'Πέμπτη', value: 4 },
    { label: 'Παρασκευή', value: 5 },
    { label: 'Σάββατο', value: 6 },
    { label: 'Κυριακή', value: 7 }
  ];

  typeOptions = [
    { label: 'Εβδομαδιαίο', value: 'weekly' },
    { label: 'Workshop', value: 'workshop' }
  ];

  dayLabel(d?: number | null): string {
    if (!d) return '—';
    return this.dayOptions.find(o => o.value === d)?.label ?? String(d);
  }

  typeLabel(t?: string | null): string {
    return t === 'workshop' ? 'Workshop' : 'Εβδομαδιαίο';
  }

  timeRange() {
    const c = this.classItem;
    if (!c?.starts_time || !c?.ends_time) return '—';
    return `${c.starts_time.slice(0,5)}–${c.ends_time.slice(0,5)}`;
  }

  loadEnrolledStudents() {
    if (!this.classItem) return;

    this.loadingEnrollments.set(true);
    this.enrollmentService.getClassEnrollments(this.classItem.id, {
      status: 'active',
      perPage: 100
    }).subscribe({
      next: (res) => {
        this.enrolledStudents.set(res.data);
        this.enrollmentMeta.set({
          current: res.data.length,
          total: res.meta.total,
          capacity: this.classItem?.capacity ?? null
        });
        this.loadingEnrollments.set(false);
      },
      error: () => {
        this.loadingEnrollments.set(false);
      }
    });
  }

  private loadRecentSessions() {
    if (!this.classItem || this.classItem.type !== 'weekly') return;
    this.loadingRecentAttendance.set(true);
    this.recentSessions.set([]);
    this.attendanceService.history(this.classItem.id, { perPage: 5 }).subscribe({
      next: (res) => {
        this.recentSessions.set(res.data);
        this.loadingRecentAttendance.set(false);
      },
      error: () => {
        this.loadingRecentAttendance.set(false);
      }
    });
  }

  openAttendanceHistory() {
    if (!this.classItem) return;
    const classId = this.classItem.id;
    this.hide();
    this.router.navigate(['/classes', classId, 'attendance']);
  }

  capacityDisplay(): string {
    const meta = this.enrollmentMeta();
    if (meta.capacity !== null) {
      return `${meta.current}/${meta.capacity}`;
    }
    return `${meta.current}`;
  }

  capacitySeverity(): 'success' | 'warn' | 'danger' | 'info' {
    const meta = this.enrollmentMeta();
    if (meta.capacity === null) return 'info';

    const ratio = meta.current / meta.capacity;
    if (ratio >= 1) return 'danger';
    if (ratio >= 0.8) return 'warn';
    return 'success';
  }
}
