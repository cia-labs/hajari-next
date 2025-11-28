import { z } from "zod";


export const createAttendanceSchema = z.object({
    teacher:  z.string().nonempty('teacher name is required'),
    batch:    z.string().nonempty('batch is required'),
    subject:  z.string().nonempty('subject is required'),
    date:     z.string().nonempty('date is required'),
    time:     z
                .string()
                .nonempty('time is required')
                .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'time must be in HH:mm format'),
    students: z
                .array(
                  z.object({
                    student: z.string().nonempty('student is required'),
                    attendanceStatus: z.enum(['present', 'absent'], {
                      errorMap: () => ({ message: 'status should be present or absent' }),
                    }),
                  }),
                )
                .min(1, 'At least one student object required'),
  });
  