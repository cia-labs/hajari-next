"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import createAxiosInstance from "@/lib/axiosInstance";
import StudentRouteGuard from "@/components/route-guards/StudentRouteGuard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface AttendanceRecord {
  _id: string;
  date: string;
  time: string;
  subject: { name: string };
  teacher: { name: string };
  attendanceStatus: "present" | "absent";
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

interface Props {
  subjects: {
    subjectId: string;
    subjectName: string;
  }[];
  loading: boolean;
}

export default function AttendanceHistory({ subjects, loading }: Props) {
  const { getToken } = useAuth();
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);
  const [page, setPage] = useState(1);
  const [subjectId, setSubjectId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setPage(1);
  }, [subjectId, fromDate, toDate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["attendanceHistory", page, subjectId, fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (subjectId) params.append("subjectId", subjectId);
      if (fromDate && toDate) {
        params.append("fromDate", fromDate);
        params.append("toDate", toDate);
      }
      const res = await axios.get(`/api/students/attendance-history?${params}`);
      if (res.data?.success) return res.data.history;
      throw new Error(res.data?.error || "Failed to fetch attendance history");
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const handleReset = () => {
    setSubjectId("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  return (
    <StudentRouteGuard>
      <Card className="border border-[#4637d2]/10 bg-gradient-to-br from-white to-[#00d746]/5 dark:from-[#0d0d0d] dark:to-[#00d746]/10">
        <CardHeader className="border-b border-[#00d746]/10">
          <CardTitle className="text-[#4637d2]">Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="subject" className="text-[#4637d2]/90">
                Subject
              </Label>
              <select
                id="subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full border rounded-md p-2 border-[#4637d2]/20 focus:border-[#4637d2] focus:ring focus:ring-[#4637d2]/20 outline-none"
              >
                <option value="">All Subjects</option>
                {subjects?.map((sub) => (
                  <option key={sub.subjectId} value={sub.subjectId}>
                    {sub.subjectName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-[#4637d2]/90">From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border-[#4637d2]/20 dark:border-[#4637d2]/40 focus:border-[#4637d2] focus:ring focus:ring-[#4637d2]/20 dark:bg-[#1a1a1a] dark:text-white"
              />
            </div>
            <div>
              <Label className="text-[#4637d2]/90">To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border-[#4637d2]/20 dark:border-[#4637d2]/40 focus:border-[#4637d2] focus:ring focus:ring-[#4637d2]/20 dark:bg-[#1a1a1a] dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full border-[#4637d2]/30 hover:bg-[#4637d2]/5 text-[#4637d2]"
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="border rounded-lg border-[#4637d2]/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#4637d2]/5 dark:bg-[#4637d2]/10">
                    <TableRow>
                      <TableHead className="text-[#4637d2]">Date</TableHead>
                      <TableHead className="text-[#4637d2]">Time</TableHead>
                      <TableHead className="text-[#4637d2]">Subject</TableHead>
                      <TableHead className="text-[#4637d2]">Teacher</TableHead>
                      <TableHead className="text-[#4637d2]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.records.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          No attendance records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.records.map((record) => (
                        <TableRow
                          key={record._id}
                          className="hover:bg-[#00d746]/5"
                        >
                          <TableCell>
                            {format(new Date(record.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{record.time}</TableCell>
                          <TableCell>{record.subject.name}</TableCell>
                          <TableCell>{record.teacher.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.attendanceStatus === "present"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                record.attendanceStatus === "present"
                                  ? "bg-[#008000] hover:bg-[#008000]/90"
                                  : "bg-red-500 hover:bg-red-600"
                              }
                            >
                              {record.attendanceStatus === "present"
                                ? "Present"
                                : "Absent"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {data?.pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {data?.pagination.page > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(data?.pagination.page - 1)
                      }
                      className="border-[#4637d2]/30 hover:bg-[#4637d2]/5 dark:hover:bg-[#4637d2]/10 text-[#4637d2]"
                    >
                      Previous
                    </Button>
                  )}

                  {Array.from(
                    { length: Math.min(5, data?.pagination.pages) },
                    (_, i) => {

                      const start = Math.max(1, data?.pagination.page - 2);
                      const end = Math.min(data?.pagination.pages, start + 4);
                      const pageNum = start + i;

                      if (pageNum <= end) {
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === data?.pagination.page
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={
                              pageNum === data?.pagination.page
                                ? "bg-[#4637d2] hover:bg-[#4637d2]/90"
                                : "border-[#4637d2]/30 hover:bg-[#4637d2]/5 text-[#4637d2]"
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    }
                  )}

                  {data?.pagination.page < data?.pagination.pages && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(data?.pagination.page + 1)
                      }
                      className="border-[#4637d2]/30 hover:bg-[#4637d2]/5 text-[#4637d2]"
                    >
                      Next
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </StudentRouteGuard>
  );
}
