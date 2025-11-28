"use client";

import { useAuth } from "@clerk/nextjs";
import StudentRouteGuard from "@/components/route-guards/StudentRouteGuard";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import createAxiosInstance from "@/lib/axiosInstance";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { PieChart, Pie, Cell, Label, Sector } from "recharts";
import ShineBorder from "@/components/ui/shine-border";

import { TrendingUp } from "lucide-react";
import type { AttendanceSummary as SummaryType } from "../types/student/route";

export default function AttendanceStatistics() {

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

  if (loading || !summary) return null;

  const subjectsAbove75 = summary.subjects.filter(
    (subject) => subject.stats.percentage >= 75
  ).length;
  const subjectsBelow75 = summary.subjects.length - subjectsAbove75;

  const TOTAL_SESSIONS = 30;

  const subjectsBelowThreshold = summary.recentSubjects
    .filter((subject) => {
      return (subject.stats.present / TOTAL_SESSIONS) * 100 < 75;
    })
    .map((subject) => {
      const present = subject.stats.present;

      const needed = Math.ceil(0.75 * TOTAL_SESSIONS - present);
      return {
        name: subject.subjectName,
        classesNeeded: Math.max(0, needed),
      };
    })
    .sort((a, b) => b.classesNeeded - a.classesNeeded)
    .slice(0, 3);

  return (
    <StudentRouteGuard>
      <ShineBorder
        borderRadius={12}
        borderWidth={1.2}
        duration={10}
        color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        className="block w-full"
      >
        <Card className="border border-[#4637d2]/10 bg-gradient-to-br from-white to-[#00d746]/5 dark:from-[#0d0d0d] dark:to-[#00d746]/10">
          <CardHeader className="border-b border-[#00d746]/10">
            <CardTitle>Attendance Statistics</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium mb-4 text-[#4637d2]">
                  Subject Performance
                </h3>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      <Badge
                        variant="outline"
                        className="bg-[#00d746]/10 text-[#00d746] border-[#00d746]/30 mr-2"
                      />
                      Above 75% ({subjectsAbove75} Subjects)
                    </span>
                    <span>
                      {Math.round(
                        (subjectsAbove75 / summary.subjects.length) * 100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(subjectsAbove75 / summary.subjects.length) * 100}
                    className="h-2 bg-muted"
                    indicatorClassName="bg-[#00d746]"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      <Badge
                        variant="outline"
                        className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 mr-2"
                      />
                      Below 75% ({subjectsBelow75} Subjects)
                    </span>
                    <span>
                      {Math.round(
                        (subjectsBelow75 / summary.subjects.length) * 100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(subjectsBelow75 / summary.subjects.length) * 100}
                    className="h-2 bg-muted"
                    indicatorClassName="bg-red-500"
                  />
                </div>

                <div className="flex justify-center items-center w-full max-w-[300px] mx-auto">
                  <ChartStyle
                    id="attendance-pie"
                    config={{
                      present: { label: "Present", color: "#00d746" },
                      absent: { label: "Absent", color: "#4637d2" },
                    }}
                  />
                  <ChartContainer
                    id="attendance-pie"
                    config={{
                      present: { label: "Present", color: "#00d746" },
                      absent: { label: "Absent", color: "#4637d2" },
                    }}
                    className="aspect-square w-full"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={[
                          {
                            status: "present",
                            value: summary.overallAttendance.present,
                            fill: "#00d746",
                          },
                          {
                            status: "absent",
                            value:
                              summary.overallAttendance.total -
                              summary.overallAttendance.present,
                            fill: "#4637d2",
                          },
                        ]}
                        dataKey="value"
                        nameKey="status"
                        innerRadius={60}
                        strokeWidth={5}
                        activeIndex={0}
                        activeShape={({ outerRadius = 0, ...props }) => (
                          <g>
                            <Sector {...props} outerRadius={outerRadius + 10} />
                            <Sector
                              {...props}
                              outerRadius={outerRadius + 25}
                              innerRadius={outerRadius + 12}
                            />
                          </g>
                        )}
                      >
                        <Label
                          content={({ viewBox }) => {
                            const present = summary.overallAttendance.present;
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
                                    className="fill-[#4637d2] text-3xl font-bold"
                                  >
                                    {present}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Present
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium mb-4 text-[#4637d2]">
                  Improvement Needed
                </h3>
                {subjectsBelowThreshold.length > 0 ? (
                  <div className="space-y-4">
                    {subjectsBelowThreshold.map((subject, index) => (
                      <div
                        key={index}
                        className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{subject.name}</span>
                          <Badge
                            variant="outline"
                            className="bg-[#4637d2]/10 text-[#4637d2] border-[#4637d2]/30"
                          >
                            <TrendingUp className="mr-1 h-3 w-3" /> Need
                            improvement
                          </Badge>
                        </div>
                        <p className="text-amber-800 dark:text-amber-300 text-sm">
                          You need to attend{" "}
                          <strong>{subject.classesNeeded}</strong> more
                          consecutive classes to reach 75%
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#00d746]/5 border border-[#00d746]/20 rounded-lg p-4 flex items-center">
                    <TrendingUp className="h-5 w-5 text-[#00d746] mr-2" />
                    <p className="text-[#00d746]/90">
                      Great job! All your subjects are above the 75% attendance
                      requirement.
                    </p>
                  </div>
                )}

                <div className="mt-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Pro Tip</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Regular attendance is directly correlated with better
                    academic performance. Try to maintain at least 85%
                    attendance for optimal results.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ShineBorder>
    </StudentRouteGuard>
  );
}
