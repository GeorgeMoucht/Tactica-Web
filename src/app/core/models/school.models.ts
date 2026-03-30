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

export interface InstructorHoursDetail {
    instructor_id: number;
    instructor_name: string;
    intructor_name: string;
    total_hours: number;
    session_count: number;
    classes_taught: string[];
}

export interface TodayAttendance {
    present: number;
    enrolled: number;
}

export interface DashboardStats {
    active_learners: number;
    today_attendance: TodayAttendance;
    session_today: number;
    entrollments_this_month: number;
}

export interface OutstandingInfo {
    total_amount: number;
    students_count: number;
}

export interface ClassCapacityInfo {
    id: number;
    title: string;
    capacity: number;
    enrolled: number;
    percentage: number;
}

export interface RecentRegistrationStudent {
    id: number;
    name: string;
}

export interface RecentRegistration {
    id: number;
    created_at: string;
    guardian_id: number | null;
    guardian_name: string | null;
    students: RecentRegistrationStudent[];
}

export interface DashboardWidgets {
    stats: DashboardStats;
    outstanding: OutstandingInfo;
    class_capacity: ClassCapacityInfo[];
    workshop_capacity: ClassCapacityInfo[];
    recent_registrations: RecentRegistration[];
}

export interface FinancialOverview {
    revenue_this_month: number;
    expenses_this_month: number;
    balance: number;
    outstanding_total: number;
    outstanding_count: number;
}

export interface MonthlyRevenueRow {
    year: number;
    month: number;
    month_label: string;
    paid: number;
    pending: number;
    total: number;
}

export interface ExpenseCategorySummary {
    category: string;
    amount: number;
}

export interface ExpensesSummary {
    total: number;
    paid: number;
    pending_amount: number;
    pending_count: number;
    by_category: ExpenseCategorySummary[];
}

export interface DashboardFinancials {
    overview: FinancialOverview;
    monthly_revenue: MonthlyRevenueRow[];
    expenses_summary: ExpensesSummary;
}