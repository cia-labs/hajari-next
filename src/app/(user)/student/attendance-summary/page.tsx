"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import createAxiosInstance from "@/lib/axiosInstance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StudentRouteGuard from "@/components/route-guards/StudentRouteGuard";
import ShineBorder from "@/components/ui/shine-border";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, Label } from "recharts";
import type { AttendanceSummary as SummaryType } from "../types/student/route";

const auTheme = {
  primary: "#4637d2", 
  secondary: "#00d746",
  white: "#ffffff",
};

export default function AttendanceSummary() {
  const { getToken } = useAuth();
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);

  const {
    data: summary,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["attendanceSummary"],
    queryFn: async () => {
      const res = await axios.get("/api/students/attendance-summary");
      if (res.data?.success) return res.data.summary;
      throw new Error(res.data?.error || "Failed to fetch summary");
    },
    staleTime: 1000 * 60 * 5,
  });

  if (loading) {
    return (
      <Card className="border border-[#4637d2]/10">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
          <CardTitle>
            <Skeleton className="h-7 w-40" />
          </CardTitle>
          <Skeleton className="h-7 w-20" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-1 gap-3 mb-4">
            <Skeleton className="h-32 w-32 mx-auto" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-2 border rounded-lg"
                >
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-6 w-6" />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="h-6 w-36 mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const { overallAttendance, subjects } = summary;

  const pieData = [
    {
      name: "Present",
      value: overallAttendance.present,
      color: auTheme.secondary,
    },
    {
      name: "Absent",
      value: overallAttendance.total - overallAttendance.present,
      color: auTheme.primary,
    },
  ];

  return (
    <StudentRouteGuard>
      <ShineBorder
        borderRadius={12}
        borderWidth={1.2}
        duration={10}
        color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        className="block w-full"
      >
        <Card className="border border-[#4637d2]/20 bg-gradient-to-br from-white to-[#4637d2]/5 dark:from-[#0d0d0d] dark:to-[#4637d2]/10">
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">
              Attendance Summary
            </CardTitle>
            <Badge
              variant={
                overallAttendance.percentage >= 75 ? "default" : "destructive"
              }
              className="text-sm py-1 px-2 sm:text-md sm:py-1 sm:px-3"
              style={{
                backgroundColor:
                  overallAttendance.percentage >= 75
                    ? auTheme.primary
                    : "#ef4444",
                color: auTheme.white,
              }}
            >
              {overallAttendance.percentage}% Overall
            </Badge>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col gap-4 mb-6 -mt-3">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div className="w-full sm:w-[70%] flex justify-center">
                  <PieChart
                    width={220}
                    height={220}
                    className="hidden sm:block"
                  >
                    <Pie
                      data={pieData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill={auTheme.secondary} />
                      <Cell fill={auTheme.primary} />
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-2xl font-bold"
                                  style={{ fill: auTheme.primary }}
                                >
                                  {overallAttendance.percentage}%
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 22}
                                  className="fill-muted-foreground text-sm"
                                >
                                  Attendance
                                </tspan>
                              </text>
                            );
                          }
                          return null;
                        }}
                      />
                    </Pie>
                  </PieChart>

                  <PieChart width={160} height={160} className="sm:hidden">
                    <Pie
                      data={pieData}
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill={auTheme.secondary} />
                      <Cell fill={auTheme.primary} />
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-xl font-bold"
                                  style={{ fill: auTheme.primary }}
                                >
                                  {overallAttendance.percentage}%
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 18}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Attendance
                                </tspan>
                              </text>
                            );
                          }
                          return null;
                        }}
                      />
                    </Pie>
                  </PieChart>
                </div>

                <div className="mt-4 sm:mt-0 sm:w-[41%] flex flex-col gap-3">
                  <div className="flex flex-col items-center justify-center p-3 border rounded-xl border-[#4637d2]/20 shadow-sm dark:bg-[#1a1a1a]">
                    <span className="text-muted-foreground text-sm">Total</span>
                    <span className="text-xl font-bold">
                      {overallAttendance.total}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-xl bg-[#00d746]/5 border-[#00d746]/20 shadow-sm dark:bg-[#00d746]/10">
                    <span className="text-muted-foreground text-sm">
                      Present
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{ color: auTheme.secondary }}
                    >
                      {overallAttendance.present}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-xl bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 shadow-sm">
                    <span className="text-muted-foreground text-sm">
                      Absent
                    </span>
                    <span className="text-xl font-bold text-red-600 dark:text-red-400">
                      {overallAttendance.total - overallAttendance.present}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-md sm:text-lg font-medium mb-2 sm:mb-3 text-[#4637d2]">
              Subject-wise Attendance
            </h3>

            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="min-w-full sm:rounded-md px-3 sm:px-0">
                <Table>
                  <TableHeader className="bg-[#4637d2]/5 dark:bg-[#4637d2]/10">
                    <TableRow className="hover:bg-[#4637d2]/5 dark:hover:bg-[#4637d2]/10">
                      <TableHead className="py-2">Subject</TableHead>
                      <TableHead className="text-center py-2">
                        Present
                      </TableHead>
                      <TableHead className="text-center py-2">Absent</TableHead>
                      <TableHead className="text-center py-2">Total</TableHead>
                      <TableHead className="text-center py-2">%</TableHead>
                      <TableHead className="text-center py-2">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-2">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subjects.map((subject) => (
                        <TableRow
                          key={subject.subjectId}
                          className="hover:bg-[#4637d2]/5"
                        >
                          <TableCell className="font-medium py-2 truncate max-w-xs sm:max-w-none">
                            {subject.subjectName}
                          </TableCell>
                          <TableCell className="text-center py-2">
                            {subject.stats.present}
                          </TableCell>
                          <TableCell className="text-center py-2">
                            {subject.stats.absent}
                          </TableCell>
                          <TableCell className="text-center py-2">
                            {subject.stats.total}
                          </TableCell>
                          <TableCell className="text-center py-2">
                            {subject.stats.percentage}%
                          </TableCell>
                          <TableCell className="text-center py-2">
                            <Badge
                              variant={
                                subject.stats.percentage >= 75
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-xs px-1 py-0 sm:text-sm sm:px-2 sm:py-0"
                              style={{
                                backgroundColor:
                                  subject.stats.percentage >= 75
                                    ? "#008000"
                                    : "#ef4444",
                                color: auTheme.white,
                              }}
                            >
                              {subject.stats.percentage >= 75 ? "Good" : "Low"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </ShineBorder>
    </StudentRouteGuard>
  );
}
