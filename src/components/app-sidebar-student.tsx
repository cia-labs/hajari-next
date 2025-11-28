"use client";

import { Layout, PieChart, ListChecks, BarChart2, Clock, User } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher-student";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useUser } from "@clerk/nextjs";

import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebarStudent(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded } = useUser();

  const teams = [
    {
      name: "Atria University",
      logo: "/Atria logo.svg",
      plan: "Student",
    },
  ];

  const navMain = [
    {
      title: "Apps",
      url: "/student",
      icon: User,
      isActive: true,
      items: [{ title: "Student Dashboard", url: "/student" }],
    },
    // {
    //   title: "Attendance Insights",
    //   url: "/student/attendance-summary",
    //   icon: PieChart,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Summary",
    //       url: "/student/attendance-summary",
    //       icon: ListChecks,
    //     },
    //     {
    //       title: "Statistics",
    //       url: "/student/attendance-statistics",
    //       icon: BarChart2,
    //     },
    //     { title: "History", url: "/student/attendance-history", icon: Clock },
    //   ],
    // },
  ];

  const projects = [];

  return (
    <Sidebar
      collapsible="icon"
      className="sidebar-au-theme border-r border-[#00d746]/18"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        {projects.length > 0 && <NavProjects projects={projects} />}
      </SidebarContent>

      <SidebarFooter>
        {isLoaded && user ? (
          <NavUser
            user={{
              name: user.fullName || "Student",
              email:
                user.primaryEmailAddress?.emailAddress ||
                "student@atriauniversity.edu.in",
              avatar: "/AU.png",
              // avatar: user.imageUrl || "/AU.png",
            }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
