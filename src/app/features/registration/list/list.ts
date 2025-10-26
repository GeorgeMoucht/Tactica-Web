import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { RegistrationService } from '../../../core/services/registration.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-registrations-list',
  standalone: true,
  imports: [RouterLink, CardModule, TableModule, InputTextModule,
    ButtonModule, SkeletonModule, PaginatorModule, FormsModule, DatePipe
  ],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class RegistrationList {
  private api = inject(RegistrationService);

  q = signal('');
  loading = signal(false);
  rows = signal<any[]>([]);
  total = signal(0);

  page = signal(1);
  pageSize = signal(10);

  search() {
    this.loading.set(true);
    this.api.list({ q: this.q(), page: this.page(), pageSize: this.pageSize()}).subscribe({
      next: res => {
        this.rows.set(res.data);
        this.total.set(res.total);
      },
      complete: () => this.loading.set(false)
    });
  }

  onPage( e: { page?: number; rows?: number }) {
    this.page.set((e.page ?? 0) + 1);
    this.pageSize.set(e.rows ?? 10);
    this.search();
  }

  ngOnInit() {
    this.search();
  }
}
