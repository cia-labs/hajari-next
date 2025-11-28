"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import createAxiosInstance from "@/lib/axiosInstance";

import TeacherRouteGuard from "@/components/route-guards/TeacherRouteGuard";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNowStrict, parseISO, format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  Calendar,
  ChevronLeft,
  Users,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Pencil,
  Save,
  XCircle as Cancel,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SessionDetail() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [map, setMap] = useState<Record<string, string>>({});

  const { getToken } = useAuth();
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["sessionDetail", sessionId],
    queryFn: () =>
      axios.get(`/teacher/api/sessions/${sessionId}`).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!data) return;

    const first = data.records[0];
    const batchName =
      data.session?.batch?.name ?? first?.batch?.name ?? "Unknown Batch";
    const subjectName =
      data.session?.subject?.name ?? first?.subject?.name ?? "Unknown Subject";

    setSessionInfo({
      ...data.session,
      batch: { name: batchName },
      subject: { name: subjectName },
    });

    setMap(
      Object.fromEntries(
        data.records.map((x: any) => [x.studentId, x.attendanceStatus])
      )
    );
  }, [data]);

  const age = data?.records?.[0]
  ? Date.now() - new Date(data.records[0].createdAt).getTime()
  : Infinity;
  const canEdit = age < 24 * 60 * 60 * 1000;

  const totalStudents = data?.records.length ?? 0;
  const presentCount = data?.records.filter(
    (r) => r.attendanceStatus === "present"
  ).length;
  const absentCount = totalStudents - presentCount;
  const attendanceRate =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  async function saveEdits() {
    try {
      await axios.patch(`/teacher/api/sessions/${sessionId}`, {
        updates: Object.entries(map).map(([sid, status]) => ({
          studentId: sid,
          status,
        })),
      });
      toast.success("Attendance records updated successfully!");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["sessionDetail", sessionId] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update attendance");
    }
  }

  if (loading) {
    return (
      <TeacherRouteGuard>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Loading session data...</p>
          </div>
        </div>
      </TeacherRouteGuard>
    );
  }

  return (
    <TeacherRouteGuard>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/teacher/sessions")}
            className="mr-2 text-[#4637d2] hover:bg-[#4637d2]/10"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Sessions
          </Button>
        </div>

        <Card className="border border-[#00d746]/20 hover:border-[#00d746]/40 transition-colors">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-[#4637d2]" />
                  <CardTitle className="text-xl">
                    Attendance Session Details
                  </CardTitle>
                </div>

                <CardDescription className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-[#4637d2]" />
                    {sessionInfo?.date &&
                      format(parseISO(sessionInfo.date), "dd MMMM yyyy")}
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-[#4637d2]" />
                    {sessionInfo?.time &&
                      format(
                        new Date(`1970-01-01T${sessionInfo.time}`),
                        "hh:mm a"
                      )}
                  </div>

                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-[#4637d2]" />
                    {totalStudents} Students
                  </div>

                  {data?.records[0]?.createdAt && (
                    <Badge
                      variant="outline"
                      className="border-[#4637d2]/30 bg-[#4637d2]/5"
                    >
                      Recorded{" "}
                      {formatDistanceToNowStrict(parseISO(data.records[0].createdAt))}{" "}
                      ago
                    </Badge>
                  )}
                </CardDescription>
              </div>

              {canEdit && (
                <Button
                  variant={editing ? "outline" : "default"}
                  onClick={() => setEditing((e) => !e)}
                  className={`gap-1 ${
                    editing
                      ? "border-[#4637d2]/30 hover:bg-[#4637d2]/10"
                      : "bg-[#4637d2] hover:bg-[#4637d2]/90"
                  }`}
                >
                  {editing ? (
                    <>
                      <Cancel className="h-4 w-4" />
                      Cancel Edits
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4" />
                      Edit Attendance
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>

          <Separator className="bg-[#00d746]/10" />

          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Card className="flex-1 border-[#00d746]/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#4637d2]" />
                      {sessionInfo?.batch?.name || "Unknown Batch"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm">Class Batch</p>
                  </CardContent>
                </Card>

                <Card className="flex-1 border-[#00d746]/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#4637d2]" />
                      {sessionInfo?.subject?.name || "Unknown Subject"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm">Subject</p>
                  </CardContent>
                </Card>

                <Card className="flex-1 border-[#00d746]/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#00d746]" />
                      {presentCount} Present
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {attendanceRate}% Present
                      </span>
                      <span className="text-muted-foreground">
                        {absentCount} Absent
                      </span>
                    </div>
                    <Progress
                      value={attendanceRate}
                      className="h-2 bg-[#00d746]/10"
                      indicatorClassName="bg-[#00d746]"
                    />
                  </CardContent>
                </Card>
              </div>

              {!canEdit && !editing && (
                <Alert
                  variant="warning"
                  className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Attendance records can only be edited within 24 hours of
                    creation.
                  </AlertDescription>
                </Alert>
              )}

              <div className="w-full overflow-x-auto">
                <div className="min-w-[700px]">
                  <ScrollArea className="h-96 rounded-md border border-[#00d746]/20">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead className="text-right">
                            Attendance Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.records
                          .filter((r) => r.student)
                          .map((r, index) => (
                            <TableRow
                              key={r.studentId}
                              className="hover:bg-[#00d746]/5"
                            >
                              <TableCell className="font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8 bg-[#4637d2]/10">
                                    <AvatarFallback className="text-[#4637d2]">
                                      {(r.student?.name ?? "??")
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{r.student?.name ?? "Unknown"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {editing ? (
                                  <Select
                                    value={map[r.studentId]}
                                    onValueChange={(v) =>
                                      setMap((m) => ({
                                        ...m,
                                        [r.studentId]: v,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="w-32 ml-auto border-[#00d746]/20 focus:border-[#00d746]/60">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="present">
                                        Present
                                      </SelectItem>
                                      <SelectItem value="absent">
                                        Absent
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    {r.attendanceStatus === "present" ? (
                                      <>
                                        <span className="text-[#00d746] font-medium">
                                          PRESENT
                                        </span>
                                        <CheckCircle2 className="h-5 w-5 text-[#00d746]" />
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-red-600 font-medium">
                                          ABSENT
                                        </span>
                                        <XCircle className="h-5 w-5 text-red-600" />
                                      </>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </CardContent>

          {editing && (
            <CardFooter className="border-t p-4 flex justify-end border-[#00d746]/10">
              <Button
                onClick={saveEdits}
                disabled={loading}
                className="gap-2 bg-[#4637d2] hover:bg-[#4637d2]/90"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </TeacherRouteGuard>
  );
}
