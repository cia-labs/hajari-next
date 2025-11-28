"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

import {
  Loader2,
  Search,
  UserPlus,
  Trash2,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Info,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

type Teacher = {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  role: "teacher" | "staff";
  createdAt: string;
};

export default function TeachersPage() {
  const { getToken } = useAuth();
  const axios = useMemo(() => createAxiosInstance(getToken), [getToken]);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const PER_PAGE = 10;

  const queryClient = useQueryClient();

  const {
    data: list = [],
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: async () => {
      const res = await axios.get<Teacher[]>("/api/users/list");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list.filter((t) => {
      return (
        t.name.toLowerCase().includes(q) ||
        (t.employeeId ?? "").toLowerCase().includes(q) ||
        (t.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [list, search]);

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const handleOpenDeleteDialog = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;
    setWorkingId(teacherToDelete.id);
    try {
      await axios.delete(`/api/users/remove/${teacherToDelete.id}`);
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setWorkingId(null);
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(-1);
        pageNumbers.push(totalPages);
      } else if (page >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push(-1);
        for (let i = page - 1; i <= page + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(-1);
        pageNumbers.push(totalPages);
      }
    }

    return (
      <Pagination>
        <PaginationContent className="flex flex-wrap justify-center gap-1">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className={`border border-[#191919]/10 dark:border-white/10 rounded-md px-3 py-1.5 text-sm ${
                page === 1
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-[#191919]/5 dark:hover:bg-white/5"
              }`}
            />
          </PaginationItem>

          {pageNumbers.map((num, i) => (
            <PaginationItem key={i}>
              {num === -1 ? (
                <span className="px-2 py-1.5 text-slate-400">...</span>
              ) : (
                <button
                  onClick={() => setPage(num)}
                  className={`min-w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md border transition-colors ${
                    page === num
                      ? "bg-[#191919]/10 dark:bg-white/10 border-[#191919]/30 dark:border-white/30 text-[#191919] dark:text-white"
                      : "border-[#191919]/10 dark:border-white/10 hover:bg-[#191919]/5 dark:hover:bg-white/5"
                  }`}
                >
                  {num}
                </button>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className={`border border-[#191919]/10 dark:border-white/10 rounded-md px-3 py-1.5 text-sm ${
                page === totalPages
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-[#191919]/5 dark:hover:bg-white/5"
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderSkeleton = () => (
    <>
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <TableRow key={i} className="animate-pulse">
            <TableCell>
              <Skeleton className="h-6 w-6" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-48" />
            </TableCell>
            <TableCell>
              <div className="flex justify-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </TableCell>
          </TableRow>
        ))}
    </>
  );

  return (
    <AdminRouteGuard>
      <div className="py-3 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#191919] dark:to-[#333742] min-h-screen">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 ml-0 sm:ml-2 sm:mt-2 text-[#191919] dark:text-white hover:bg-[#191919]/5 dark:hover:bg-white/10 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            back
          </Button>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4637d2] to-[#00d746] dark:from-white dark:to-[#00d746] bg-clip-text text-transparent">
                Teachers Directory
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage faculty and staff members
              </p>
            </div>

            <div className="flex w-full sm:w-auto gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name, ID or email..."
                  className="pl-8 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#333742]/50 dark:text-white"
                />
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={isFetching}
                      className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#333742]/50"
                    >
                      <RefreshCw
                        className={`h-4 w-4 text-slate-600 dark:text-slate-300 ${
                          isFetching ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* <Button
                onClick={() => router.push("/admin")}
                className="whitespace-nowrap bg-gradient-to-r from-[#191919] to-[#333742] hover:from-[#333742] hover:to-[#191919] dark:from-[#00d746] dark:to-[#191919] dark:hover:from-[#00d746] dark:hover:to-[#333742] text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button> */}
            </div>
          </div>

          <Card className="border-slate-200 dark:border-slate-700/30 bg-white dark:bg-[#191919] shadow-sm overflow-hidden mt-6">
            <CardHeader className="bg-slate-50 dark:bg-[#333742]/20 border-b border-slate-100 dark:border-slate-700/30 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800 dark:text-white flex items-center">
                  <div className="w-2 h-6 bg-[#00d746] rounded-full mr-2"></div>
                  Faculty List
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Total: {filtered.length} teacher
                  {filtered.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>

              {filtered.length > 0 && !loading && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>View teacher details or manage their information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-[#333742]/20">
                    <TableRow className="border-slate-200 dark:border-slate-700/30">
                      <TableHead className="w-12 font-medium text-slate-700 dark:text-slate-300">
                        #
                      </TableHead>
                      <TableHead className="font-medium text-slate-700 dark:text-slate-300">
                        Name
                      </TableHead>
                      <TableHead className="font-medium text-slate-700 dark:text-slate-300">
                        Employee ID
                      </TableHead>
                      <TableHead className="font-medium text-slate-700 dark:text-slate-300">
                        Email
                      </TableHead>
                      <TableHead className="text-center font-medium text-slate-700 dark:text-slate-300">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      renderSkeleton()
                    ) : paginated.length === 0 ? (
                      <TableRow className="border-slate-200 dark:border-slate-700/30">
                        <TableCell
                          colSpan={5}
                          className="text-center py-12 text-slate-500 dark:text-slate-400"
                        >
                          {list.length === 0 ? (
                            <div className="flex flex-col items-center">
                              <UserPlus className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                              <p>
                                No teachers found. Add your first teacher to get
                                started.
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                              <p>No teachers match your search criteria.</p>
                              <Button
                                variant="link"
                                onClick={() => setSearch("")}
                                className="mt-2 text-[#191919] dark:text-[#00d746]"
                              >
                                Clear search
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((t, i) => (
                        <TableRow
                          key={t.id}
                          className="border-slate-200 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-[#333742]/10 transition-colors"
                        >
                          <TableCell className="font-medium text-slate-500 dark:text-slate-400">
                            {(page - 1) * PER_PAGE + i + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 bg-gradient-to-br text-white">
                                <AvatarFallback>
                                  {t.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-slate-800 dark:text-white">
                                {t.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {t.employeeId ? (
                              <Badge
                                variant="outline"
                                className="bg-slate-50 dark:bg-[#333742]/20 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333742]/40 border-slate-200 dark:border-slate-700/30"
                              >
                                {t.employeeId}
                              </Badge>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">
                            {t.email}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#4637d2] text-[#4637d2] hover:bg-[#4637d2] hover:text-white"
                                disabled={navigatingId === t.id}
                                onClick={() => {
                                  setNavigatingId(t.id);
                                  router.push(`/admin/teachers/${t.id}`);
                                }}
                              >
                                {navigatingId === t.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    Sessions
                                  </>
                                )}
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                disabled={workingId === t.id}
                                onClick={() => handleOpenDeleteDialog(t)}
                              >
                                {workingId === t.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {!loading && filtered.length > 0 && (
            <div className="flex justify-center mt-6">{renderPagination()}</div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#191919] border-slate-200 dark:border-slate-700/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800 dark:text-white">
              Delete Teacher
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to delete {teacherToDelete?.name}? This
              action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700/30 text-slate-700 dark:text-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {workingId ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminRouteGuard>
  );
}
