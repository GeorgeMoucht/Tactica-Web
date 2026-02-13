import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MonthlyDue, PaymentSummary } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
    private api = inject(ApiService);

    // Get payment summary for a student
    getSummary(studentId: number): Observable<PaymentSummary> {
        return this.api.get<PaymentSummary>(`/students/${studentId}/payment-summary`);
    }

    // Get monthly dues for a student
    getDues(studentId: number, filters?: { status?: string }): Observable<MonthlyDue[]> {
        const q = new URLSearchParams();

        if (filters?.status) {
            q.set('status', filters.status);
        }

        const qs = q.toString() ? `?${q.toString()}` : '';
        return this.api.get<MonthlyDue[]>(`/students/${studentId}/monthly-dues${qs}`);
    }

    // Mark a due as paid
    payDue(dueId: number): Observable<MonthlyDue> {
        return this.api.patch<MonthlyDue>(`/monthly-dues/${dueId}/pay`, {});
    }

    // Waive a due
    waiveDue(dueId: number, notes?: string): Observable<MonthlyDue> {
        return this.api.patch<MonthlyDue>(`/monthly-dues/${dueId}/waive`, { notes });
    }
}
