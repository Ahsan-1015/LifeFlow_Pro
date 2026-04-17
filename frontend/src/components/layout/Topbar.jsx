import { Bell, ChevronRight, Mail, Menu, Moon, Search, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { normalizeRole, roleLabels } from "../../utils/roles";

const prettifySegment = (value) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const Topbar = ({ title, description, onOpenSidebar }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumb = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return ["Home"];
    return segments.map(prettifySegment);
  }, [location.pathname]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col gap-4"
    >
      <div className="glass-panel flex flex-col gap-4 rounded-[2rem] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onOpenSidebar} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 lg:hidden">
            <Menu size={20} />
          </button>
          <div className="relative min-w-0 flex-1 lg:w-[340px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-11"
              placeholder="Search users, projects, tasks..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300 xl:flex">
            {breadcrumb.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                {index > 0 ? <ChevronRight size={14} /> : null}
                <span>{item}</span>
              </div>
            ))}
          </div>
          <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800" onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            {unreadCount > 0 ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" /> : null}
          </button>
          <button
            type="button"
            onClick={() => navigate("/messages")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800"
          >
            <Mail size={18} />
          </button>
          <button type="button" onClick={toggleTheme} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex max-w-full items-center gap-3 rounded-2xl bg-slate-100 px-3 py-2 text-left transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 font-display text-lg font-bold text-white">
              {user?.name?.[0] || "U"}
            </div>
            <div className="min-w-0 max-w-[116px] sm:max-w-[148px]">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{roleLabels[normalizeRole(user?.role)]}</p>
            </div>
          </button>
        </div>
      </div>

      <div className="px-1">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </motion.div>
  );
};

export default Topbar;
