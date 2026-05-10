import React from "react";
import { useAppSelector } from "../redux/hook";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Teacher } from "../components/teacher/Teacher";
import { Student } from "../components/student/Student";

const Dashboard: React.FC = () => {
  const { loggedUser } = useAppSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-[#0B1120] font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      <Navbar />

      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12"
      >
        {loggedUser?.role === "teacher" ? <Teacher /> : <Student />}
      </motion.div>
    </div>
  );
};

export default Dashboard;
