import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormsModule
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
  advanced: 'Προχωρημένος',
};

const INTEREST_LABELS: Record<'painting' | 'ceramics' | 'drawing', string> = {
  painting: 'Ζωγραφική',
  ceramics: 'Κεραμική',
  drawing: 'Σχέδιο',
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
    CheckboxModule,
    FormsModule
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
  registrationDialogVisible = signal(false);

  // registrationStartDate = signal<Date>(new Date());
  registrationStartDate: Date = new Date();


  registrationPreview = signal<{
    starts_at: Date;
    ends_at: Date;
  } | null>(null);

  form: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    birthdate: [''],
    email: ['', Validators.email],
    phone: [''],
    // is_member: [false],
    // registration_date: [''],
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

  ctrl(path: string): FormControl {
    return this.form.get(path) as FormControl;
  }

  hide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }

  enterEdit() {
    if (!this.student) return;
    this.editMode.set(true);

    this.form.reset({
      first_name: this.student.first_name ?? this.student.name?.split(' ')[0] ?? '',
      last_name: this.student.last_name ?? this.student.name?.split(' ').slice(1).join(' ') ?? '',
      birthdate: this.student.birthdate ? new Date(this.student.birthdate) : null,
      email: this.student.email ?? '',
      phone: this.student.phone ?? '',
      // is_member: !!this.student.is_member,
      // registration_date: this.student.registration_date ? new Date(this.student.registration_date) : null,
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

  openRegistrationDialog() {
    const start = new Date();
    this.registrationStartDate = start;
    this.registrationPreview.set(this.buildRegistrationPeriod(start));
    this.registrationDialogVisible.set(true);
  }

  onRegistrationStartChange(date: Date) {
    this.registrationPreview.set(this.buildRegistrationPeriod(date));
  }

  confirmRegistration() {
    if (this.saving()) return;

    const preview = this.registrationPreview();
  }

  // confirmRegistration() {
  //   if (this.saving()) return;

  //   this.saving.set(true);

  //   const preview = this.registrationPreview();
  //   if (!this.student || !preview) {
  //     this.saving.set(false);
  //     return;
  //   }

  //   // UI ONLY FOR NOW
  //   console.log('REGISTER ANNUAL:', {
  //     student_id: this.student.id,
  //     starts_at: preview.starts_at,
  //     ends_at: preview.ends_at
  //   });

  //   this.toast.add({
  //     severity: 'success',
  //     summary: 'Προεπισκόπηση',
  //     detail: 'Η ετήσια εγγραφή είναι έτοιμη για καταχώρηση.',
  //   });

  //   this.registrationDialogVisible.set(false);
  //   this.saving.set(false);
  // }

  private buildRegistrationPeriod(start: Date = new Date()) {
    const startsAt = new Date(start);

    const endsAt = new Date(startsAt);

    endsAt.setFullYear(endsAt.getFullYear() + 1);

    return {
      starts_at: startsAt,
      ends_at: endsAt
    };
  }

  private normalizeDate(value: any): string | null {
    if (!value) return null;
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(value);
  }

  save() {
    if (!this.student || this.form.invalid) return;

    const raw = this.form.value;
    const addr = raw.address;
    const address = (addr.street || addr.city || addr.zip) ? addr : null;

    const payload: UpdateStudentDTO = {
      first_name: raw.first_name.trim(),
      last_name: raw.last_name.trim(),
      birthdate: this.normalizeDate(raw.birthdate),
      email: raw.email?.trim() || null,
      phone: raw.phone?.trim() || null,
      address,
      level: raw.level || null,
      interests: raw.interests ?? [],
      notes: raw.notes || null,
      medical_note: raw.medical_note || null,
      consent_media: !!raw.consent_media,
    };

    this.saving.set(true);
    this.api.update(this.student.id, payload).subscribe({
      next: updated => {
        this.student = updated;
        this.toast.add({ severity: 'success', summary: 'Αποθηκεύτηκε' });
        this.editMode.set(false);
      },
      error: err => {
        this.toast.add({ severity: 'error', summary: 'Σφάλμα', detail: err?.message });
      },
      complete: () => this.saving.set(false),
    });
  }

  age(b?: string | null) { return ageFrom(b); }

  levelLabel(level?: 'beginner' | 'intermediate' | 'advanced' | null) {
    return level ? LEVEL_LABELS[level] : '-';
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


  interestLabels(list?: Array<'painting' | 'ceramics' | 'drawing'> | null) {
    return list?.map(i => INTEREST_LABELS[i]) ?? [];
  }
}
