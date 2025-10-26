import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RegistrationService } from '../../../core/services/registration.service';
import { CreateRegistrationDTO, GuardianDTO } from '../../../core/models/registration.models';
import { Address, ContactPref, Interest, Level } from '../../../core/models/student.models';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';

type GuardianForm = FormGroup<{
  first_name: FormControl<string>;
  last_name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  address: FormGroup<{
    street: FormControl<string>;
    city: FormControl<string>;
    zip: FormControl<string>;
  }>;
  preferred_contact: FormControl<ContactPref>;
  notes: FormControl<string>;
  newsletter_consent: FormControl<boolean>;
}>;


type StudentForm = FormGroup<{
  first_name: FormControl<string>;
  last_name: FormControl<string>;
  birthdate: FormControl<Date | null>;
  email: FormControl<string>;
  phone: FormControl<string>;
  address: FormGroup<{
    street: FormControl<string>;
    city: FormControl<string>;
    zip: FormControl<string>;
  }>;
  level: FormControl<Level>;
  interests: FormControl<Interest[]>;
  notes: FormControl<string>;
  medical_note: FormControl<string>;
  consent_media: FormControl<boolean>;
}>;


@Component({
  selector: 'app-registration-new',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, RouterLink,
    CardModule, InputTextModule, DatePickerModule,
    SelectModule, MultiSelectModule, CheckboxModule,
    ButtonModule, ToastModule, TextareaModule
  ],
  templateUrl: './new.html',
  styleUrl: './new.scss'
})
export class RegistrationNew {
  private fb = inject(FormBuilder);
  private api = inject(RegistrationService);
  private router = inject(Router);
  private toast = inject(MessageService);

  // dropdown data
  contactPrefs = [
    { label: 'Email', value: 'email' as ContactPref },
    { label: 'SMS', value: 'sms' as ContactPref },
    { label: 'Τηλέφωνο', value: 'phone' as ContactPref },
  ];

  levels = [
    { label: 'Αρχάριος', value: 'beginner' as Level },
    { label: 'Μέσος', value: 'intermediate' as Level },
    { label: 'Προχωρημένος', value: 'advanced' as Level },
  ];

  interests = [
    { label: 'Ζωγραφική', value: 'painting' as Interest },
    { label: 'Κεραμική', value: 'ceramics' as Interest },
    { label: 'Σχέδιο', value: 'drawing' as Interest },
  ];
  
  guardian: GuardianForm = this.fb.group({
    first_name: this.fb.nonNullable.control('', Validators.required),
    last_name: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.email]),
    phone: this.fb.nonNullable.control(''),
    address: this.fb.group({
      street: this.fb.nonNullable.control(''),
      city:   this.fb.nonNullable.control(''),
      zip:    this.fb.nonNullable.control(''),
    }),
    preferred_contact: this.fb.nonNullable.control<ContactPref>('sms'),
    notes: this.fb.nonNullable.control(''),
    newsletter_consent: this.fb.nonNullable.control(false)
  });


  students = this.fb.array<StudentForm>([this.createStudentForm()]);

  get studentsFA(): FormArray<StudentForm> { return this.students; }

  createStudentForm(): StudentForm {
    return this.fb.group({
      first_name: this.fb.nonNullable.control('', Validators.required),
      last_name: this.fb.nonNullable.control('', Validators.required),
      birthdate: this.fb.control<Date | null>(null, [
        Validators.required,
        (c) => c.value && c.value > new Date() ? { futureDate: true } : null
      ]),
      email: this.fb.nonNullable.control('', [Validators.email]),
      phone: this.fb.nonNullable.control(''),
      address: this.fb.group({
        street: this.fb.nonNullable.control(''),
        city:   this.fb.nonNullable.control(''),
        zip:    this.fb.nonNullable.control(''),
      }),
      level: this.fb.nonNullable.control<Level>('beginner'),
      interests: this.fb.nonNullable.control<Interest[]>([]),
      notes: this.fb.nonNullable.control(''),
      medical_note: this.fb.nonNullable.control(''),
      consent_media: this.fb.nonNullable.control(false)
    });
  }


  addStudent(prefillFromGuardian = false) {
    const fg = this.createStudentForm();

    if (prefillFromGuardian) {
      const g = this.guardian.getRawValue();

      fg.patchValue({
        first_name: g.first_name || '',
        last_name: g.last_name || '',
        email: g.email || '',
        phone: g.phone || '',
        address: {
          street: g.address.street,
          city: g.address.city,
          zip: g.address.zip
        }
      });
    }
    this.studentsFA.push(fg);
  }

  removeStudent(i: number) {
    if (this.studentsFA.length > 1) this.studentsFA.removeAt(i);
  }

  private normalizeAddress(a: {street:string;city:string;zip:string;}): Address | undefined {
    return (a.street || a.city || a.zip)
      ? { street: a.street || undefined, city: a.city || undefined, zip: a.zip || undefined}
      : undefined;
  }

  save() {
    if (this.guardian.invalid || this.studentsFA.invalid) {
      this.toast.add({
        severity: 'warn',
        summary: 'Έλεγχος πεδίων',
        detail: 'Συμπλήρωσε τα υποχρεωτικά πεδία.'
      });
      return;
    }

    const g = this.guardian.getRawValue();
    const dto: CreateRegistrationDTO = {
      guardian: {
        first_name: g.first_name,
        last_name: g.last_name,
        email: g.email || undefined,
        phone: g.phone || undefined,
        address: this.normalizeAddress(g.address),
        preferred_contact: g.preferred_contact,
        notes: g.notes || '',
        newsletter_consent: g.newsletter_consent || false
      } as GuardianDTO,
      students: this.studentsFA.getRawValue().map(s => ({
        first_name: s.first_name,
        last_name: s.last_name,
        birthdate: (s.birthdate as Date).toISOString().slice(0,10),
        email: s.email || undefined,
        phone: s.phone || undefined,
        address: this.normalizeAddress(s.address),
        level: s.level,
        interests: s.interests,
        notes: s.notes || '',
        medical_note: s.medical_note || '',
        consent_media: s.consent_media || false
      }))
    };

    if (dto.students.length === 0) {
      this.toast.add({
        severity: 'warn',
        summary: 'Χωρίς μαθητή',
        detail: 'Πρόσθεσε τουλάχιστον έναν μαθητή.'
      });
      return;
    }

    this.api.create(dto).subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'Αποθήκευση',
          detail: 'Η εγγραφή δημιουργήθηκε'
        });
        this.router.navigate(['/students']);
      },
      error: (e) => this.toast.add({
        severity: 'error',
        summary: 'Σφάλμα',
        detail: e?.error?.message || 'Κάτι πήγε στραβά'
      })
    });
  }
}
