import { Injectable, inject } from "@angular/core";
import { ApiService } from './api.service';
import { GuardianDetail, GuardianListRow } from '../models/guardian.models';
import { PaginatedResponse } from "../models/pagination";

@Injectable({ providedIn: 'root' })
export class GuardianService {
    private api = inject(ApiService);

    list(params: { query?: string; page?: number; pageSize?: number }) {
        const q = new URLSearchParams();
        if (params.query) q.set('query', params.query);
        if (params.page) q.set('page', String(params.page));
        if (params.pageSize) q.set('pageSize', String(params.pageSize));

        const qs = q.toString() ? `?${q.toString()}` : '';

        return this.api.get<PaginatedResponse<GuardianListRow>>(
            `/guardians${qs}`,
            { unwrap: false }
        );
    }

    get(id: number) {
        return this.api.get<GuardianDetail>(`/guardians/${id}`);
    }
}