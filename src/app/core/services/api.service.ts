import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ApiEnvelope } from "../models";
import { map, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);
    private base = environment.apiBaseUrl;

    // Helpers for unwrap
    get<T>(url: string, opts?: { params?: any; unwrap?: boolean }) {
        const unwrap = opts?.unwrap !== false; // default true
        return this.http.get<any>(this.base + url, { params: opts?.params }).pipe(
            map(res => unwrap ? res.data : res) // pass through envelope if unwrap=false
        );
    }
    // get<T>(url: string, options?: object) {
    //     return this.http.get<ApiEnvelope<T>>(`${this.base}${url}`, options).pipe(map(r => r.data));
    // }

    post<T>(url: string, body?: unknown, options?: object) {
        return this.http.post<ApiEnvelope<T>>(`${this.base}${url}`, body, options).pipe(map(r => r.data));
    }

    put<T>(url: string, body?: unknown, options?: object) {
        return this.http.put<ApiEnvelope<T>>(`${this.base}${url}`, body, options).pipe(map(r => r.data));
    }

    del<T>(url: string, options?: object) {
        return this.http.delete<ApiEnvelope<T>>(`${this.base}${url}`, options).pipe(map(r => r.data));
    }

    getRaw<T>(url: string, options?: object) {
        return this.http.get<ApiEnvelope<T>>(`${this.base}${url}`, options);
    }
    postRaw<T>(url: string, body?: unknown, options?: object) {
        return this.http.post<ApiEnvelope<T>>(`${this.base}${url}`, body, options);
    }

    static asReadableError(err: HttpErrorResponse) {
        const msg = (err.error?.message) || err.message || 'Request failed';
        return throwError(() => new Error(msg));
    }
}
