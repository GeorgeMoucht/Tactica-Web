import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { DataChangedService } from './data-changed.service';
import { MonthlyDue, PaymentSummary } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
    private api = inject(ApiService);
    private dataChanged = inject(DataChangedService);

    getSummary(studentId: number): Observable<PaymentSummary> {
        return this.api.get<PaymentSummary>(`/students/${studentId}/payment-summary`);
    }

    getDues(studentId: number, filters?: { status?: string }): Observable<MonthlyDue[]> {
        const q = new URLSearchParams();
        if (filters?.status) q.set('status', filters.status);
        const qs = q.toString() ? `?${q.toString()}` : '';
        return this.api.get<MonthlyDue[]>(`/students/${studentId}/monthly-dues${qs}`);
    }

    payDue(dueId: number): Observable<MonthlyDue> {
        return this.api.patch<MonthlyDue>(`/monthly-dues/${dueId}/pay`, {}).pipe(
            tap(() => this.dataChanged.notify('payment'))
        );
    }

    waiveDue(dueId: number, notes?: string): Observable<MonthlyDue> {
        return this.api.patch<MonthlyDue>(`/monthly-dues/${dueId}/waive`, { notes }).pipe(
            tap(() => this.dataChanged.notify('payment'))
        );
    }
}
