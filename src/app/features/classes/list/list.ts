import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ClassService } from '../../../core/services/class.service';
import { Router } from '@angular/router';
import { ClassDetail, ClassListRow } from '../../../core/models/class.models';
import { ClassDetailDialog } from './class-detail-dialog/class-detail-dialog';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    CardModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    SkeletonModule,
    TooltipModule,
    TagModule,
    ClassDetailDialog
  ],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class ClassesList {
  private api = inject(ClassService);
  private router = inject(Router);

  q = signal('');
  page = signal(1);
  pageSize = signal(10);
  total = signal(0);

  loading = signal(false);
  rows = signal<ClassListRow[]>([]);

  dialogVisible = signal(false);
  selected = signal<ClassDetail | null>(null);

  load() {
    this.loading.set(true);
    this.api.list({
      query: this.q(),
      page: this.page(),
      pageSize: this.pageSize()
    }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.total.set(res.meta.total);
        this.page.set(res.meta.current_page);
        this.pageSize.set(res.meta.per_page);
      },
      complete: () => this.loading.set(false)
    });
  }
  
  search() {
    this.page.set(1);
    this.load();
  }

  onLazyLoad(event: any) {
    const newPage = (event.page ?? 0) + 1;
    const newRows = event.rows ?? this.pageSize();
    this.page.set(newPage);
    this.pageSize.set(newRows);
    this.load();
  }

  openClass(id: number) {
    this.api.get(id).subscribe({
      next: (detail) => {
        this.selected.set(detail);
        this.dialogVisible.set(true);
      }
    });
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.selected.set(null);
  }

  goNew() {
    this.router.navigate(['/classes/new']);
  }

  ngOnInit() {
    this.load();
  }

  dayLabel(d?: number | null) {
    const map: Record<number, string> = {
      1: 'Δευτέρα', 2: 'Τρίτη', 3: 'Τετάρτη', 4: 'Πέμπτη',
      5: 'Παρασκευή', 6: 'Σάββατο', 7: 'Κυριακή'
    };
    return d ? (map[d] ?? String(d)) : '—';
  }

  timeRange(r: ClassListRow) {
    if (!r.starts_time || !r.ends_time) {
      return '-'
    }

    const s = r.starts_time.slice(0, 5);
    const e = r.ends_time.slice(0, 5);
    return `${s}-${e}`;
  }

}
