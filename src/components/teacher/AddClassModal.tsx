import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBook, FaBarcode, FaLayerGroup } from "react-icons/fa";
import API from "../../api/api";
import { useAppSelector } from "../../redux/hook";
import axios from "axios";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    subject_name: string;
    subject_code: string;
    subject_section: string;
  }) => void;
  fatchClass2: () => Promise<void>;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  fatchClass2,
}) => {
  const { loggedUser } = useAppSelector((state) => state.user);
  const [formData, setFormData] = useState({
    subject_name: "",
    subject_code: "",
    subject_section: "",
    teacher_id: `${loggedUser?.user_id}`,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    if (!loggedUser?.user_id) return;
    e.preventDefault();
    onSubmit(formData);

    try {
      const { data } = await API.post("/auth/add-class", formData);
      console.log(data);
      fatchClass2();
    } catch (error) {
      console.error(error);
      let message = "Something went wrong";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || message;
      }
      alert(message);
    } finally {
      // Reset form
      setFormData({
        subject_name: "",
        subject_code: "",
        subject_section: "",
        teacher_id: `${loggedUser?.user_id}`,
      });
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
            onClick={onClose}
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
                Add New Class
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 text-slate-400 hover:text-white hover:bg-rose-500/80 transition-all"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Subject Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider ml-1">
                  Subject Name
                </label>
                <div className="relative group">
                  <FaBook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Data Structures"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-slate-200 text-sm font-medium placeholder:text-slate-600"
                    value={formData.subject_name}
                    onChange={(e) =>
                      setFormData({ ...formData, subject_name: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Subject Code */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider ml-1">
                  Subject Code
                </label>
                <div className="relative group">
                  <FaBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., CS-301"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-slate-200 text-sm font-medium placeholder:text-slate-600 uppercase"
                    value={formData.subject_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subject_code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider ml-1">
                  Section / Batch
                </label>
                <div className="relative group">
                  <FaLayerGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Section A"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-slate-200 text-sm font-medium placeholder:text-slate-600"
                    value={formData.subject_section}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subject_section: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                >
                  Create Class
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
