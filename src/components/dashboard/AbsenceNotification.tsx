"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell, RefreshCw, Mail, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@clerk/clerk-react";
import createAxiosInstance from "@/lib/axiosInstance";

export default function AbsenceNotification() {
  const { getToken } = useAuth();
  const axiosInstance = useMemo(() => createAxiosInstance(getToken), [getToken]);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/api/attendances/notifications");
      if (res.data && res.data.notifications) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getSeverityColor = (days: number) => {
    if (days >= 7) return "border-red-500";
    if (days >= 4) return "border-[#4637d2]";
    return "border-[#00d746]";
  };

  const getSeverityBadgeStyle = (days: number) => {
    if (days >= 7) return "bg-red-100 text-red-800 border-red-200";
    if (days >= 4) return "bg-[#ededff] text-[#4637d2] border-[#d8d6ff]";
    return "bg-[#e3fff0] text-[#00a539] border-[#c9f5db]";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-slate-50 transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge
                    className={`absolute -top-1 -right-1 ${
                      notifications.some(n => n.consecutiveDays >= 5) 
                        ? "animate-pulse bg-red-500" 
                        : "bg-[#4637d2]"
                    } text-white text-xs min-w-5 h-5 flex items-center justify-center p-0 rounded-full`}
                  >
                    {notifications.length > 99 ? "99+" : notifications.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Absence Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium">
              Student Absence Alerts
            </DialogTitle>
            {/* <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button> */}
          </div>
          <DialogDescription>
            Students with consecutive absences require your attention.
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-1" />
        
        <ScrollArea className="h-80 pr-2">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin text-[#4637d2]" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchNotifications} 
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-sm text-muted-foreground">No active absence notifications</p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {notifications.map((notif, index) => (
                <Card 
                  key={index} 
                  className={`border-l-4 ${getSeverityColor(notif.consecutiveDays)} transition-all hover:shadow-sm`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-slate-50 text-slate-700 text-xs">
                          {getInitials(notif.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm">{notif.studentName}</h4>
                          <Badge 
                            variant="outline"
                            className={`ml-2 text-xs ${getSeverityBadgeStyle(notif.consecutiveDays)}`}
                          >
                            {notif.consecutiveDays} {notif.consecutiveDays === 1 ? 'day' : 'days'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">USN: {notif.studentUSN || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">Last: {formatDate(notif.lastAbsenceDate)}</p>
                        </div>
                        
                        <div className="pt-2 flex items-center gap-2 justify-between">
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${notif.studentEmail}&su=Regarding%20Your%20Consecutive%20Absences&body=Dear%20${notif.studentName},%0A%0AWe%20noticed%20you%20have%20been%20absent%20for%20${notif.consecutiveDays}%20consecutive%20days.%0A%0APlease%20contact%20the%20admin%20office%20regarding%20your%20attendance.%0A%0ARegards,%0AAdmin`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs font-medium text-[#4637d2] hover:text-[#322a94] transition-colors"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Contact
                          </a>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-6 px-2"
                          >
                            Details <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="flex justify-end items-center pt-2">
          <Button 
            onClick={fetchNotifications}
            size="sm"
            className="bg-[#4637d2] hover:bg-[#322a94] text-white"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}