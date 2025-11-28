"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import createAxiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

import AdminRouteGuard from "@/components/route-guards/AdminRouteGuard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Loader2,
  Calendar,
  Clock,
  Users,
  BookOpen,
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
} from "lucide-react";

type RecordRow = {
  id: string;
  studentId?: string;
  studentName?: string;
  attendanceStatus: "present" | "absent";
};

type SessionInfo = {
  date: string;
  time: string;
  batchName?: string;
  subjectName?: string;
};

export default function AttendanceEditPage() {
  const { sessionId, teacherId } = useParams() as {
    teacherId: string;
    sessionId: string;
  };
  const { getToken } = useAuth();
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [edited, setEdited] = useState<Record<string, "present" | "absent">>(
    {}
  );
  const [saving, setSaving] = useState(false);

 const {
    data,
    isLoading: loading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["attendanceSession", sessionId],
    queryFn: () =>
      axios
        .get<{
          success: boolean;
          session: SessionInfo;
          records: RecordRow[];
        }>(`/api/attendance/getAttendanceBySession/${sessionId}`)
        .then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const session = data?.session ?? null;
  const records = data?.records ?? [];


  const merged = useMemo(
    () =>
      records.map((r) => ({
        ...r,
        attendanceStatus: edited[r.id] || r.attendanceStatus,
      })),
    [records, edited]
  );

  const presentCount = merged.filter(
    (r) => r.attendanceStatus === "present"
  ).length;
  const absentCount = merged.length - presentCount;

  const chartData = [
    { name: "Present", value: presentCount },
    { name: "Absent", value: absentCount },
  ];

  const toggle = (id: string, status: "present" | "absent") => {
    setEdited((e) => ({
      ...e,
      [id]:
        status === records.find((r) => r.id === id)?.attendanceStatus
          ? undefined
          : status,
    }));
  };

  async function handleSave() {
    setSaving(true);
    try {
      const updates = merged.map((r) => ({
        id: r.id,
        attendanceStatus: r.attendanceStatus,
      }));
      await axios.post("/api/attendance/bulkUpdateAttendance", {
        sessionId,
        updates,
      });
      toast.success("Attendance updated successfully!");
      setEdited({});

      queryClient.invalidateQueries({
        queryKey: ["attendanceSession", sessionId],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  const attendancePercentage = records.length
    ? Math.round((presentCount / records.length) * 100)
    : 0;

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "ST"
    );
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 85) return { label: "Excellent", color: "bg-[#00d746]" };
    if (percentage >= 75) return { label: "Good", color: "bg-[#4637d2]" };
    if (percentage >= 65) return { label: "Average", color: "bg-amber-500" };
    return { label: "Poor", color: "bg-red-500" };
  };

  const status = getAttendanceStatus(attendancePercentage);

  return (
    <AdminRouteGuard>
      <div className="space-y-6 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto bg-white dark:bg-[#0d0d0d]">
        <div className="bg-gradient-to-r from-[#4637d2]/90 to-[#4637d2]/70 rounded-lg shadow-md p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Attendance Management
            </h1>
            <p className="text-white/90">
              Edit and update student attendance records
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border border-[#00d746]/20 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#4637d2]/10 to-[#4637d2]/5 px-6 py-4 border-b border-[#00d746]/10">
                <CardTitle className="text-xl text-[#4637d2]">
                  Session Details
                </CardTitle>
                <CardDescription>
                  {session?.batchName} - {session?.subjectName}
                </CardDescription>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#4637d2]/10 mr-4">
                      <Calendar className="h-6 w-6 text-[#4637d2]" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Date</p>
                      <p className="font-medium text-lg">{session?.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#4637d2]/10 mr-4">
                      <Clock className="h-6 w-6 text-[#4637d2]" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Time</p>
                      <p className="font-medium text-lg">{session?.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#4637d2]/10 mr-4">
                      <Users className="h-6 w-6 text-[#4637d2]" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Batch</p>
                      <p className="font-medium text-lg">
                        {session?.batchName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#4637d2]/10 mr-4">
                      <BookOpen className="h-6 w-6 text-[#4637d2]" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Subject</p>
                      <p className="font-medium text-lg">
                        {session?.subjectName}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#00d746]/20 shadow-sm">
              <CardHeader className="pb-2 border-b border-[#00d746]/10">
                <CardTitle className="text-xl text-[#4637d2]">
                  Attendance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col justify-center items-center p-4">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e5e5"
                          strokeWidth="8"
                        />

                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#progressGradient)"
                          strokeWidth="9"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 45 * (1 - attendancePercentage / 100)
                          }`}
                          transform="rotate(-90 50 50)"
                        />

                        <defs>
                          <linearGradient
                            id="progressGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#4637d2" />
                            <stop offset="100%" stopColor="#00d746" />
                          </linearGradient>
                        </defs>
                      </svg>

                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-4xl font-bold">
                          {attendancePercentage}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Attendance
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <Badge className={`${status.color} text-white px-3 py-1`}>
                        {status.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 flex flex-col justify-center">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Total Students
                        </span>
                        <span className="font-medium text-[#4637d2]">
                          {records.length}
                        </span>
                      </div>
                      <Progress
                        value={100}
                        max={100}
                        className="h-2 bg-muted"
                        indicatorClassName="bg-[#4637d2]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Present</span>
                        <span className="font-medium text-[#00d746]">
                          {presentCount}
                        </span>
                      </div>
                      <Progress
                        value={presentCount}
                        max={records.length}
                        className="h-2 bg-muted"
                        indicatorClassName="bg-[#00d746]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Absent</span>
                        <span className="font-medium text-red-500">
                          {absentCount}
                        </span>
                      </div>
                      <Progress
                        value={absentCount}
                        max={records.length}
                        className="h-2 bg-muted"
                        indicatorClassName="bg-red-500"
                      />
                    </div>
                  </div>

                  <div className="h-48 md:h-auto flex items-center justify-center">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          dataKey="value"
                          data={chartData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell key="present" fill="#00d746" />
                          <Cell key="absent" fill="#4637d2" />
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} students`, null]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => {
                            return (
                              <span className="text-sm font-medium">
                                {value}
                              </span>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#00d746]/20 shadow-sm">
              <CardHeader className="pb-2 border-b border-[#00d746]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl text-[#4637d2]">
                    Student Attendance
                  </CardTitle>
                  <CardDescription>
                    {records.length} students in total
                  </CardDescription>
                </div>
                {/* <Button
      onClick={handleSave}
      disabled={saving}
      size="sm"
      className="bg-[#4637d2] hover:bg-[#3a2db0] text-white"
    >
      {saving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Saving...
        </>
      ) : (
        "Save Changes"
      )}
    </Button> */}
              </CardHeader>

              <div className="overflow-x-auto w-full">
                <div className="min-w-[700px]">
                  <Table>
                    <TableHeader className="bg-[#4637d2]/5 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead className="w-32 text-center">
                          Status
                        </TableHead>
                        <TableHead className="w-48 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {merged.map((record, index) => (
                        <TableRow key={record.id} className="hover:bg-slate-50">
                          <TableCell className="text-center font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8 bg-[#4637d2]/10">
                                <AvatarFallback className="text-[#4637d2]">
                                  {getInitials(record.studentName || "")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">
                                {record.studentName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={
                                record.attendanceStatus === "present"
                                  ? "bg-[#00d746] hover:bg-[#00d746]/90 text-white"
                                  : "bg-red-500 hover:bg-red-600 text-white"
                              }
                            >
                              {record.attendanceStatus === "present"
                                ? "Present"
                                : "Absent"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              defaultValue={record.attendanceStatus}
                              onValueChange={(value) =>
                                toggle(record.id, value as "present" | "absent")
                              }
                            >
                              <SelectTrigger className="w-[130px] h-9 border-[#4637d2]/30 focus:border-[#4637d2] focus:ring-[#4637d2]/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">
                                  <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2 text-[#00d746]" />
                                    Present
                                  </div>
                                </SelectItem>
                                <SelectItem value="absent">
                                  <div className="flex items-center">
                                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                    Absent
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <CardFooter className="flex flex-col sm:flex-row justify-between p-4 border-t border-[#00d746]/10 gap-4">
                <div className="text-sm text-muted-foreground">
                  Total students:{" "}
                  <span className="font-medium">{records.length}</span>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#4637d2] hover:bg-[#3a2db0] text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </AdminRouteGuard>
  );
}
