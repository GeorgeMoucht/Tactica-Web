import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Stepper, Step, StepList, StepPanels, StepPanel } from 'primeng/stepper';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { StudentService } from '../../../core/services/student.service';
import { StudentStepComponent } from './student-step/student-step';
import { GuardiansStepComponent } from './guardians-step/guardians-step';
import { ReviewStepComponent } from './review-step/review-step';

type AddressFG = FormGroup<{
  street: FormControl<string>;
  city:   FormControl<string>;
  zip:    FormControl<string>;
}>;

type GuardianFG = FormGroup<{
  id:         FormControl<number | null>;
  first_name: FormControl<string>;
  last_name:  FormControl<string>;
  relation:   FormControl<string>;
  email:      FormControl<string>;
  phone:      FormControl<string>;
  address:    AddressFG;
}>;

type StudentForm = FormGroup<{
  name: FormControl<string>;
  birthdate: FormControl<Date | null>;
  email: FormControl<string>;
  phone: FormControl<string>;
  address: AddressFG;
  preferred_contact: FormControl<'email'|'sms'|'phone'>;
  interests: FormControl<Array<'painting'|'ceramics'|'drawing'>>;
  level: FormControl<'beginner'|'intermediate'|'advanced'>;
  notes: FormControl<string>;
  consent_media: FormControl<boolean>;
  medical_note: FormControl<string>;
  guardians: FormArray<GuardianFG>;
}>;

@Component({
  selector: 'app-student-registration-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    Stepper, StepList, StepPanels, StepPanel, Step,
    Card, Button, Toast,
    StudentStepComponent,
    GuardiansStepComponent,
    ReviewStepComponent
    // child steps are in their own files; template references them
  ],
  templateUrl: './student-registration-wizard.html',
  styleUrls: ['./student-registration-wizard.scss'],
  providers: [MessageService],
})
export class StudentRegistrationWizard {
  private fb = inject(FormBuilder).nonNullable;
  private api = inject(StudentService);
  private router = inject(Router);
  toast = inject(MessageService);

  saving = signal(false);
  currentStep = 1;

  private buildAddressFG(init?: Partial<{street:string;city:string;zip:string}>): AddressFG {
    return this.fb.group({
      street: this.fb.control(init?.street ?? ''),
      city:   this.fb.control(init?.city   ?? ''),
      zip:    this.fb.control(init?.zip    ?? ''),
    });
  }

  private buildGuardianFG(g?: Partial<{
    id: number|null; first_name:string; last_name:string; relation:string;
    email:string; phone:string; address:{street?:string;city?:string;zip?:string}
  }>): GuardianFG {
    return new FormGroup<GuardianFG['controls']>({
      id:         new FormControl<number | null>(g?.id ?? null),
      first_name: this.fb.control(g?.first_name ?? ''),
      last_name:  this.fb.control(g?.last_name  ?? ''),
      relation:   this.fb.control(g?.relation   ?? ''),
      email:      new FormControl<string>(g?.email ?? '', { nonNullable: true, validators: [Validators.email] }),
      phone:      this.fb.control(g?.phone ?? ''),
      address:    this.buildAddressFG(g?.address),
    });
  }

  form: StudentForm = new FormGroup<StudentForm['controls']>({
    name: this.fb.control('', Validators.required),
    birthdate: new FormControl<Date | null>(null, {
      validators: [
        Validators.required,
        (c: AbstractControl) => c.value && c.value > new Date() ? { futureDate: true } : null,
      ],
    }),
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.email] }),
    phone: this.fb.control(''),
    address: this.buildAddressFG(),
    preferred_contact: this.fb.control<'email'|'sms'|'phone'>('sms'),
    interests: this.fb.control<Array<'painting'|'ceramics'|'drawing'>>([]),
    level: this.fb.control<'beginner'|'intermediate'|'advanced'>('beginner'),
    notes: this.fb.control(''),
    consent_media: this.fb.control(false),
    medical_note: this.fb.control(''),
    guardians: new FormArray<GuardianFG>([]),
  });

  get guardiansFA() { return this.form.controls.guardians; }

  isMinor(): boolean {
    const d = this.form.get('birthdate')?.value as Date | null;
    if (!d) return false;
    const t = new Date();
    let age = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
    return age < 18;
  }

  addGuardian(g?: Partial<GuardianFG['value']>) { this.guardiansFA.push(this.buildGuardianFG(g as any)); }
  removeGuardian(i: number) { this.guardiansFA.removeAt(i); }

  onStepChange(i: number | undefined) { this.currentStep = i ?? 1; }

  nextStep()  { this.currentStep = Math.min(this.currentStep + 1, 3); }
  prevStep()  { this.currentStep = Math.max(this.currentStep - 1, 1); }

  save() {
    if (this.form.invalid) {
      this.toast.add({ severity: 'warn', summary: 'Συμπλήρωσε τα απαιτούμενα πεδία' });
      return;
    }

    const v = this.form.getRawValue();

    // Split full name into first/last for backend
    const [first, ...rest] = (v.name || '').trim().split(/\s+/);
    const student = {
      first_name: first || '-',
      last_name:  rest.join(' ') || '-',
      birthdate:  (v.birthdate as Date).toISOString().slice(0, 10),
      email:      v.email || null,
      phone:      v.phone || null,
      address:    (v.address.street || v.address.city || v.address.zip)
                    ? { street: v.address.street, city: v.address.city, zip: v.address.zip }
                    : null, // backend may inherit from guardian if minor
      level:      v.level || null,
      interests:  Array.isArray(v.interests) ? v.interests : [],
      notes:      v.notes || null,
      medical_note: v.medical_note || null,
      consent_media: !!v.consent_media,
      preferred_contact: v.preferred_contact || null
    };

    const guardians = this.guardiansFA.controls.map(g => {
      const gv = g.getRawValue();
      const addr = (gv.address?.street || gv.address?.city || gv.address?.zip)
        ? { street: gv.address.street, city: gv.address.city, zip: gv.address.zip }
        : null;

      return {
        first_name: gv.first_name,
        last_name:  gv.last_name,
        email:      gv.email || null,
        phone:      gv.phone || null,
        address:    addr,
        preferred_contact: null,   // add a control if you want to capture this
        notes: null,
        newsletter_consent: false,
      };
    });

    if (this.isMinor() && guardians.length === 0) {
      this.toast.add({ severity: 'warn', summary: 'Πρόσθεσε τουλάχιστον έναν κηδεμόνα' });
      return;
    }

    this.saving.set(true);

    this.api.createStudent({ student, guardians }).subscribe({
      next: (res) => {
        // ApiService in your project typically unwraps "data", so res is { student_id, guardian_ids }
        const id = (res as any).student_id ?? (res as any)?.data?.student_id;
        this.toast.add({ severity: 'success', summary: 'Η εγγραφή δημιουργήθηκε' });
        if (id) this.router.navigate(['/students', id]);
      },
      error: (e) => {
        this.toast.add({
          severity: 'error',
          summary: 'Αποτυχία',
          detail: e?.error?.message || 'Κάτι πήγε στραβά'
        });
      },
      complete: () => this.saving.set(false),
    });
  }
}
