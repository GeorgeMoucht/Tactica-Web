import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

import { GuardianService } from '../../../core/services/guardian.service';
import { GuardianDetailDialog } from './guardian-detail-dialog/guardian-detail-dialog';

@Component({
  selector: 'app-guardians-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    CardModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    SkeletonModule,
    TooltipModule,
    GuardianDetailDialog
  ],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class GuardiansList {
  private api = inject(GuardianService);

  q = signal('');
  page = signal(1);
  pageSize = signal(10);
  total = signal(0);

  loading = signal(false);
  rows = signal<any[]>([]);

  dialogVisible = signal(false);
  selected = signal<any|null>(null);

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

  onLazyLoad(e: any) {
    this.page.set((e.page ?? 0) + 1);
    this.pageSize.set(e.rows ?? this.pageSize());
    this.load();
  }

  openGuardian(id: number) {
    this.api.get(id).subscribe((g) => {
      this.selected.set(g);
      this.dialogVisible.set(true);
    })
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.selected.set(null);
  }

  ngOnInit() {
    this.load();
  }
}
