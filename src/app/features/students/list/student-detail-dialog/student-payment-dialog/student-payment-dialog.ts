import { Component, Output, EventEmitter, inject, signal, effect, input } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

import { PaymentService } from '../../../../../core/services/payment.service';
import { MonthlyDue, MonthlyDueStatus } from '../../../../../core/models/payment.models';

const STATUS_LABELS: Record<MonthlyDueStatus, string> = {
    pending: 'Εκκρεμεί',
    paid: 'Πληρώθηκε',
    waived: 'Διαγραφή',
    cancelled: 'Ακυρώθηκε'
};

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

const STATUS_SEVERITY: Record<MonthlyDueStatus, TagSeverity> = {
    pending: 'warn',
    paid: 'success',
    waived: 'info',
    cancelled: 'secondary'
};

interface StatusOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-student-payment-dialog',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        CurrencyPipe,
        FormsModule,
        DialogModule,
        DividerModule,
        TagModule,
        ButtonModule,
        TableModule,
        SelectModule,
        ConfirmDialogModule,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './student-payment-dialog.html',
    styleUrl: './student-payment-dialog.scss'
})
export class StudentPaymentDialog {
    private paymentService = inject(PaymentService);
    private toast = inject(MessageService);
    private confirm = inject(ConfirmationService);

    visible = input(false);
    studentId = input<number | null>(null);

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() paymentChanged = new EventEmitter<void>();

    loading = signal(false);
    dues = signal<MonthlyDue[]>([]);
    statusFilter: string | null = null;

    // Waive dialog
    waiveDialogVisible = signal(false);
    waiveNotes = '';
    selectedDueForWaive = signal<MonthlyDue | null>(null);
    waiving = signal(false);

    statusOptions: StatusOption[] = [
        { label: 'Όλες', value: '' },
        { label: 'Εκκρεμείς', value: 'pending' },
        { label: 'Πληρωμένες', value: 'paid' },
        { label: 'Διαγραμμένες', value: 'waived' }
    ];

    constructor() {
        effect(() => {
            const isVisible = this.visible();
            const id = this.studentId();

            if (isVisible && id) {
                this.loadDues(id);
            }
        });
    }

    private loadDues(studentId: number) {
        this.loading.set(true);
        const filter = this.statusFilter;

        this.paymentService.getDues(studentId, filter ? { status: filter } : undefined).subscribe({
            next: (res) => {
                this.dues.set(res ?? []);
            },
            error: () => {
                this.dues.set([]);
            },
            complete: () => this.loading.set(false)
        });
    }

    onStatusFilterChange() {
        const id = this.studentId();
        if (id) {
            this.loadDues(id);
        }
    }

    statusLabel(status: MonthlyDueStatus): string {
        return STATUS_LABELS[status] ?? status;
    }

    statusSeverity(status: MonthlyDueStatus): TagSeverity {
        return STATUS_SEVERITY[status] ?? 'secondary';
    }

    payDue(due: MonthlyDue) {
        this.confirm.confirm({
            message: `Θέλετε να καταχωρήσετε πληρωμή για "${due.period_label}" (${due.class?.title});`,
            header: 'Επιβεβαίωση πληρωμής',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Ναι, πληρώθηκε',
            rejectLabel: 'Ακύρωση',
            accept: () => {
                this.paymentService.payDue(due.id).subscribe({
                    next: () => {
                        this.toast.add({
                            severity: 'success',
                            summary: 'Επιτυχία',
                            detail: 'Η πληρωμή καταχωρήθηκε'
                        });
                        this.paymentChanged.emit();
                        this.loadDues(this.studentId()!);
                    },
                    error: (err) => {
                        this.toast.add({
                            severity: 'error',
                            summary: 'Σφάλμα',
                            detail: err?.error?.message ?? 'Αποτυχία καταχώρησης πληρωμής'
                        });
                    }
                });
            }
        });
    }

    openWaiveDialog(due: MonthlyDue) {
        this.selectedDueForWaive.set(due);
        this.waiveNotes = '';
        this.waiveDialogVisible.set(true);
    }

    confirmWaive() {
        const due = this.selectedDueForWaive();
        if (!due) return;

        this.waiving.set(true);

        this.paymentService.waiveDue(due.id, this.waiveNotes || undefined).subscribe({
            next: () => {
                this.toast.add({
                    severity: 'success',
                    summary: 'Επιτυχία',
                    detail: 'Η οφειλή διαγράφηκε'
                });
                this.waiveDialogVisible.set(false);
                this.paymentChanged.emit();
                this.loadDues(this.studentId()!);
            },
            error: (err) => {
                this.toast.add({
                    severity: 'error',
                    summary: 'Σφάλμα',
                    detail: err?.error?.message ?? 'Αποτυχία διαγραφής οφειλής'
                });
            },
            complete: () => this.waiving.set(false)
        });
    }

    close() {
        this.visibleChange.emit(false);
    }
}
