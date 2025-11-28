"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import createAxiosInstance from "@/lib/axiosInstance";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import AdminRouteGuard from "@/components/route-guards/AdminRouteGuard";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDestructive,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Trash2, UserCheck, RefreshCw, ArrowLeft } from "lucide-react";

interface Batch {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  usnNumber: string;
  email: string;
  batches: Batch[];
}

export default function StudentsPage() {
  const { getToken } = useAuth();
  const axiosInstance = useMemo(
    () => createAxiosInstance(getToken),
    [getToken]
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);
  const [navigatingStudentId, setNavigatingStudentId] = useState<string | null>(null);
  const PER_PAGE = 25;
  const router = useRouter();

  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);
  const queryClient = useQueryClient();

  const {
    data: students = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["admin-students"],
    queryFn: () =>
      axios.get<Student[]>("/api/students/list").then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const handleDeleteStudent = async (id: string) => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/students/remove/${id}`);
      toast.success("Student deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    } catch (err) {
      console.error("Failed to delete student", err);
      toast.error("Failed to delete student. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteStudentId(null);
    }
  };

  const sortedStudents = [...students].sort((a, b) =>
  b.usnNumber.localeCompare(a.usnNumber)
);

const filtered = sortedStudents.filter((s) => {
  const q = search.toLowerCase();
  return (
    s.name.toLowerCase().includes(q) ||
    s.usnNumber.toLowerCase().includes(q) ||
    (s.email ?? "").toLowerCase().includes(q)
  );
});


  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  return (
    <AdminRouteGuard>
      <div className="py-4 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 ml-0 sm:ml-2 sm:mt-2 text-[#4637d2] hover:bg-[#4637d2]/10 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          back
        </Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#4637d2" }}>
              Students Directory
            </h2>
            <p className="text-muted-foreground">
              Manage all students in the system
            </p>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, USN, email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 border-[#4637d2]/20 focus:border-[#4637d2]/60"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="border-[#00d746]/20 hover:border-[#00d746]/60 hover:bg-[#00d746]/5"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border border-[#4637d2]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#4637d2]/5 to-[#00d746]/5">
            <CardTitle>Student Records</CardTitle>

            {loading ? (
              <Skeleton className="h-5 w-36" />
            ) : (
              <CardDescription>
                {filtered.length} students found
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-36" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>USN</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Batches</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground h-32"
                        >
                          <div className="flex flex-col items-center justify-center">
                            {/* <Icons.empty className="h-10 w-10 text-muted-foreground/50 mb-2" /> */}
                            <p>No students found matching your criteria.</p>
                            {search && (
                              <Button
                                variant="link"
                                onClick={() => setSearch("")}
                                className="mt-2"
                              >
                                Clear search
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((s, i) => (
                        <TableRow
                          key={s.id}
                          className="hover:bg-[#4637d2]/5 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {(page - 1) * PER_PAGE + i + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {s.name}
                          </TableCell>
                          <TableCell>{s.usnNumber}</TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#4637d2]/20 hover:border-[#4637d2]/60 hover:bg-[#4637d2]/5"
                                >
                                  View&nbsp;({s.batches.length})
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="border border-[#4637d2]/20">
                                <DialogHeader>
                                  <DialogTitle>
                                    Batches for {s.name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Showing all batches this student is enrolled
                                    in
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-wrap gap-2 py-4">
                                  {s.batches.length === 0 ? (
                                    <p className="text-muted-foreground">
                                      No batches assigned yet.
                                    </p>
                                  ) : (
                                    s.batches.map((b) => (
                                      <Badge
                                        key={b.id}
                                        className="bg-[#00d746]/10 text-[#00d746] hover:bg-[#00d746]/20 border border-[#00d746]/20"
                                      >
                                        {b.name}
                                      </Badge>
                                    ))
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setNavigatingStudentId(s.id);
                                  router.push(`/admin/students/${s.id}`);
                                }}
                                className="border-[#4637d2]/20 hover:border-[#4637d2]/60 hover:bg-[#4637d2]/5"
                                disabled={navigatingStudentId === s.id}
                              >
                                {navigatingStudentId === s.id ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Attendance
                                  </>
                                )}
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500"
                                    onClick={() => setDeleteStudentId(s.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent className="border border-red-200">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle variant="destructive">
                                      Delete Student
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {s.name}?
                                      This action cannot be undone and will
                                      permanently remove the student.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogDestructive
                                      onClick={() => handleDeleteStudent(s.id)}
                                      disabled={
                                        isDeleting && deleteStudentId === s.id
                                      }
                                    >
                                      {isDeleting &&
                                      deleteStudentId === s.id ? (
                                        <>
                                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        <>Delete</>
                                      )}
                                    </AlertDialogDestructive>
                                  </AlertDialogFooter>
                                  <AlertDialogClose />{" "}
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * PER_PAGE + 1} to{" "}
              {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}{" "}
              students
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
