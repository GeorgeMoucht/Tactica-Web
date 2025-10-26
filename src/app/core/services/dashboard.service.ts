import { Injectable, inject } from "@angular/core";
import { ApiService } from "./api.service";
import { DashboardStats, Session, WeeklyInstructorHours } from "../models/school.models";

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private api = inject(ApiService);

    stats() {
        return this.api.get<DashboardStats>('/dashboard/stats');
    }

    sessionsToday() {
        return this.api.get<Session[]>('/sessions/today');
    }

    weeklyInstructorHours(weekIso?: string) {
        const q = weekIso ? `?week=${encodeURIComponent(weekIso)}` : '';
        return this.api.get<WeeklyInstructorHours[]>(`/hours/instructors${q}`)
    }
}