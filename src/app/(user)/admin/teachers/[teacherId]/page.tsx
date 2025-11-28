"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import createAxiosInstance from "@/lib/axiosInstance";

import AdminRouteGuard from "@/components/route-guards/AdminRouteGuard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  RefreshCw,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Users,
  FileEdit,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Session = {
  sessionId: string;
  date: string;
  time: string;
  batch: { name: string };
  subject: { name: string };
};

export default function TeacherSessionsPage({
  params,
}: {
  params: { teacherId: string };
}) {
  const { teacherId } = params;
  const { getToken } = useAuth();
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);
  const router = useRouter();
  const { theme } = useTheme();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);

  const { data: teacherInfo } = useQuery({
    queryKey: ["teacherInfo", teacherId],
    queryFn: () => axios.get(`/api/users/${teacherId}`).then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: sessionData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: [
      "teacherSessions",
      teacherId,
      page,
      limit,
      subjectSearch,
      dateFilter,
    ],
    queryFn: () => {
      const qs = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(subjectSearch && { subject: subjectSearch }),
        ...(dateFilter && { date: dateFilter }),
      });

      return axios
        .get(`/api/attendance/getSessionsByTeacher/${teacherId}?${qs}`)
        .then((r) => r.data);
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const sessions = sessionData?.sessions ?? [];
  const totalSessions = sessionData?.total ?? 0;
  const totalPages = sessionData?.totalPages ?? 1;

  const handleRefresh = () => {
    refetch();
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setDateFilter(format(selectedDate, "yyyy-MM-dd"));
    } else {
      setDateFilter("");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSubjectSearch("");
    setDateFilter("");
    setDate(undefined);
    setPage(1);
  };

  const handleView = (sid: string) => {
    setViewingSessionId(sid);
    router.push(`/admin/teachers/${teacherId}/attendance/${sid}`);
  };

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return format(date, "EEE, MMM d, yyyy");
  }

  const isDark = theme === "dark";

  return (
    <AdminRouteGuard>
      <div
        className={`py-6 sm:px-6 ${
          isDark ? "bg-[#191919] text-white" : "bg-slate-50 text-slate-900"
        } min-h-screen`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Button
                variant="ghost"
                className={`mb-2 pl-0 ${
                  isDark
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-slate-600 hover:text-[#4637d2] hover:bg-slate-100"
                }`}
                onClick={() => router.push("/admin/teachers")}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Teachers
              </Button>
              <h2
                className={`text-3xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {teacherInfo?.name
                  ? `${teacherInfo.name}'s Sessions`
                  : "Teacher Sessions"}
              </h2>
              <p
                className={`${
                  isDark ? "text-white/60" : "text-slate-500"
                } mt-1`}
              >
                Manage attendance records for all teaching sessions
              </p>
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              className={
                isDark
                  ? "border-[#333742] bg-[#333742]/50 hover:bg-[#333742] text-white"
                  : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
              }
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card
            className={
              isDark
                ? "border-[#333742] bg-[#191919]"
                : "border-slate-200 bg-white shadow-sm"
            }
          >
            <CardHeader className="pb-3">
              <CardTitle
                className={`text-lg flex items-center ${
                  isDark ? "text-white" : "text-slate-800"
                }`}
              >
                <div className="w-1 h-5 bg-[#00d746] rounded-full mr-2"></div>
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-1/3">
                  <Search
                    className={`absolute left-3 top-3 h-4 w-4 ${
                      isDark ? "text-white/50" : "text-slate-400"
                    }`}
                  />
                  <Input
                    placeholder="Filter by subject"
                    className={
                      isDark
                        ? "pl-9 border-[#333742] bg-[#333742]/50 text-white placeholder:text-white/50 focus-visible:ring-[#00d746] focus-visible:ring-offset-[#191919]"
                        : "pl-9 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#00d746] focus-visible:ring-offset-white"
                    }
                    value={subjectSearch}
                    onChange={(e) => {
                      setSubjectSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={
                        isDark
                          ? `w-full sm:w-auto border-[#333742] bg-[#333742]/50 hover:bg-[#333742] text-left justify-between ${
                              date ? "text-white" : "text-white/50"
                            }`
                          : `w-full sm:w-auto border-slate-200 bg-white hover:bg-slate-100 text-left justify-between ${
                              date ? "text-slate-900" : "text-slate-500"
                            }`
                      }
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Filter by date"}
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={
                      isDark
                        ? "w-auto p-0 bg-[#333742] border-[#00d746]/20"
                        : "w-auto p-0 bg-white border-slate-200"
                    }
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                      className={isDark ? "bg-[#333742]" : "bg-white"}
                    />
                  </PopoverContent>
                </Popover>

                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    setLimit(parseInt(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger
                    className={
                      isDark
                        ? "w-full sm:w-[180px] border-[#333742] bg-[#333742]/50 text-white focus:ring-[#00d746] focus:ring-offset-[#191919]"
                        : "w-full sm:w-[180px] border-slate-200 bg-white text-slate-900 focus:ring-[#00d746] focus:ring-offset-white"
                    }
                  >
                    <SelectValue placeholder="Rows per page" />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      isDark
                        ? "bg-[#333742] border-[#00d746]/20 text-white"
                        : "bg-white border-slate-200 text-slate-900"
                    }
                  >
                    <SelectItem value="5">5 rows</SelectItem>
                    <SelectItem value="10">10 rows</SelectItem>
                    <SelectItem value="20">20 rows</SelectItem>
                    <SelectItem value="50">50 rows</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  className={
                    isDark
                      ? "hover:bg-white/10 text-white/80 hover:text-white"
                      : "hover:bg-slate-100 text-slate-600 hover:text-[#4637d2]"
                  }
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              isDark
                ? "border-[#333742] bg-[#191919]"
                : "border-slate-200 bg-white shadow-sm"
            }
          >
            <CardHeader
              className={
                isDark
                  ? "bg-[#333742]/30 border-b border-[#333742]"
                  : "bg-slate-50 border-b border-slate-100"
              }
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle
                    className={`text-xl flex items-center ${
                      isDark ? "text-white" : "text-slate-800"
                    }`}
                  >
                    <div className="w-1 h-5 bg-[#00d746] rounded-full mr-2"></div>
                    Teaching Sessions
                  </CardTitle>
                  <CardDescription
                    className={isDark ? "text-white/60" : "text-slate-500"}
                  >
                    {loading ? (
                      <Skeleton className="h-4 w-[200px] rounded-md" />
                    ) : (
                      <>
                        Showing {sessionData?.sessions.length ?? 0} of{" "}
                        {sessionData?.total ?? 0} session
                        {(sessionData?.total ?? 0) !== 1 ? "s" : ""}
                        {(subjectSearch || dateFilter) &&
                          " with applied filters"}
                      </>
                    )}
                  </CardDescription>
                </div>
                <div
                  className={`mt-2 sm:mt-0 text-sm ${
                    isDark ? "text-white/60" : "text-slate-500"
                  }`}
                >
                  Page {page} of {totalPages}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading && sessions.length === 0 ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-2">
                      <Skeleton
                        className={`h-4 w-[15%] ${
                          isDark ? "bg-[#333742]" : "bg-slate-200"
                        }`}
                      />
                      <Skeleton
                        className={`h-4 w-[25%] ${
                          isDark ? "bg-[#333742]" : "bg-slate-200"
                        }`}
                      />
                      <Skeleton
                        className={`h-4 w-[20%] ${
                          isDark ? "bg-[#333742]" : "bg-slate-200"
                        }`}
                      />
                      <Skeleton
                        className={`h-4 w-[15%] ${
                          isDark ? "bg-[#333742]" : "bg-slate-200"
                        }`}
                      />
                      <Skeleton
                        className={`h-8 w-24 rounded-md ${
                          isDark ? "bg-[#333742]" : "bg-slate-200"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader
                      className={isDark ? "bg-[#333742]/30" : "bg-slate-50"}
                    >
                      <TableRow
                        className={`hover:bg-transparent border-b ${
                          isDark ? "border-[#333742]" : "border-slate-200"
                        }`}
                      >
                        <TableHead
                          className={
                            isDark
                              ? "text-white font-medium"
                              : "text-slate-700 font-medium"
                          }
                        >
                          <div className="flex items-center">
                            <Users
                              className={`h-4 w-4 mr-2 ${
                                isDark ? "text-[#00d746]" : "text-[#4637d2]"
                              }`}
                            />
                            Batch
                          </div>
                        </TableHead>
                        <TableHead
                          className={
                            isDark
                              ? "text-white font-medium"
                              : "text-slate-700 font-medium"
                          }
                        >
                          <div className="flex items-center">
                            <BookOpen
                              className={`h-4 w-4 mr-2 ${
                                isDark ? "text-[#00d746]" : "text-[#4637d2]"
                              }`}
                            />
                            Subject
                          </div>
                        </TableHead>
                        <TableHead
                          className={
                            isDark
                              ? "text-white font-medium"
                              : "text-slate-700 font-medium"
                          }
                        >
                          <div className="flex items-center">
                            <CalendarIcon
                              className={`h-4 w-4 mr-2 ${
                                isDark ? "text-[#00d746]" : "text-[#4637d2]"
                              }`}
                            />
                            Date
                          </div>
                        </TableHead>
                        <TableHead
                          className={
                            isDark
                              ? "text-white font-medium"
                              : "text-slate-700 font-medium"
                          }
                        >
                          <div className="flex items-center">
                            <Clock
                              className={`h-4 w-4 mr-2 ${
                                isDark ? "text-[#00d746]" : "text-[#4637d2]"
                              }`}
                            />
                            Time
                          </div>
                        </TableHead>
                        <TableHead
                          className={`text-center ${
                            isDark
                              ? "text-white font-medium"
                              : "text-slate-700 font-medium"
                          }`}
                        >
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className={`text-center py-12 ${
                              isDark ? "text-white/60" : "text-slate-500"
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <CalendarIcon
                                className={`h-12 w-12 ${
                                  isDark ? "text-white/20" : "text-slate-300"
                                }`}
                              />
                              <p>No sessions found</p>
                              {(subjectSearch || dateFilter) && (
                                <Button
                                  variant="outline"
                                  onClick={clearFilters}
                                  className={
                                    isDark
                                      ? "mt-2 border-[#333742] bg-[#333742]/50 hover:bg-[#333742] text-white"
                                      : "mt-2 border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                                  }
                                >
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sessions.map((s) => (
                          <TableRow
                            key={s.sessionId}
                            className={`border-b ${
                              isDark
                                ? "border-[#333742]/50 hover:bg-[#333742]/20"
                                : "border-slate-100 hover:bg-slate-50"
                            }`}
                          >
                            <TableCell>
                              <Badge
                                className={
                                  isDark
                                    ? "bg-[#00d746]/10 text-[#00d746] hover:bg-[#00d746]/20 border-0"
                                    : "bg-[#4637d2]/10 text-[#4637d2] hover:bg-[#4637d2]/20 border-0"
                                }
                              >
                                {s.batch.name}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={
                                isDark
                                  ? "font-medium text-white"
                                  : "font-medium text-slate-900"
                              }
                            >
                              {s.subject.name}
                            </TableCell>
                            <TableCell
                              className={
                                isDark ? "text-white/80" : "text-slate-700"
                              }
                            >
                              <div className="flex items-center">
                                <CalendarIcon
                                  className={`h-3.5 w-3.5 mr-1.5 ${
                                    isDark
                                      ? "text-[#00d746]/70"
                                      : "text-[#4637d2]"
                                  }`}
                                />
                                {formatDate(s.date)}
                              </div>
                            </TableCell>
                            <TableCell
                              className={
                                isDark ? "text-white/80" : "text-slate-700"
                              }
                            >
                              {s.time}
                            </TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={
                                        isDark
                                          ? "border-[#00d746]/30 bg-[#00d746]/10 hover:bg-[#00d746]/20 text-white"
                                          : "border-[#4637d2]/30 bg-[#4637d2]/10 hover:bg-[#4637d2]/20 text-slate-800"
                                      }
                                      disabled={
                                        viewingSessionId === s.sessionId
                                      }
                                      onClick={() => handleView(s.sessionId)}
                                    >
                                      {viewingSessionId === s.sessionId ? (
                                        <>
                                          <Clock className="h-4 w-4 animate-spin mr-2" />
                                          Loading...
                                        </>
                                      ) : (
                                        <>
                                          <FileEdit className="h-4 w-4 mr-2" />
                                          Attendance
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Manage attendance for this session
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    {sessions.length > 0 && (
                      <TableFooter
                        className={
                          isDark
                            ? "bg-[#333742]/30 border-t border-[#333742]"
                            : "bg-slate-50 border-t border-slate-100"
                        }
                      >
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={5}>
                            <div className="flex items-center justify-between py-2">
                              <div
                                className={`text-sm ${
                                  isDark ? "text-white/60" : "text-slate-500"
                                }`}
                              >
                                Showing {sessions.length ?? 0} of{" "}
                                {sessionData?.total ?? 0} sessions
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                  }
                                  disabled={page === 1}
                                  className={
                                    isDark
                                      ? "border-[#333742] bg-[#333742]/50 hover:bg-[#333742] text-white disabled:opacity-50"
                                      : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-50"
                                  }
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div
                                  className={`text-sm ${
                                    isDark ? "text-white/80" : "text-slate-700"
                                  }`}
                                >
                                  Page {page} of {totalPages}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                  }
                                  disabled={page === totalPages}
                                  className={
                                    isDark
                                      ? "border-[#333742] bg-[#333742]/50 hover:bg-[#333742] text-white disabled:opacity-50"
                                      : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-50"
                                  }
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    )}
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
