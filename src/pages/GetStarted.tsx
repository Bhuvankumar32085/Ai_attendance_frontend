import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaArrowRight,
  FaShieldAlt,
  FaRobot,
  FaBolt,
} from "react-icons/fa";

const GetStarted: React.FC = () => {
  const navigate = useNavigate();

  const handleSelection = (role: string) => {
    navigate("/login", { state: { selectedRole: role } });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 20 },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#0B1120] flex flex-col items-center p-6 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* --- BACKGROUND EFFECTS --- */}
      {/* 1. Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      {/* 2. Animated Glowing Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-purple-600 rounded-full mix-blend-screen filter blur-[150px]"
      />

      {/* --- TOP NAVBAR --- */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl mx-auto flex items-center justify-between py-6 relative z-20"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FaShieldAlt className="text-white text-xl" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            VisionAttend
          </span>
        </div>
      </motion.nav>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center flex-1 justify-center mt-10 md:mt-0">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0px 0px 0px 0px rgba(99,102,241,0)",
                "0px 0px 20px 0px rgba(99,102,241,0.5)",
                "0px 0px 0px 0px rgba(99,102,241,0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-sm backdrop-blur-md"
          >
            <FaRobot /> Smart AI Attendance System
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            The Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
              Attendance Tracking
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Experience lightning-fast, highly secure facial recognition. Choose
            your designated portal below to get started.
          </p>
        </motion.div>

        {/* Portals Selection Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
        >
          {/* Student Card */}
          <motion.button
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelection("student")}
            className="group relative flex flex-col items-start p-10 rounded-4xl bg-[#1E293B]/80 border border-slate-700/50 backdrop-blur-xl hover:bg-[#1E293B] hover:border-indigo-500/50 transition-all duration-300 text-left overflow-hidden"
          >
            {/* Glowing Hover Effect */}
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 w-full">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                <FaUserGraduate size={28} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Student Portal
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed h-16">
                Mark your daily attendance seamlessly using AI facial
                recognition and view your personal logs.
              </p>
              <div className="w-full flex items-center justify-between border-t border-slate-700/50 pt-6">
                <span className="text-white font-semibold">Enter Portal</span>
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                  <FaArrowRight />
                </div>
              </div>
            </div>
          </motion.button>

          {/* Teacher Card */}
          <motion.button
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelection("teacher")}
            className="group relative flex flex-col items-start p-10 rounded-4xl bg-[#1E293B]/80 border border-slate-700/50 backdrop-blur-xl hover:bg-[#1E293B] hover:border-purple-500/50 transition-all duration-300 text-left overflow-hidden"
          >
            {/* Glowing Hover Effect */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 w-full">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                <FaChalkboardTeacher size={28} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Teacher Portal
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed h-16">
                Monitor class attendance in real-time, manage student records,
                and generate detailed reports.
              </p>
              <div className="w-full flex items-center justify-between border-t border-slate-700/50 pt-6">
                <span className="text-white font-semibold">Enter Portal</span>
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                  <FaArrowRight />
                </div>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Small Features Section below cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-slate-400 text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <FaBolt className="text-yellow-400" /> Fast Setup
          </div>
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-green-400" /> Secure Data
          </div>
          <div className="flex items-center gap-2">
            <FaRobot className="text-blue-400" /> 99.9% AI Accuracy
          </div>
        </motion.div>
      </div>

      {/* --- FOOTER --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="w-full max-w-6xl mx-auto text-center py-6 mt-10 border-t border-slate-800 text-slate-500 text-sm z-20"
      >
        &copy; {new Date().getFullYear()} VisionAttend. Developed by team. All
        rights reserved.
      </motion.div>
    </div>
  );
};

export default GetStarted;
