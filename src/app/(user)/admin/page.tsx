"use client";
import React, { useState, useRef, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileSearch,
  Sun,
  Moon,
  Sparkles,
  Award,
  TrendingUp,
  UserPlus,
  Settings,
  Download,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
} from "lucide-react";
import { AnimatePresence, motion, useInView, Variants } from "framer-motion";


function BlurFade({
  children,
  className,
  variant,
  duration = 0.8,
  delay = 0,
  yOffset = 20,
  inView = false,
  inViewMargin = "-100px",
  blur = "8px",
}) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;

  const defaultVariants = {
    hidden: {
      y: yOffset,
      opacity: 0,
      filter: `blur(${blur})`,
      scale: 0.95,
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: `blur(0px)`,
      scale: 1,
    },
  };

  const combinedVariants = variant || defaultVariants;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={combinedVariants}
      transition={{
        delay: 0.1 + delay,
        duration,
        ease: [0.25, 0.25, 0, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const NavigationCard = ({ tab, index, isSelected, onSelect }) => {
  const Icon = tab.icon;

  const getDescription = (title) => {
    const descriptions = {
      Dashboard: "System Setup",
      Teachers: "Manage faculty and sessions",
      Students: "Student records and attendance",
      Batches: "Class groups and subjects",
      Subjects: "Course management",
      "Attendance Hub": "Master attendance data",
      "Attendance Review": "Leave requests and approvals",
    };
    return descriptions[title] || "";
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(index)}
      className={`
        relative overflow-hidden rounded-2xl border cursor-pointer
        transition-all duration-300 backdrop-blur-sm
        ${
          isSelected
            ? "border-[#4637d2] bg-[#4637d2]/5 dark:bg-[#4637d2]/10 shadow-lg shadow-[#4637d2]/20"
            : "border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50/80 dark:hover:bg-gray-700/50"
        }
      `}
    >

      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#4637d2]/5 to-transparent opacity-0"
        animate={{ opacity: isSelected ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative p-6">
        <div className="flex items-center space-x-4 mb-3">
          <div
            className={`
            p-3 rounded-xl transition-all duration-300
            ${
              isSelected
                ? "bg-[#4637d2] text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }
          `}
          >
            <Icon size={24} />
          </div>
          <div>
            <h3
              className={`
              font-semibold text-lg transition-colors duration-300
              ${
                isSelected
                  ? "text-[#4637d2] dark:text-[#4637d2]"
                  : "text-gray-800 dark:text-gray-200"
              }
            `}
            >
              {tab.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getDescription(tab.title)}
            </p>
          </div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-[#4637d2] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: isSelected ? "100%" : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

const StatsCard = ({ stat, index }) => {
  const Icon = stat.icon;

  return (
    <BlurFade delay={index * 0.1} inView>
      <motion.div
        whileHover={{
          scale: 1.02,
          y: -4,
          transition: { duration: 0.2 },
        }}
        className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      >

        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#4637d2]/5 to-transparent opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <Icon size={24} className={stat.iconColor} />
            </div>
            <TrendingUp size={16} className="text-[#00d746]" />
          </div>

          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        </div>
      </motion.div>
    </BlurFade>
  );
};

export default function AdminWelcomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(null);

  const navigationTabs = [
    { title: "Dashboard", icon: Home },
    { title: "Teachers", icon: Users },
    { title: "Students", icon: GraduationCap },
    { title: "Batches", icon: BookOpen },
    { title: "Subjects", icon: Calendar },
    { title: "Attendance Hub", icon: ClipboardCheck },
    { title: "Attendance Review", icon: FileSearch },
  ];

  const routes = [
    "/admin/manage",
    "/admin/teachers",
    "/admin/students",
    "/admin/batches",
    "/admin/subjects",
    "/admin/attendance-hub",
    "/admin/Attendance-Review",
  ];

  const fetchAdminStats = async () => {
    const response = await axios.get("/api/admin/stats");
    return response.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });

  const stats = [
  {
    label: "Total Students",
    value: isLoading || !data ? "..." : data.studentCount,
    icon: GraduationCap,
    iconColor: "text-[#4637d2]",
    bgColor: "bg-[#4637d2]/10",
  },
  {
    label: "Active Teachers",
    value: isLoading || !data ? "..." : data.teacherCount,
    icon: Users,
    iconColor: "text-[#00d746]",
    bgColor: "bg-[#00d746]/10",
  },
  {
    label: "Attendance Rate",
    value: isLoading || !data ? "..." : `${data.attendanceRate}%`,
    icon: TrendingUp,
    iconColor: "text-[#4637d2]",
    bgColor: "bg-[#4637d2]/10",
  },
  {
    label: "Total Batches",
    value: isLoading || !data ? "..." : data.batchCount,
    icon: BookOpen,
    iconColor: "text-[#00d746]",
    bgColor: "bg-[#00d746]/10",
  },
];


  const handleTabSelect = (index) => {
  setSelectedTab(index);
  router.push(routes[index]); 
};


  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <div className="min-h-screen bg-white dark:bg-[#000000] relative overflow-hidden">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-20 left-20 w-96 h-96 bg-[#4637d2]/3 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -50, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-20 right-20 w-80 h-80 bg-[#00d746]/3 rounded-full blur-3xl"
          />
        </div>


        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">

          <div className="text-center mb-12 lg:mb-16">
            {/* <BlurFade delay={0.1} inView>
              <motion.div 
                className="flex items-center justify-center mb-6"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 lg:p-6 bg-gradient-to-r from-[#4637d2] to-[#4637d2]/80 rounded-2xl shadow-2xl">
                  <Award className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
                </div>
              </motion.div>
            </BlurFade>
             */}
            <BlurFade delay={0.2} inView>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4">
                <span>Welcome Back! 👋</span>
              </h1>
            </BlurFade>

            <BlurFade delay={0.3} inView>
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                AU Academics Admin Portal
              </h2>
            </BlurFade>

            <BlurFade delay={0.4} inView>
              <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                Manage Atria University with ease and efficiency. Your dashboard
                is ready to help you track attendance, manage students, and
                oversee academic excellence.
              </p>
            </BlurFade>
          </div>


          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
            {stats.map((stat, index) => (
              <StatsCard key={stat.label} stat={stat} index={index} />
            ))}
          </div>


          <BlurFade delay={0.6} inView>
            <div className="text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Quick Navigation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a section to manage your institution
              </p>
            </div>
          </BlurFade>


          <BlurFade delay={0.7} inView>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
              {navigationTabs.map((tab, index) => (
                <NavigationCard
                  key={tab.title}
                  tab={tab}
                  index={index}
                  isSelected={selectedTab === index}
                  onSelect={handleTabSelect}
                />
              ))}
            </div>
          </BlurFade>


          <BlurFade delay={0.8} inView>
            <div className="text-center mt-16 lg:mt-20 pb-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Atria University © 2025 - Academic Management System
              </p>
            </div>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}
