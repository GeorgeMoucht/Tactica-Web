import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ExpenseService } from '../../../../core/services/expense.service';
import { Expense, ExpenseCategory, UpsertExpenseDTO } from '../../../../core/models/expense.models';

@Component({
  selector: 'app-expense-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    DividerModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
    ToastModule
  ],
  templateUrl: './expense-dialog.html',
  styleUrl: './expense-dialog.scss'
})
export class ExpenseDialog implements OnChanges {
  private fb = inject(FormBuilder);
  private api = inject(ExpenseService);
  private toast = inject(MessageService);

  @Input() visible = false;
  @Input() expense: Expense | null = null;
  @Input() mode: 'view' | 'create' | 'edit' = 'view';
  @Input() categories: ExpenseCategory[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  editMode = signal(false);
  saving = signal(false);
  newCategoryName = signal('');
  showNewCategory = signal(false);

  form!: FormGroup;

  statusOptions = [
    { label: 'Εκκρεμεί', value: 'pending' },
    { label: 'Πληρωμένο', value: 'paid' }
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] || changes['mode'] || changes['expense']) {
      if (this.visible) {
        this.editMode.set(this.mode === 'create' || this.mode === 'edit');
        this.buildForm();
      }
    }
  }

  private buildForm() {
    if (this.mode === 'create') {
      this.form = this.fb.group({
        description: ['', Validators.required],
        amount: [null, [Validators.required, Validators.min(0.01)]],
        expense_category_id: [null],
        date: [new Date(), Validators.required],
        status: ['pending'],
        notes: [null]
      });
    } else if (this.expense) {
      this.form = this.fb.group({
        description: [this.expense.description, Validators.required],
        amount: [this.expense.amount, [Validators.required, Validators.min(0.01)]],
        expense_category_id: [this.expense.expense_category_id],
        date: [new Date(this.expense.date), Validators.required],
        status: [this.expense.status],
        notes: [this.expense.notes]
      });
    }
  }

  hide() {
    this.editMode.set(false);
    this.showNewCategory.set(false);
    this.newCategoryName.set('');
    this.close.emit();
  }

  enterEdit() {
    this.editMode.set(true);
    this.buildForm();
  }

  cancelEdit() {
    if (this.mode === 'create') {
      this.hide();
    } else {
      this.editMode.set(false);
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const val = this.form.value;

    const dto: UpsertExpenseDTO = {
      description: val.description,
      amount: val.amount,
      date: this.formatDate(val.date),
      expense_category_id: val.expense_category_id || null,
      status: val.status,
      notes: val.notes || null
    };

    const obs = this.mode === 'create'
      ? this.api.create(dto)
      : this.api.update(this.expense!.id, dto);

    obs.subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: this.mode === 'create' ? 'Δημιουργήθηκε' : 'Ενημερώθηκε'
        });
        this.saving.set(false);
        this.saved.emit();
        this.hide();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail: err?.error?.message ?? 'Αποτυχία αποθήκευσης'
        });
      }
    });
  }

  addCategory() {
    const name = this.newCategoryName().trim();
    if (!name) return;

    this.api.createCategory(name).subscribe({
      next: (cat) => {
        this.categories = [...this.categories, cat];
        this.form.patchValue({ expense_category_id: cat.id });
        this.showNewCategory.set(false);
        this.newCategoryName.set('');
        this.saved.emit();
      },
      error: (err) => {
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail: err?.error?.message ?? 'Αποτυχία δημιουργίας κατηγορίας'
        });
      }
    });
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
