import { Injectable, inject } from "@angular/core";
import { ApiService } from "./api.service";
import { DashboardFinancials, DashboardWidgets, Session, WeeklyInstructorHours } from "../models/school.models";


@Injectable({ providedIn: 'root' })
export class DashboardService {
    private api = inject(ApiService);

    sessionsToday() {
        return this.api.get<Session[]>('/sessions/today');
    }

    weeklyInstructorHours(weekIso?: string) {
        const q = weekIso ? `?week=${encodeURIComponent(weekIso)}` : '';
        return this.api.get<WeeklyInstructorHours[]>(`/hours/instructors${q}`)
    }

    widgets() {
        return this.api.get<DashboardWidgets>('/dashboard/widgets');
    }

    financials() {
        return this.api.get<DashboardFinancials>('/dashboard/financials');
    }
}