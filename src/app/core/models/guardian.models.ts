// export interface GuardianListRow {
//     id: number;
//     name: string;
//     email?: string | null;
//     phone?: string | null;
//     students_count: number;
//     created_at?: string | null;
// }

export interface GuardianListRow {
    id: number;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
    students_count: number;
    created_at?: string | null;

    // Keep also the fullname if we want it
    name?: string;
}

// Student entry inside a Guardian detail
export interface GuardianStudentForDetail {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
}

// Full detail for one guardian
export interface GuardianDetail {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;

    address?: {
        street?: string | null;
        city?: string | null;
        zip?: string | null;
    } | null;

    preferred_contract?: 'email' | 'sms' | 'phone' | null;
    notes?: string | null;
    newsletter_consent?: boolean;

    students: GuardianStudentForDetail[];
}