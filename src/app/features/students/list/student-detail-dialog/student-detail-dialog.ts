import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl
} from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

import {
  GuardianBasic,
  StudentDetail,
  UpdateStudentDTO
} from '../../../../core/models/student.models';
import { StudentService } from '../../../../core/services/student.service';

const LEVEL_LABELS: Record<'beginner' | 'intermediate' | 'advanced', string> = {
  beginner: 'Αρχάριος',
  intermediate: 'Μέσος',
  advanced: 'Προχωρημένος'
};

const INTEREST_LABELS: Record<'painting' | 'ceramics' | 'drawing', string> = {
  painting: 'Ζωγραφική',
  ceramics: 'Κεραμική',
  drawing: 'Σχέδιο'
};

function ageFrom(birthdate?: string | null): number | null {
  if (!birthdate) return null;
  const d = new Date(birthdate);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

@Component({
  selector: 'app-student-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    DialogModule,
    DividerModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule
  ],
  providers: [MessageService],
  templateUrl: './student-detail-dialog.html',
  styleUrl: './student-detail-dialog.scss'
})
export class StudentDetailDialog {
  private fb = inject(FormBuilder);
  private api = inject(StudentService);
  private toast = inject(MessageService);

  @Input() visible = false;
  @Input() student: StudentDetail | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  editMode = signal(false);
  saving = signal(false);

  form: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    birthdate: [''],
    email: ['', Validators.email],
    phone: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      zip: [''],
    }),
    level: [''],
    interests: [[]],
    consent_media: [false, Validators.required],
    notes: [''],
    medical_note: [''],
  });

  /** Helper to return a typed FormControl to fix template type errors */
  ctrl(path: string): FormControl {
    return this.form.get(path) as FormControl;
  }

  // UI
  hide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }

  enterEdit() {
    if (!this.student) return;
    this.editMode.set(true);

    const birth = this.student.birthdate
      ? new Date(this.student.birthdate)
      : null;

    this.form.reset({
      first_name: (this.student as any).first_name ?? this.student.name?.split(' ')[0] ?? '',
      last_name: (this.student as any).last_name ?? this.student.name?.split(' ').slice(1).join(' ') ?? '',
      birthdate: birth,
      email: this.student.email ?? '',
      phone: this.student.phone ?? '',
      address: {
        street: this.student.address?.street ?? '',
        city: this.student.address?.city ?? '',
        zip: this.student.address?.zip ?? '',
      },
      level: this.student.level ?? '',
      interests: this.student.interests ?? [],
      consent_media: !!this.student.consent_media,
      notes: this.student.notes ?? '',
      medical_note: this.student.medical_note ?? '',
    });
  }

  cancelEdit() {
    this.editMode.set(false);
  }

  private normalizeBirthdate(val: unknown): string | null {
    if (!val) return null;
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(val);
  }

  save() {
    if (!this.student) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const addr = raw.address as { street?: string; city?: string; zip?: string } | null | undefined;
    const hasAddr = !!(addr && (addr.street || addr.city || addr.zip));
    const address = hasAddr ? addr : null;

    const payload: UpdateStudentDTO = {
      first_name: raw.first_name?.trim(),
      last_name: raw.last_name?.trim(),
      birthdate: this.normalizeBirthdate(raw.birthdate),
      email: raw.email?.trim() || null,
      phone: raw.phone?.trim() || null,
      address,
      level: (raw.level as any) || null,
      interests: (raw.interests as any[])?.length ? (raw.interests as any[]) : [],
      notes: raw.notes || null,
      medical_note: raw.medical_note || null,
      consent_media: !!raw.consent_media,
    };

    this.saving.set(true);
    this.api.update(this.student.id, payload).subscribe({
      next: (updated) => {
        this.student = updated;
        this.toast.add({ severity: 'success', summary: 'Αποθηκεύτηκε', detail: 'Τα στοιχεία ενημερώθηκαν.' });
        this.editMode.set(false);
      },
      error: (err) => {
        this.toast.add({ severity: 'error', summary: 'Σφάλμα', detail: err?.message || 'Αποτυχία αποθήκευσης.' });
      },
      complete: () => this.saving.set(false),
    });
  }

  // View helpers
  age(b?: string | null) { return ageFrom(b); }
  levelLabel(level?: 'beginner' | 'intermediate' | 'advanced' | null) {
    return level ? LEVEL_LABELS[level] : '—';
  }
  levelSeverity(level?: 'beginner' | 'intermediate' | 'advanced' | null) {
    return level === 'beginner'
      ? 'info'
      : level === 'intermediate'
      ? 'warn'
      : level === 'advanced'
      ? 'success'
      : 'secondary';
  }
  interestLabels(list?: Array<'painting' | 'ceramics' | 'drawing'>) {
    if (!list || list.length === 0) return [];
    return list.map(i => INTEREST_LABELS[i]);
  }
  guardianName(g?: GuardianBasic) { return g?.name || '—'; }
}
