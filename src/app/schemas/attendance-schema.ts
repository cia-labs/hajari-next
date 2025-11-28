
import { z } from "zod";

const uuidValidation = z
    .string()
    .uuid("Must be a valid UUID")
    .nonempty("This field is required");

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createAttendanceSchema = z.object({
    teacher: uuidValidation.refine((val) => val.length > 0, {
        message: "teacher name is required",
    }),
    batch: uuidValidation.refine((val) => val.length > 0, {
        message: "batch is required",
    }),
    subject: uuidValidation.refine((val) => val.length > 0, {
        message: "subject is required",
    }),
    date: z
        .string()
        .nonempty("date is required")
        .refine((val) => {
            const date = new Date(val);
            return !isNaN(date.getTime());
        }, "Invalid date format"),
    time: z
        .string()
        .nonempty("time is required")
        .regex(timeRegex, "time must be in HH:mm format"),

    students: z
        .array(
            z.object({
                student: uuidValidation.refine((val) => val.length > 0, {
                    message: "student is required",
                }),
                attendanceStatus: z.enum(["present", "absent"], {
                    errorMap: () => ({
                        message: "status should be present or absent",
                    }),
                }),
            })
        )
        .min(1, "At least one student object required"),
});
