export interface PaginatedResponse<T> {
    status: 'success' | 'error';
    message: string;
    data: T[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}