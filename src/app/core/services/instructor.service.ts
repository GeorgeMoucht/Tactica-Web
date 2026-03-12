import { Injectable, inject } from "@angular/core";
import { ApiService } from "./api.service";
import { InstructorHoursDetail } from "../models/school.models";

@Injectable({ providedIn: 'root' })
export class InstructorService {
    private api = inject(ApiService);

    getHours(params: { from?: string; to?: string; week?: string } = {}) {
        const q = new URLSearchParams();
        if (params.from) q.set('from', params.from);
        if (params.to) q.set('to', params.to);
        if (params.week) q.set('week', params.week);
        const qs = q.toString() ? `?${q.toString()}` : '';
        return this.api.get<InstructorHoursDetail[]>(`/hours/instructors${qs}`);
    }
}
