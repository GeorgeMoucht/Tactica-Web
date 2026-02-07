import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { PaginatedResponse } from "../models/pagination";
import { ClassDetail, ClassListRow, UpsertClassDTO } from "../models/class.models";

@Injectable({ providedIn: 'root' })
export class ClassService {
    private api = inject(ApiService);

    get(id: number): Observable<ClassDetail> {
        return this.api.get<ClassDetail>(`/classes/${id}`);
    }

    list(params: {
        query?: string;
        page?: number;
        pageSize?: number;
        type?: string;
        active?: boolean | string;
        day_of_week?: number;
        teacher_id?: number;
        sortField?: string;
        sortOrder?: number;
    }) {
        const q = new URLSearchParams();
        if (params.query) {
            q.set('query', params.query);
        }

        if (params.page) {
            q.set('page', String(params.page));
        }

        if (params.pageSize) {
            q.set('pageSize', String(params.pageSize));
        }

        if (params.type) {
            q.set('type', params.type);
        }

        if (params.active !== undefined && params.active !== '') {
            q.set('active', String(params.active));
        }

        if (params.day_of_week !== undefined && params.day_of_week !== null) {
            q.set('day_of_week', String(params.day_of_week));
        }

        if (params.teacher_id !== undefined && params.teacher_id !== null) {
            q.set('teacher_id', String(params.teacher_id));
        }

        if (params.sortField) {
            q.set('sort_by', params.sortField);
            q.set('sort_order', params.sortOrder === 1 ? 'asc' : 'desc');
        }

        const qs = q.toString() ? `?${q.toString()}` : '';

        return this.api.get<PaginatedResponse<ClassListRow>>(`/classes${qs}`, { unwrap: false });
    }

    create(dto: UpsertClassDTO): Observable<ClassDetail> {
        return this.api.post<ClassDetail>('/classes', dto);
    }

    update(id: number, dto: Partial<UpsertClassDTO>): Observable<ClassDetail> {
        return this.api.put<ClassDetail>(`/classes/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.api.del<void>(`/classes/${id}`);
    }

    toggleActive(id: number): Observable<ClassDetail> {
        return this.api.patch<ClassDetail>(`/classes/${id}/toggle-active`, {});
    }
}
