import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-student-history-dialog',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        DialogModule,
        DividerModule,
        TagModule,
        ButtonModule
    ],
    templateUrl: './student-history-dialog.html',
    styleUrls: ['./student-history-dialog.scss']
})
export class StudentHistoryDialog {
    @Input() visible = false;
    @Input() studentId!: number;

    @Input() memberships: Array<{
        starts_at: string;
        ends_at: string;
        active: boolean;
    }> = [];

    @Output() visibleChange = new EventEmitter<boolean>();

    close() {
        this.visibleChange.emit(false);
    }
}