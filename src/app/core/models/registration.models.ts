import { Address, ContactPref, Interest, Level } from './student.models';

export interface GuardianDTO {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address?: Address;
    preferred_contact?: ContactPref;
    notes?: string;
    newsletter_consent?: boolean;
}

export interface CreateRegistrationDTO {
    guardian: GuardianDTO;
    students: Array<{
        first_name: string;
        last_name: string;
        birthdate: string; // yyyy-mm-dd
        email?: string;
        phone?: string;
        address?: Address;
        level?: Level;
        interests?: Interest[];
        notes?: string;
        medical_note?: string;
        consent_media?: boolean;
    }>;
    guardian_is_student?: boolean;
}

export interface RegistrationCreatedPayload {
    guardian_id: number;
    student_ids: number[];
}

export interface RegistrationListItem {
    id: number;
    created_at: string;
    guardian_name: string;
    guardian_phone?: string;
    guardian_email?: string;
    student_summary: string;
}