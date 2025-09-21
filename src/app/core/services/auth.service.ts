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

    token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
    refreshToken = signal<string | null>(localStorage.getItem(REFRESH_KEY));
    tokenType = signal<string>(localStorage.getItem(TYPE_KEY) || 'Bearer');
    user = signal<User | null>(null);

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

    // Session helpers
    setSession(payload: { access_token: string | null; refresh_token: string | null; token_type: string; user?: User}) {
        if (payload.access_token) {
            this.token.set(payload.access_token);
            localStorage.setItem(TOKEN_KEY, payload.access_token);
        }

        if (payload.refresh_token) {
            this.refreshToken.set(payload.refresh_token);
            localStorage.setItem(REFRESH_KEY, payload.refresh_token);
        }

        if (payload.token_type) {
            this.tokenType.set(payload.token_type);
            localStorage.setItem(TYPE_KEY, payload.token_type);
        }
        if (payload.user) this.user.set(payload.user);
    }

    clearSession() {
        this.token.set(null);
        this.refreshToken.set(null);
        this.user.set(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(TYPE_KEY);
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