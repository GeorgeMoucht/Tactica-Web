import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

import { ClassService } from '../../../../core/services/class.service';
import { ClassDetail, UpsertClassDTO } from '../../../../core/models/class.models';

@Component({
  selector: 'app-class-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    DividerModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './class-detail-dialog.html',
  styleUrl: './class-detail-dialog.scss'
})
export class ClassDetailDialog {
  private fb = inject(FormBuilder);
  private api = inject(ClassService);
  private toast = inject(MessageService);

  @Input() visible = false;
  @Input() classItem: ClassDetail | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  editMode = signal(false);
  saving = signal(false);

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    day_of_week: [null],
    starts_time: [''],
    ends_time: [''],
    capacity: [null],
    teacher_id: [null]
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
    if (!this.classItem) return;
    this.editMode.set(true);

    this.form.reset({
      title: this.classItem.title ?? '',
      description: this.classItem.description ?? '',
      day_of_week: this.classItem.day_of_week ?? null,
      starts_time: (this.classItem.starts_time ?? '').slice(0, 5),
      ends_time: (this.classItem.ends_time ?? '').slice(0, 5),
      capacity: this.classItem.capacity ?? null,
      teacher_id: this.classItem.teacher?.id ?? null
    });
  }

  cancelEdit() {
    this.editMode.set(false);
  }

  private normalizeTime(value: any): string | null {
    if (!value) return null;
    // expects "HH:MM" from input; keep as is
    return String(value).slice(0, 5);
  }

  save() {
    if (!this.classItem || this.form.invalid) return;

    const raw = this.form.value;

    const payload: Partial<UpsertClassDTO> = {
      title: raw.title?.trim(),
      description: raw.description?.trim() || null,
      day_of_week: raw.day_of_week ?? null,
      starts_time: this.normalizeTime(raw.starts_time),
      ends_time: this.normalizeTime(raw.ends_time),
      capacity: raw.capacity === '' ? null : raw.capacity,
      teacher_id: raw.teacher_id ?? null
    };

    this.saving.set(true);
    this.api.update(this.classItem.id, payload).subscribe({
      next: (updated) => {
        this.classItem = updated;
        this.toast.add({ severity: 'success', summary: 'Αποθηκεύτηκε' });
        this.editMode.set(false);
      },
      error: (err) => {
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail: err?.error?.message ?? err?.message ?? 'Αποτυχία αποθήκευσης'
        });
      },
      complete: () => this.saving.set(false)
    });
  }

  dayOptions = [
    { label: 'Δευτέρα', value: 1 },
    { label: 'Τρίτη', value: 2 },
    { label: 'Τετάρτη', value: 3 },
    { label: 'Πέμπτη', value: 4 },
    { label: 'Παρασκευή', value: 5 },
    { label: 'Σάββατο', value: 6 },
    { label: 'Κυριακή', value: 7 }
  ];

  timeRange() {
    const c = this.classItem;
    if (!c?.starts_time || !c?.ends_time) return '—';
    return `${c.starts_time.slice(0,5)}–${c.ends_time.slice(0,5)}`;
  }
}