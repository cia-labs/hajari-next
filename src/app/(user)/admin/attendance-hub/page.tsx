"use client";

import { useEffect, useState } from "react";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import AdminRouteGuard from "@/components/route-guards/AdminRouteGuard";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  Calendar,
  ChevronRight,
  LucideLoader2,
  User,
  GraduationCap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

interface Student {
  name: string;
  usnNumber: string;
  email: string;
  subjects: {
    [key: string]: {
      stats: {
        total: number;
        present: number;
        percentage: number;
      };
    };
  };
}

export default function AttendanceDashboardPage() {
  const [attendance, setAttendance] = useState<Student[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingStudent, setDownloadingStudent] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchAttendance();
  }, [dateRange, searchQuery, pagination.currentPage]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.currentPage,
        limit: pagination.limit,
        ...(searchQuery && { searchQuery }),
        ...(dateRange && {
          startDate: dateRange.from.toISOString().split("T")[0],
          endDate: dateRange.to.toISOString().split("T")[0],
        }),
      };

      const res = await axios.get("/api/attendances/master-report", {
        params,
        withCredentials: true,
      });

      setAttendance(res.data.attendance);
      setPagination({
        currentPage: res.data.pagination.currentPage,
        totalPages: res.data.pagination.pages,
        limit: res.data.pagination.limit,
      });
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    setDownloadingAll(true);
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.set("startDate", dateRange.from.toISOString().split("T")[0]);
        params.set("endDate", dateRange.to.toISOString().split("T")[0]);
      }
      if (searchQuery) {
        params.set("searchQuery", searchQuery);
      }

      const res = await axios.get(
        `/api/attendances/report?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `attendance-report-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloadingAll(false);
    }
  };

  const downloadStudentCSV = async (student: Student) => {
    setDownloadingStudent(true);
    try {
      const csvHeaders = [
        "Name",
        "USN",
        "Email",
        "Subject",
        "Present",
        "Absent",
        "Total",
        "Percentage",
      ];

      let csvContent = csvHeaders.join(",") + "\n";

      Object.entries(student.subjects).forEach(([subject, data]) => {
        const row = [
          `"${student.name}"`,
          `"${student.usnNumber}"`,
          `"${student.email}"`,
          `"${subject}"`,
          data.stats.present,
          data.stats.total - data.stats.present,
          data.stats.total,
          `${data.stats.percentage}%`,
        ];
        csvContent += row.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${student.name.replace(/\s+/g, "_")}_${
          student.usnNumber
        }_attendance.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Student download error:", err);
    } finally {
      setDownloadingStudent(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 85) return { label: "Excellent", color: "bg-[#00d746]" };
    if (percentage >= 75) return { label: "Good", color: "bg-[#4637d2]" };
    if (percentage >= 65) return { label: "Average", color: "bg-amber-500" };
    return { label: "Poor", color: "bg-red-500" };
  };

  const getOverallAttendance = (student: Student) => {
    let totalClasses = 0;
    let totalPresent = 0;

    Object.values(student.subjects).forEach((subject) => {
      totalClasses += subject.stats.total;
      totalPresent += subject.stats.present;
    });

    return totalClasses > 0
      ? Math.round((totalPresent / totalClasses) * 1000) / 10
      : 0;
  };

  const openStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <AdminRouteGuard>
      <div className="space-y-6 px-1 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-[#4637d2]/90 to-[#4637d2]/70 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Master Attendance Dashboard
          </h1>
          <p className="text-white/90">
            Comprehensive view of student attendance records
          </p>
        </div>

        <Card className="border border-[#00d746]/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, USN or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[#4637d2]/30 focus:border-[#4637d2] focus:ring-[#4637d2]/20"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full md:w-auto">
                <CalendarDateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                />

                <Button
                  variant="outline"
                  onClick={downloadCSV}
                  disabled={downloadingAll}
                  className="border-[#00d746]/40 hover:border-[#00d746]/80 hover:bg-[#00d746]/10 text-[#4637d2]"
                >
                  {downloadingAll ? (
                    <>
                      <LucideLoader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Full Attendance
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="border border-[#00d746]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : attendance.length > 0 ? (
            attendance.map((student, index) => {
              const overallPercentage = getOverallAttendance(student);
              const status = getAttendanceStatus(overallPercentage);

              return (
                <Card
                  key={index}
                  className="cursor-pointer hover:bg-accent/50 transition-colors border border-[#00d746]/20 hover:border-[#00d746]/60"
                  onClick={() => openStudentDetails(student)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12    ">
                        <AvatarFallback>
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-medium text-lg">{student.name}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <User className="h-3.5 w-3.5 mr-1 text-[#4637d2]" />
                            {student.usnNumber}
                          </span>
                          <span className="hidden sm:inline-block">•</span>
                          <span className="flex items-center">
                            <GraduationCap className="h-3.5 w-3.5 mr-1 text-[#4637d2]" />
                            {Object.keys(student.subjects).length} subjects
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-lg font-semibold">
                          {overallPercentage}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Overall Attendance
                        </span>
                      </div>

                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>

                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border border-[#00d746]/20">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <Calendar className="h-12 w-12 text-[#4637d2]/50 mb-3" />
                <h3 className="text-lg font-medium">
                  No attendance records found
                </h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your search criteria or date range
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {!loading && attendance.length > 0 && (
          <div className="flex items-center justify-between px-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="border-[#4637d2]/30 hover:border-[#4637d2]/60"
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="border-[#4637d2]/30 hover:border-[#4637d2]/60"
            >
              Next
            </Button>
          </div>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          {selectedStudent && (
            <DialogContent className="w-[95vw] sm:max-w-[800px] lg:max-w-[900px] xl:max-w-[1000px] max-h-[95vh] overflow-y-auto">
              <DialogHeader className="bg-gradient-to-r from-[#4637d2]/20 to-[#00d746]/10 p-4 sm:p-6 -mx-6 -mt-6 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4637d2] to-[#00d746] blur-[2px] scale-[1.05] opacity-70"></div>
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-white">
                      <AvatarFallback className="text-base sm:text-lg">
                        {getInitials(selectedStudent.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-[#4637d2]">
                      {selectedStudent.name}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
                      <span className="flex items-center">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 text-[#4637d2]" />
                        {selectedStudent.usnNumber}
                      </span>
                      <span className="hidden sm:inline-block">•</span>
                      <span className="flex items-center">
                        <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 text-[#4637d2]" />
                        {Object.keys(selectedStudent.subjects).length} subjects
                      </span>
                      <span className="hidden sm:inline-block">•</span>
                      <span className="flex items-center">
                        <Badge
                          className={`${
                            getAttendanceStatus(
                              getOverallAttendance(selectedStudent)
                            ).color
                          } text-white`}
                        >
                          {getOverallAttendance(selectedStudent)}% Overall
                        </Badge>
                      </span>
                    </DialogDescription>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadStudentCSV(selectedStudent);
                    }}
                    disabled={downloadingStudent}
                    className="border-[#00d746]/40 hover:border-[#00d746]/80 hover:bg-[#00d746]/10 text-[#4637d2] w-full sm:w-auto"
                  >
                    {downloadingStudent ? (
                      <>
                        <LucideLoader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV
                      </>
                    )}
                  </Button>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overall" className="mt-0">
                <TabsList className="w-full bg-muted/50 border border-[#00d746]/20 rounded-lg mb-4">
                  <TabsTrigger
                    value="overall"
                    className="data-[state=active]:bg-[#4637d2] data-[state=active]:text-white"
                  >
                    Overall Summary
                  </TabsTrigger>
                  <TabsTrigger
                    value="subjects"
                    className="data-[state=active]:bg-[#4637d2] data-[state=active]:text-white"
                  >
                    Subject Details
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="overall"
                  className="focus-visible:outline-none focus-visible:ring-0"
                >
                  <Card className="border-[#00d746]/20">
                    <CardHeader className="pb-2 border-b border-[#00d746]/10">
                      <CardTitle className="text-lg sm:text-xl text-[#4637d2]">
                        Attendance Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 my-4">
                        <div className="relative w-36 h-36 sm:w-40 sm:h-40">
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
                                2 *
                                Math.PI *
                                45 *
                                (1 -
                                  getOverallAttendance(selectedStudent) / 100)
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
                            <span className="text-3xl sm:text-4xl font-bold">
                              {getOverallAttendance(selectedStudent)}%
                            </span>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              Attendance
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4 w-full max-w-xs">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Attendance Status
                              </span>
                              <span className="font-medium">
                                {
                                  getAttendanceStatus(
                                    getOverallAttendance(selectedStudent)
                                  ).label
                                }
                              </span>
                            </div>
                            <Progress
                              value={getOverallAttendance(selectedStudent)}
                              max={100}
                              className="h-2 bg-muted"
                              indicatorClassName="bg-gradient-to-r from-[#4637d2] to-[#00d746]"
                            />
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Total Classes
                            </span>
                            <span className="font-medium text-[#4637d2]">
                              {Object.values(selectedStudent.subjects).reduce(
                                (acc, subject) => acc + subject.stats.total,
                                0
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Classes Attended
                            </span>
                            <span className="font-medium text-[#00d746]">
                              {Object.values(selectedStudent.subjects).reduce(
                                (acc, subject) => acc + subject.stats.present,
                                0
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Classes Missed
                            </span>
                            <span className="font-medium text-red-500">
                              {Object.values(selectedStudent.subjects).reduce(
                                (acc, subject) =>
                                  acc +
                                  (subject.stats.total - subject.stats.present),
                                0
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <Card className="border-[#00d746]/20 overflow-hidden">
                          <div className="bg-gradient-to-r from-[#4637d2]/10 to-[#4637d2]/5 px-4 py-2 border-b border-[#00d746]/10">
                            <h4 className="font-medium text-[#4637d2]">
                              Attendance Summary
                            </h4>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Total Classes</span>
                                <Badge
                                  variant="outline"
                                  className="border-[#4637d2] text-[#4637d2]"
                                >
                                  {Object.values(
                                    selectedStudent.subjects
                                  ).reduce(
                                    (acc, subject) => acc + subject.stats.total,
                                    0
                                  )}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">
                                  Classes Attended
                                </span>
                                <Badge
                                  variant="outline"
                                  className="border-[#00d746] text-[#00d746]"
                                >
                                  {Object.values(
                                    selectedStudent.subjects
                                  ).reduce(
                                    (acc, subject) =>
                                      acc + subject.stats.present,
                                    0
                                  )}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Attendance Rate</span>
                                <Badge
                                  variant="outline"
                                  className="border-[#4637d2] text-[#4637d2]"
                                >
                                  {getOverallAttendance(selectedStudent)}%
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-[#00d746]/20 overflow-hidden">
                          <div className="bg-gradient-to-r from-[#00d746]/10 to-[#00d746]/5 px-4 py-2 border-b border-[#00d746]/10">
                            <h4 className="font-medium text-[#00d746]">
                              Performance Insights
                            </h4>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Best Subject</span>
                                <Badge
                                  variant="outline"
                                  className="border-[#00d746] text-[#00d746]"
                                >
                                  {Object.entries(
                                    selectedStudent.subjects
                                  ).reduce(
                                    (best, [subject, data]) =>
                                      !best ||
                                      data.stats.percentage > best.percentage
                                        ? {
                                            name: subject,
                                            percentage: data.stats.percentage,
                                          }
                                        : best,
                                    null as null | {
                                      name: string;
                                      percentage: number;
                                    }
                                  )?.name || "N/A"}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">
                                  Needs Improvement
                                </span>
                                <Badge
                                  variant="outline"
                                  className="border-red-500 text-red-500"
                                >
                                  {Object.entries(
                                    selectedStudent.subjects
                                  ).reduce(
                                    (worst, [subject, data]) =>
                                      !worst ||
                                      data.stats.percentage < worst.percentage
                                        ? {
                                            name: subject,
                                            percentage: data.stats.percentage,
                                          }
                                        : worst,
                                    null as null | {
                                      name: string;
                                      percentage: number;
                                    }
                                  )?.name || "N/A"}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Current Status</span>
                                <Badge
                                  className={`${
                                    getAttendanceStatus(
                                      getOverallAttendance(selectedStudent)
                                    ).color
                                  } text-white`}
                                >
                                  {
                                    getAttendanceStatus(
                                      getOverallAttendance(selectedStudent)
                                    ).label
                                  }
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="subjects"
                  className="focus-visible:outline-none focus-visible:ring-0"
                >
                  <Card className="border-[#00d746]/20">
                    <CardHeader className="pb-2 border-b border-[#00d746]/10 flex flex-row justify-between items-center">
                      <CardTitle className="text-lg sm:text-xl text-[#4637d2]">
                        Subject Attendance
                      </CardTitle>
                      <Badge variant="outline" className="border-[#4637d2]/40">
                        {Object.keys(selectedStudent.subjects).length} Subjects
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-[#00d746]/10 dark:divide-[#00d746]/20">
                        {Object.entries(selectedStudent.subjects).map(
                          ([subject, data], index) => {
                            const { percentage } = data.stats;
                            const status = getAttendanceStatus(percentage);

                            return (
                              <div
                                key={subject}
                                className="p-4 hover:bg-slate-50 dark:hover:bg-[#1f1f1f]"
                              >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-base sm:text-lg text-foreground dark:text-white break-words">
                                      {subject}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                      {data.stats.present} of {data.stats.total}{" "}
                                      classes attended
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                      <span className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">
                                        {percentage}%
                                      </span>
                                    </div>
                                    <Badge
                                      className={`${status.color} text-white whitespace-nowrap`}
                                    >
                                      {status.label}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="space-y-2 mt-3">
                                  <Progress
                                    value={percentage}
                                    max={100}
                                    className="h-2 bg-muted dark:bg-[#2a2a2a]"
                                    indicatorClassName={`${
                                      percentage >= 85
                                        ? "bg-[#00d746]"
                                        : percentage >= 75
                                        ? "bg-[#4637d2]"
                                        : percentage >= 65
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                    }`}
                                  />

                                  <div className="flex flex-col sm:flex-row justify-between gap-2 text-sm">
                                    <div className="flex flex-wrap gap-4">
                                      <span className="text-[#00d746] flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-[#00d746] mr-1.5"></div>
                                        Present: {data.stats.present}
                                      </span>
                                      <span className="text-red-500 flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
                                        Absent:{" "}
                                        {data.stats.total - data.stats.present}
                                      </span>
                                    </div>
                                    <span className="text-muted-foreground">
                                      Total: {data.stats.total}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </AdminRouteGuard>
  );
}
