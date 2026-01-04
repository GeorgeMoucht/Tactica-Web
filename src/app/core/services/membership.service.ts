import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface CreateMembershipPayload {
    starts_at: string;
    ends_at: string;
    paid_at?: string;
}

@Injectable({ providedIn: 'root'})
export class MembershipService {
    constructor(private http: HttpClient) {}

    createAnnual(studentId: number, payload: CreateMembershipPayload): Observable<any> {
        return this.http.post(
            `/api/v1/students/${studentId}/memberships`,
            payload
        );
    }
}