import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { PaginatedResponse } from "../models/pagination";
import { Expense, ExpenseCategory, UpsertExpenseDTO } from "../models/expense.models";

@Injectable({ providedIn: 'root' })
export class ExpenseService {
    private api = inject(ApiService);

    // Categories
    getCategories(): Observable<ExpenseCategory[]> {
        return this.api.get<ExpenseCategory[]>('/expense-categories');
    }

    createCategory(name: string): Observable<ExpenseCategory> {
        return this.api.post<ExpenseCategory>('/expense-categories', { name });
    }

    updateCategory(id: number, name: string): Observable<ExpenseCategory> {
        return this.api.put<ExpenseCategory>(`/expense-categories/${id}`, { name });
    }

    deleteCategory(id: number): Observable<void> {
        return this.api.del<void>(`/expense-categories/${id}`);
    }

    // Expenses
    list(params: {
        query?: string;
        page?: number;
        pageSize?: number;
        category_id?: number;
        status?: string;
        date_from?: string;
        date_to?: string;
        sortField?: string;
        sortOrder?: number;
    }) {
        const q = new URLSearchParams();
        if (params.query) q.set('query', params.query);
        if (params.page) q.set('page', String(params.page));
        if (params.pageSize) q.set('pageSize', String(params.pageSize));
        if (params.category_id !== undefined && params.category_id !== null) q.set('category_id', String(params.category_id));
        if (params.status) q.set('status', params.status);
        if (params.date_from) q.set('date_from', params.date_from);
        if (params.date_to) q.set('date_to', params.date_to);
        if (params.sortField) {
            q.set('sort_by', params.sortField);
            q.set('sort_order', params.sortOrder === 1 ? 'asc' : 'desc');
        }

        const qs = q.toString() ? `?${q.toString()}` : '';
        return this.api.get<PaginatedResponse<Expense>>(`/expenses${qs}`, { unwrap: false });
    }

    get(id: number): Observable<Expense> {
        return this.api.get<Expense>(`/expenses/${id}`);
    }

    create(dto: UpsertExpenseDTO): Observable<Expense> {
        return this.api.post<Expense>('/expenses', dto);
    }

    update(id: number, dto: Partial<UpsertExpenseDTO>): Observable<Expense> {
        return this.api.put<Expense>(`/expenses/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.api.del<void>(`/expenses/${id}`);
    }

    markAsPaid(id: number): Observable<Expense> {
        return this.api.patch<Expense>(`/expenses/${id}/pay`, {});
    }
}
