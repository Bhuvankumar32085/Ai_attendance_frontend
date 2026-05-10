import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCircle,
  FaHome,
  FaCamera,
  FaBars,
  FaTimes,
  FaUsersCog
} from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { setLoading, setLoggedUser } from "../redux/slices/userSlices";

// User Data Type based on your description
type Role = "student" | "teacher" | "admin";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loggedUser } = useAppSelector((state) => state.user);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(setLoggedUser(null));
    dispatch(setLoading(true));
    navigate("/");
  };

  // Helper to check active links
  const isActive = (path: string) => location.pathname === path;

  // Dynamic Links based on Role
  const getNavLinks = (role?: Role) => {
    const baseLinks = [{ name: "Dashboard", path: "/dashboard", icon: <FaHome /> }];
    
    if (role === "admin") {
      baseLinks.push({ name: "Manage Users", path: "/admin/users", icon: <FaUsersCog /> });
    } else if (role === "teacher") {
      baseLinks.push({ name: "Class Attendance", path: "/attendance", icon: <FaCamera /> });
    } else {
      // Default to Student
      baseLinks.push({ name: "Add Biometrics", path: "/enroll_biometrics", icon: <FaCamera /> });
    }
    return baseLinks;
  };

  const navLinks = getNavLinks(loggedUser?.role as Role);

  // Role Badge Color Mapping
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "admin": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "teacher": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "student": default: return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
    }
  };

  return (
    <>
      {/* Floating Navbar Container */}
      <div className="fixed top-4 left-0 w-full z-50 flex justify-center px-4 font-sans">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-full max-w-6xl bg-[#0F172A]/80 backdrop-blur-2xl border border-slate-700/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
        >
          <div className="px-5 py-3 flex items-center justify-between">
            
            {/* 1. Brand / Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}
                className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
              >
                <FaShieldAlt className="text-white text-xl" />
              </motion.div>
              <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
                Vision<span className="text-indigo-400">Attend</span>
              </span>
            </Link>

            {/* 2. Desktop Navigation Links (With layoutId Magic) */}
            <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-slate-900/50 rounded-2xl border border-slate-800">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold tracking-wide transition-colors z-10 ${
                      active ? "text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-500/30"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="text-lg">{link.icon}</span>
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* 3. User Profile & Logout */}
            <div className="flex items-center gap-4">
              {/* Dynamic User Badge */}
              {loggedUser && (
                <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50">
                  <FaUserCircle className="text-slate-400" size={24} />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-sm font-bold text-slate-200 capitalize">{loggedUser.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Roll No :- {loggedUser.user_id}</span>
                  </div>
                  <div className={`ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getRoleBadgeColor(loggedUser.role)}`}>
                    {loggedUser.role}
                  </div>
                </div>
              )}

              {/* Animated Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-rose-500/20 group"
              >
                <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
                <span>Logout</span>
              </motion.button>

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden text-slate-300 hover:text-white p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* 4. Mobile Menu Dropdown (Animated) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-4 right-4 z-40 bg-[#0F172A]/95 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 shadow-2xl md:hidden"
          >
            {/* Mobile User Info */}
            {loggedUser && (
              <div className="flex items-center gap-3 p-4 mb-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <FaUserCircle className="text-indigo-400" size={32} />
                <div>
                  <h3 className="text-white font-bold capitalize">{loggedUser.name}</h3>
                  <p className="text-slate-400 text-xs">Roll No :- {loggedUser.user_id}</p>
                </div>
                <div className={`ml-auto px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getRoleBadgeColor(loggedUser.role)}`}>
                  {loggedUser.role}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${
                    isActive(link.path) ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="flex items-center justify-center gap-2 px-4 py-4 mt-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-bold hover:bg-rose-500 hover:text-white transition-all"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;