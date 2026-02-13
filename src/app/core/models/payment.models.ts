export type MonthlyDueStatus = 'pending' | 'paid' | 'waived' | 'cancelled';

export interface MonthlyDueClass {
    id: number;
    title: string;
}

export interface MonthlyDue {
    id: number;
    student_id: number;
    class_id: number;
    period_year: number;
    period_month: number;
    period_label: string;
    amount: number;
    status: MonthlyDueStatus;
    paid_at: string | null;
    notes: string | null;
    class?: MonthlyDueClass;
}

export interface OutstandingDue {
    id: number;
    period: string;
    amount: number;
    class: MonthlyDueClass;
}

export interface RegistrationStatus {
    status: 'active' | 'inactive' | 'expired';
    expires_at: string | null;
}

export interface PaymentSummary {
    student_id: number;
    total_paid: number;
    total_outstanding: number;
    registration: RegistrationStatus | null;
    outstanding_dues: OutstandingDue[];
}
