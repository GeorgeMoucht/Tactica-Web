import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG standalone components (v20)
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { FormsModule } from '@angular/forms';

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

export interface ExistingGuardianOption {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: { street?: string; city?: string; zip?: string };
}

@Component({
  selector: 'app-guardians-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,           // <-- for [(ngModel)]
    Button,
    InputTextModule,
    SelectModule,
    Dialog,
    Divider,
    Tag
  ],
  templateUrl: './guardians-step.html',
})
export class GuardiansStepComponent {
  /** The FormArray<GuardianFG> from parent (typed) */
  @Input({ required: true }) guardians!: FormArray<GuardianFG>;

  /** Optional list to pick from */
  @Input() existingGuardians: ExistingGuardianOption[] = [];

  /** Events for parent to act on */
  @Output() addNew = new EventEmitter<void>();
  @Output() selectExisting = new EventEmitter<Partial<ExistingGuardianOption>>();
  @Output() remove = new EventEmitter<number>();

  /** UI state (plain fields so we can 2-way bind) */
  pickerOpen = false;
  filter = '';

  relations = [
    { label: 'Πατέρας',   value: 'father'   },
    { label: 'Μητέρα',    value: 'mother'   },
    { label: 'Κηδεμόνας', value: 'guardian' },
    { label: 'Άλλο',      value: 'other'    },
  ];

  /** Typed helpers for template binding */
  fg = (i: number) => this.guardians.at(i) as GuardianFG;
  addr = (i: number) => this.fg(i).controls.address as AddressFG;

  /** Display helpers */
  displayName(i: number): string {
    const g = this.fg(i);
    const fn = g.controls.first_name.value || '';
    const ln = g.controls.last_name.value || '';
    return `${fn} ${ln}`.trim() || '(Χωρίς όνομα)';
  }

  openPicker() {
    this.filter = '';
    this.pickerOpen = true;
  }

  pick(g: ExistingGuardianOption) {
    this.selectExisting.emit({
      id: g.id,
      first_name: g.first_name ?? (g.name ? g.name.split(' ')[0] : ''),
      last_name:  g.last_name  ?? (g.name ? g.name.split(' ').slice(1).join(' ') : ''),
      email: g.email,
      phone: g.phone,
      address: g.address,
    });
    this.pickerOpen = false;
  }

  removeAt(i: number) {
    this.remove.emit(i);
  }

  /** Filtered options (computed) */
  optionsFiltered = computed(() => {
    const q = (this.filter || '').trim().toLowerCase();
    if (!q) return this.existingGuardians;
    return this.existingGuardians.filter(o => {
      const name = (o.name ?? `${o.first_name ?? ''} ${o.last_name ?? ''}`).toLowerCase();
      return name.includes(q) || (o.email ?? '').toLowerCase().includes(q) || (o.phone ?? '').includes(q);
    });
  });
}
