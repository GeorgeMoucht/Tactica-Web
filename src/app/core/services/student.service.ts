import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { CreateStudentDTO, StudentDetail, StudentListRow, StudentMinimal, UpdateStudentDTO } from '../models/student.models';
import { PaginatedResponse } from '../models/pagination';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private api = inject(ApiService);

  create(dto: CreateStudentDTO) {
    // backend: POST /api/v1/student -> (id: number)
    return this.api.post<{ id: number }>('/students', dto);
  }

  get(id: number) {
    return this.api.get<StudentDetail>(`/students/${id}`);
  }

  list(params: { query?: string; page?: number; pageSize?: number }) {
    const q = new URLSearchParams();
    if (params.query) q.set('query', params.query);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : '';

    return this.api.get<PaginatedResponse<StudentListRow>>(`/students${qs}`, { unwrap: false });
  }

  update(id: number, dto: UpdateStudentDTO) {
    return this.api.put<StudentDetail>(`/students/${id}`, dto); // ApiService unwraps .data
  }
}
