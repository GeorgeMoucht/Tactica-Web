import { Component, inject, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { Address, ContactPref, CreateStudentDTO, Interest, Level } from '../../../core/models/student.models';

// PrimeNG (v20 syntax)
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';


type NewStudentForm = FormGroup<{
  name: FormControl<string>;
  birthdate: FormControl<Date | null>;
  email: FormControl<string>;
  phone: FormControl<string>;
  address: FormGroup<{
    street: FormControl<string>;
    city: FormControl<string>;
    zip: FormControl<string>;
  }>;
  preferred_contact: FormControl<ContactPref>;
  interests: FormControl<Interest[]>;
  level: FormControl<Level>;
  notes: FormControl<string>;
  consent_media: FormControl<boolean>;
  medical_note: FormControl<string>;
}>;

@Component({
  selector: 'app-student-new',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    ButtonModule,
    ToastModule,
    CheckboxModule
  ],
  templateUrl: './new.html',
  styleUrls: ['./new.scss']
})
export class NewStudent {
  private fb = inject(FormBuilder);
  private api = inject(StudentService);
  private router = inject(Router);
  private toast = inject(MessageService);

  /** Dropdown data */
  interests = [
    { label: 'Ζωγραφική', value: 'painting' as Interest },
    { label: 'Κεραμική',   value: 'ceramics' as Interest },
    { label: 'Σχέδιο',     value: 'drawing'  as Interest }
  ];

  levels = [
    { label: 'Αρχάριος',        value: 'beginner' as Level },
    { label: 'Μέσος',           value: 'intermediate' as Level },
    { label: 'Προχωρημένος',    value: 'advanced' as Level }
  ];

  contactPrefs = [
    { label: 'Email',    value: 'email' as ContactPref },
    { label: 'SMS',      value: 'sms'   as ContactPref },
    { label: 'Τηλέφωνο', value: 'phone' as ContactPref }
  ];

  /** Form group */
  form: NewStudentForm = this.fb.group({
    name: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    birthdate: this.fb.control<Date|null>(null, [
      Validators.required,
      control => control.value && control.value > new Date() ? { futureDate: true } : null
    ]),
    email: this.fb.nonNullable.control('', [Validators.email]),
    phone: this.fb.nonNullable.control(''),
    address: this.fb.group({
      street: this.fb.nonNullable.control(''),
      city:   this.fb.nonNullable.control(''),
      zip:    this.fb.nonNullable.control(''),
    }),
    preferred_contact: this.fb.nonNullable.control<ContactPref>('sms'),
    interests: this.fb.nonNullable.control<Interest[]>([]),
    level: this.fb.nonNullable.control<Level>('beginner'),
    notes: this.fb.nonNullable.control(''),
    consent_media: this.fb.nonNullable.control(false),
    medical_note: this.fb.nonNullable.control('')
  });

  /** Derived computed property */
  isMinor = computed(() => {
    const d = this.form.value.birthdate;
    if (!d) return false;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age < 18;
  });

  /** Submit handler */
  save() {
    const v = this.form.getRawValue();

    if (this.form.invalid) {
      this.toast.add({ severity: 'warn', summary: 'Συμπλήρωσε τα απαιτούμενα πεδία' });
      return;
    }

    if (!v.email && !v.phone) {
      this.toast.add({ severity: 'warn', summary: 'Συμπλήρωσε email ή τηλέφωνο' });
      return;
    }

    // only send address if at least one field exists
    const address: Address | null =
      (v.address.street || v.address.city || v.address.zip)
        ? {
            street: v.address.street || undefined,
            city:   v.address.city   || undefined,
            zip:    v.address.zip    || undefined
          }
        : null;

    // split full name to first/last for backend
    const [first, ...rest] = (v.name || '').trim().split(/\s+/);

    const payload = {
      student: {
        first_name: first || '-',
        last_name:  rest.join(' ') || '-',
        birthdate:  (v.birthdate as Date).toISOString().slice(0, 10),
        email:      v.email || null,
        phone:      v.phone || null,
        address,                              // null or { street, city, zip }
        level:      v.level || null,
        interests:  Array.isArray(v.interests) ? v.interests : [],
        notes:      v.notes || null,
        medical_note: v.medical_note || null,
        consent_media: !!v.consent_media
        // preferred_contact is *not* in the student schema on the backend
      },
      guardians: [] as any[] // this simple page creates a student without guardians
    };

    this.api.createStudent(payload).subscribe({
      next: (res: any) => {
        const id = res?.student_id ?? res?.data?.student_id;
        this.toast.add({ severity: 'success', summary: 'Η εγγραφή δημιουργήθηκε' });
        if (id) this.router.navigate(['/students', id]);
      },
      error: (e: any) => this.toast.add({
        severity: 'error',
        summary: 'Αποτυχία',
        detail: e?.error?.message || 'Κάτι πήγε στραβά'
      })
    });
  }
}