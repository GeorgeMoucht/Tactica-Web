export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ClassType = 'weekly' | 'workshop';

export interface TeacherLite {
    id: number;
    name: string;
    role: 'teacher' | 'admin' | string;
}

export interface ClassSession {
    id?: number;
    date: string;         // 'YYYY-MM-DD'
    starts_time: string;  // 'HH:MM'
    ends_time: string;    // 'HH:MM'
}

export interface ClassListRow {
    id: number;
    title: string;
    type: ClassType;
    active: boolean;
    description?: string | null;
    day_of_week?: DayOfWeek | null;
    starts_time?: string | null;
    ends_time?: string | null;
    capacity?: number | null;
    monthly_price?: number | null;
    teacher?: TeacherLite | null;
    created_at?: string;
}

export interface ClassDetail extends ClassListRow {
    sessions: ClassSession[];
    updated_at?: string;
}

export interface UpsertClassDTO {
    title: string;
    type?: ClassType;
    description?: string | null;
    day_of_week?: DayOfWeek | null;
    starts_time?: string | null;
    ends_time?: string | null;
    capacity?: number | null;
    monthly_price?: number | null;
    teacher_id?: number | null;
    active?: boolean;
    sessions?: ClassSession[];
}
