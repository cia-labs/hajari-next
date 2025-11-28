"use client";
import { useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import createAxiosInstance from "@/lib/axiosInstance";
import TeacherRouteGuard from "@/components/route-guards/TeacherRouteGuard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import { BorderBeam } from "@/components/ui/border-beam";

type Batch = { 
  id: string; 
  name: string; 
  createdAt?: string; 
  studentCount?: number;
  subjects?: Subject[];
};
type Student = { id: string; name: string; usnNumber: string };
type Subject = { id: string; name: string };

export default function AttendancePage() {

  const { userId, getToken } = useAuth(); 
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [subs, setSubs] = useState<Subject[]>([]);
  const [sub, setSub] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [map, setMap] = useState<Record<string, "present" | "absent">>({});
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const batchesPerPage = 9;

  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["teacherBatches"],
    queryFn: () => axios.get("/teacher/api/batches").then((r) => r.data),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return batches;
    const query = searchQuery.toLowerCase();
    return batches.filter((b: Batch) => {
      // Search by batch name
      const matchesBatchName = b.name.toLowerCase().includes(query);
      
      // Search by subject names
      const matchesSubject = b.subjects?.some((subject: Subject) =>
        subject.name.toLowerCase().includes(query)
      ) || false;
      
      return matchesBatchName || matchesSubject;
    });
  }, [batches, searchQuery]);

  const { data: batchDetails, isLoading: studentLoading } = useQuery({
    queryKey: ["batchDetails", batch?.id],
    queryFn: () =>
      axios.get(`/teacher/api/batch/${batch?.id}`).then((r) => r.data),
    enabled: !!batch,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!batchDetails) return;

    setStudents(batchDetails.students);
    setSubs(batchDetails.subjects);
    setMap(
      Object.fromEntries(
        batchDetails.students.map((s: any) => [s.id, "present"])
      )
    );
  }, [batchDetails]);

  const indexOfLastBatch = currentPage * batchesPerPage;
  const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
  const currentBatches = filteredBatches.slice(
    indexOfFirstBatch,
    indexOfLastBatch
  );
  const totalPages = Math.ceil(filteredBatches.length / batchesPerPage);

  function pick(b: Batch) {
  setBatch(b);
}


  const can = true;

  // Update current time every minute for live display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      const tm = format(new Date(), "HH:mm");
      if ((tm === "08:55" || tm === "13:40") && !saving)
        toast.warning("Reminder: submit attendance");
    }, 60000);
    return () => clearInterval(i);
  }, [saving]);

  async function submit() {
    if (!batch || !sub)
      return toast.error("Please select both batch and subject");

    setSaving(true);

    try {
      // Get current time at submission for accurate timestamp
      const submissionTime = new Date();
      
      const { data } = await axios.post("/teacher/api/take", {
        teacherClerkId: userId,
        batchId: batch.id,
        subjectId: sub,
        date: format(submissionTime, "yyyy-MM-dd"),
        time: format(submissionTime, "HH:mm"),
        students: Object.entries(map).map(([id, status]) => ({
          studentId: id,
          status,
        })),
      });

      toast.success("Attendance saved successfully!");

      if (data.skippedCount && data.skippedCount > 0) {
        toast.warning(
          `${data.skippedCount} student${
            data.skippedCount > 1 ? "s" : ""
          } forcibly skipped due to *admin-rejected* leave requests: ${data.skippedNames.join(
            ", "
          )}.`
        );
      }

      setBatch(null);
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  }

  const presentCount = Object.values(map).filter(
    (status) => status === "present"
  ).length;
  const absentCount = Object.values(map).filter(
    (status) => status === "absent"
  ).length;
  
  // Get selected subject name
  const selectedSubject = subs.find(s => s.id === sub);
  
  const router = useRouter();

  if (!batch)
    return (
      <TeacherRouteGuard>
        <div className="space-y-5 px-0 sm:px-3 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 ml-0 sm:ml-2 sm:mt-2 text-[#4637d2] hover:bg-[#4637d2]/10 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            back
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-[#4637d2]" />
              <h2 className="text-xl sm:text-2xl font-bold">Class Batches</h2>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search batches or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 border-[#28a745]/30"
              />
            </div>
          </div>

          <Card className="border border-[#333742]/20">
            <CardHeader className="border-b border-[#333742]/10 p-3 sm:p-3">
              <CardTitle>Select a Batch</CardTitle>
              <CardDescription>
                Choose a batch to take attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {batchesLoading
                  ? Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <Card
                          key={`batch-skeleton-${i + 1}`}
                          className="relative h-40 border border-muted shadow-sm overflow-hidden"
                        >
                          <div className="p-5 space-y-4">
                            <Skeleton className="h-5 w-4/5" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </Card>
                      ))
                  : currentBatches.map((b: Batch) => (
                      <Card
                        key={b.id}
                        className="relative h-40 cursor-pointer hover:bg-gradient-to-br hover:from-[#4637d2]/5 hover:to-[#00d746]/5 dark:hover:from-[#6366f1]/5 dark:hover:to-[#22c55e]/5 transition-all duration-300 border border-[#00d746]/20 dark:border-[#22c55e]/20 hover:border-[#4637d2]/40 dark:hover:border-[#6366f1]/40 hover:shadow-lg group overflow-hidden"
                        onClick={() => pick(b)}
                      >
                        <div className="p-5 h-full flex flex-col">
                          {/* Header with icon and batch name */}
                          <div className="flex items-start space-x-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#4637d2]/10 to-[#00d746]/10 dark:from-[#6366f1]/10 dark:to-[#22c55e]/10 flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-[#4637d2] dark:text-[#6366f1]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-foreground truncate leading-tight mb-1" title={b.name}>
                                {b.name}
                              </h3>
                              {b.subjects && b.subjects.length > 0 && (
                                <p className="text-xs text-muted-foreground truncate" title={b.subjects.map(s => s.name).join(', ')}>
                                  {b.subjects.length === 1 ? b.subjects[0].name : `${b.subjects[0].name} +${b.subjects.length - 1} more`}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Spacer to push footer to bottom */}
                          <div className="flex-1"></div>
                          
                          {/* Footer with student count */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="h-4 w-4 mr-2" />
                              <span className="font-medium">{b.studentCount || 0}</span>
                              <span className="ml-1">students</span>
                            </div>
                            <BookOpen className="h-4 w-4 text-[#4637d2]/60 dark:text-[#6366f1]/60" />
                          </div>
                        </div>
                        <BorderBeam
                          duration={8}
                          size={280}
                          className="from-transparent via-[#4637d2]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </Card>
                    ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 w-8 border border-[#4637d2]/30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="h-8 w-8 border border-[#4637d2]/30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TeacherRouteGuard>
    );

  return (
    <TeacherRouteGuard>
      <div className="space-y-6 px-0 sm:px-2 py-3">
        <Card className="border border-border dark:border-border bg-gradient-to-br from-background to-secondary/20 dark:from-background dark:to-secondary/10">
          <CardHeader className="border-b border-border bg-gradient-to-r from-[#4637d2]/5 to-[#00d746]/5 dark:from-[#6366f1]/5 dark:to-[#22c55e]/5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setBatch(null)}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 hover:bg-[#4637d2]/10 hover:text-[#4637d2]"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#4637d2] dark:text-[#6366f1]" />
                  <CardTitle className="text-lg sm:text-xl text-foreground break-words">
                    <span className="truncate max-w-[200px] sm:max-w-none" title={batch.name}>
                      {batch.name}
                    </span>
                    {selectedSubject && (
                      <>
                        <span className="hidden sm:inline"> • </span>
                        <span className="block sm:inline text-base text-muted-foreground truncate max-w-[150px] sm:max-w-none" title={selectedSubject.name}>
                          {selectedSubject.name}
                        </span>
                      </>
                    )}
                  </CardTitle>
                </div>
                <CardDescription className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(currentTime, "dd MMM yyyy")}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(currentTime, "hh:mm a")}
                  </span>
                  <Badge
                    variant={can ? "default" : "destructive"}
                    className={`h-6 ml-0 sm:ml-2 mt-2 sm:mt-0 ${
                      can ? "bg-[#05a22a]" : "bg-red-500"
                    }`}
                  >
                    {can ? "Attendance Open" : "Attendance Closed"}
                  </Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-[#333742]/10" />
          <CardContent className="pt-1">
            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="subject-select"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4 text-[#4637d2]" />
                  Select Subject
                </label>
                <Select value={sub} onValueChange={setSub}>
                  <SelectTrigger
                    id="subject-select"
                    className="w-full border-[#4637d2]/30 focus:ring-[#4637d2]/30"
                  >
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subs.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                <Card className="w-full sm:w-40 md:w-48 border border-[#00d746]/20">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Total Students</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{students.length}</p>
                  </CardContent>
                </Card>

                <Card className="w-full sm:w-40 md:w-48 border border-[#00d746]/20">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Present</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-[#28a745]">
                      {presentCount}
                    </p>
                  </CardContent>
                </Card>

                <Card className="w-full sm:w-40 md:w-48 border border-[#00d746]/20">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Absent</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-red-500">
                      {absentCount}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {studentLoading ? (
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[700px] space-y-2">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={`student-skeleton-${i + 1}`}
                          className="flex items-center gap-4 px-4 py-3 border rounded-md border-[#333742]/10"
                        >
                          <Skeleton className="h-4 w-6" />
                          <div className="flex items-center gap-2 w-48">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-4 w-24" />
                          <div className="flex items-center gap-2 ml-auto">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-6 w-10 rounded-full" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[700px]">
                    <ScrollArea className="h-96 w-full rounded-md border border-[#333742]/20 overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow className="border-b border-[#333742]/10">
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>USN</TableHead>
                            <TableHead className="text-center">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((st, index) => (
                            <TableRow
                              key={st.id}
                              className="border-b border-[#333742]/10"
                            >
                              <TableCell className="font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 bg-[#4637d2]/10">
                                    <AvatarFallback className="text-[#4637d2] text-xs sm:text-sm">
                                      {st.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm sm:text-base">
                                    {st.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs sm:text-sm">
                                {st.usnNumber}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center items-center gap-2">
                                  <span
                                    className={`text-xs sm:text-sm ${
                                      map[st.id] === "present"
                                        ? "text-[#28a745]"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {map[st.id] === "present"
                                      ? "Present"
                                      : "Absent"}
                                  </span>
                                  <Switch
                                    disabled={!can}
                                    checked={map[st.id] === "present"}
                                    onCheckedChange={(v) =>
                                      setMap((m) => ({
                                        ...m,
                                        [st.id]: v ? "present" : "absent",
                                      }))
                                    }
                                    className="data-[state=checked]:bg-[#333742]"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <Separator className="bg-[#333742]/10" />
          <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6">
            {!can && (
              <div className="flex items-center text-xs sm:text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  Attendance can only be taken between 08:30 AM – 09:00 AM &
                  01:15 PM – 01:45 PM
                </span>
              </div>
            )}
            <div className="ml-auto">
              <Button
                disabled={saving || !can || !sub}
                onClick={submit}
                className="w-full bg-[#00a335] hover:bg-[#006f24] border-2 border-[#00a335]"
                size="lg"
              >
                {saving ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Attendance
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </TeacherRouteGuard>
  );
}
