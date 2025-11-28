"use client";

import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { TextShimmer } from "@/components/ui/text-shimmer";

import createAxiosInstance from "@/lib/axiosInstance";
import TeacherRouteGuard from "@/components/route-guards/TeacherRouteGuard";
import ShineBorder from "@/components/ui/shine-border";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  CheckCircle2,
  History,
  Users,
  Calendar,
  Award,
  LucideLoader2,
} from "lucide-react";
import { Toaster } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { BorderBeam } from "@/components/ui/border-beam";

interface SessionData {
  batchId: string;
  date: string;
  time: string;
}

interface BatchData {
  id: string;
  name: string;
}

export default function TeacherHome() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);
  const [navigating, setNavigating] = useState(false);
  const [attending, setAttending] = useState(false);

  const { data: batches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ["teacherBatches"],
    queryFn: () => axios.get("/teacher/api/batches").then((res) => res.data),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["teacherSessions"],
    queryFn: () =>
      axios.get("/teacher/api/sessions").then((res) => res.data.sessions),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const { data: studentCount = 0, isLoading: loadingStudents } = useQuery({
    queryKey: ["studentCount"],
    queryFn: () =>
      axios.get("/api/students/count").then((res) => res.data.count),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const loading = loadingBatches || loadingSessions || loadingStudents;

  const totalBatches = batches.length;
  const totalStudents = studentCount;
  const totalSessions = sessions.length;

  const todayDate = format(new Date(), "yyyy-MM-dd");
  const todaySessions = sessions.filter((s: any) => s.date === todayDate).length;

  const teacherBatchIds = [
    ...new Set(
      sessions
        .slice(0, 10)
        .map((s) => s.batchId)
        .filter((id): id is string => typeof id === "string")
    ),
  ];

  const recentTeacherBatches = batches
    .filter((b) => teacherBatchIds.includes(b.id))
    .slice(0, 3);

  const now = new Date();
  const hour = now.getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  const teacherName = user?.firstName || "Teacher";

  return (
    <TeacherRouteGuard>
      <div className="space-y-6">
        <Toaster position="bottom-right" richColors />
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#0d0d25] dark:to-[#1a1a3d] border-none shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <CardTitle className="text-3xl font-bold">
                  {greeting},{" "}
                  <TextShimmer
                    duration={3}
                    className="
    [--base-color:#4637d2]
    [--base-gradient-color:#00d746]
    dark:[--base-color:#ffffff]
    dark:[--base-gradient-color:#00d746]
  "
                  >
                    {teacherName}!
                  </TextShimmer>
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  {format(now, "EEEE, MMMM d, yyyy")} • {format(now, "h:mm a")}
                </CardDescription>
              </div>

              {/* <div className="mt-4 sm:mt-0">
                {canTakeAttendance ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/teacher/attendance")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Attendance Open Now
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/teacher/attendance")}
                  >
                    Take Attendance
                  </Button>
                )}
              </div> */}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ShineBorder
            borderRadius={9}
            borderWidth={1}
            duration={5}
            color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
            className="block w-full"
          >
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#7c3aed]/10 hover:border-[#7c3aed] text-[#4637d2] hover:text-[#7c3aed] font-semibold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-[#7c3aed]/50 focus-visible:ring-offset-2"
              onClick={() => {
                setAttending(true);
                router.push("/teacher/attendance");
              }}
              disabled={attending}
            >
              {attending ? (
                <>
                  <LucideLoader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Take Attendance
                </>
              )}
            </Button>
          </ShineBorder>

          <Button
            variant="outline"
            onClick={() => {
              setNavigating(true);
              router.push("/teacher/sessions");
            }}
            disabled={navigating}
            className="w-full flex items-center justify-center"
          >
            {navigating ? (
              <>
                <LucideLoader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <History className="mr-2 h-5 w-5" />
                View Past Sessions
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={`skeleton-card-${i + 1}`} className="relative h-28 shadow-sm overflow-hidden">
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2" />
                  </div>
                </Card>
              ))
          ) : (
            <>
              {/* Batches Card */}
              <Card className="relative h-28 overflow-hidden bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300 group">
                <div className="p-5 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Batches
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 leading-none">
                      {totalBatches}
                    </p>
                    <div className="w-2 h-2 rounded-full bg-blue-500 opacity-70"></div>
                  </div>
                </div>
                <BorderBeam
                  duration={6}
                  size={200}
                  className="from-transparent via-blue-500/60 to-transparent opacity-0 group-hover:opacity-100"
                />
              </Card>

              {/* Students Card */}
              <Card className="relative h-28 overflow-hidden bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/10 dark:to-green-950/10 border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-300 group">
                <div className="p-5 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      Students
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 leading-none">
                      {totalStudents}
                    </p>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-70"></div>
                  </div>
                </div>
                <BorderBeam
                  duration={6}
                  delay={1.5}
                  size={200}
                  className="from-transparent via-emerald-500/60 to-transparent opacity-0 group-hover:opacity-100"
                />
              </Card>

              {/* Total Sessions Card */}
              <Card className="relative h-28 overflow-hidden bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/10 dark:to-violet-950/10 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300 group">
                <div className="p-5 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <History className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      Total Sessions
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 leading-none">
                      {totalSessions}
                    </p>
                    <div className="w-2 h-2 rounded-full bg-purple-500 opacity-70"></div>
                  </div>
                </div>
                <BorderBeam
                  duration={6}
                  delay={3}
                  size={200}
                  className="from-transparent via-purple-500/60 to-transparent opacity-0 group-hover:opacity-100"
                />
              </Card>

              {/* Today's Sessions Card */}
              <Card className="relative h-28 overflow-hidden bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-300 group">
                <div className="p-5 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                      Today&apos;s Sessions
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 leading-none">
                      {todaySessions}
                    </p>
                    <div className="w-2 h-2 rounded-full bg-amber-500 opacity-70"></div>
                  </div>
                </div>
                <BorderBeam
                  duration={6}
                  delay={4.5}
                  size={200}
                  className="from-transparent via-amber-500/60 to-transparent opacity-0 group-hover:opacity-100"
                />
              </Card>
            </>
          )}
        </div>

        <Card className="border border-[#333742]/20 dark:border-[#4a4a5a] dark:bg-[#121212]">
          <CardHeader className="border-b border-[#333742]/10">
            <CardTitle className="text-xl flex items-center text-[#333742] dark:text-white">
              <Users className="mr-2 h-5 w-5" />
              Your Recent Batches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`batch-skeleton-${i}`}
                    className="h-12 bg-muted animate-pulse rounded"
                  />
                ))
            ) : (
              <>
                {recentTeacherBatches.length > 0 ? (
                  recentTeacherBatches.map((b: any) => (
                    <Card
                      key={b.id}
                      className="flex justify-between items-center p-4 hover:bg-accent/20 cursor-pointer border border-[#00d746]/20 hover:border-[#00d746]/60 transition-all"
                      onClick={() =>
                        router.push(`/teacher/attendance?batchId=${b.id}`)
                      }
                    >
                      <div className="font-medium">{b.name}</div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {b.studentCount}
                        </span>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No batches found
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TeacherRouteGuard>
  );
}
