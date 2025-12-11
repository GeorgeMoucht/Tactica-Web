import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StudentService } from '../../../core/services/student.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { StudentDetailDialog } from './student-detail-dialog/student-detail-dialog';
import { StudentDetail } from '../../../core/models/student.models';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    CardModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    SkeletonModule,
    StudentDetailDialog,
    TooltipModule
  ],
  templateUrl: './list.html',
  styleUrls: ['./list.scss']
})
export class StudentsList {
  private api = inject(StudentService);
  private router = inject(Router);

  q = signal('');
  page = signal(1);
  pageSize = signal(10);
  total = signal(0);

  loading = signal(false);
  rows = signal<{
    id:number;
    name:string;
    email?:string;
    phone?:string;
    level?:string|null;
    is_member: boolean;
    created_at?:string;
  }[]>([]);

  dialogVisible = signal(false);
  selectedStudent = signal<StudentDetail | null>(null);

  load() {
    this.loading.set(true);
    this.api.list({
      query: this.q(),
      page: this.page(),
      pageSize: this.pageSize()
    }).subscribe({
      next: (res) => {
        console.log('Students list response', res);
        this.rows.set(res.data);
        this.total.set(res.meta.total);
        this.page.set(res.meta.current_page);
        this.pageSize.set(res.meta.per_page);
      },
      complete: () => this.loading.set(false)
    });
  }

  search() {
    // reset to first page when changing the query
    this.page.set(1);
    this.load();
  }


  onLazyLoad(event: any) {
    // PrimeNG Table paginator: event has first, rows, page, pageCount
    // page is 0-based; backend is 1-based
    const newPage = (event.page ?? 0) + 1;
    const newRows = event.rows ?? this.pageSize();

    this.page.set(newPage);
    this.pageSize.set(newRows);
    this.load();
  }

  openStudent(id: number) {
    this.api.get(id).subscribe({
      next: (detail) => {
        this.selectedStudent.set(detail);
        this.dialogVisible.set(true);
      }
    });
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.selectedStudent.set(null);
  }

  goNew() {
    // Creation now happens via Registration flow
    this.router.navigate(['/registrations/new']);
  }

  ngOnInit() { this.load(); }

}