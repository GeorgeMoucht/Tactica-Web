import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, Table, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AttendanceHistorySession } from '../../../../core/models/attendance-history.models';

@Component({
  selector: 'app-history-tab',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule],
  template: `
    <p-table
      #dt
      [value]="sessions()"
      [lazy]="true"
      [paginator]="true"
      [rows]="10"
      [totalRecords]="totalRecords()"
      [loading]="loading()"
      (onLazyLoad)="onLazyLoad($event)"
      dataKey="session_id"
      styleClass="p-datatable-sm p-datatable-striped"
    >
      <ng-template pTemplate="header">
        <tr>
          <th style="width: 3rem"></th>
          <th>Ημερομηνία</th>
          <th>Ωράριο</th>
          <th>Διδάσκων</th>
          <th style="text-align: center">Παρόντες</th>
          <th style="text-align: center">Απόντες</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-session let-expanded="expanded" let-rowIndex="rowIndex">
        <tr>
          <td>
            <button
              type="button"
              class="p-button p-button-text p-button-rounded p-button-sm"
              (click)="toggleRow(session, $event)"
            >
              <i [class]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
            </button>
          </td>
          <td>{{ session.date }}</td>
          <td>{{ session.starts_time?.slice(0,5) }} – {{ session.ends_time?.slice(0,5) }}</td>
          <td>{{ session.conducted_by_name || '—' }}</td>
          <td style="text-align: center">
            <p-tag [value]="'' + session.present_count" severity="success"></p-tag>
          </td>
          <td style="text-align: center">
            <p-tag [value]="'' + session.absent_count" severity="danger"></p-tag>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="expandedrow" let-session>
        <tr>
          <td colspan="6" style="padding: 0.5rem 1rem 1rem 3rem;">
            <p-table [value]="session.attendances" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>Μαθητής</th>
                  <th style="width: 120px; text-align: center">Κατάσταση</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-att>
                <tr>
                  <td>{{ att.student_name }}</td>
                  <td style="text-align: center">
                    <p-tag
                      [value]="att.status === 'present' ? 'Παρών' : 'Απών'"
                      [severity]="att.status === 'present' ? 'success' : 'danger'"
                    ></p-tag>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="2" class="text-center text-600">Δεν υπάρχουν εγγραφές</td>
                </tr>
              </ng-template>
            </p-table>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center text-600 p-4">
            Δεν βρέθηκαν καταγεγραμμένες παρουσίες
          </td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class HistoryTab implements OnInit, OnChanges {
  @Input() classId!: number;
  @Input() from?: string;
  @Input() to?: string;

  @ViewChild('dt') table!: Table;

  private attendanceService = inject(AttendanceService);

  sessions = signal<AttendanceHistorySession[]>([]);
  totalRecords = signal(0);
  loading = signal(false);

  private currentPage = 1;
  private perPage = 10;

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['from'] || changes['to']) {
      this.currentPage = 1;
      this.loadData();
    }
  }

  toggleRow(rowData: any, event: Event) {
    this.table.toggleRow(rowData, event);
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    this.currentPage = Math.floor(first / rows) + 1;
    this.perPage = rows;
    this.loadData();
  }

  private loadData() {
    this.loading.set(true);
    this.attendanceService.history(this.classId, {
      page: this.currentPage,
      perPage: this.perPage,
      from: this.from,
      to: this.to
    }).subscribe({
      next: (res) => {
        this.sessions.set(res.data);
        this.totalRecords.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
