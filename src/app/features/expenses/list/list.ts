import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense, ExpenseCategory } from '../../../core/models/expense.models';
import { ExpenseDialog } from './expense-dialog/expense-dialog';

@Component({
  selector: 'app-expenses-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    FormsModule,
    CardModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    SkeletonModule,
    TooltipModule,
    TagModule,
    SelectModule,
    DatePickerModule,
    ConfirmDialogModule,
    ToastModule,
    ExpenseDialog
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class ExpensesList {
  private api = inject(ExpenseService);
  private confirmService = inject(ConfirmationService);
  private toast = inject(MessageService);

  @ViewChild('dt') table!: Table;

  q = signal('');
  total = signal(0);
  loading = signal(false);
  initialized = signal(false);
  rows = signal<Expense[]>([]);
  categories = signal<ExpenseCategory[]>([]);

  // Filter signals
  selectedCategory = signal<number | null>(null);
  selectedStatus = signal<string | null>(null);
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);

  private lastEvent: any = { first: 0, rows: 10 };

  dialogVisible = signal(false);
  dialogMode = signal<'view' | 'create' | 'edit'>('view');
  selected = signal<Expense | null>(null);

  statusOptions = [
    { label: 'Εκκρεμεί', value: 'pending' },
    { label: 'Πληρωμένο', value: 'paid' }
  ];

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (list) => this.categories.set(list)
    });
  }

  load() {
    if (this.loading()) return;

    const event = this.lastEvent;
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    const pageSize = event.rows ?? 10;

    this.loading.set(true);

    const dateFrom = this.dateFrom();
    const dateTo = this.dateTo();

    this.api.list({
      query: this.q(),
      page,
      pageSize,
      category_id: this.selectedCategory() ?? undefined,
      status: this.selectedStatus() ?? undefined,
      date_from: dateFrom ? this.formatDate(dateFrom) : undefined,
      date_to: dateTo ? this.formatDate(dateTo) : undefined,
      sortField: event.sortField,
      sortOrder: event.sortOrder ?? -1
    }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.total.set(res.meta.total);
        this.loading.set(false);
        this.initialized.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.initialized.set(true);
      }
    });
  }

  search() {
    this.lastEvent = { ...this.lastEvent, first: 0 };
    this.load();
  }

  onLazyLoad(event: any) {
    this.lastEvent = event;
    this.load();
  }

  clearFilters() {
    this.q.set('');
    this.selectedCategory.set(null);
    this.selectedStatus.set(null);
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.table.clear();
  }

  openExpense(row: Expense) {
    this.api.get(row.id).subscribe({
      next: (detail) => {
        this.selected.set(detail);
        this.dialogMode.set('view');
        this.dialogVisible.set(true);
      }
    });
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.dialogMode.set('view');
    this.selected.set(null);
  }

  openCreate() {
    this.selected.set(null);
    this.dialogMode.set('create');
    this.dialogVisible.set(true);
  }

  onDialogSaved() {
    this.load();
    this.loadCategories();
  }

  payExpense(row: Expense) {
    this.confirmService.confirm({
      message: `Θέλετε να σημειώσετε ως πληρωμένο το "${row.description}";`,
      header: 'Επιβεβαίωση Πληρωμής',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Πληρωμή',
      rejectLabel: 'Ακύρωση',
      accept: () => {
        this.api.markAsPaid(row.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Πληρώθηκε' });
            this.load();
          },
          error: (err) => {
            this.toast.add({
              severity: 'error',
              summary: 'Σφάλμα',
              detail: err?.error?.message ?? 'Αποτυχία πληρωμής'
            });
          }
        });
      }
    });
  }

  deleteExpense(row: Expense) {
    this.confirmService.confirm({
      message: `Θέλετε σίγουρα να διαγράψετε το "${row.description}";`,
      header: 'Επιβεβαίωση Διαγραφής',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Διαγραφή',
      rejectLabel: 'Ακύρωση',
      accept: () => {
        this.api.delete(row.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Διαγράφηκε' });
            this.load();
          },
          error: (err) => {
            this.toast.add({
              severity: 'error',
              summary: 'Σφάλμα',
              detail: err?.error?.message ?? 'Αποτυχία διαγραφής'
            });
          }
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
