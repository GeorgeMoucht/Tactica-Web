import { Injectable, inject } from "@angular/core";
import { ApiService } from "./api.service";
import { CreateRegistrationDTO, RegistrationCreatedPayload, RegistrationListItem } from '../models/registration.models';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
    private api = inject(ApiService);

    create(dto: CreateRegistrationDTO) {
        return this.api.post<RegistrationCreatedPayload>('/registrations', dto);
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