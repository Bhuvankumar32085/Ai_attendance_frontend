import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUserGraduate, FaBookOpen } from "react-icons/fa";
import API from "../../api/api";
import axios from "axios";

interface Subject {
  subject_id: number;
  subject_name: string;
  subject_code?: string;
  subject_section?: string;
  students?: { user_id: number; name: string }[];
}

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { student_id: number; subject_id: number }) => void;
  classes: Subject[];
  preSelectedSubjectId?: number | null;
  fatchDashboardData2: () => Promise<void>;
}

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  classes,
  preSelectedSubjectId,
  fatchDashboardData2,
}) => {
  const [formData, setFormData] = useState({
    student_id: "",
    subject_id: "",
  });

  // 🔥 THE REACT PREFERRED WAY (No useEffect) 🔥
  // Hum track karenge ki pichli baar modal open tha ya close
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen); // Tracker ko update karo
    if (isOpen) {
      // Jaise hi modal 'close' se 'open' hoga, ye form auto-fill kar dega
      setFormData({
        student_id: "",
        subject_id: preSelectedSubjectId
          ? String(preSelectedSubjectId)
          : classes.length > 0
            ? String(classes[0].subject_id)
            : "",
      });
    }
  }

  // Modal band hote time form clear kar dena
  const handleClose = () => {
    setFormData({ student_id: "", subject_id: "" });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_id || !formData.subject_id) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = {
        student_id: Number(formData.student_id),
        subject_id: Number(formData.subject_id),
      };
      const { data } = await API.post("/auth/add-student-in-class", payload);
      console.log(data);
      onSubmit(payload);
      fatchDashboardData2();
      alert("Student enrolled successfully");
      handleClose();
    } catch (error) {
      console.error(error);

      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || message;
      }

      alert(message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#0B1120]/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1E293B] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50 bg-slate-800/50">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Enroll Student
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 text-slate-400 hover:text-white hover:bg-rose-500/80 transition-all"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Select Class Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider ml-1">
                  Select Class
                </label>
                <div className="relative group">
                  <FaBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <select
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-slate-200 text-sm font-medium appearance-none"
                    value={formData.subject_id}
                    onChange={(e) =>
                      setFormData({ ...formData, subject_id: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      -- Select a Class --
                    </option>
                    {classes.map((cls) => (
                      <option key={cls.subject_id} value={cls.subject_id}>
                        {cls.subject_code} - {cls.subject_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student ID Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider ml-1">
                  Student ID
                </label>
                <div className="relative group">
                  <FaUserGraduate className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="number"
                    required
                    placeholder="Enter Student ID (e.g., 101)"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-slate-200 text-sm font-medium placeholder:text-slate-600"
                    value={formData.student_id}
                    onChange={(e) =>
                      setFormData({ ...formData, student_id: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
