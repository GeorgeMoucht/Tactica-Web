// Corresponds to TodaySessionResource (backend)
export interface TodaySession {
  id: number;
  class_id: number;
  date: string;                  // 'YYYY-MM-DD'
  starts_time: string;           // 'HH:MM'
  ends_time: string;             // 'HH:MM'
  class_title: string;
  teacher_name: string | null;
  conducted_by_name: string | null;
  enrolled_count: number;
  attended_count: number;
}

// Teacher option for conductor dropdown
export interface TeacherOption {
  id: number;
  name: string;
}

// Corresponds to AttendanceRosterResource (backend)
export type AttendanceStatus = 'present' | 'absent';

export interface RosterStudent {
  student_id: number;
  name: string;
  attendance_status: AttendanceStatus | null;  // null = not marked yet
  has_debt: boolean;
  outstanding_amount: number;
}

export interface DebtSummaryItem {
  student_id: number;
  name: string;
  outstanding_amount: number;
}

export interface SessionInfo {
  id: number;
  date: string;
  class_title: string;
  teacher_name: string | null;
  teacher_id: number | null;
  conducted_by: number | null;
  conducted_by_name: string | null;
}

export interface AttendanceRoster {
  session: SessionInfo;
  teachers: TeacherOption[];
  debt_summary: DebtSummaryItem[];
  students: RosterStudent[];
}

// POST payload
export interface AttendanceEntry {
  student_id: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface StoreAttendancePayload {
  conducted_by: number;
  attendances: AttendanceEntry[];
}
