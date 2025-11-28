"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import createAxiosInstance from "@/lib/axiosInstance";

import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AdminRouteGuard from "@/components/route-guards/AdminRouteGuard";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDestructive,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  batches: { id: string; name: string }[];
}

export default function SubjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { getToken } = useAuth();
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);

  const {
    data: subjects = [],
    isLoading: isSubjectsLoading,
    refetch: refetchSubjects,
  } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: async () => {
      const res = await axios.get<Subject[]>("/api/subjects/list");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, 
  });

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setDeleteSubjectId(id);
    try {
      await axios.delete(`/api/subjects/remove/${id}`);
      toast.success("Subject deleted successfully!");
      await refetchSubjects();
    } catch (err) {
      console.error("Error deleting subject:", err);
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage = error?.response?.data?.error || "Failed to delete subject. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteSubjectId(null);
    }
  };

  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return subjects;
    const q = searchTerm.toLowerCase();
    return subjects.filter((s) => s.name.toLowerCase().includes(q));
  }, [subjects, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubjects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);

  if (isSubjectsLoading) {
    return (
      <AdminRouteGuard>
        <Container className="p-4 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          <Skeleton className="h-10 w-full" />

          <Card className="border border-[#4637d2]/10">
            <CardHeader className="bg-gradient-to-r from-[#4637d2]/5 to-[#00d746]/5 pb-2">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </Container>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard>
      <Container className="p-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#4637d2" }}>
              Subjects Directory
            </h2>
            <p className="text-muted-foreground">
              Manage all subjects in the system
            </p>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2">
            {/* <Button
            onClick={() => router.push("/admin/admin-dashboard")}
            className="bg-[#4637d2] hover:bg-[#4637d2]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Subject
          </Button> */}

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-[#4637d2]/20 focus:border-[#4637d2]/60"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => refetchSubjects()}
              className="border-[#00d746]/20 hover:border-[#00d746]/60 hover:bg-[#00d746]/5"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border border-[#4637d2]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#4637d2]/5 to-[#00d746]/5">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-[#4637d2]" />
              Subject Records
            </CardTitle>
            <CardDescription>
              {filteredSubjects.length} subjects found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Assigned Batches</TableHead>
                  <TableHead className="text-center w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((subject, index) => (
                    <TableRow
                      key={subject.id}
                      className="hover:bg-[#4637d2]/5 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {indexOfFirstItem + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {subject.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {subject.batches.length > 0 ? (
                            subject.batches.map((batch) => (
                              <Badge
                                key={batch.id}
                                className="bg-[#00d746]/10 text-[#00d746] hover:bg-[#00d746]/20 border border-[#00d746]/20"
                              >
                                {batch.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No batches assigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader variant="destructive">
                                <AlertDialogTitle variant="destructive">
                                  Delete Subject
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;
                                  {subject.name}
                                  &quot;? This action cannot be undone and will
                                  permanently remove the subject from all
                                  associated batches.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogDestructive
                                  onClick={() => handleDelete(subject.id)}
                                  disabled={
                                    isDeleting && deleteSubjectId === subject.id
                                  }
                                >
                                  {isDeleting &&
                                  deleteSubjectId === subject.id ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>Delete</>
                                  )}
                                </AlertDialogDestructive>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? `No subjects matching "${searchTerm}" found.`
                            : "No subjects available."}
                        </p>
                        {searchTerm && (
                          <Button
                            variant="link"
                            onClick={() => setSearchTerm("")}
                            className="mt-2"
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredSubjects.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredSubjects.length)} of{" "}
              {filteredSubjects.length} subjects
            </p>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {currentPage > 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}

                {currentPage > 3 && (
                  <PaginationItem>
                    <span className="px-2">...</span>
                  </PaginationItem>
                )}

                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationLink isActive>{currentPage}</PaginationLink>
                </PaginationItem>

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      {currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}

                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <span className="px-2">...</span>
                  </PaginationItem>
                )}

                {currentPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Container>
    </AdminRouteGuard>
  );
}
