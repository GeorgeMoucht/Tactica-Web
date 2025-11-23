export interface GuardianListRow {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    students_count: number;
    created_at?: string
}

export interface GuardianStudentRef {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
}

export interface GuardianDetail {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: {
        street?: string;
        city?: string;
        zip?: string;
    };

    notes?: string | null;
    students: GuardianStudentRef[];
}