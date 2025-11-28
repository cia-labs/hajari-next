  "use client";

  import { useState, useMemo } from "react";
  import { useQuery } from "@tanstack/react-query";
  import { useAuth } from "@clerk/nextjs";
  import createAxiosInstance from "@/lib/axiosInstance";
  import StudentRouteGuard from "@/components/route-guards/StudentRouteGuard";
  import { CalendarIcon } from "lucide-react";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { Alert, AlertDescription } from "@/components/ui/alert";
  // import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
  import StudentProfile from "@/app/(user)/student/Profile/page";
  import AttendanceSummary from "@/app/(user)/student/attendance-summary/page";
  import AttendanceStatistics from "@/app/(user)/student/attendance-statistics/page";
  import AttendanceHistory from "@/app/(user)/student/attendance-history/page";
  import { Toaster } from "sonner";

  import type {
    Student,
    AttendanceSummary as SummaryType,
  } from "./types/student/route";

  export default function StudentDashboard() {
    const { getToken } = useAuth();
    const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);
    const [activeTab, setActiveTab] = useState("summary");


    const {
      data: profileData,
      isLoading: loadingProfile,
      error: errorProfile,
    } = useQuery({
      queryKey: ["studentProfile"],
      queryFn: async () => {
        const res = await axios.get("/api/students/profile");
        if (res.data?.success) return res.data.student;
        throw new Error(res.data?.error || "Failed to fetch profile");
      },
      staleTime: 1000 * 60 * 5,
    });

    const {
      data: summaryData,
      isLoading: loadingSummary,
      error: errorSummary,
    } = useQuery({
      queryKey: ["attendanceSummary"],
      queryFn: async () => {
        const res = await axios.get("/api/students/attendance-summary");
        if (res.data?.success) return res.data.summary;
        throw new Error(res.data?.error || "Failed to fetch summary");
      },
      staleTime: 1000 * 60 * 5,
    });

    const loading = loadingProfile || loadingSummary;
    const error = errorProfile?.message || errorSummary?.message || "";

    return (
      <StudentRouteGuard>
        <div className="container mx-auto py-1 space-y-6">
          <Toaster position="bottom-right" richColors />
          {/* <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/student" isActive>
              My Attendance
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb> */}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <StudentProfile profile={profileData} loading={loading} />

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Summary
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="space-y-6 mt-6">
                <AttendanceSummary summary={summaryData} loading={loading} />
                <AttendanceStatistics summary={summaryData} loading={loading} />
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <AttendanceHistory
                subjects={summaryData?.subjects || []}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </StudentRouteGuard>
    );
  }
