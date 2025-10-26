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
  consent_communication: FormControl<boolean>;
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
    consent_communication: this.fb.nonNullable.control(true),
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

    if (!v.email && !v.phone) {
      this.toast.add({ severity: 'warn', summary: 'Συμπλήρωσε email ή τηλέφωνο' });
      return;
    }

    // normalize address: only send if at least one field is non-empty
    const address: Address | undefined =
      (v.address.street || v.address.city || v.address.zip)
        ? {
            street: v.address.street || undefined,
            city:   v.address.city   || undefined,
            zip:    v.address.zip    || undefined
          }
        : undefined;

    const dto: CreateStudentDTO = {
      name: v.name,
      birthdate: (v.birthdate as Date).toISOString().slice(0, 10),
      email: v.email || undefined,
      phone: v.phone || undefined,
      address, // typed Address | undefined
      preferred_contact: v.preferred_contact, // ContactPref
      interests: v.interests,                 // Interest[]
      level: v.level,                         // Level
      notes: v.notes || '',
      consents: {
        communication: v.consent_communication,
        media: v.consent_media,
        medical_note: v.medical_note || ''
      }
    };

    this.api.create(dto).subscribe({
      next: (res) => {
        this.toast.add({ severity: 'success', summary: 'Η εγγραφή δημιουργήθηκε' });
        this.router.navigate(['/students', res.id]);
      },
      error: (e) => this.toast.add({
        severity: 'error',
        summary: 'Αποτυχία',
        detail: e?.error?.message || 'Κάτι πήγε στραβά'
      })
    });
  }
}