export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface TeacherLite {
    id: number;
    name: string;
    role: 'teacher' | 'admin' | string;
}

export interface ClassListRow {
    id: number;
    title: string;
    description?: string | null;
    day_of_week?: DayOfWeek | null;
    starts_time?: string | null;
    ends_time?: string | null;
    capacity?: number | null;
    teacher?: TeacherLite | null;
    created_at?: string;
}

export interface ClassDetail extends ClassListRow {

}

export interface UpsertClassDTO {
    title: string;
    description?: string | null;
    day_of_week?: DayOfWeek | null;
    starts_time?: string | null;
    ends_time?: string | null;
    capacity?: number | null;
    teacher_id?: number | null;
}