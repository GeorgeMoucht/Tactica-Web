import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

export interface TeacherOption {
    id: number;
    name: string;
    email: string;
    role: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
    private api = inject(ApiService);

    list(): Observable<TeacherOption[]> {
        return this.api.get<TeacherOption[]>('/teachers');
    }
}
