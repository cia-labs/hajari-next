"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChevronDown, ChevronUp } from "lucide-react";

import StudentRouteGuard from "@/components/route-guards/StudentRouteGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ShineBorder from "@/components/ui/shine-border";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Student } from "../types/student/route";

const auTheme = {
  primary: "#4637d2",
  secondary: "#00d746",
  white: "#ffffff",
};

export default function StudentProfile() {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/students/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setProfile(data.student);
        } else {
          console.error("Profile fetch failed", data.error);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [getToken]);

  if (loading) {
    return (
      <StudentRouteGuard>
        <Card className="mb-6 border border-[#00d746]/20 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </StudentRouteGuard>
    );
  }

  if (!profile) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const batches = profile.batches || [];
  const hasManyBatches = batches.length > 3;
  const visibleBatches = hasManyBatches ? batches.slice(0, 2) : batches;
  const hiddenBatchesCount = batches.length - visibleBatches.length;

  return (
    <StudentRouteGuard>
      <ShineBorder
        borderRadius={12}
        borderWidth={1.4}
        duration={10}
        color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        className="block w-full"
      >
<Card className="border border-[#00d746]/30 shadow-sm overflow-hidden bg-gradient-to-br from-white to-[#00d746]/5 dark:from-[#0c0c0c] dark:to-[#00d746]/10">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-[#00d746]/30 ring-offset-1">
                <AvatarFallback
                  style={{
                    background:
                      "linear-gradient(135deg, #00d746 0%, #4637d2 100%)",
                    color: auTheme.white,
                  }}
                  className="text-lg"
                >
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#4637d2]">
                  {profile.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  USN: {profile.usnNumber || "Not assigned"}
                </p>
              </div>
            </div>

            <hr className="my-3 border-[#00d746]/10" />

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
<div className="p-2 sm:p-3 rounded-lg border border-[#00d746]/20 hover:border-[#00d746]/40 transition-colors bg-white/70 dark:bg-[#1a1a1a]/70">
                <span className="text-xs sm:text-sm text-[#4637d2] font-medium block mb-1">
                  Email
                </span>
                <span className="text-sm sm:text-base truncate block">
                  {profile.email}
                </span>
              </div>

<div className="p-2 sm:p-3 rounded-lg border border-[#4637d2]/20 hover:border-[#4637d2]/40 transition-colors bg-white/70 dark:bg-[#1a1a1a]/70">
                <span className="text-xs sm:text-sm text-[#4637d2] font-medium block mb-1">
                  USN
                </span>
                <span className="text-sm sm:text-base">
                  {profile.usnNumber || "Not assigned"}
                </span>
              </div>

              <div className="flex gap-2 sm:gap-3 col-span-2">
<div className="flex-grow w-[70%] p-2 sm:p-3 rounded-lg border border-[#4637d2]/20 hover:border-[#4637d2]/40 transition-colors bg-white/70 dark:bg-[#1a1a1a]/70">
                  <span className="text-xs sm:text-sm text-[#4637d2] font-medium block mb-1">
                    Batches
                  </span>

                  {batches.length === 0 ? (
                    <span className="text-sm sm:text-base">
                      Not assigned to any batch
                    </span>
                  ) : (
                    <Collapsible
                      open={isOpen}
                      onOpenChange={setIsOpen}
                      className="w-full"
                    >
                      <div className="flex flex-wrap gap-1">
                        {visibleBatches.map((batch, index) => (
                          <Badge
                            key={index}
                            className="bg-[#4637d2]/10 text-[#4637d2] hover:bg-[#4637d2]/20 px-2 py-0.5 text-xs"
                          >
                            {batch.name}
                          </Badge>
                        ))}

                        {hasManyBatches && !isOpen && (
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-2 text-xs text-[#4637d2] hover:text-[#4637d2] hover:bg-[#4637d2]/10"
                            >
                              +{hiddenBatchesCount} more{" "}
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </div>

                      <CollapsibleContent className="mt-1">
                        <div className="flex flex-wrap gap-1">
                          {batches
                            .slice(visibleBatches.length)
                            .map((batch, index) => (
                              <Badge
                                key={index}
                                className="bg-[#4637d2]/10 text-[#4637d2] hover:bg-[#4637d2]/20 px-2 py-0.5 text-xs"
                              >
                                {batch.name}
                              </Badge>
                            ))}
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-2 mt-1 text-xs text-[#4637d2] hover:text-[#4637d2] hover:bg-[#4637d2]/10"
                          >
                            Show less <ChevronUp className="h-3 w-3 ml-1" />
                          </Button>
                        </CollapsibleTrigger>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>

                {/* <div className="w-[30%] p-2 sm:p-3 rounded-lg border border-[#00d746]/20 hover:border-[#00d746]/40 transition-colors bg-white/70 flex flex-col">
              <span className="text-xs sm:text-sm text-[#4637d2] font-medium block mb-1">
                Status
              </span>
              <div className="flex items-center h-full">
                <Badge
                  variant={profile.active ? "default" : "destructive"}
                  className="text-xs sm:text-sm px-2 py-0"
                  style={{
                    backgroundColor: profile.active ? auTheme.secondary : "#ef4444",
                    color: auTheme.white,
                  }}
                >
                  {profile.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </ShineBorder>
    </StudentRouteGuard>
  );
}
