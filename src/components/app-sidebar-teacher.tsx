"use client";

import {
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher-teacher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useUser } from "@clerk/nextjs"; 
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebarTeacher(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded } = useUser(); 

  const teams = [
    {
      name: "Atria University",
      logo: "/Atria logo.svg",
      plan: "Teacher",
    },
  ];

  const navMain = [
    {
      title: "Apps",
      url: "/teacher",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "Teacher Dashboard", url: "/teacher" },
        { title: "Take Attendance", url: "/teacher/attendance" },
        { title: "View History", url: "/teacher/sessions" },
      ],
    },
  ];

  const projects = []; 

  return (
    <Sidebar collapsible="icon" {...props}>
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
              name: user.fullName || "Teacher",
              email: user.primaryEmailAddress?.emailAddress || "teacher@atriauniversity.edu.in",
              avatar: "/AU.png",
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
