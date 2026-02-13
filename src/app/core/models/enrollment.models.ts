export type EnrollmentStatus = 'active' | 'withdrawn';

export interface EnrollmentTeacher {
    id: number;
    name: string;
}

export interface EnrollmentClass {
    id: number;
    title: string;
    type: 'weekly' | 'workshop';
    active: boolean;
    day_of_week?: number | null;
    starts_time?: string | null;
    ends_time?: string | null;
    capacity?: number | null;
    teacher?: EnrollmentTeacher | null;
}

export interface EnrollmentStudent {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
}

export interface Enrollment {
    id: number;
    student_id: number;
    class_id: number;
    status: EnrollmentStatus;
    enrolled_at: string;
    withdrawn_at?: string | null;
    notes?: string | null;
    discount_percent?: number | null;
    discount_amount?: number | null;
    discount_note?: string | null;
    effective_price?: number | null;
    created_at?: string;
    updated_at?: string;
    student?: EnrollmentStudent;
    course_class?: EnrollmentClass;
}

export interface CreateEnrollmentPayload {
    class_id: number;
    enrolled_at?: string;
    notes?: string;
    discount_percent?: number;
    discount_amount?: number;
    discount_note?: string;
}

export interface UpdateDiscountPayload {
    discount_percent?: number;
    discount_amount?: number;
    discount_note?: string;
}
