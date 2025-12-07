import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';

import { GuardianService } from '../../../../core/services/guardian.service';
import { GuardianListRow } from '../../../../core/models/guardian.models';
import { GuardianTable } from '../../../guardians/guardian-table/guardian-table';

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
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    DividerModule,
    TagModule,
    GuardianTable,
  ],
  templateUrl: './guardians-step.html',
})
export class GuardiansStepComponent {
  @Input({ required: true }) guardians!: FormArray<GuardianFG>;

  @Output() addNew = new EventEmitter<void>();
  @Output() selectExisting = new EventEmitter<Partial<ExistingGuardianOption>>();
  @Output() remove = new EventEmitter<number>();

  private guardiansApi = inject(GuardianService);

  pickerOpen = false;

  // 👇 just make filter + loading + existing list signals
  filter = signal('');
  loadingExisting = signal(false);
  existingGuardians = signal<GuardianListRow[]>([]);

  relations = [
    { label: 'Πατέρας',   value: 'father'   },
    { label: 'Μητέρα',    value: 'mother'   },
    { label: 'Κηδεμόνας', value: 'guardian' },
    { label: 'Άλλο',      value: 'other'    },
  ];

  fg = (i: number) => this.guardians.at(i) as GuardianFG;
  addr = (i: number) => this.fg(i).controls.address as AddressFG;

  ngOnInit() {
    this.loadExistingGuardians();
  }

  displayName(i: number): string {
    const g = this.fg(i);
    const fn = g.controls.first_name.value || '';
    const ln = g.controls.last_name.value || '';
    return `${fn} ${ln}`.trim() || '(Χωρίς όνομα)';
  }

  openPicker() {
    // reset filter when opening
    this.filter.set('');
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

  // 👇 use the signal here
  optionsFiltered = computed(() => {
    const q = this.filter().trim().toLowerCase();
    const list = this.existingGuardians();

    if (!q) return list;

    return list.filter(o => {
      const name = `${o.first_name} ${o.last_name}`.toLowerCase();
      return (
        name.includes(q) ||
        (o.email ?? '').toLowerCase().includes(q) ||
        (o.phone ?? '').includes(q)
      );
    });
  });

  private loadExistingGuardians() {
    this.loadingExisting.set(true);

    this.guardiansApi.list({
      query: '',
      page: 1,
      pageSize: 50,
    }).subscribe({
      next: (res) => {
        this.existingGuardians.set(
          res.data.map((g: any) => ({
            id: g.id,
            first_name: g.first_name,
            last_name: g.last_name,
            name: `${g.first_name} ${g.last_name}`.trim(),
            email: g.email,
            phone: g.phone,
            students_count: g.students_count ?? 0,
            created_at: g.created_at,
          }))
        );
      },
      error: () => {
        this.loadingExisting.set(false);
      },
      complete: () => {
        this.loadingExisting.set(false);
      },
    });
  }

  pickFromRow(row: GuardianListRow) {
    this.pick({
      id: row.id,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone ?? undefined,
    });
  }
}
