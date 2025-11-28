"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import createAxiosInstance from "@/lib/axiosInstance";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import AdminRouteGuard from "@/components/route-guards/AdminRouteGuard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import {
  Download,
  Info,
  Search,
  Calendar as CalendarIcon,
  ArrowLeft,
  RefreshCw,
  Filter,
  X,
  Edit2,
  Check,
  XIcon,
  Save,
  SquarePen,
} from "lucide-react";

type AttendanceRecord = {
  id: string;
  subject?: { name: string };
  teacher?: { name: string };
  date: string;
  time: string;
  attendanceStatus: string;
  sessionId?: string;
  studentId?: string;
};

export default function StudentAttendancePage() {
  const { studentId = "" } = useParams() as { studentId?: string };
  const router = useRouter();

  const { getToken } = useAuth();
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);

  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [editedAttendance, setEditedAttendance] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const PER_PAGE = 30;

  const {
    data: rows = [],
    isLoading: loading,
    error,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ["studentAttendance", studentId],
    queryFn: () =>
      axios
        .get<AttendanceRecord[]>(`/api/attendances/student/${studentId}`)
        .then((r) =>
          r.data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        ),
    staleTime: 1000 * 60 * 5,
  });

  const { data: student, isLoading: loadingStudentName } = useQuery({
    queryKey: ["studentDetail", studentId],
    queryFn: () => axios.get(`/api/students/${studentId}`).then((r) => r.data),
    staleTime: 1000 * 60 * 60,
  });
  const studentName = student?.name ?? "";

  const filteredRows = useMemo(() => {
    let res = [...rows];
    const q = search.toLowerCase();

    if (q) {
      res = res.filter(
        (r) =>
          (r.subject?.name?.toLowerCase() ?? "").includes(q) ||
          (r.teacher?.name?.toLowerCase() ?? "").includes(q) ||
          r.attendanceStatus.toLowerCase().includes(q)
      );
    }
    if (startDate)
      res = res.filter((r) => !isBefore(parseISO(r.date), startDate));
    if (endDate) res = res.filter((r) => !isAfter(parseISO(r.date), endDate));
    if (statusFilter !== "all")
      res = res.filter(
        (r) => r.attendanceStatus.toLowerCase() === statusFilter
      );
    return res;
  }, [rows, search, startDate, endDate, statusFilter]);

  const totalPages = Math.ceil(filteredRows.length / PER_PAGE);

  const paginatedRows = filteredRows.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  const resetFilters = () => {
    setSearch("");
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter("all");
  };

  const handleEditClick = (rowIndex: number, currentStatus: string) => {
    const newEditingRows = new Set(editingRows);
    newEditingRows.add(rowIndex);
    setEditingRows(newEditingRows);
    setEditedAttendance(prev => ({
      ...prev,
      [rowIndex]: currentStatus
    }));
  };

  const handleCancelEdit = (rowIndex: number) => {
    const newEditingRows = new Set(editingRows);
    newEditingRows.delete(rowIndex);
    setEditingRows(newEditingRows);
    const newEditedAttendance = { ...editedAttendance };
    delete newEditedAttendance[rowIndex];
    setEditedAttendance(newEditedAttendance);
  };

  const handleStatusChange = (rowIndex: number, newStatus: string) => {
    setEditedAttendance(prev => ({
      ...prev,
      [rowIndex]: newStatus
    }));
  };

  const handleSaveChanges = async () => {

    if (Object.keys(editedAttendance).length === 0) return;

  setSaving(true);
  try {

    const updates = Object.entries(editedAttendance)
      .map(([rowIndexStr, status]) => {
        const pageIdx = Number(rowIndexStr);
        const absIdx  = (page - 1) * PER_PAGE + pageIdx;
        const r       = filteredRows[absIdx];
        if (!r) return null;  

        const payload: any = { attendanceStatus: status };

        if (r.id) {
          payload.id = r.id;
        } else if (r.sessionId && r.studentId) {
          payload.sessionId = r.sessionId;
          payload.studentId = r.studentId;
        } else {
          return null;  
        }

        return payload;
      })
      .filter(Boolean);  


      if (updates.length === 0) {
      toast.error("No valid attendance rows to update.");
      setSaving(false);
      return;
    }

    const response = await axios.post("/api/attendance/bulkUpdateAttendance", {
      updates,
    });

    if (response.data.success) {
      toast.success(
        `Successfully updated ${response.data.modifiedCount} attendance record(s)`
      );
      setEditingRows(new Set());
      setEditedAttendance({});
      await refetchAttendance();
    } else {
      throw new Error(response.data.message || "Failed to update attendance");
    }
  } catch (error: any) {
    console.error("Error updating attendance:", error);
    toast.error(
      error.response?.data?.message || "Failed to update attendance records"
    );
  } finally {
    setSaving(false);
  }
};


  const hasUnsavedChanges = Object.keys(editedAttendance).length > 0;

  const handleDownload = () => {
    if (!filteredRows.length) return;
    setDownloading(true);

    const header = ["Subject", "Teacher", "Date", "Time", "Status"];
    const csv = [
      header.join(","),
      ...filteredRows.map(
        (r) =>
          `"${r.subject?.name ?? "N/A"}","${r.teacher?.name ?? "N/A"}","${
            r.date
          }","${r.time}","${r.attendanceStatus}"`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${studentName || studentId}_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
    toast.success("Attendance records downloaded successfully.");
  };

  return (
    <AdminRouteGuard>
      <div className="py-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-[#4637d2]/20 hover:border-[#4637d2]/60 hover:bg-[#4637d2]/5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              {loadingStudentName ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ) : (
                <>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "#4637d2" }}
                  >
                    {studentName
                      ? `${studentName}'s Attendance`
                      : "Student Attendance"}
                  </h2>
                  {loading ? (
                    <Skeleton className="h-5 w-48" />
                  ) : (
                    <p className="text-muted-foreground">
                      {filteredRows.length} attendance records found
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={refetchAttendance}
              className="border-[#00d746]/20 hover:border-[#00d746]/60 hover:bg-[#00d746]/5"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            {!loading && !!filteredRows.length && (
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
                className="bg-[#00d746] hover:bg-[#00d746]/90"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? "Downloading…" : "Download CSV"}
              </Button>
            )}
          </div>
        </div>

        <Card className="border border-[#4637d2]/10 shadow-sm overflow-visible">
          <CardHeader className="bg-gradient-to-r from-[#4637d2]/5 to-[#00d746]/5 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </CardTitle>

              {(search || startDate || endDate || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subject, teacher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 border-[#4637d2]/20 focus:border-[#4637d2]/60"
                  disabled={loading}
                />
              </div>

              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-[#4637d2]/20 hover:border-[#4637d2]/60"
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-[#4637d2]/20 hover:border-[#4637d2]/60"
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) =>
                        startDate ? isBefore(date, startDate) : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                disabled={loading}
              >
                <SelectTrigger className="border-[#4637d2]/20 focus:border-[#4637d2]/60">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="border border-red-200">
            <Info className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{(error as Error)?.message}</AlertDescription>
          </Alert>
        )}

        <Card className="border border-[#4637d2]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#4637d2]/5 to-[#00d746]/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                {loading ? (
                  <Skeleton className="h-5 w-48" />
                ) : (
                  <CardDescription>
                    {startDate &&
                      endDate &&
                      `${format(startDate, "dd MMM yyyy")} - ${format(
                        endDate,
                        "dd MMM yyyy"
                      )}`}
                    {startDate &&
                      !endDate &&
                      `From ${format(startDate, "dd MMM yyyy")}`}
                    {!startDate &&
                      endDate &&
                      `Until ${format(endDate, "dd MMM yyyy")}`}
                    {!startDate && !endDate && "All dates"}

                    {statusFilter !== "all" &&
                      ` • ${
                        statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
                      } only`}
                  </CardDescription>
                )}
              </div>
              
              {hasUnsavedChanges && (
                <Button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="bg-[#4637d2] hover:bg-[#4637d2]/90 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                ))}
              </div>
            ) : !filteredRows.length ? (
              <div className="py-12 text-center text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">
                  No attendance records found
                </p>
                <p className="text-sm mt-1">
                  {search || startDate || endDate || statusFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "This student has no attendance records yet."}
                </p>
                {(search || startDate || endDate || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    className="mt-4 border-[#4637d2]/20 hover:border-[#4637d2]/60"
                    onClick={resetFilters}
                  >
                    Reset All Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.map((r, i) => {
                      const isEditing = editingRows.has(i);
                      const currentStatus = editedAttendance[i] || r.attendanceStatus;
                      
                      return (
                        <TableRow
                          key={i}
                          className="hover:bg-[#4637d2]/5 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {r.subject?.name ?? "N/A"}
                          </TableCell>
                          <TableCell>{r.teacher?.name ?? "N/A"}</TableCell>
                          <TableCell>
                            {r.date
                              ? format(new Date(r.date), "dd MMM yyyy")
                              : "N/A"}
                          </TableCell>
                          <TableCell>{r.time || "N/A"}</TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select
                                value={currentStatus.toLowerCase()}
                                onValueChange={(value) => handleStatusChange(i, value)}
                              >
                                <SelectTrigger className="w-[120px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="present">Present</SelectItem>
                                  <SelectItem value="absent">Absent</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge
                                className={
                                  currentStatus.toLowerCase() === "present"
                                    ? "bg-[#00d746]/10 text-[#00d746] hover:bg-[#00d746]/20 border border-[#00d746]/20"
                                    : currentStatus.toLowerCase() === "absent"
                                    ? "bg-red-100 text-red-600 hover:bg-red-200 border border-red-200"
                                    : currentStatus.toLowerCase() === "late"
                                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200 border border-amber-200"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                                }
                              >
                                {currentStatus}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelEdit(i)}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(i, r.attendanceStatus)}
                                  className="h-8 w-8 p-0 hover:bg-[#4637d2]/10 hover:text-[#4637d2]"
                                >
                                  <SquarePen className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {!loading && filteredRows.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * PER_PAGE + 1} to{" "}
              {Math.min(page * PER_PAGE, filteredRows.length)} of{" "}
              {filteredRows.length} records
            </p>

            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(page - 1);
                      }}
                    />
                  </PaginationItem>
                )}

                {page > 2 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {page > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </>
                )}

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === page ||
                    pageNumber === page - 1 ||
                    pageNumber === page + 1
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={pageNumber === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else {
                    return null;
                  }
                })}

                {page < totalPages - 1 && (
                  <>
                    {page < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(totalPages);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(page + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </AdminRouteGuard>
  );
}