import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaArrowRight,
} from "react-icons/fa";
import API from "../api/api";
import axios from "axios";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.selectedRole || "student";
  const isStudent = role === "student";

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post("/auth/register", {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role,
      });
      if (res.data.success) {
        console.log("Registration successful:", res.data);
        navigate("/login", { state: { selectedRole: role } });
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (axios.isAxiosError(error)) {
        setErrorMsg(
          error.response?.data?.message || "Could not create account.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B1120] flex flex-col items-center p-6 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* --- BACKGROUND EFFECTS (Same as GetStarted) --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

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
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl mx-auto flex items-center py-6 relative z-20"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FaShieldAlt className="text-white text-sm" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            VisionAttend
          </span>
        </button>
      </motion.nav>

      {/* --- REGISTER FORM --- */}
      <div className="relative z-10 w-full max-w-105 mx-auto flex flex-col items-center flex-1 justify-center -mt-5 pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
          className="w-full bg-[#1E293B]/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl shadow-black/50"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Join the{" "}
              <span
                className={
                  isStudent
                    ? "text-indigo-400 font-bold"
                    : "text-purple-400 font-bold"
                }
              >
                {role}
              </span>{" "}
              portal
            </p>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-center"
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors text-sm" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-200 text-sm placeholder:text-slate-600"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest ml-1">
                Username
              </label>
              <div className="flex rounded-xl border border-slate-700/50 bg-[#0B1120]/50 overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                <span className="flex items-center justify-center px-4 text-slate-500 font-bold text-sm border-r border-slate-700/50 bg-slate-800/30">
                  @
                </span>
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  className="w-full px-4 py-2.5 bg-transparent outline-none text-slate-200 text-sm lowercase placeholder:text-slate-600"
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-200 text-sm placeholder:text-slate-600"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={14} />
                    ) : (
                      <FaEye size={14} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest ml-1">
                  Confirm
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-200 text-sm placeholder:text-slate-600"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400"
                  >
                    {showConfirm ? (
                      <FaEyeSlash size={14} />
                    ) : (
                      <FaEye size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center mt-4 ${
                isStudent
                  ? "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                  : "bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign Up <FaArrowRight className="ml-2 text-xs opacity-80" />
                </>
              )}
            </motion.button>
          </form>

          {/* Navigation to Login */}
          <div className="mt-8 text-center pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-400 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                state={{ selectedRole: role }}
                className={`font-bold transition-colors ${isStudent ? "text-indigo-400 hover:text-indigo-300" : "text-purple-400 hover:text-purple-300"}`}
              >
                Log in instead
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Change Portal Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <button
            onClick={() => navigate("/")}
            className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-[2px] transition-all"
          >
            ← Change Portal Type
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
