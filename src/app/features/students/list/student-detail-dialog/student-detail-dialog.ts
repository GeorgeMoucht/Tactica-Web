import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
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
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MembershipService } from '../../../../core/services/membership.service';
import { EnrollmentService } from '../../../../core/services/enrollment.service';
import { ClassService } from '../../../../core/services/class.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { Enrollment } from '../../../../core/models/enrollment.models';
import { ClassListRow } from '../../../../core/models/class.models';
import { PaymentSummary, OutstandingDue } from '../../../../core/models/payment.models';

import {
  GuardianBasic,
  StudentDetail,
  UpdateStudentDTO
} from '../../../../core/models/student.models';
import { StudentService } from '../../../../core/services/student.service';
import { StudentHistoryDialog } from './student-history-dialog/student-history-dialog';
import { StudentPaymentDialog } from './student-payment-dialog/student-payment-dialog';

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
    CurrencyPipe,
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
    FormsModule,
    TabsModule,
    TableModule,
    ConfirmDialogModule,
    TooltipModule,
    StudentHistoryDialog,
    StudentPaymentDialog
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './student-detail-dialog.html',
  styleUrl: './student-detail-dialog.scss'
})
export class StudentDetailDialog implements OnChanges {
  private fb = inject(FormBuilder);
  private api = inject(StudentService);
  private toast = inject(MessageService);
  private confirm = inject(ConfirmationService);
  private memberships = inject(MembershipService);
  private enrollmentService = inject(EnrollmentService);
  private classService = inject(ClassService);
  private paymentService = inject(PaymentService);

  @Input() visible = false;
  @Input() student: StudentDetail | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  editMode = signal(false);
  saving = signal(false);
  registrationDialogVisible = signal(false);

  // Enrollments
  enrollments = signal<Enrollment[]>([]);
  loadingEnrollments = signal(false);
  enrollDialogVisible = signal(false);
  availableClasses = signal<ClassListRow[]>([]);
  loadingClasses = signal(false);
  selectedClassId: number | null = null;
  enrolling = signal(false);

  // Discount fields for enrollment creation
  enrollDiscountPercent: number | null = null;
  enrollDiscountAmount: number | null = null;
  enrollDiscountNote: string = '';

  // Edit discount dialog
  editDiscountDialogVisible = signal(false);
  selectedEnrollmentForDiscount = signal<Enrollment | null>(null);
  discountPercent: number | null = null;
  discountAmount: number | null = null;
  discountNote: string = '';
  savingDiscount = signal(false);

  private todayIso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // registrationStartDate = signal<Date>(new Date());
  registrationStartDate: Date = new Date();

  registrationPreview = signal<{
    starts_at: Date;
    ends_at: Date;
  } | null>(null);

  historyDialogVisible = signal(false);

  // Payments
  paymentSummary = signal<PaymentSummary | null>(null);
  loadingPayments = signal(false);
  paymentDialogVisible = signal(false);

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

  // membershipHistory = computed(() => {
  //   const s = this.student;
  //   if (!s) {
  //     return [];
  //   }

  //   // If no entitlements found then init to empty array
  //   const entitlements = (s as any).entitlements ?? [];
    
  //   return entitlements
  //     .filter((e: any) => e?.product?.type === 'registration') // only membership/registration
  //     .map((e: any) => {
  //       const starts_at = String(e.starts_at).slice(0, 10);
  //       const ends_at = String(e.ends_at).slice(0, 10);

  //       return {
  //         starts_at,
  //         ends_at,
  //         active: starts_at <= this.todayIso && ends_at >= this.todayIso,
  //       };
  //     })
  //     // newest first
  //     .sort((a: any, b: any) => b.starts_at.localeCompare(a.starts_at));
  // });

  ctrl(path: string): FormControl {
    return this.form.get(path) as FormControl;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible && this.student) {
      this.loadEnrollments();
      this.loadPaymentSummary();
    }
    if (changes['student'] && this.student && this.visible) {
      this.loadEnrollments();
      this.loadPaymentSummary();
    }
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
    if (this.saving()) {
      return;
    }

    const preview = this.registrationPreview();
    if (!this.student || !preview) {
      return;
    }

    this.saving.set(true);

    this.memberships.createAnnual(this.student.id, {
      starts_at: this.normalizeDate(preview.starts_at)!,
      ends_at: this.normalizeDate(preview.ends_at)!
    }).subscribe({
      next: (res) => {
        // backend returns updated StudentDetailResource
        this.student = res.data;

        this.toast.add({
          severity: 'success',
          summary: 'Ολοκληρώθηκε',
          detail: 'Η ετήσια εγγραφή καταχωρήθηκε επιτυχώς.'
        });

        this.registrationDialogVisible.set(false);
      },
      error: (err) => {
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail: err?.error?.message ?? 'Αποτυχία καταχώρησης'
        });
      },
      complete: () => {
        this.saving.set(false);
      }
    });
  }

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

  openHistoryDialog() {
    this.historyDialogVisible.set(true);
  }

  // Enrollment methods
  loadEnrollments() {
    if (!this.student) return;

    this.loadingEnrollments.set(true);
    this.enrollmentService.getStudentEnrollments(this.student.id).subscribe({
      next: (enrollments) => {
        this.enrollments.set(enrollments);
        this.loadingEnrollments.set(false);
      },
      error: () => {
        this.loadingEnrollments.set(false);
      }
    });
  }

  openEnrollDialog() {
    this.loadingClasses.set(true);
    this.selectedClassId = null;
    this.enrollDiscountPercent = null;
    this.enrollDiscountAmount = null;
    this.enrollDiscountNote = '';

    // Load available weekly classes that are active
    this.classService.list({ type: 'weekly', active: true, pageSize: 100 }).subscribe({
      next: (res) => {
        // Filter out classes student is already enrolled in
        const enrolledClassIds = this.enrollments()
          .filter(e => e.status === 'active')
          .map(e => e.class_id);

        const available = res.data.filter((c: ClassListRow) => !enrolledClassIds.includes(c.id));
        this.availableClasses.set(available);
        this.loadingClasses.set(false);
        this.enrollDialogVisible.set(true);
      },
      error: () => {
        this.loadingClasses.set(false);
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail: 'Αποτυχία φόρτωσης μαθημάτων'
        });
      }
    });
  }

  confirmEnroll() {
    const classId = this.selectedClassId;
    if (!classId || !this.student) return;

    this.enrolling.set(true);

    const payload: any = { class_id: classId };
    if (this.enrollDiscountPercent != null && this.enrollDiscountPercent > 0) {
      payload.discount_percent = this.enrollDiscountPercent;
    }
    if (this.enrollDiscountAmount != null && this.enrollDiscountAmount > 0) {
      payload.discount_amount = this.enrollDiscountAmount;
    }
    if (this.enrollDiscountNote?.trim()) {
      payload.discount_note = this.enrollDiscountNote.trim();
    }

    this.enrollmentService.enroll(this.student.id, payload).subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'Επιτυχία',
          detail: 'Η εγγραφή ολοκληρώθηκε'
        });
        this.enrollDialogVisible.set(false);
        this.loadEnrollments();
      },
      error: (err) => {
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail: err?.error?.message ?? 'Αποτυχία εγγραφής'
        });
      },
      complete: () => {
        this.enrolling.set(false);
      }
    });
  }

  withdrawEnrollment(enrollment: Enrollment) {
    this.confirm.confirm({
      message: `Θέλετε να αποχωρήσετε από το μάθημα "${enrollment.course_class?.title}";`,
      header: 'Επιβεβαίωση αποχώρησης',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ναι',
      rejectLabel: 'Όχι',
      accept: () => {
        this.enrollmentService.withdraw(enrollment.id).subscribe({
          next: () => {
            this.toast.add({
              severity: 'success',
              summary: 'Επιτυχία',
              detail: 'Η αποχώρηση ολοκληρώθηκε'
            });
            this.loadEnrollments();
          },
          error: (err) => {
            this.toast.add({
              severity: 'error',
              summary: 'Σφάλμα',
              detail: err?.error?.message ?? 'Αποτυχία αποχώρησης'
            });
          }
        });
      }
    });
  }

  editEnrollmentDiscount(enrollment: Enrollment) {
    this.selectedEnrollmentForDiscount.set(enrollment);
    this.discountPercent = enrollment.discount_percent ?? 0;
    this.discountAmount = enrollment.discount_amount ?? 0;
    this.discountNote = enrollment.discount_note ?? '';
    this.editDiscountDialogVisible.set(true);
  }

  saveEnrollmentDiscount() {
    const enrollment = this.selectedEnrollmentForDiscount();
    if (!enrollment) return;

    this.savingDiscount.set(true);

    this.enrollmentService.updateDiscount(enrollment.id, {
      discount_percent: this.discountPercent ?? 0,
      discount_amount: this.discountAmount ?? 0,
      discount_note: this.discountNote?.trim() || undefined,
    }).subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'Επιτυχία',
          detail: 'Η έκπτωση ενημερώθηκε'
        });
        this.editDiscountDialogVisible.set(false);
        this.loadEnrollments();
      },
      error: (err) => {
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail: err?.error?.message ?? 'Αποτυχία ενημέρωσης έκπτωσης'
        });
      },
      complete: () => this.savingDiscount.set(false)
    });
  }

  dayLabel(d?: number | null): string {
    if (!d) return '—';
    const days: Record<number, string> = {
      1: 'Δευτέρα',
      2: 'Τρίτη',
      3: 'Τετάρτη',
      4: 'Πέμπτη',
      5: 'Παρασκευή',
      6: 'Σάββατο',
      7: 'Κυριακή'
    };
    return days[d] ?? String(d);
  }

  // Payment methods
  loadPaymentSummary() {
    if (!this.student) return;

    this.loadingPayments.set(true);
    this.paymentService.getSummary(this.student.id).subscribe({
      next: (summary) => {
        this.paymentSummary.set(summary);
      },
      error: () => {
        this.paymentSummary.set(null);
      },
      complete: () => this.loadingPayments.set(false)
    });
  }

  payDue(due: OutstandingDue) {
    this.confirm.confirm({
      message: `Θέλετε να καταχωρήσετε πληρωμή για την οφειλή "${due.period}" (${due.class.title});`,
      header: 'Επιβεβαίωση πληρωμής',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Ναι, πληρώθηκε',
      rejectLabel: 'Ακύρωση',
      accept: () => {
        this.paymentService.payDue(due.id).subscribe({
          next: () => {
            this.toast.add({
              severity: 'success',
              summary: 'Επιτυχία',
              detail: 'Η πληρωμή καταχωρήθηκε'
            });
            this.loadPaymentSummary();
          },
          error: (err) => {
            this.toast.add({
              severity: 'error',
              summary: 'Σφάλμα',
              detail: err?.error?.message ?? 'Αποτυχία καταχώρησης πληρωμής'
            });
          }
        });
      }
    });
  }

  openPaymentDialog() {
    this.paymentDialogVisible.set(true);
  }

  onPaymentDialogClose() {
    this.loadPaymentSummary();
  }
}
