import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  TodaySession,
  AttendanceRoster,
  StoreAttendancePayload
} from '../models/attendance.models';
import { AttendanceHistorySession, AttendanceSummary } from '../models/attendance-history.models';
import { PaginatedResponse } from '../models/pagination';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private api = inject(ApiService);

  todaySessions(): Observable<TodaySession[]> {
    return this.api.get<TodaySession[]>('/dashboard/today-sessions');
  }

  roster(sessionId: number): Observable<AttendanceRoster> {
    return this.api.get<AttendanceRoster>(`/sessions/${sessionId}/attendance`);
  }

  store(sessionId: number, payload: StoreAttendancePayload): Observable<void> {
    return this.api.post<void>(`/sessions/${sessionId}/attendance`, payload);
  }

  history(classId: number, params?: {
    from?: string; to?: string; perPage?: number; page?: number;
  }): Observable<PaginatedResponse<AttendanceHistorySession>> {
    const sp = new URLSearchParams();
    if (params?.from) sp.set('from', params.from);
    if (params?.to) sp.set('to', params.to);
    if (params?.perPage) sp.set('perPage', String(params.perPage));
    if (params?.page) sp.set('page', String(params.page));
    const qs = sp.toString();
    return this.api.get<PaginatedResponse<AttendanceHistorySession>>(
      `/classes/${classId}/attendance-history${qs ? '?' + qs : ''}`,
      { unwrap: false }
    );
  }

  summary(classId: number, params?: {
    from?: string; to?: string;
  }): Observable<AttendanceSummary> {
    const sp = new URLSearchParams();
    if (params?.from) sp.set('from', params.from);
    if (params?.to) sp.set('to', params.to);
    const qs = sp.toString();
    return this.api.get<AttendanceSummary>(
      `/classes/${classId}/attendance-summary${qs ? '?' + qs : ''}`
    );
  }
}
