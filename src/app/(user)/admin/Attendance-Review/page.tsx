"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShineBorder from "@/components/ui/shine-border";
import {
  CalendarIcon,
  FileIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FileTextIcon,
  GraduationCapIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ExceptionRequest {
  id: string;
  date: string;
  reasonType: string;
  reason?: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  student: {
    name: string;
    usnNumber?: string;
    email?: string;
    avatarUrl?: string;
  };
  reviewedBy?: {
    name: string;
  };
  reviewedAt?: string;
}

export default function AttendanceExceptionAdminPage() {
  const [requests, setRequests] = useState<ExceptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/attendance-exceptions/list");
      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      setRequests(data.requests);
    } catch (err) {
      setError("Failed to load exception requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/attendance-exceptions/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      toast.success(
        <div className="flex items-center gap-2">
          {status === "approved" ? (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-red-500" />
          )}
          <span>
            Request {status === "approved" ? "approved" : "rejected"}{" "}
            successfully
          </span>
        </div>,
        {
          icon: null, 
        }
      );

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((req) => req.status === activeTab);

  const getInitials = (name?: string) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon className="h-4 w-4 text-emerald-600" />;
      case "rejected":
        return <XCircleIcon className="h-4 w-4 text-rose-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-amber-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="py-3 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Attendance Exception Requests
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Review and manage student attendance exception requests
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <ShineBorder
          borderRadius={13}
          borderWidth={1.1}
          duration={10}
          color={["#FFC75F", "#F9F871", "#FFE29A"]}
          className="block w-full"
        >
          <Card>
            <CardContent className="p-3 md:p-4 flex justify-between items-center text-foreground">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground dark:text-slate-400">
                  Pending
                </p>
                <p className="text-xl md:text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <ClockIcon className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </ShineBorder>
        <ShineBorder
          borderRadius={13}
          borderWidth={1.1}
          duration={10}
          color={["#00F5A0", "#00D9F5", "#38F9D7"]}
          className="block w-full"
        >
          <Card>
            <CardContent className="p-3 md:p-4 flex justify-between items-center text-foreground">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground dark:text-slate-400">
                  Approved
                </p>
                <p className="text-xl md:text-2xl font-bold">{approvedCount}</p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-full">
                <CheckCircleIcon className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </ShineBorder>

        <ShineBorder
          borderRadius={13}
          borderWidth={1.1}
          duration={10}
          color={["#FF6F91", "#FF3CAC", "#FF6B6B"]}
          className="block w-full"
        >
          <Card>
            <CardContent className="p-3 md:p-4 flex justify-between items-center text-foreground">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground dark:text-slate-400">
                  Rejected
                </p>
                <p className="text-xl md:text-2xl font-bold">{rejectedCount}</p>
              </div>
              <div className="bg-rose-100 p-2 rounded-full">
                <XCircleIcon className="h-4 w-4 md:h-5 md:w-5 text-[#fc5308]" />
              </div>
            </CardContent>
          </Card>
        </ShineBorder>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="p-4 md:px-6 md:pt-6 md:pb-2">
          <CardTitle className="text-lg md:text-xl">
            Exception Requests
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Review and manage student leave requests
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 md:px-6 pt-0 md:pt-2">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                Pending
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs">
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs">
                Rejected
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-3 md:p-6 overflow-hidden">
            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="space-y-3 md:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-3 md:p-4">
                      <div className="flex gap-3 md:gap-4 items-center">
                        <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-3 md:h-4 w-1/3" />
                          <Skeleton className="h-3 md:h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-6 md:h-8 w-16 md:w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 md:py-10">
                  <FileTextIcon className="mx-auto h-10 w-10 md:h-12 md:w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-3 md:mt-4 text-base md:text-lg font-medium">
                    No requests found
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {activeTab === "all"
                      ? "There are no exception requests yet."
                      : `There are no ${activeTab} requests.`}
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[60vh] md:max-h-[500px] w-full overflow-auto">
                  <div className="space-y-3 md:space-y-4 pr-2">
                    {filteredRequests.map((req) => (
                      <div
                        key={req.id}
                        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:shadow-md"
                      >
                        <div className="p-3 md:p-4">
                          <div className="flex flex-col space-y-4">
                            {/* Top Section */}
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-between">
                              <div className="flex gap-3 md:gap-4 items-center">
                                <Avatar className="h-10 w-10 md:h-12 md:w-12 border flex-shrink-0 bg-[#4637d2]/10 dark:bg-[#4637d2]/20">
                                  <AvatarFallback className="flex items-center justify-center h-full w-full">
                                    <GraduationCapIcon className="h-5 w-5 md:h-6 md:w-6" />
                                  </AvatarFallback>
                                </Avatar>

                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <h3 className="font-medium text-sm md:text-base truncate text-foreground">
                                      {req.student?.name}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs font-normal flex items-center gap-1 ${getStatusColor(
                                        req.status
                                      )}`}
                                    >
                                      {getStatusIcon(req.status)}
                                      <span>
                                        {req.status.charAt(0).toUpperCase() +
                                          req.status.slice(1)}
                                      </span>
                                    </Badge>
                                  </div>
                                  {req.student?.usnNumber && (
                                    <p className="text-xs text-muted-foreground">
                                      USN: {req.student.usnNumber}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {req.status === "pending" && (
                                <div className="flex gap-2 self-start sm:self-center">
                                  <Button
                                    onClick={() =>
                                      handleReview(req.id, "approved")
                                    }
                                    className="bg-[#00d746] hover:bg-[#00d746]/90 text-white h-8 px-3 text-xs"
                                    size="sm"
                                    disabled={processingId === req.id}
                                  >
                                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleReview(req.id, "rejected")
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 h-8 px-3 text-xs"
                                    disabled={processingId === req.id}
                                  >
                                    <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Reason & Info */}
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center text-xs md:text-sm text-muted-foreground gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  <span>{req.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  <span>{req.reasonType}</span>
                                </div>
                              </div>
                              {req.reason && (
                                <p className="text-xs md:text-sm mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 break-words">
                                  {req.reason}
                                </p>
                              )}
                              <a
                                href={req.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#4637d2] dark:text-[#a5b4fc] hover:text-[#4637d2]/80 dark:hover:text-[#a5b4fc]/80 underline-offset-4 hover:underline text-xs md:text-sm inline-flex items-center gap-1"
                              >
                                <FileIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                View supporting document
                              </a>
                            </div>

                            {/* Submitted Info */}
                            <div className="flex flex-wrap justify-between items-center pt-1 text-xs text-muted-foreground border-t border-slate-100 dark:border-slate-700">
                              <div>Submitted: {formatDate(req.createdAt)}</div>
                              {req.status !== "pending" &&
                                req.reviewedBy &&
                                req.reviewedAt && (
                                  <div>
                                    {req.status.charAt(0).toUpperCase() +
                                      req.status.slice(1)}{" "}
                                    by {req.reviewedBy.name} (
                                    {formatDate(req.reviewedAt)})
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
