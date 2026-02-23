export interface AttendanceHistorySession {
  session_id: number;
  date: string;
  starts_time: string;
  ends_time: string;
  conducted_by_name: string | null;
  present_count: number;
  absent_count: number;
  attendances: SessionAttendanceRecord[];
}

export interface SessionAttendanceRecord {
  student_id: number;
  student_name: string;
  status: 'present' | 'absent';
}

export interface AttendanceSummary {
  class_id: number;
  class_title: string;
  total_sessions: number;
  students: StudentAttendanceSummary[];
}

export interface StudentAttendanceSummary {
  student_id: number;
  student_name: string;
  total_present: number;
  total_absent: number;
  attendance_rate: number;
}
