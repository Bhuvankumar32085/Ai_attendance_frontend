import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaUsers,
  FaClipboardList,
  FaEllipsisV,
  FaUserPlus,
  FaEye,
  FaTimes,
  FaPlay,
  FaStop,
} from "react-icons/fa";
import { useAppSelector } from "../../redux/hook";
import { AddClassModal } from "./AddClassModal";
import { EnrollStudentModal } from "./EnrollStudentModal";
import API from "../../api/api";
import axios from "axios";

// Updated Interface matching your new Dashboard Data structure
interface Student {
  user_id: number;
  name: string;
}

interface DashboardSubject {
  subject_id: number;
  subject_name: string;
  students: Student[];
  subject_code?: string;
  subject_section?: string;
  status?: "start" | "close"; // NAYA LOGIC: Attendance portal status
}

export const Teacher: React.FC = () => {
  const { loggedUser } = useAppSelector((state) => state.user);

  // Modal States
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedSubjectForEnroll, setSelectedSubjectForEnroll] = useState<
    number | null
  >(null);

  // New States for Dashboard Data & UI Controls
  const [dashboardData, setDashboardData] = useState<DashboardSubject[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [viewStudentsModal, setViewStudentsModal] = useState<{
    isOpen: boolean;
    subject: DashboardSubject | null;
  }>({
    isOpen: false,
    subject: null,
  });

  const [classes, setClasses] = useState<DashboardSubject[]>([]);

  // Handler: Add New Class
  const handleAddClass = (data: {
    subject_name: string;
    subject_code: string;
    subject_section: string;
  }) => {
    console.log("Submitting Class to DB:", {
      ...data,
      teacher_id: loggedUser?.user_id,
    });
    const newClass: DashboardSubject = {
      subject_id: Date.now(),
      subject_name: data.subject_name,
      subject_code: data.subject_code,
      subject_section: data.subject_section,
      students: [],
      status: "close", // By default class band rahegi
    };
    setDashboardData([newClass, ...dashboardData]);
    setIsAddClassOpen(false);
  };

  // Handler: Enroll Student
  const handleEnrollStudent = (data: {
    student_id: number;
    subject_id: number;
  }) => {
    console.log("Enrolling Student to DB:", data);
    alert(
      `Student ID ${data.student_id} has been enrolled in Class ID ${data.subject_id} successfully!`,
    );
    setIsEnrollModalOpen(false);
  };

  // Open Enroll Modal for specific class
  const openEnrollForClass = (subject_id: number) => {
    setSelectedSubjectForEnroll(subject_id);
    setIsEnrollModalOpen(true);
  };

  // ================= NAYA LOGIC: TOGGLE ATTENDANCE STATUS =================
  const handleToggleAttendance = async (
    subject_id: number,
    currentStatus?: string,
  ) => {
    console.log("currentStatus :-", currentStatus);
    const newStatus = currentStatus === "start" ? "close" : "start";
    console.log("newStatus :-", newStatus);

    // 1. Optimistic UI Update (Screen par turant change dikhega)
    setDashboardData((prevData) =>
      prevData.map((cls) =>
        cls.subject_id === subject_id ? { ...cls, status: newStatus } : cls,
      ),
    );

    try {
      // 2. Backend API Call
      await API.put(`/auth/update-class-status`, {
        subject_id: subject_id,
        teacher_id: loggedUser?.user_id,
      });
      console.log(`Class ${subject_id} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update attendance status", error);
      let message = "Something went wrong";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || message;
      }
      console.log(message);
    }
  };
  // =======================================================================

  useEffect(() => {
    const fatchClass = async () => {
      try {
        const { data } = await API.get(
          `/auth/get-classes/${loggedUser?.user_id}`,
        );
        console.log("class data is :- ", data);
        setClasses(data);
      } catch (error) {
        console.error(error);
        let message = "Something went wrong";
        if (axios.isAxiosError(error)) {
          message = error.response?.data?.error || message;
        }
        console.log(message);
      }
    };
    fatchClass();
  }, [loggedUser?.user_id]);

  const fatchClass2 = async () => {
    try {
      const { data } = await API.get(
        `/auth/get-classes/${loggedUser?.user_id}`,
      );
      console.log("class data  is:- ", data);
      setClasses(data);
    } catch (error) {
      console.error(error);
      let message = "Something went wrong";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || message;
      }
      console.log(message);
    }
  };

  useEffect(() => {
    const fatchDashboardData = async () => {
      try {
        const { data } = await API.get(
          `/auth/teacher-dashboard-data/${loggedUser?.user_id}`,
        );
        console.log("teacher data :- ", data);
        // Bas yaha data set kiya hai UI ke liye, logic wahi hai
        setDashboardData(data);
      } catch (error) {
        console.error(error);
        let message = "Something went wrong";
        if (axios.isAxiosError(error)) {
          message = error.response?.data?.error || message;
        }
        console.log(message);
      }
    };
    fatchDashboardData();
  }, [loggedUser?.user_id]);

  const fatchDashboardData2 = async () => {
    try {
      const { data } = await API.get(
        `/auth/teacher-dashboard-data/${loggedUser?.user_id}`,
      );
      console.log("teacher data :- ", data);
      // Bas yaha data set kiya hai UI ke liye, logic wahi hai
      setDashboardData(data);
    } catch (error) {
      console.error(error);
      let message = "Something went wrong";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || message;
      }
      console.log(message);
    }
  };

  // Calculate Total Students Dynamically
  const totalStudents = dashboardData.reduce(
    (acc, curr) => acc + (curr.students?.length || 0),
    0,
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Teacher Portal,{" "}
            <span className="text-purple-400 capitalize">
              {loggedUser?.name || "Professor"}
            </span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Manage your classes and monitor student attendance.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedSubjectForEnroll(null);
              setIsEnrollModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3.5 bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-xl font-bold transition-all whitespace-nowrap"
          >
            <FaUserPlus /> Enroll Student
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddClassOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all whitespace-nowrap"
          >
            <FaPlus /> Add Class
          </motion.button>
        </div>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-[#1E293B]/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 shadow-lg flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl border border-purple-500/20">
            <FaClipboardList />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">
              Total Classes
            </p>
            <p className="text-3xl font-extrabold text-white">
              {dashboardData.length || classes.length}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-[#1E293B]/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 shadow-lg flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl border border-indigo-500/20">
            <FaUsers />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">
              Total Students
            </p>
            <p className="text-3xl font-extrabold text-white">
              {totalStudents}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Classes Grid */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-white mb-6">
          Your Active Classes
        </h2>

        {dashboardData.length === 0 ? (
          <div className="bg-[#1E293B]/50 border border-dashed border-slate-700 p-10 rounded-3xl text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500 text-3xl">
              <FaClipboardList />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              No Classes Yet
            </h3>
            <p className="text-slate-400 text-sm">
              You haven't created any classes. Click the button above to add
              one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.map((cls) => (
              <motion.div
                key={cls.subject_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-[#1E293B]/80 backdrop-blur-xl p-6 rounded-3xl border transition-colors flex flex-col shadow-lg relative group ${
                  cls.status === "start"
                    ? "border-emerald-500/50 shadow-emerald-500/10"
                    : "border-slate-700/50 hover:border-purple-500/50"
                }`}
              >
                {/* Status Badge */}
                <div
                  className={`absolute -top-3 -right-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shadow-sm ${
                    cls.status === "start"
                      ? "bg-emerald-500 text-white border-emerald-400"
                      : "bg-slate-700 text-slate-400 border-slate-600"
                  }`}
                >
                  {cls.status === "start" ? "Portal Live" : "Portal Closed"}
                </div>

                {/* Three Dot Menu Button */}
                <button
                  onClick={() =>
                    setOpenDropdownId(
                      openDropdownId === cls.subject_id ? null : cls.subject_id,
                    )
                  }
                  className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700/50"
                >
                  <FaEllipsisV />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {openDropdownId === cls.subject_id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-14 right-6 w-44 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-10 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setViewStudentsModal({ isOpen: true, subject: cls });
                          setOpenDropdownId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-purple-600/30 transition-colors"
                      >
                        <FaEye className="text-purple-400" /> View Students
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mb-4">
                  <span className="px-3 py-1 bg-slate-800 text-purple-400 rounded-lg text-xs font-bold uppercase tracking-wider border border-purple-500/20">
                    {cls.subject_code || "CODE-NA"}
                  </span>
                  <span className="px-3 py-1 ml-2 bg-slate-800 text-purple-400 rounded-lg text-xs font-bold uppercase tracking-wider border border-purple-500/20">
                    Section ({cls.subject_section || "CODE-NA"})
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mb-1 line-clamp-1">
                  {cls.subject_name}
                </h3>
                <p className="text-slate-400 text-sm font-medium mb-4 flex-1">
                  {cls.students?.length || 0} Enrolled Students
                </p>

                {/* --- NAYA ATTENDANCE TOGGLE UI --- */}
                <div className="mb-5 flex items-center justify-between bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
                  <span className="text-xs font-bold text-slate-400">
                    Attendance
                  </span>
                  <button
                    onClick={() =>
                      handleToggleAttendance(cls.subject_id, cls.status)
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      cls.status === "start"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                    }`}
                  >
                    {cls.status === "start" ? <FaStop /> : <FaPlay />}
                    {cls.status === "start" ? "Close Portal" : "Start Portal"}
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center">
                  <button
                    onClick={() => openEnrollForClass(cls.subject_id)}
                    className="text-xs font-bold text-slate-300 bg-slate-800 hover:bg-emerald-600 hover:text-white transition-colors px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-700"
                  >
                    <FaUserPlus /> Add Student
                  </button>
                  <button
                    onClick={() =>
                      setViewStudentsModal({ isOpen: true, subject: cls })
                    }
                    className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* --- View Students Modal --- */}
      <AnimatePresence>
        {viewStudentsModal.isOpen && viewStudentsModal.subject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1E293B] border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <FaUsers />
                  </div>
                  {viewStudentsModal.subject.subject_name}
                </h2>
                <button
                  onClick={() =>
                    setViewStudentsModal({ isOpen: false, subject: null })
                  }
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {viewStudentsModal.subject.students &&
                viewStudentsModal.subject.students.length > 0 ? (
                  <ul className="space-y-3">
                    {viewStudentsModal.subject.students.map((student, idx) => (
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={student.user_id}
                        className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg shadow-inner">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-bold group-hover:text-purple-300 transition-colors">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Student ID: {student.user_id}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600 text-3xl">
                      <FaUsers />
                    </div>
                    <h3 className="text-white font-bold mb-1">
                      No Students Found
                    </h3>
                    <p className="text-slate-400 text-sm">
                      There are no students enrolled in this class yet.
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-slate-700 bg-slate-800/30 flex justify-end">
                <button
                  onClick={() =>
                    setViewStudentsModal({ isOpen: false, subject: null })
                  }
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pop-up Modals Rendering */}
      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onSubmit={handleAddClass}
        fatchClass2={fatchClass2}
      />

      <EnrollStudentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onSubmit={handleEnrollStudent}
        classes={dashboardData.length > 0 ? dashboardData : classes}
        preSelectedSubjectId={selectedSubjectForEnroll}
        fatchDashboardData2={fatchDashboardData2}
      />
    </div>
  );
};
