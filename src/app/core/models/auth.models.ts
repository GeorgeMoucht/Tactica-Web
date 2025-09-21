import { User } from './user.model';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string; 
    password_confirmation: string;
}

export interface TokenPayload {
    token_type: string;
    expires_in: number;
    access_token: string | null;
    refresh_token: string | null;
}

export interface AuthPayload extends TokenPayload {
    user: User;
}