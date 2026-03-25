export type ExpenseStatus = 'pending' | 'paid';

export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
  paid_at: string | null;
  notes: string | null;
  expense_category_id: number | null;
  category?: ExpenseCategory | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpsertExpenseDTO {
  description: string;
  amount: number;
  date: string;
  expense_category_id?: number | null;
  status?: ExpenseStatus;
  notes?: string | null;
}
