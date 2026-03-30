import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { DataChangedService } from './data-changed.service';
import { PaginatedResponse } from '../models/pagination';
import { Enrollment, CreateEnrollmentPayload, UpdateDiscountPayload } from '../models/enrollment.models';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
    private api = inject(ApiService);
    private dataChanged = inject(DataChangedService);

    enroll(studentId: number, payload: CreateEnrollmentPayload): Observable<Enrollment> {
        return this.api.post<Enrollment>(`/students/${studentId}/enrollments`, payload).pipe(
            tap(() => this.dataChanged.notify('enrollment'))
        );
    }

    getStudentEnrollments(studentId: number): Observable<Enrollment[]> {
        return this.api.get<Enrollment[]>(`/students/${studentId}/enrollments`);
    }

    getClassEnrollments(classId: number, params: {
        page?: number;
        perPage?: number;
        status?: 'active' | 'withdrawn';
    } = {}): Observable<PaginatedResponse<Enrollment>> {
        const q = new URLSearchParams();
        if (params.page) q.set('page', String(params.page));
        if (params.perPage) q.set('perPage', String(params.perPage));
        if (params.status) q.set('status', params.status);
        const qs = q.toString() ? `?${q.toString()}` : '';
        return this.api.get<PaginatedResponse<Enrollment>>(`/classes/${classId}/enrollments${qs}`, { unwrap: false });
    }

    withdraw(enrollmentId: number): Observable<Enrollment> {
        return this.api.patch<Enrollment>(`/enrollments/${enrollmentId}/withdraw`, {}).pipe(
            tap(() => this.dataChanged.notify('enrollment'))
        );
    }

    updateDiscount(enrollmentId: number, payload: UpdateDiscountPayload): Observable<Enrollment> {
        return this.api.patch<Enrollment>(`/enrollments/${enrollmentId}/discount`, payload).pipe(
            tap(() => this.dataChanged.notify('enrollment'))
        );
    }
}
