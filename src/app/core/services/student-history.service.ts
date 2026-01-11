import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface MembershipHistoryItem {
    starts_at: string;
    ends_at: string;
    active: boolean;
    product?: {
        id: number;
        name: string;
        price: string;
    };
}

export interface StudentHistoryResponse {
    student_id: number;
    memberships: MembershipHistoryItem[];
}

@Injectable({ providedIn: 'root' })
export class StudentHistoryService {
    private api = inject(ApiService);

    getHistory(studentId: number) {
        return this.api.get<StudentHistoryResponse>(
            `/students/${studentId}/history`
        );
    }
}