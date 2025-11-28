export interface Batch {
    _id: string;
    name: string;
  }
  
  export interface Student {
    _id: string;
    name: string;
    email: string;
    usnNumber: string;
    active: boolean;
    batches?: Batch[];
  }
  
  export interface SubjectStats {
    present: number;
    absent: number;
    total: number;
    percentage: number;
  }
  
  export interface SubjectAttendance {
    subjectId: string;
    subjectName: string;
    stats: SubjectStats;
  }
  
  export interface OverallAttendance {
    present: number;
    total: number;
    percentage: number;
  }
  
  export interface AttendanceSummary {
    overallAttendance: OverallAttendance;
    subjects: SubjectAttendance[];
  }
  
  export interface Teacher {
    _id: string;
    name: string;
  }
  
  export interface Subject {
    _id: string;
    name: string;
  }
  
  export interface AttendanceRecord {
    _id: string;
    date: string;
    time: string;
    subject: Subject;
    teacher: Teacher;
    attendanceStatus: 'present' | 'absent';
  }
  
  export interface AttendanceHistory {
    records: AttendanceRecord[];
    pagination: {
      page: number;
      pages: number;
      total: number;
    };
  }
  
  export interface AttendanceHistoryFilters {
    subjectId: string;
    fromDate: string;
    toDate: string;
  }