import { Injectable, inject } from "@angular/core";
import { ApiService } from "./api.service";
import { PaginatedResponse } from "../models/pagination";
import { ClassDetail, ClassListRow, UpsertClassDTO } from "../models/class.models";

@Injectable({ providedIn: 'root' })
export class ClassService {
    private api = inject(ApiService);

    get(id: number) {
        return this.api.get<ClassDetail>(`/classes/${id}`);
    }

    list(params: { query?: string, page?: number; pageSize?: number }) {
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

        const qs = q.toString() ? `?${q.toString()}` : '';

        return this.api.get<PaginatedResponse<ClassListRow>>(`/classes${qs}`, { unwrap: false });
    }

    create(dto: UpsertClassDTO) {
        return this.api.post<ClassDetail>('/classes', dto);
    }

    update(id: number, dto: Partial<UpsertClassDTO>) {
        return this.api.put<ClassDetail>(`/classes/${id}`, dto);
    }
}