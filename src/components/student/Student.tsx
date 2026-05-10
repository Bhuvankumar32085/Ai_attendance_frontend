import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarCheck,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaHistory,
  FaBook,
} from "react-icons/fa";
import { useAppSelector } from "../../redux/hook";
import API from "../../api/api";
import axios from "axios";

// ================= TYPES =================
interface AttendanceLog {
  attendance_date: string;
  status: "present" | "absent";
}

interface SubjectData {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  subject_section: string;
  total_classes: number;
  present_classes: number;
  absent_classes: number;
  attendance_percentage: number;
  today_status: string;
  class_status: string;
  attendance_history: AttendanceLog[];
}

interface DashboardData {
  student_id: string;
  overall_percentage: number;
  today_date: string;
  total_absent: number;
  total_classes: number;
  total_present: number;
  total_subjects: number;
  subjects: SubjectData[];
}
// ==========================================

export const Student: React.FC = () => {
  const { loggedUser } = useAppSelector((state) => state.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State for History
  const [selectedSubjectHistory, setSelectedSubjectHistory] = useState<SubjectData | null>(null);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/auth/get-student-data/${loggedUser?.user_id}`);
        console.log("Student Dashboard Data:", response.data);
        setData(response.data);
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          console.log(error.response?.data?.error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (loggedUser?.user_id) {
      fetchDashboardData();
    }
  }, [loggedUser?.user_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-indigo-400 font-bold text-sm tracking-widest uppercase mb-1">
            {todayStr}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="capitalize text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">{loggedUser?.name || "Student"}</span> 👋
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Here is your attendance overview across all subjects.
          </p>
        </motion.div>
      </div>

      {/* --- QUICK ACTION & STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overall Percentage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#1E293B]/80 backdrop-blur-xl p-8 rounded-4xl border border-slate-700/50 shadow-lg flex flex-col justify-center relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-4 translate-y-4">
            <FaChartLine size={120} />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl border border-blue-500/20">
              <FaChartLine />
            </div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Overall Rate</p>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-4xl font-extrabold text-white">
              {data?.overall_percentage || 0}<span className="text-2xl">%</span>
            </p>
            {data?.overall_percentage && data.overall_percentage < 75 ? (
              <p className="text-rose-400 text-sm font-bold ml-2">↓ Needs Attention</p>
            ) : (
              <p className="text-emerald-400 text-sm font-bold ml-2">↑ Good Standing</p>
            )}
          </div>
        </motion.div>

        {/* Total Present */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1E293B]/80 backdrop-blur-xl p-8 rounded-4xl border border-slate-700/50 shadow-lg flex flex-col justify-center"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/20">
              <FaCalendarCheck />
            </div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Total Present</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-extrabold text-white">{data?.total_present || 0}</p>
            <p className="text-slate-500 font-medium">Classes</p>
          </div>
        </motion.div>

        {/* Total Absent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#1E293B]/80 backdrop-blur-xl p-8 rounded-4xl border border-slate-700/50 shadow-lg flex flex-col justify-center"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl border border-rose-500/20">
              <FaTimesCircle />
            </div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Total Absent</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-extrabold text-white">{data?.total_absent || 0}</p>
            <p className="text-slate-500 font-medium">Classes</p>
          </div>
        </motion.div>
      </div>

      {/* --- SUBJECT WISE CARDS --- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FaBook className="text-indigo-400" /> Subject Breakdown
        </h2>
        
        {data?.subjects && data.subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.subjects.map((sub, idx) => (
              <motion.div
                key={sub.subject_id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * idx }}
                className="bg-[#1E293B]/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 shadow-lg flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="px-2.5 py-1 bg-slate-800 text-indigo-400 rounded-md text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
                      {sub.subject_code}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-2 line-clamp-1">{sub.subject_name}</h3>
                  </div>
                  {/* Circular Progress (Visual indicator) */}
                  <div className="relative w-14 h-14 flex items-center justify-center bg-slate-800 rounded-full border-4 border-slate-700">
                    <span className={`text-sm font-bold ${sub.attendance_percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sub.attendance_percentage}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-center">
                    <p className="text-emerald-400 font-bold text-lg">{sub.present_classes}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Present</p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-center">
                    <p className="text-rose-400 font-bold text-lg">{sub.absent_classes}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Absent</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSubjectHistory(sub)}
                  className="mt-auto w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-sm transition-colors border border-slate-700 flex items-center justify-center gap-2"
                >
                  <FaHistory /> View History
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#1E293B]/50 rounded-3xl border border-dashed border-slate-700">
            <p className="text-slate-400">No enrolled subjects found.</p>
          </div>
        )}
      </motion.div>

      {/* --- HISTORY MODAL --- */}
      <AnimatePresence>
        {selectedSubjectHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1E293B] border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaHistory className="text-indigo-400" /> Attendance History
                  </h2>
                  <p className="text-slate-400 text-sm font-medium mt-1">{selectedSubjectHistory.subject_name}</p>
                </div>
                <button
                  onClick={() => setSelectedSubjectHistory(null)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-2 overflow-y-auto flex-1">
                {selectedSubjectHistory.attendance_history && selectedSubjectHistory.attendance_history.length > 0 ? (
                  <div className="divide-y divide-slate-700/50">
                    {selectedSubjectHistory.attendance_history.map((log, idx) => (
                      <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.status === "present" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                            {log.status === "present" ? <FaCheckCircle size={18} /> : <FaTimesCircle size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 capitalize">{log.status}</p>
                            <p className="text-xs text-slate-500 font-medium">{log.status === "present" ? "Verified" : "Missed"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-300 text-sm">
                            {new Date(log.attendance_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-400 text-sm">No attendance records found for this subject.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};