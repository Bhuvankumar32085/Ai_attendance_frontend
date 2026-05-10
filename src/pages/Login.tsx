import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaLock,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaArrowRight,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";
import API from "../api/api";
import axios from "axios";
import { useAppDispatch } from "../redux/hook";
import { setLoading, setLoggedUser } from "../redux/slices/userSlices";

const Login: React.FC = () => {
  const dispatc = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Role handling
  const role = location.state?.selectedRole || "student";
  const isStudent = role === "student";

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await API.post("/auth/login", { ...formData, role });
      console.log("Login successful:", response.data);
      if (response.data?.success) {
        localStorage.setItem("token", response.data.token);
        dispatc(setLoggedUser(response.data.user));
        dispatc(setLoading(true));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error); 
      if (axios.isAxiosError(error)) {
        setErrorMsg(error.response?.data?.message || "Could not sign in.");
      } else {
        setErrorMsg("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B1120] flex flex-col items-center p-6 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* --- BACKGROUND EFFECTS (Same as GetStarted) --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

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

      {/* --- LOGIN FORM --- */}
      <div className="relative z-10 w-full max-w-100 mx-auto flex flex-col items-center flex-1 justify-center -mt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
          className="w-full bg-[#1E293B]/80 backdrop-blur-xl p-8 rounded-4xl border border-slate-700/50 shadow-2xl shadow-black/50"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 shadow-lg ${
                isStudent
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-indigo-500/20"
                  : "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-purple-500/20"
              }`}
            >
              {isStudent ? (
                <FaUserGraduate size={30} />
              ) : (
                <FaChalkboardTeacher size={30} />
              )}
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Log in to your{" "}
              <span
                className={isStudent ? "text-indigo-400" : "text-purple-400"}
              >
                {role}
              </span>{" "}
              portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider ml-1">
                Username
              </label>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="username"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-200 text-sm font-medium placeholder:text-slate-600"
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-200 text-sm font-medium placeholder:text-slate-600"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center mt-2 ${
                isStudent
                  ? "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                  : "bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <FaArrowRight className="ml-2 opacity-80" />
                </>
              )}
            </motion.button>
          </form>

          {/* Navigation Link */}
          <div className="mt-8 text-center pt-6 border-t border-slate-700/50">
            <p className="text-sm text-slate-400 font-medium">
              Don't have an account?{" "}
              <Link
                to="/register"
                state={{ selectedRole: role }}
                className={`font-bold transition-colors ${isStudent ? "text-indigo-400 hover:text-indigo-300" : "text-purple-400 hover:text-purple-300"}`}
              >
                Create one
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Change Portal Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => navigate("/")}
            className="text-xs font-semibold text-slate-500 hover:text-white transition-colors"
          >
            ← Back to Portal Selection
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
