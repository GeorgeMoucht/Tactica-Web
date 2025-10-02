import { Injectable, inject, signal } from "@angular/core";
import { Router } from '@angular/router';
import { ApiService } from "./api.service";
import { LoginRequest, RegisterRequest, AuthPayload, TokenPayload } from "../models";
import { User } from '../models/user.model';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const TYPE_KEY = 'token_type';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = inject(ApiService);
    private router = inject(Router);

    private LS = localStorage;
    private SS = sessionStorage;

    token        = signal<string | null>(this.LS.getItem(TOKEN_KEY) ?? this.SS.getItem(TOKEN_KEY));
    refreshToken = signal<string | null>(this.LS.getItem(REFRESH_KEY));
    tokenType    = signal<string>(this.LS.getItem(TYPE_KEY) ?? this.SS.getItem(TYPE_KEY) ?? 'Bearer');
    user         = signal<User | null>(null);

    // ------- API calls (envelope is unwrapped in ApiService) ------
    login(dto: LoginRequest) {
        return this.api.post<AuthPayload>('/auth/login', dto);
    }

    register(dto: RegisterRequest) {
        return this.api.post<AuthPayload>('/auth/register', dto);
    }

    me() {
        return this.api.get<User>('/me');
    }

    refresh(refresh: string) {
        return this.api.post<TokenPayload>('/auth/refresh', {
            refresh_token: refresh
        });
    }

    logout() {
        return this.api.post<void>('/auth/logout', {});
    }

    logoutAll() {
        return this.api.post<void>('/auth/logout-all', {});
    }

    // -------- Session helpers ---------
    setSession(
        payload: { access_token: string | null; refresh_token: string | null; token_type: string; user?: User},
        opts?: { remember?: boolean }
    ) {
        const remember = !!opts?.remember;

        // always keep in-memory signals
        if (payload.access_token) {
            this.token.set(payload.access_token);
        }

        if (payload.refresh_token) {
            this.refreshToken.set(payload.refresh_token);
        }

        if (payload.token_type) {
            this.tokenType.set(payload.token_type);
        }

        if (payload.user) {
            this.user.set(payload.user);
        }

        this.LS.removeItem(TOKEN_KEY);
        this.LS.removeItem(REFRESH_KEY);
        this.LS.removeItem(TYPE_KEY);
        this.SS.removeItem(TOKEN_KEY);
        this.SS.removeItem(TYPE_KEY);

        // persist only if remember
        if (remember) {
            if (payload.access_token) {
                this.LS.setItem(TOKEN_KEY, payload.access_token);
            }

            if (payload.refresh_token) {
                this.LS.setItem(REFRESH_KEY, payload.refresh_token);
            }

            if (payload.token_type) {
                this.LS.setItem(TYPE_KEY,  payload.token_type);
            }
        } else {
            if (payload.access_token) {
                this.SS.setItem(TOKEN_KEY, payload.access_token);
            } 
            if (payload.token_type) {
                this.SS.setItem(TYPE_KEY,  payload.token_type);
            }
        }
    }

    clearSession() {
        this.token.set(null);
        this.refreshToken.set(null);
        this.user.set(null);


        this.LS.removeItem(TOKEN_KEY);
        this.LS.removeItem(REFRESH_KEY);
        this.LS.removeItem(TYPE_KEY);

        this.SS.removeItem(TOKEN_KEY);
        this.SS.removeItem(TYPE_KEY);
    }

    isAuthenticated() {
        return !!this.token();
    }

    loadMe() {
        return this.me().subscribe({
            next: (u) => this.user.set(u),
            error: () => this.clearSession()
        });
    }
}