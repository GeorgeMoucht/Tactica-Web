import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { StudentDetail, StudentListRow, UpdateStudentDTO } from '../models/student.models';
import { PaginatedResponse } from '../models/pagination';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private api = inject(ApiService);

  // NEW: used by the wizard now
  createStudent(payload: {
    student: any;
    guardians: any[];
  }) {
    // Your ApiService usually unwraps { data }, so the type below is the inner "data"
    return this.api.post<{ student_id: number; guardian_ids: number[] }>(
      '/students',
      payload
    );
  }

  // (optional) legacy – remove when not needed
  // createRegistration(payload: { guardian: any; students: any[] }) {
  //   return this.api.post<{ guardian_id: number; student_ids: number[] }>(
  //     '/registrations',
  //     payload
  //   );
  // }

  get(id: number) {
    return this.api.get<StudentDetail>(`/students/${id}`);
  }

  list(params: { query?: string; page?: number; pageSize?: number }) {
    const q = new URLSearchParams();
    if (params.query) q.set('query', params.query);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : '';

    // unwrap: false because your ApiService by default unwraps; list needs raw pagination wrapper
    return this.api.get<PaginatedResponse<StudentListRow>>(`/students${qs}`, { unwrap: false });
  }

  update(id: number, dto: UpdateStudentDTO) {
    // comment in your code says ApiService unwraps .data, so this returns StudentDetail directly
    return this.api.put<StudentDetail>(`/students/${id}`, dto);
  }
}
