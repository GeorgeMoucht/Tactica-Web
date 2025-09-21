export interface ApiEnvelope<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
    meta?: any
}

export interface ApiErrorPayload {
    status?: 'error';
    message?: string;
    data?: null;
    errors?: Record<string, string[]>;
}