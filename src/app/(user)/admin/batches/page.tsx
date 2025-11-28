"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import createAxiosInstance from "@/lib/axiosInstance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import AdminRouteGuard from "@/components/route-guards/AdminRouteGuard";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Search,
  Users,
  Calendar,
  Info,
  X,
  BookOpen,
  Trash2,
} from "lucide-react";

type Batch = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  _count?: {
    students: number;
  };
  subjects?: Subject[];
};

type Subject = {
  id: string;
  name: string;
};

type Student = {
  id: string;
  name: string;
  usnNumber: string;
  email?: string;
  createdAt?: string;
};

const BATCHES_PER_PAGE = 12;
export default function BatchesPage() {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const { getToken } = useAuth();
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);
  const queryClient = useQueryClient();

  const { data: batches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ["admin-batches"],
    queryFn: () => axios.get<Batch[]>("/api/batches/list").then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.subjects?.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [batches, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBatches.length / BATCHES_PER_PAGE)
  );

  const paginatedBatches = filteredBatches.slice(
    (page - 1) * BATCHES_PER_PAGE,
    page * BATCHES_PER_PAGE
  );

 
  const {
    data: students = [],
    isLoading: loadingStudents,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ["batchStudents", selectedBatch?.id],
    enabled: !!selectedBatch, 
    queryFn: () =>
      axios
        .get<Student[]>(`/api/students/list-batch-wise/${selectedBatch?.id}`)
        .then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const openDialog = (batch: Batch) => {
    setSelectedBatch(batch);
    setDialogOpen(true);
    refetchStudents();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const getDateDisplay = (batch: Batch) => {
    if (batch.startDate && batch.endDate) {
      return `${formatDate(batch.startDate)} - ${formatDate(batch.endDate)}`;
    }
    if (batch.createdAt) {
      return `Created on ${formatDate(batch.createdAt)}`;
    }
    return "Date not available";
  };

  const getSubjectDisplay = (batch: Batch) => {
    if (!batch.subjects || batch.subjects.length === 0) {
      return null;
    }

    const subjectNames = batch.subjects.map((subject) => subject.name);
    return subjectNames.join(", ");
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove || !selectedBatch) return;

    setIsRemoving(true);
    try {
      await axios.delete(`/api/students/${studentToRemove.id}/remove-from-batch/${selectedBatch.id}`);
      
      await refetchStudents();
      
      queryClient.invalidateQueries({ queryKey: ["admin-batches"] });
      
      setStudentToRemove(null);
    } catch (error) {
      console.error("Error removing student from batch:", error);
      alert("Failed to remove student from batch. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AdminRouteGuard>
      <div className="py-5 space-y-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#4637d2" }}>
              Batches
            </h2>
            <p className="text-muted-foreground">
              {filteredBatches.length}{" "}
              {filteredBatches.length === 1 ? "batch" : "batches"} available
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batch or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 border-[#4637d2]/20 focus:border-[#4637d2]/60"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-220px)] pb-4 pr-1">
          {loadingBatches ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: BATCHES_PER_PAGE }).map((_, i) => (
                <Skeleton key={i} className="h-[160px] w-full rounded-lg" />
              ))}
            </div>
          ) : paginatedBatches.length === 0 ? (
            <Card className="p-8 text-center border border-[#4637d2]/10">
              <div className="flex flex-col items-center justify-center space-y-3">
                <Info className="h-10 w-10 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No batches found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {search
                    ? `No batches matching "${search}" were found. Try another search term.`
                    : "There are no batches currently available in the system."}
                </p>
                {search && (
                  <Button
                    variant="outline"
                    onClick={() => setSearch("")}
                    className="mt-2 border-[#4637d2]/20 hover:border-[#4637d2]/60"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedBatches.map((batch) => (
                <Card
                  key={batch.id}
                  onClick={() => openDialog(batch)}
                  className={`cursor-pointer hover:shadow-md transition-all border border-[#4637d2]/10 hover:border-[#4637d2]/30 h-fit min-h-[160px] flex flex-col ${
                    selectedBatch?.id === batch.id
                  }`}
                >
                  <CardHeader className="bg-gradient-to-r from-[#4637d2]/5 to-[#00d746]/5 pb-2 flex-shrink-0">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle
                            className="text-base sm:text-lg leading-tight break-words hyphens-auto line-clamp-2"
                            title={batch.name}
                            style={{ 
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                          >
                            {batch.name}
                          </CardTitle>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground flex-shrink-0">
                          <Users className="h-4 w-4 mr-1 text-[#4637d2]" />
                          <span className="font-medium text-xs sm:text-sm">
                            {batch._count?.students ?? 0}
                          </span>
                        </div>
                      </div>
                      <CardDescription className="flex items-center text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {getDateDisplay(batch)}
                        </span>
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2 pb-0 flex-1 flex flex-col justify-between">
                    {getSubjectDisplay(batch) && (
                      <div className="flex items-start mb-2 text-sm">
                        <BookOpen className="h-4 w-4 mr-1.5 flex-shrink-0 text-[#00d746] mt-0.5" />
                        <span
                          className="line-clamp-2 break-words-safe text-sm leading-tight"
                          title={getSubjectDisplay(batch) || undefined}
                        >
                          {getSubjectDisplay(batch)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground mt-auto">
                      <Users className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">View enrolled students</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 pb-4 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className="bg-[#00d746]/5 text-[#00d746] border-[#00d746]/20 hover:bg-[#00d746]/10 text-xs"
                    >
                      Tap to view details
                    </Badge>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {!loadingBatches && totalPages > 1 && (
          <div className="flex justify-center items-center pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm px-3">
                    Page {page} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[#4637d2]/20 w-[95vw] sm:w-auto">
            <DialogHeader className="bg-gradient-to-r from-[#4637d2]/5 to-[#00d746]/5 -mx-6 px-6 pt-2 pb-4 mb-4 rounded-t-lg">
              <div className="flex items-center mb-1">
                {/* <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                  className="mr-2 -ml-2 hover:bg-[#4637d2]/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="text-sm">Back</span>
                </Button> */}
                <DialogTitle className="text-lg sm:text-xl flex items-start flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-[#4637d2] flex-shrink-0" />
                    <span className="text-base sm:text-xl">Students in:</span>
                  </div>
                  <span 
                    className="text-[#4637d2] break-words-safe line-clamp-2 text-base sm:text-xl font-semibold"
                    title={selectedBatch?.name}
                  >
                    {selectedBatch?.name}
                  </span>
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm space-y-1">
                {selectedBatch?.startDate && selectedBatch?.endDate ? (
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 inline flex-shrink-0" />
                    {formatDate(selectedBatch.startDate)} -{" "}
                    {formatDate(selectedBatch.endDate)}
                  </span>
                ) : selectedBatch?.createdAt ? (
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 inline flex-shrink-0" />
                    Created on {formatDate(selectedBatch.createdAt)}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 inline flex-shrink-0" />
                    Date not available
                  </span>
                )}
                {selectedBatch?.subjects &&
                  selectedBatch.subjects.length > 0 && (
                    <span className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1 inline flex-shrink-0 text-[#00d746]" />
                      {selectedBatch.subjects.map((s) => s.name).join(", ")}
                    </span>
                  )}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-grow overflow-y-auto min-h-0">
              {loadingStudents ? (
                <div className="space-y-3 p-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !students || students.length === 0 ? (
                <div className="text-center py-8">
                  <Info className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No students found enrolled in this batch.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-2 px-1 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {students.length}{" "}
                      {students.length === 1 ? "student" : "students"} enrolled
                    </span>
                  </div>

                  <div className="rounded-md border border-[#4637d2]/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>USN</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="w-20 text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student, index) => (
                            <TableRow
                              key={student.id}
                              className="hover:bg-[#4637d2]/5 transition-colors"
                            >
                              <TableCell className="font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell className="font-medium">
                                {student.name}
                              </TableCell>
                              <TableCell>{student.usnNumber}</TableCell>
                              <TableCell className="truncate max-w-[180px]">
                                {student.email || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStudentToRemove(student);
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  title="Remove student from batch"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end mt-4 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-[#4637d2]/20 hover:border-[#4637d2]/60 hover:bg-[#4637d2]/5"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!studentToRemove} onOpenChange={(open) => !open && setStudentToRemove(null)}>
          <AlertDialogContent className="border border-[#4637d2]/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Remove Student from Batch
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-foreground">
                    {studentToRemove?.name}
                  </span>{" "}
                  (USN: {studentToRemove?.usnNumber}) from the batch{" "}
                  <span className="font-semibold text-[#4637d2]">
                    {selectedBatch?.name}
                  </span>?
                </p>
                <p className="text-sm text-muted-foreground">
                  This action will remove the student from this batch but will not delete the student account.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isRemoving}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveStudent}
                disabled={isRemoving}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isRemoving ? "Removing..." : "Remove Student"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminRouteGuard>
  );
}
