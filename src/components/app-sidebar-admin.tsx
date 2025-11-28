"use client";

import {
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  LineChart,
  ClipboardCheck,
  Home,
  UserCheck,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher-admin";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  teams: [
    {
      name: "Atria University",
      logo: "/Atria logo.svg",
      plan: "Admin",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/admin",
      icon: Home,
      items: [
        { title: "Admin Dashboard", url: "/admin" },
        { title: "System Setup", url: "/admin/manage" },
      ],
    },
    {
      title: "Teachers",
      url: "/admin/teachers",
      icon: Users,
      isActive: true,
      items: [{ title: "Teachers Directory", url: "/admin/teachers" }],
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: GraduationCap,
      isActive: true,
      items: [{ title: "Students Directory", url: "/admin/students" }],
    },
    {
      title: "Batches",
      url: "/admin/batches",
      icon: Layers,
      isActive: true,
      items: [{ title: "Batch List", url: "/admin/batches" }],
    },
    {
      title: "Subjects",
      url: "/admin/subjects",
      icon: BookOpen,
      isActive: true,
      items: [{ title: "Subject List", url: "/admin/subjects" }],
    },
    {
      title: "Take Attendance",
      url: "/admin/take-attendance",
      icon: UserCheck,
      isActive: true,
      items: [{ title: "Mark Attendance", url: "/admin/take-attendance" }],
    },
    {
      title: "Master Attendance Hub",
      url: "/admin/attendance",
      icon: LineChart,
      isActive: true,
      items: [{ title: "Dashboard", url: "/admin/attendance-hub" }],
    },
    {
      title: "Exception Requests",
      url: "/admin/attendance-exceptions",
      icon: ClipboardCheck,
      isActive: true,
      items: [{ title: "Review Requests", url: "/admin/Attendance-Review" }],
    },
  ],
  projects: [],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  const dynamicUser = {
    name: user?.fullName || "Admin User",
    email:
      user?.primaryEmailAddress?.emailAddress || "admin@atriauniversity.edu.in",
    avatar: "/AU.png",
  };

  const handleAddTeamClick = () => {
    if (window.location.pathname === "/admin") {
      const addAdminTab = document.getElementById("add-admin-tab");

      if (addAdminTab) {
        addAdminTab.classList.add("animate-pulse");

        setTimeout(() => {
          addAdminTab.classList.remove("animate-pulse");
        }, 1000);

        addAdminTab.scrollIntoView({ behavior: "smooth", block: "center" });

        toast.success("Add Admin here!!!");
      }
    } else {
      window.location.href = "/admin";
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="sidebar-au-theme border-r border-[#00d746]/18"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} onAddTeamClick={handleAddTeamClick} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {data.projects.length > 0 && <NavProjects projects={data.projects} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={dynamicUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
