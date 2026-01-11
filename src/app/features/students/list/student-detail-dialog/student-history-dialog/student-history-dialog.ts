import { Component, Input, Output, EventEmitter, inject, signal, effect, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

import { StudentHistoryService, MembershipHistoryItem } from '../../../../../core/services/student-history.service';

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
    private historyApi = inject(StudentHistoryService);

    visible = input(false);
    studentId = input<number | null>(null);

    @Output() visibleChange = new EventEmitter<boolean>();

    loading = signal(false);
    memberships = signal<MembershipHistoryItem[]>([]);

    constructor() {
        effect(() => {
            const isVisible = this.visible();
            const id = this.studentId();

            if (isVisible && id) {
                this.loadHistory(id);
            }
        });
    }

    private loadHistory(studentId: number) {
        this.loading.set(true);

        this.historyApi.getHistory(studentId).subscribe({
            next: (res) => {
                console.log('history response', res);
                this.memberships.set(res.memberships ?? []);
            },
            error: () => {
                this.memberships.set([]);
            },
            complete: () => this.loading.set(false)
        });
    }
    
    close() {
        this.visibleChange.emit(false);
    }
}