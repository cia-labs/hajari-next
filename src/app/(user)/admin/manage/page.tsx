"use client";

import { Toaster } from "sonner";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  GraduationCap,
  BookOpen,
  Library,
} from "lucide-react";
import AdminRouteGuard from "@/components/route-guards/AdminRouteGuard";
import ShineBorder from "@/components/ui/shine-border";

import AddAdmin from "@/components/dashboard/AddAdmin";
import AddTeacher from "@/components/dashboard/AddTeacher";
import AddStudent from "@/components/dashboard/AddStudent";
import AddBatch from "@/components/dashboard/AddBatch";
import AddSubject from "@/components/dashboard/AddSubject";

export default function AdminDashboardPage() {
  const [activeTab1, setActiveTab1] = useState("admin");
  const [activeTab2, setActiveTab2] = useState("subject");

  return (
    <>
      <AdminRouteGuard>
        <Toaster position="bottom-right" richColors />
  
        <div className="py-4 md:p-6 space-y-6">
        
          <ShineBorder
            borderRadius={12}
            borderWidth={1.2}
            duration={10}
            color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
            className="block w-full"
          >
            <Card className="border border-gray-200">
              <CardContent className="p-4 md:p-6">
                <Tabs
                  defaultValue="admin"
                  className="w-full"
                  value={activeTab1}
                  onValueChange={setActiveTab1}
                >
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger
                      id="add-admin-tab"
                      value="admin"
                      className="flex items-center gap-2"
                    >
                      <Users size={16} className="hidden sm:inline" />
                      <span className="hidden md:inline">Add Admin</span>
                      <span className="md:hidden">Admin</span>
                    </TabsTrigger>
  
                    <TabsTrigger
                      value="teacher"
                      className="flex items-center gap-2"
                    >
                      <UserPlus size={16} className="hidden sm:inline" />
                      <span className="hidden md:inline">Add Teacher</span>
                      <span className="md:hidden">Teacher</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="student"
                      className="flex items-center gap-2"
                    >
                      <GraduationCap size={16} className="hidden sm:inline" />
                      <span className="hidden md:inline">Add Student</span>
                      <span className="md:hidden">Student</span>
                    </TabsTrigger>
                  </TabsList>
  
                  <TabsContent value="admin" className="mt-0">
                    <AddAdmin />
                  </TabsContent>
                  <TabsContent value="teacher" className="mt-0">
                    <AddTeacher />
                  </TabsContent>
                  <TabsContent value="student" className="mt-0">
                    <AddStudent />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </ShineBorder>
  
         
          <ShineBorder
            borderRadius={12}
            borderWidth={1.2}
            duration={10}
            color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
            className="block w-full"
          >
            <Card className="border border-gray-200">
              <CardContent className="p-4 md:p-6">
                <Tabs
                  defaultValue="subject"
                  className="w-full"
                  value={activeTab2}
                  onValueChange={setActiveTab2}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger
                      value="subject"
                      className="flex items-center gap-2"
                    >
                      <Library size={16} className="hidden sm:inline" />
                      <span className="hidden md:inline">Add Subject</span>
                      <span className="md:hidden">Subject</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="batch"
                      className="flex items-center gap-2"
                    >
                      <BookOpen size={16} className="hidden sm:inline" />
                      <span className="hidden md:inline">Add Batch</span>
                      <span className="md:hidden">Batch</span>
                    </TabsTrigger>
                  </TabsList>
  
                  <TabsContent value="subject" className="mt-0">
                    <AddSubject />
                  </TabsContent>
                  <TabsContent value="batch" className="mt-0">
                    <AddBatch />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </ShineBorder>
        </div>
      </AdminRouteGuard>
    </>
  );
  
}
