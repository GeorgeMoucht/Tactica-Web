import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-student-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    TextareaModule,
  ],
  templateUrl: './student-step.html',
})
export class StudentStepComponent {
  @Input({ required: true }) form!: FormGroup;

  isMinor(): boolean {
    const d = this.form.get('birthdate')?.value as Date | null;
    if (!d) return false;
    const t = new Date();
    let age = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
    return age < 18;
  }

  contactPrefs = [
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' },
    { label: 'Τηλέφωνο', value: 'phone' },
  ];

  levels = [
    { label: 'Αρχάριος', value: 'beginner' },
    { label: 'Μέσος', value: 'intermediate' },
    { label: 'Προχωρημένος', value: 'advanced' },
  ];

  interests = [
    { label: 'Ζωγραφική', value: 'painting' },
    { label: 'Κεραμική', value: 'ceramics' },
    { label: 'Σχέδιο', value: 'drawing' },
  ];
}
