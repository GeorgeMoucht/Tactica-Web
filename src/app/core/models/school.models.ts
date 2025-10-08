export type AgeGroup = 'kids' | 'teens' | 'adults' | 'seniors';

export type Discipline = 'painting' | 'ceramics' | 'drawing';

export interface Instructor {
    id : number;
    name: string;
    email?: string;
    phone?: string;
    specialities: Discipline[];
    hourly_rate?: number;
    active: boolean;
}

export interface Learner {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    age_group: AgeGroup;
    active: boolean;
}

export interface Course {
    id: number;
    title: string;
    discipline: Discipline;
    level: 'beginner' | 'intermediate' | 'advanced';
    group_size?: number;
    duration_minutes?: number;
    active: boolean;
}

export interface Session {
    id: number;
    course: Pick<Course, 'id' | 'title' | 'discipline'>;
    instructor: Pick<Instructor, 'id' | 'name'>;
    lerners: Array<Pick<Learner, 'id' | 'name'>>;
    starts_at: string;
    ends_at: string;
    room?: string;
    status: 'scheduled' | 'completed' | 'canceled';
}

export interface WeeklyInstructorHours {
    instructor_id: number;
    intructor_name: string;
    hours: number;
}

export interface DashboardStats { 
    active_learners: number;
    active_instructors: number;
    session_today: number;
    entrollments_this_month: number;
}