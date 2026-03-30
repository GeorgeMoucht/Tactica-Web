import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { DataChangedService } from "./data-changed.service";

export interface CreateMembershipPayload {
    starts_at: string;
    ends_at: string;
    paid_at?: string;
}

@Injectable({ providedIn: 'root'})
export class MembershipService {
    private http = inject(HttpClient);
    private dataChanged = inject(DataChangedService);

    createAnnual(studentId: number, payload: CreateMembershipPayload): Observable<any> {
        return this.http.post(
            `/api/v1/students/${studentId}/memberships`,
            payload
        ).pipe(
            tap(() => this.dataChanged.notify('membership'))
        );
    }
}