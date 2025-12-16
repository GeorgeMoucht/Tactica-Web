export type ContactPref = 'email' | 'sms' | 'phone';
export type Interest = 'painting' | 'ceramics' | 'drawing';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Address {
    street?: string;
    city?: string;
    zip?: string;
}

export interface GuardianDTO {
    name: string;
    relation: string; // Πατέρας/μητέρα/κηδεμόνας
    phone: string;
    email?: string;
    address?: Address;
}

export interface ConsentsDTO {
    communication?: boolean; // consent to be contacted
    media?: boolean; // consent for photos/works usage
    medical_note?: string; // optional notes
}

export interface AvailabilityDTO {
    weekday: number;    // 0-6 (Sunday = 0)
    start: string;      // HH::mm
    end: string;        // HH::mm
}

export interface CreateStudentDTO {
    name: string;
    birthdate: string;          // ISO yyyy-mm-dd
    email?: string;
    phone?: string;
    address?: Address;
    preferred_contact?: ContactPref;
    interests?: Interest[];
    level?: Level;
    notes?: string;

    guardians?: GuardianDTO[]; // required if minor (backend will enforce)
    consents?: ConsentsDTO;
    availability?: AvailabilityDTO[];
}

export interface StudentMinimal {
    id: number;
    name: string;
    email?: string;
    phone?: string;
}

export interface StudentListRow {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | null;
    is_member?: boolean;
    created_at?: string;
}

export interface GuardianBasic {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    preferred_contact?: string | null;
    address?: Address | null;
}

// core/models/student.models.ts
export interface StudentDetail {
    id: number;
    first_name?: string;
    last_name?: string;

    name: string;
    birthdate?: string;
    email?: string;
    phone?: string;

    is_member?: boolean;

    address?: Address;
    level?: Level | null;
    interests?: Interest[];
    notes?: string;
    medical_note?: string;
    consent_media?: boolean;

    guardians?: GuardianBasic[];
    created_at?: string;
    updated_at?: string;
}


export interface UpdateStudentDTO {
    first_name: string;
    last_name: string;
    birthdate?: string | null;         // 'YYYY-MM-DD'
    registration_date?: string | null;
    email?: string | null;
    phone?: string | null;
    is_member?: boolean;
    address?: Address | null;
    level?: Level | null;
    interests?: Interest[] | null;
    notes?: string | null;
    medical_note?: string | null;
    consent_media: boolean;
}