"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import createAxiosInstance from "@/lib/axiosInstance";

import { useAuth } from "@clerk/nextjs";
import TeacherRouteGuard from "@/components/route-guards/TeacherRouteGuard";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Filter,
  History,
  Layers,
  BookOpen,
  Search,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronLeft,
  ArrowLeft,
  LucideLoader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";

export default function SessionsPage() {
  const [q, setQ] = useState("");
  // const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const r = useRouter();

  const { getToken } = useAuth();
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);

  const { data: all = [], isLoading: loading } = useQuery({
    queryKey: ["teacherSessions"],
    queryFn: () =>
      axios.get("/teacher/api/sessions").then((r) => r.data.sessions),
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const batches = useMemo(() => {
    return [...new Set(all.map((s: any) => s.batch.name))];
  }, [all]);

  const getFilteredSessions = () => {
    let filtered = all.filter((s) =>
      s.subject.name.toLowerCase().includes(q.toLowerCase())
    );

    if (selectedBatch !== "all") {
      filtered = filtered.filter((s) => s.batch.name === selectedBatch);
    }

    if (selectedPeriod !== "all") {
      const today = new Date();
      const todayString = format(today, "yyyy-MM-dd");

      if (selectedPeriod === "today") {
        filtered = filtered.filter((s) => s.date === todayString);
      } else if (selectedPeriod === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        filtered = filtered.filter((s) => {
          const sessionDate = parseISO(s.date);
          return sessionDate >= weekAgo && sessionDate <= today;
        });
      } else if (selectedPeriod === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        filtered = filtered.filter((s) => {
          const sessionDate = parseISO(s.date);
          return sessionDate >= monthAgo && sessionDate <= today;
        });
      } else if (selectedPeriod === "custom" && dateRange?.from) {
        const from = dateRange.from;
        const to = dateRange.to || from;
        filtered = filtered.filter((s) => {
          const sessionDate = parseISO(s.date);
          return sessionDate >= from && sessionDate <= to;
        });
      }
    }

    return filtered;
  };

  const filteredSessions = getFilteredSessions();

  const totalItems = filteredSessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSessions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const router = useRouter();

  useEffect(() => {
    setCurrentPage(1);
  }, [q, selectedBatch, selectedPeriod, dateRange]);

  return (
    <TeacherRouteGuard>
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 ml-0 sm:ml-2 sm:mt-2 text-[#4637d2] hover:bg-[#4637d2]/10 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          back
        </Button>
        <Card className="border border-[#00d746]/20 hover:border-[#00d746]/40 transition-colors">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#4637d2]" />
                <CardTitle>Attendance Sessions</CardTitle>
              </div>

              {loading ? (
                <Skeleton className="h-5 w-28 rounded-md" />
              ) : (
                <Badge
                  variant="outline"
                  className="w-fit border-[#4637d2]/30 text-xs sm:text-sm"
                >
                  {totalItems} Sessions Found
                </Badge>
              )}
            </div>

            <CardDescription>
              Browse and manage your classroom attendance sessions
            </CardDescription>
          </CardHeader>

          <Separator className="bg-[#00d746]/10" />
          <CardContent className="pt-6 px-3 sm:px-6">
            <div className="space-y-6">
              <Tabs defaultValue="view" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="view">View Sessions</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="view" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    <div className="w-full">
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Search className="h-4 w-4 text-[#4637d2]" />
                        Search
                      </label>
                      <Input
                        placeholder="Search by subject name..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="w-full border-[#00d746]/20 focus:border-[#00d746]/60 focus-visible:ring-[#4637d2]/20"
                      />
                    </div>

                    <div className="w-full">
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Layers className="h-4 w-4 text-[#4637d2]" />
                        Batch
                      </label>
                      <Select
                        value={selectedBatch}
                        onValueChange={setSelectedBatch}
                      >
                        <SelectTrigger className="border-[#00d746]/20 focus:border-[#00d746]/60 focus-visible:ring-[#4637d2]/20">
                          <SelectValue placeholder="All Batches" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Batches</SelectItem>
                          {batches.map((batch) => (
                            <SelectItem key={batch} value={batch}>
                              {batch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full">
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-4 w-4 text-[#4637d2]" />
                        Period
                      </label>
                      <Select
                        value={selectedPeriod}
                        onValueChange={setSelectedPeriod}
                      >
                        <SelectTrigger className="border-[#00d746]/20 focus:border-[#00d746]/60 focus-visible:ring-[#4637d2]/20">
                          <SelectValue placeholder="Time Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Last 7 Days</SelectItem>
                          <SelectItem value="month">Last 30 Days</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPeriod === "custom" && (
                      <div className="w-full">
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-[#4637d2]" />
                          Date Range
                        </label>
                        <CalendarDateRangePicker
                          value={dateRange}
                          onChange={setDateRange}
                          className="border-[#00d746]/20 focus:border-[#00d746]/60 w-full"
                          align="start"
                        />
                      </div>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <p className="text-muted-foreground">
                          Loading sessions...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border border-[#00d746]/20 overflow-hidden">
                        <div className="w-full overflow-x-auto">
                          <div className="min-w-[900px]">
                            <Table>
                              <TableHeader className="sticky top-0 bg-background z-10">
                                <TableRow>
                                  <TableHead className="w-10">#</TableHead>
                                  <TableHead>
                                    <div className="flex items-center gap-1">
                                      <Layers className="h-4 w-4 text-[#4637d2]" />
                                      Batch
                                    </div>
                                  </TableHead>
                                  <TableHead>
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="h-4 w-4 text-[#4637d2]" />
                                      Subject
                                    </div>
                                  </TableHead>
                                  <TableHead>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4 text-[#4637d2]" />
                                      Date
                                    </div>
                                  </TableHead>
                                  <TableHead>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4 text-[#4637d2]" />
                                      Time
                                    </div>
                                  </TableHead>
                                  <TableHead className="text-right">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {currentItems.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={6}
                                      className="text-center h-24 text-muted-foreground"
                                    >
                                      No sessions found matching your criteria
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  currentItems.map((s, index) => (
                                    <TableRow
                                      key={s.sessionId}
                                      className="hover:bg-[#00d746]/5"
                                    >
                                      <TableCell className="font-medium">
                                        {indexOfFirstItem + index + 1}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="outline"
                                          className="border-[#4637d2]/30 bg-[#4637d2]/5 text-xs sm:text-sm"
                                        >
                                          {s.batch.name}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{s.subject.name}</TableCell>
                                      <TableCell>
                                        {format(
                                          parseISO(s.date),
                                          "dd MMM yyyy"
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {format(
                                          new Date(`1970-01-01T${s.time}`),
                                          "hh:mm a"
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            setViewingSessionId(s.sessionId);
                                            r.push(
                                              `/teacher/sessions/${s.sessionId}`
                                            );
                                          }}
                                          className="flex items-center gap-1 bg-[#4637d2] hover:bg-[#4637d2]/90 text-xs sm:text-sm"
                                          disabled={
                                            viewingSessionId === s.sessionId
                                          }
                                        >
                                          {viewingSessionId === s.sessionId ? (
                                            <>
                                              <LucideLoader2 className="w-4 h-4 animate-spin mr-1" />
                                              Loading...
                                            </>
                                          ) : (
                                            <>
                                              <span className="sm:inline hidden">
                                                View Details
                                              </span>
                                              <span className="sm:hidden inline">
                                                View
                                              </span>
                                              <ChevronRight className="h-4 w-4" />
                                            </>
                                          )}
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>

                      {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                            Showing {indexOfFirstItem + 1}-
                            {Math.min(indexOfLastItem, totalItems)} of{" "}
                            {totalItems} sessions
                          </div>
                          <div className="flex items-center justify-center space-x-1 order-1 sm:order-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                paginate(Math.max(1, currentPage - 1))
                              }
                              disabled={currentPage === 1}
                              className="h-8 w-8 border border-[#00d746]/30"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center space-x-1">
                              {/* Show first page on mobile */}
                              {currentPage > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => paginate(1)}
                                  className="h-8 w-8 border border-[#00d746]/30 hidden sm:flex items-center justify-center"
                                >
                                  1
                                </Button>
                              )}

                              {currentPage > 3 && (
                                <span className="px-1 text-muted-foreground hidden sm:inline">
                                  ...
                                </span>
                              )}

                              {/* Mobile optimized page numbers */}
                              {Array.from({
                                length: Math.min(
                                  totalPages < 3 ? totalPages : 3
                                ),
                              }).map((_, i) => {
                                let pageNum;
                                if (currentPage === 1) {
                                  pageNum = i + 1;
                                } else if (currentPage === totalPages) {
                                  pageNum = totalPages - 2 + i;
                                } else {
                                  pageNum = currentPage - 1 + i;
                                }

                                if (pageNum > 0 && pageNum <= totalPages) {
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={
                                        currentPage === pageNum
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => paginate(pageNum)}
                                      className={`h-8 w-8 ${
                                        currentPage === pageNum
                                          ? "bg-[#4637d2]"
                                          : "border border-[#00d746]/30"
                                      }`}
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                }
                                return null;
                              })}

                              {currentPage < totalPages - 2 && (
                                <span className="px-1 text-muted-foreground hidden sm:inline">
                                  ...
                                </span>
                              )}

                              {/* Show last page on mobile */}
                              {currentPage < totalPages && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => paginate(totalPages)}
                                  className="h-8 w-8 border border-[#00d746]/30 hidden sm:flex items-center justify-center"
                                >
                                  {totalPages}
                                </Button>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                paginate(Math.min(totalPages, currentPage + 1))
                              }
                              disabled={currentPage === totalPages}
                              className="h-8 w-8 border border-[#00d746]/30"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="analytics" className="pt-4">
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <p>Attendance analytics dashboard coming soon...</p>
                    {/* <p className="text-sm">
                      Track attendance trends, student participation, and more
                    </p> */}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherRouteGuard>
  );
}
