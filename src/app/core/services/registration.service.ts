import { Injectable, inject } from "@angular/core";
import { tap } from "rxjs";
import { ApiService } from "./api.service";
import { DataChangedService } from "./data-changed.service";
import { CreateRegistrationDTO, RegistrationCreatedPayload, RegistrationListItem } from '../models/registration.models';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
    private api = inject(ApiService);
    private dataChanged = inject(DataChangedService);

    create(dto: CreateRegistrationDTO) {
        return this.api.post<RegistrationCreatedPayload>('/registrations', dto).pipe(
            tap(() => this.dataChanged.notify('registration'))
        );
    }

    list(params: {q?: string; page?: number; pageSize?: number} = {}) {
        const query = new URLSearchParams();

        if (params.q) {
            query.set('q', params.q);
        }

        if (params.page) {
            query.set('page', String(params.page));
        }

        if (params.pageSize) {
            query.set('pageSize', String(params.pageSize));
        }

        return this.api.get<{ data: RegistrationListItem[]; total: number }>(
        `/registrations?${query.toString()}`
        );
    }
}