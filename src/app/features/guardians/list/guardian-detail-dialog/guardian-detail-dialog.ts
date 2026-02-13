import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuardianDetail } from '../../../../core/models/guardian.models';
import { StudentDetail } from '../../../../core/models/student.models';
import { StudentService } from '../../../../core/services/student.service';
import { StudentDetailDialog } from '../../../students/list/student-detail-dialog/student-detail-dialog';

import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-guardian-detail-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, TagModule, StudentDetailDialog],
  templateUrl: './guardian-detail-dialog.html',
  styleUrl: './guardian-detail-dialog.scss'
})
export class GuardianDetailDialog {
  private studentApi = inject(StudentService);

  @Input() visible = false;
  @Input() guardian: GuardianDetail | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  selectedStudent = signal<StudentDetail | null>(null);
  studentDialogVisible = signal(false);

  hide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }

  openStudent(id: number) {
    this.studentApi.get(id).subscribe({
      next: (detail) => {
        this.selectedStudent.set(detail);
        this.studentDialogVisible.set(true);
      }
    });
  }

  initials(): string {
    const name = this.guardian?.name;
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  preferredContactLabel(): string {
    switch (this.guardian?.preferred_contract) {
      case 'email': return 'Email';
      case 'sms':   return 'SMS';
      case 'phone': return 'Τηλέφωνο';
      default:      return '—';
    }
  }
}
