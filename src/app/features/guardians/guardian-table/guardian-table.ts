import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { GuardianListRow } from '../../../core/models/guardian.models';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-guardian-table',
  imports: [
    CommonModule,
    DatePipe,
    TableModule,
    ButtonModule,
    TooltipModule,
    SkeletonModule
  ],
  templateUrl: './guardian-table.html',
  styleUrl: './guardian-table.scss'
})
export class GuardianTable {
  @Input() rows: GuardianListRow[] = [];
  @Input() loading = false;
  @Input() mode: 'view' | 'select' = 'view';
  
  @Output() view = new EventEmitter<number>();
  @Output() select = new EventEmitter<GuardianListRow>();
}
