import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuardianDetail } from '../../../../core/models/guardian.models';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-guardian-detail-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, DividerModule],
  templateUrl: './guardian-detail-dialog.html',
  styleUrl: './guardian-detail-dialog.scss'
})
export class GuardianDetailDialog {
  @Input() visible = false;
  @Input() guardian: GuardianDetail | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  hide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }
}
